# Architecture

Open for discussion in [Discussions](https://github.com/Paskod121/relais/discussions).

## Layout

```text
src/
  cli.ts              command line: arguments, human and JSON output, exit codes
  check.ts            checkPackage(): resolve ecosystem, gather facts, evaluate
  policy.ts           evaluate(): pure decision, facts + policy + clock -> report
  messages.ts         describe() and advise(): what it means, what to do (en, fr)
  lookalike.ts        typo and lookalike detection, shared by all ecosystems
  core/
    http.ts           fetch with timeout, 10 MB cap, no redirects; fixed endpoints
    osv.ts            OSV advisories and fixed versions, for any ecosystem
    text.ts           sanitizing untrusted text, version checks, version ordering
  ecosystems/
    types.ts          the Ecosystem interface every adapter implements
    index.ts          registry of adapters, "npm:" style prefixes, planned ones
    npm.ts            the npm adapter
    npm-popular.ts    widely used npm names, for lookalike detection only
```

## Flow of one check

```text
  "lodash@4.17.15"
        |
  resolveTarget ---------> npm adapter (default) or "pypi:" ... (planned)
        |
  gatherFacts             version manifest (~3 KB), search entry (~5 KB),
  (adapter)               full metadata only when needed, OSV advisories
        |                 every string sanitized, every version validated
        v
  evaluate (pure)  -----> findings: block / warn / info, verdict, fix version
        |
  describe + advise ----> plain explanation + next command, in English or French
        |
  cli --------------------> text for humans, or JSON for agents; exit 0 / 2 / 1
```

## Design rules

1. **Facts and decisions are separate.** Adapters only collect; `evaluate` only decides. Every rule is unit tested without the network.
2. **Fail closed.** Registry unreachable: error, exit 1, never "safe". A secondary source missing: a visible warning.
3. **Every outside string is hostile.** See [THREAT_MODEL.md](THREAT_MODEL.md).
4. **Frugal by default.** Small endpoints first; big documents only when they are small anyway.
5. **No runtime dependencies, no telemetry.**
6. **One adapter per ecosystem.** Adding PyPI must not touch the rules: [ADDING_AN_ECOSYSTEM.md](ADDING_AN_ECOSYSTEM.md).

## Next: the local registry (Phase 2)

```text
  agents, npm, pnpm, bun, npx (MCP)
               |
               v
  +-------- relais (local) --------+
  | registry proxy                  |
  | same policy as `relais check`   |
  | tarball integrity verification  |
  | audit log + phantom-name log    |
  | verified cache (offline)        |
  +---------------------------------+
               |
               v
      registries, OSV
```

## Open questions

- How to attribute an install to a given agent session in the audit log.
- Default cooldown: 72 hours today. Shorter for security fixes of packages already in a project?
- Lockfile formats to support first in `relais scan`: npm v2/v3, then pnpm and yarn.
