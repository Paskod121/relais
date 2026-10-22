/**
 * Helpers for text that comes from the outside world (registry metadata, advisories).
 * Anything a package author controls is untrusted: it can carry terminal escape codes,
 * invisible bidirectional characters, or instructions aimed at an AI agent.
 */

// biome-ignore lint/suspicious/noControlCharactersInRegex: removing control characters is the point.
const ANSI = /\u001b\[[0-9;?]*[ -/]*[@-~]|\u001b\][^\u0007\u001b]*(?:\u0007|\u001b\\)/g;
// biome-ignore lint/suspicious/noControlCharactersInRegex: removing control characters is the point.
const CONTROL = /[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g;

/** Removes escape sequences, control and bidi characters, collapses spaces, caps the length. */
export function sanitize(value: string, max = 200): string {
  const clean = value.replace(ANSI, "").replace(CONTROL, " ").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 3)}...` : clean;
}

const VERSION_RE = /^[0-9A-Za-z][0-9A-Za-z.+-]{0,63}$/;

/** True for strings shaped like a package version or tag. Anything else is refused. */
export function isSafeVersion(value: unknown): value is string {
  return typeof value === "string" && VERSION_RE.test(value);
}

const ADVISORY_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;

export function isSafeAdvisoryId(value: unknown): value is string {
  return typeof value === "string" && ADVISORY_ID_RE.test(value);
}

export function toDate(value: unknown): Date | undefined {
  if (typeof value !== "string") return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/**
 * Compares two dotted versions ("1.2.10" > "1.2.9"). A pre-release ("2.0.0-beta.1")
 * sorts before its release. Good enough to pick a fixed version; not a full semver parser.
 */
export function compareVersions(a: string, b: string): number {
  const [mainA = "", preA] = a.split("-", 2);
  const [mainB = "", preB] = b.split("-", 2);
  const pa = mainA.split(".").map((n) => Number.parseInt(n, 10) || 0);
  const pb = mainB.split(".").map((n) => Number.parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return Math.sign(diff);
  }
  if (preA === undefined && preB !== undefined) return 1;
  if (preA !== undefined && preB === undefined) return -1;
  if (preA !== undefined && preB !== undefined) return preA < preB ? -1 : preA > preB ? 1 : 0;
  return 0;
}
