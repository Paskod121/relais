import { npm } from "./npm.ts";
import { type Ecosystem, InvalidNameError, UnsupportedEcosystemError } from "./types.ts";

export const ECOSYSTEMS: Record<string, Ecosystem> = { npm };

/** Ecosystems people may ask for that are planned. Contributions welcome: docs/ADDING_AN_ECOSYSTEM.md */
export const PLANNED = ["pypi", "cargo", "rubygems", "go", "vscode"] as const;

export const DEFAULT_ECOSYSTEM = npm;

export function getEcosystem(id: string): Ecosystem | undefined {
  return ECOSYSTEMS[id];
}

/** "express" and "npm:express" go to npm; "pypi:requests" is planned; anything else is invalid. */
export function resolveTarget(input: string): { ecosystem: Ecosystem; spec: string } {
  const colon = input.indexOf(":");
  if (colon <= 0) return { ecosystem: DEFAULT_ECOSYSTEM, spec: input };
  const prefix = input.slice(0, colon).toLowerCase();
  const spec = input.slice(colon + 1);
  const ecosystem = ECOSYSTEMS[prefix];
  if (ecosystem) return { ecosystem, spec };
  if ((PLANNED as readonly string[]).includes(prefix)) throw new UnsupportedEcosystemError(prefix);
  throw new InvalidNameError(input);
}

export type { Ecosystem };
export { InvalidNameError, UnsupportedEcosystemError };
