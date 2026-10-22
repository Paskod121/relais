import { DEFAULT_SOURCES, type Sources } from "./core/http.ts";
import { resolveTarget } from "./ecosystems/index.ts";
import { DEFAULT_POLICY, evaluate, type Policy, type Report } from "./policy.ts";

export interface CheckOptions {
  sources?: Sources;
  policy?: Policy;
  now?: Date;
}

/**
 * Checks one package, such as "express", "lodash@4.17.21" or "npm:@types/node".
 * Throws InvalidNameError, UnsupportedEcosystemError or RegistryError; never returns "pass"
 * for something it could not verify.
 */
export async function checkPackage(input: string, options: CheckOptions = {}): Promise<Report> {
  const { ecosystem, spec } = resolveTarget(input.trim());
  const { name, requested } = ecosystem.parseSpec(spec);
  const facts = await ecosystem.gatherFacts(name, requested, options.sources ?? DEFAULT_SOURCES);
  return evaluate(facts, options.policy ?? DEFAULT_POLICY, options.now ?? new Date());
}
