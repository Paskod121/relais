import { getJson, RegistryError, type Sources, tryJson } from "../core/http.ts";
import { queryAdvisories } from "../core/osv.ts";
import { isSafeVersion, sanitize, toDate } from "../core/text.ts";
import { findLookalike } from "../lookalike.ts";
import type { PackageFacts } from "../policy.ts";
import { POPULAR_NPM } from "./npm-popular.ts";
import { type Ecosystem, InvalidNameError } from "./types.ts";

/** Packages below this many weekly downloads get the full metadata check (their documents are small). */
const DEEP_CHECK_BELOW = 1_000;
const NAME_RE = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
const INSTALL_HOOKS = ["preinstall", "install", "postinstall"] as const;

/** Splits "name", "name@1.2.3" and "@scope/name@tag" into name and requested spec. */
export function parseNpmSpec(input: string): { name: string; requested: string } {
  const at = input.lastIndexOf("@");
  const hasSpec = at > 0;
  const name = (hasSpec ? input.slice(0, at) : input).trim();
  const requested = hasSpec ? input.slice(at + 1).trim() : "";
  if (name.length === 0 || name.length > 214 || !NAME_RE.test(name)) {
    throw new InvalidNameError(input);
  }
  if (requested !== "" && !isSafeVersion(requested)) throw new InvalidNameError(input);
  return { name, requested };
}

function encodeName(name: string): string {
  return name.startsWith("@") ? `@${encodeURIComponent(name.slice(1))}` : encodeURIComponent(name);
}

interface Manifest {
  version?: unknown;
  scripts?: Record<string, unknown>;
  gypfile?: unknown;
  deprecated?: unknown;
  dist?: { attestations?: unknown };
}

async function searchStats(
  sources: Sources,
  name: string,
): Promise<{ weekly?: number; version?: string; date?: Date }> {
  const url = `${sources.npmRegistry}/-/v1/search?text=${encodeURIComponent(name)}&size=5`;
  const body = (await tryJson(sources, url)) as
    | {
        objects?: {
          downloads?: { weekly?: unknown };
          package?: { name?: unknown; version?: unknown; date?: unknown };
        }[];
      }
    | undefined;
  const hit = body?.objects?.find((o) => o.package?.name === name);
  if (!hit) return {};
  const date = toDate(hit.package?.date);
  const weekly = hit.downloads?.weekly;
  const version = hit.package?.version;
  return {
    ...(typeof weekly === "number" && weekly >= 0 ? { weekly } : {}),
    ...(isSafeVersion(version) ? { version } : {}),
    ...(date ? { date } : {}),
  };
}

async function weeklyDownloads(sources: Sources, name: string): Promise<number | undefined> {
  const body = (await tryJson(sources, `${sources.npmDownloads}/${name}`)) as
    | { downloads?: unknown }
    | undefined;
  const n = body?.downloads;
  return typeof n === "number" && n >= 0 ? n : undefined;
}

async function gatherNpmFacts(
  name: string,
  requested: string,
  sources: Sources,
): Promise<PackageFacts> {
  const enc = encodeName(name);
  const spec = requested || "latest";
  const lookalike = findLookalike(name, POPULAR_NPM);
  const base = {
    ecosystem: "npm",
    name,
    requested,
    ...(lookalike ? { lookalikeOf: lookalike } : {}),
  };

  const manifestRes = await getJson(
    sources,
    `${sources.npmRegistry}/${enc}/${encodeURIComponent(spec)}`,
  );
  if (manifestRes.status !== 200 && manifestRes.status !== 404) {
    throw new RegistryError(`registry answered ${manifestRes.status} for ${name}`);
  }

  if (manifestRes.status === 404) {
    const tags = await getJson(sources, `${sources.npmRegistry}/-/package/${enc}/dist-tags`);
    if (tags.status !== 200 && tags.status !== 404) {
      throw new RegistryError(`registry answered ${tags.status} for ${name}`);
    }
    return {
      ...base,
      exists: tags.status === 200,
      versionFound: false,
      installScripts: [],
      hasProvenance: false,
    };
  }

  const manifest = (manifestRes.body ?? {}) as Manifest;
  if (!isSafeVersion(manifest.version)) {
    throw new RegistryError(`registry returned an unusable version for ${name}`);
  }
  const version = manifest.version;
  const scripts: string[] = INSTALL_HOOKS.filter(
    (hook) => typeof manifest.scripts?.[hook] === "string",
  );
  if (manifest.gypfile === true && !scripts.includes("install")) scripts.push("install (node-gyp)");

  const stats = await searchStats(sources, name);
  const weekly = stats.weekly ?? (await weeklyDownloads(sources, name));
  let publishedAt = stats.version === version ? stats.date : undefined;
  let createdAt: Date | undefined;

  if (publishedAt === undefined || weekly === undefined || weekly < DEEP_CHECK_BELOW) {
    const doc = (await tryJson(sources, `${sources.npmRegistry}/${enc}`)) as
      | { time?: Record<string, unknown> }
      | undefined;
    publishedAt = toDate(doc?.time?.[version]) ?? publishedAt;
    createdAt = toDate(doc?.time?.created);
  }

  const advisories = await queryAdvisories(sources, "npm", name, version);

  return {
    ...base,
    exists: true,
    versionFound: true,
    version,
    ...(publishedAt ? { publishedAt } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(weekly !== undefined ? { weeklyDownloads: weekly } : {}),
    installScripts: scripts,
    hasProvenance: manifest.dist?.attestations !== undefined,
    ...(typeof manifest.deprecated === "string" && manifest.deprecated.trim()
      ? { deprecated: sanitize(manifest.deprecated) }
      : {}),
    ...(advisories ? { advisories } : {}),
  };
}

export const npm: Ecosystem = {
  id: "npm",
  displayName: "npm",
  parseSpec: parseNpmSpec,
  gatherFacts: gatherNpmFacts,
  popular: POPULAR_NPM,
  commands: {
    install: (name, version) => `npm install ${version ? `${name}@${version}` : name}`,
    uninstall: (name) => `npm uninstall ${name}`,
    listVersions: (name) => `npm view ${name} versions`,
  },
};
