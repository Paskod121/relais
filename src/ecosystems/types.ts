import type { Sources } from "../core/http.ts";
import type { PackageFacts } from "../policy.ts";

/**
 * One package ecosystem (npm today, PyPI next). Everything specific to a registry lives
 * behind this interface; rules, messages and output are shared. See docs/ADDING_AN_ECOSYSTEM.md.
 */
export interface Ecosystem {
  /** Prefix users can type: "npm:express". */
  id: string;
  displayName: string;
  /** Splits "name@version" (or the ecosystem's own syntax); throws InvalidNameError. */
  parseSpec(input: string): { name: string; requested: string };
  /** Collects facts; throws RegistryError when the registry itself cannot be used. */
  gatherFacts(name: string, requested: string, sources: Sources): Promise<PackageFacts>;
  /** Widely used names, only for spotting lookalikes. */
  popular: readonly string[];
  commands: {
    install(name: string, version?: string): string;
    uninstall(name: string): string;
    listVersions(name: string): string;
  };
}

export class InvalidNameError extends Error {
  override name = "InvalidNameError";
}

/** A known ecosystem that is planned but not implemented yet. */
export class UnsupportedEcosystemError extends Error {
  override name = "UnsupportedEcosystemError";
  readonly ecosystem: string;
  constructor(ecosystem: string) {
    super(ecosystem);
    this.ecosystem = ecosystem;
  }
}
