import { compareVersions } from "./core/text.ts";

/** Everything relais knows about one requested package version. */
export interface PackageFacts {
  /** Ecosystem id, such as "npm". */
  ecosystem: string;
  name: string;
  /** What was asked for: a version, a tag such as "latest", or nothing. */
  requested: string;
  exists: boolean;
  /** False when the package exists but the requested version or tag does not. */
  versionFound: boolean;
  version?: string;
  publishedAt?: Date;
  createdAt?: Date;
  /** Undefined when it could not be checked. */
  weeklyDownloads?: number;
  installScripts: string[];
  hasProvenance: boolean;
  /** The author's deprecation note. Untrusted text, already sanitized. */
  deprecated?: string;
  /** Undefined when the advisory database could not be reached. */
  advisories?: Advisory[];
  lookalikeOf?: string;
}

export interface Advisory {
  id: string;
  summary?: string;
  /** Versions that fix this advisory, as published by OSV. */
  fixed?: string[];
}

export interface Policy {
  /** Versions younger than this are blocked. Most malicious releases are caught within days. */
  minAgeHours: number;
  /** A package created more recently than this is "young". */
  youngPackageDays: number;
  /** Fewer weekly downloads than this is "barely used". */
  lowDownloads: number;
  /** A name close to a popular package is flagged only below this many weekly downloads. */
  lookalikeBelow: number;
  /** Names the user vouches for: age-based blocks become warnings. Never lifts malware or missing names. */
  allow: readonly string[];
}

export const DEFAULT_POLICY: Policy = {
  minAgeHours: 72,
  youngPackageDays: 30,
  lowDownloads: 100,
  lookalikeBelow: 10_000,
  allow: [],
};

export type Level = "block" | "warn" | "info";

export type Finding =
  | { code: "not-found"; level: "block"; lookalikeOf?: string }
  | { code: "version-not-found"; level: "block"; requested: string }
  | { code: "malicious"; level: "block"; ids: string[] }
  | { code: "too-new"; level: "block" | "warn"; hours: number; minHours: number; allowed: boolean }
  | { code: "unproven"; level: "block" | "warn"; days: number; downloads: number; allowed: boolean }
  | { code: "lookalike"; level: "warn"; target: string }
  | { code: "young-package"; level: "warn"; days: number }
  | { code: "low-downloads"; level: "warn"; downloads: number }
  | { code: "install-scripts"; level: "warn"; scripts: string[] }
  | { code: "vulnerabilities"; level: "warn"; ids: string[]; fixVersion?: string }
  | { code: "deprecated"; level: "warn"; reason: string }
  | { code: "advisories-unchecked"; level: "warn" }
  | { code: "age-unchecked"; level: "warn" }
  | { code: "downloads-unchecked"; level: "info" }
  | { code: "provenance"; level: "info"; present: boolean }
  | { code: "age"; level: "info"; days: number };

export type Verdict = "pass" | "warn" | "block";

export interface Report {
  ecosystem: string;
  name: string;
  version?: string;
  verdict: Verdict;
  findings: Finding[];
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/**
 * The smallest version that fixes every advisory, or undefined when at least one advisory
 * has no fix above the current version.
 */
export function pickFixVersion(current: string, advisories: Advisory[]): string | undefined {
  let target: string | undefined;
  for (const a of advisories) {
    const above = (a.fixed ?? []).filter((v) => compareVersions(v, current) > 0);
    if (above.length === 0) return undefined;
    const smallest = above.reduce((x, y) => (compareVersions(x, y) <= 0 ? x : y));
    if (!target || compareVersions(smallest, target) > 0) target = smallest;
  }
  return target;
}

/** Pure decision step: same facts, policy and clock always give the same report. */
export function evaluate(
  facts: PackageFacts,
  policy: Policy = DEFAULT_POLICY,
  now = new Date(),
): Report {
  const findings: Finding[] = [];
  const base = {
    ecosystem: facts.ecosystem,
    name: facts.name,
    ...(facts.version ? { version: facts.version } : {}),
  };
  const allowed = policy.allow.includes(facts.name);

  if (!facts.exists) {
    findings.push(
      facts.lookalikeOf
        ? { code: "not-found", level: "block", lookalikeOf: facts.lookalikeOf }
        : { code: "not-found", level: "block" },
    );
    return { ...base, verdict: "block", findings };
  }
  if (!facts.versionFound) {
    findings.push({ code: "version-not-found", level: "block", requested: facts.requested });
    return { ...base, verdict: "block", findings };
  }

  if (facts.advisories) {
    const malicious = facts.advisories.filter((a) => a.id.startsWith("MAL-"));
    const others = facts.advisories.filter((a) => !a.id.startsWith("MAL-"));
    if (malicious.length > 0) {
      findings.push({ code: "malicious", level: "block", ids: malicious.map((a) => a.id) });
    }
    if (others.length > 0) {
      const fix = facts.version ? pickFixVersion(facts.version, others) : undefined;
      findings.push({
        code: "vulnerabilities",
        level: "warn",
        ids: others.map((a) => a.id),
        ...(fix ? { fixVersion: fix } : {}),
      });
    }
  } else {
    findings.push({ code: "advisories-unchecked", level: "warn" });
  }

  if (facts.publishedAt) {
    const hours = (now.getTime() - facts.publishedAt.getTime()) / HOUR;
    if (hours < policy.minAgeHours) {
      findings.push({
        code: "too-new",
        level: allowed ? "warn" : "block",
        hours: Math.max(0, Math.floor(hours)),
        minHours: policy.minAgeHours,
        allowed,
      });
    } else {
      findings.push({ code: "age", level: "info", days: Math.floor(hours / 24) });
    }
  } else {
    findings.push({ code: "age-unchecked", level: "warn" });
  }

  const youngDays =
    facts.createdAt !== undefined ? (now.getTime() - facts.createdAt.getTime()) / DAY : undefined;
  const isYoung = youngDays !== undefined && youngDays < policy.youngPackageDays;
  const isUnused =
    facts.weeklyDownloads !== undefined && facts.weeklyDownloads < policy.lowDownloads;

  if (isYoung && isUnused) {
    // New and unused at the same time: the profile of a name registered to catch someone.
    findings.push({
      code: "unproven",
      level: allowed ? "warn" : "block",
      days: Math.floor(youngDays ?? 0),
      downloads: facts.weeklyDownloads ?? 0,
      allowed,
    });
  } else {
    if (isYoung)
      findings.push({ code: "young-package", level: "warn", days: Math.floor(youngDays ?? 0) });
    if (isUnused)
      findings.push({
        code: "low-downloads",
        level: "warn",
        downloads: facts.weeklyDownloads ?? 0,
      });
  }
  if (facts.weeklyDownloads === undefined) {
    findings.push({ code: "downloads-unchecked", level: "info" });
  }

  const established =
    facts.weeklyDownloads !== undefined && facts.weeklyDownloads >= policy.lookalikeBelow;
  if (facts.lookalikeOf && !established) {
    findings.push({ code: "lookalike", level: "warn", target: facts.lookalikeOf });
  }

  if (facts.installScripts.length > 0) {
    findings.push({ code: "install-scripts", level: "warn", scripts: facts.installScripts });
  }
  if (facts.deprecated) {
    findings.push({ code: "deprecated", level: "warn", reason: facts.deprecated });
  }
  findings.push({ code: "provenance", level: "info", present: facts.hasProvenance });

  const verdict: Verdict = findings.some((f) => f.level === "block")
    ? "block"
    : findings.some((f) => f.level === "warn")
      ? "warn"
      : "pass";
  return { ...base, verdict, findings };
}
