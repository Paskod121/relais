# Roadmap

Each phase has a bar to clear before the next one starts. If a bar is missed, we change course rather than build on a guess. Items marked **open to contributors** are designed to be picked up by anyone; see [docs/GOOD_FIRST_ISSUES.md](docs/GOOD_FIRST_ISSUES.md).

## Phase 0: `relais check` for npm (now)

- Checks a package before install: existence, known malware, release age, brand-new and unused names, lookalikes, install scripts, vulnerabilities with the first fixed version, provenance.
- Plain-language explanation and the exact next command for every problem, in English and French.
- JSON output and strict exit codes for agents and CI; author text kept apart from messages.
- Ecosystem adapters: the core is ready for more registries.
- **Bar:** 20 developers or teams use it from their agent instructions or CI, with fewer than 1 wrong block in 100 checks reported.

## Phase 1: Incidents and old projects

- `relais scan`: reads `package-lock.json` and answers the incident question, "am I affected?", listing only what is malicious, vulnerable or abandoned, each with the command that fixes it. **Open to contributors.**
- Fix proposals as a diff or pull request, never silent upgrades: target versions must pass the same checks (old enough, no malware, provenance preferred), then tests run.
- PyPI adapter. **Open to contributors.**
- A ready-made instruction snippet and MCP tool so agents call relais by themselves before adding a dependency.
- **Bar:** run on 50 real repositories; during the next public npm or PyPI incident, relais gives a correct yes or no within hours.

## Phase 2: Local registry

- A registry proxy that applies the same policy automatically to every tool on a machine or network: npm, pnpm, yarn, bun, `npx` in MCP configs, agents.
- Integrity verification of every tarball against the official registry.
- Audit log: what was installed, by which process, what was blocked and why; log of attempts to install names that do not exist.
- Offline cache: verified packages are served without the internet, and fetched once for a whole group.
- **Bar:** a team or classroom runs it for two weeks, and the log catches at least one real problem.

## Phase 3: More ecosystems

- In order of demand: crates.io, RubyGems, Go modules, editor extensions. Each one is an adapter. **Open to contributors.**

## Not planned

- Silent automatic upgrades. Blind auto-updates are how poisoned releases spread.
- Rewriting application code for breaking changes. That is the job of the developer or their agent; relais decides which versions are safe to move to.
- A hosted service, accounts, or telemetry of any kind.
