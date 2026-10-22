import type { Advisory } from "../policy.ts";
import { type Sources, tryJson } from "./http.ts";
import { isSafeAdvisoryId, isSafeVersion, sanitize } from "./text.ts";

interface OsvVuln {
  id?: unknown;
  summary?: unknown;
  affected?: {
    package?: { name?: unknown };
    ranges?: { events?: { fixed?: unknown }[] }[];
  }[];
}

/**
 * Asks OSV (osv.dev) which advisories cover this exact version. OSV aggregates GitHub,
 * npm, PyPI and the OpenSSF malicious-packages feed (ids starting with "MAL-").
 * Returns undefined when OSV cannot be reached, so callers can say it was not checked.
 */
export async function queryAdvisories(
  sources: Sources,
  osvEcosystem: string,
  name: string,
  version: string,
): Promise<Advisory[] | undefined> {
  const body = (await tryJson(sources, sources.osv, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ version, package: { name, ecosystem: osvEcosystem } }),
  })) as { vulns?: OsvVuln[] } | undefined;
  if (body === undefined) return undefined;

  const out: Advisory[] = [];
  for (const v of body.vulns ?? []) {
    if (!isSafeAdvisoryId(v.id)) continue;
    const fixed = new Set<string>();
    for (const affected of v.affected ?? []) {
      if (affected.package?.name !== name) continue;
      for (const range of affected.ranges ?? []) {
        for (const event of range.events ?? []) {
          if (isSafeVersion(event.fixed)) fixed.add(event.fixed);
        }
      }
    }
    out.push({
      id: v.id,
      ...(typeof v.summary === "string" ? { summary: sanitize(v.summary) } : {}),
      ...(fixed.size > 0 ? { fixed: [...fixed] } : {}),
    });
  }
  return out;
}
