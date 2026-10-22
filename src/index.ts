export { type CheckOptions, checkPackage } from "./check.ts";
export { DEFAULT_SOURCES, type FetchLike, RegistryError, type Sources } from "./core/http.ts";
export { compareVersions, sanitize } from "./core/text.ts";
export {
  ECOSYSTEMS,
  type Ecosystem,
  getEcosystem,
  InvalidNameError,
  PLANNED,
  resolveTarget,
  UnsupportedEcosystemError,
} from "./ecosystems/index.ts";
export { editDistance, findLookalike } from "./lookalike.ts";
export {
  type Advisory,
  DEFAULT_POLICY,
  evaluate,
  type Finding,
  type Level,
  type PackageFacts,
  type Policy,
  pickFixVersion,
  type Report,
  type Verdict,
} from "./policy.ts";
