import { DEFAULT_SOURCES, type Sources } from "../src/core/http.ts";

export interface FakeRoute {
  status: number;
  body?: unknown;
}

/** A registry that answers from a fixed table. Unknown URLs answer 404, "THROW" simulates a network failure. */
export function fakeSources(
  routes: Record<string, FakeRoute | "THROW">,
): Sources & { calls: string[] } {
  const calls: string[] = [];
  return {
    ...DEFAULT_SOURCES,
    calls,
    fetch: async (input) => {
      calls.push(input);
      const route = routes[input];
      if (route === "THROW") throw new Error("network down");
      const { status, body } = route ?? { status: 404, body: { error: "Not found" } };
      return new Response(body === undefined ? "" : JSON.stringify(body), { status });
    },
  };
}

export const R = "https://registry.npmjs.org";
export const OSV = "https://api.osv.dev/v1/query";
export const NOW = new Date("2026-10-22T12:00:00Z");

export function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 86_400_000).toISOString();
}

export function search(name: string, weekly: number, version: string, date: string) {
  return {
    status: 200,
    body: { objects: [{ downloads: { weekly }, package: { name, version, date } }] },
  };
}
