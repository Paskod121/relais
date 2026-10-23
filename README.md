<h1 align="center">relais</h1>

<p align="center"><strong>Your AI agent installs packages. relais checks each one first.</strong></p>

<p align="center">
  <a href="https://github.com/Paskod121/relais/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Paskod121/relais/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@paskod121/relais"><img alt="npm" src="https://img.shields.io/npm/v/@paskod121/relais"></a>
  <a href="https://scorecard.dev/viewer/?uri=github.com/Paskod121/relais"><img alt="OpenSSF Scorecard" src="https://api.scorecard.dev/projects/github.com/Paskod121/relais/badge"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue"></a>
</p>

<p align="center"><a href="README.fr.md">Lire en français</a></p>

---

Coding agents now run `npm install` on their own, and nobody reads what they pull in. Language models invent package names in close to one code sample out of five in published research, attackers register those names, and worms such as Shai-Hulud spread through hundreds of real packages in a few days.

relais stands between your machine and npm and answers one question before anything is installed: **should this package be trusted, yes or no, and why?**

## Try it

```sh
npx @paskod121/relais check express react_dom
```

```text
express@5.3.0  OK
  info  Published 13 days ago.
  info  Verified provenance: this version was built and published from public CI.

react_dom  BLOCKED
  BLOCK  react_dom does not exist on npm. AI assistants often invent package names,
         and attackers then register them to trap whoever installs them.
         What to do: If you meant react-dom: npm install react-dom
```

Every problem comes with the next step, written for someone who started coding last month: the exact command to install the right package, or to update to the first version that fixes a known flaw.

Requires Node 22.23.4 or later.. Set `RELAIS_LANG=fr` for French output.

## What it checks

| Check                                  | Verdict                            | Why it matters                                                   |
| -------------------------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| The name exists on npm                 | Block if not                       | Invented names are the entry point of slopsquatting              |
| Known malware (OSV `MAL-` advisories)  | Block                              | Published malicious packages are catalogued within hours         |
| Age of the version                     | Block under 72 h (configurable)    | Most poisoned releases are caught within days                    |
| Lookalike of a popular package         | Warn                               | Typosquats and near-miss names an AI may have mixed up           |
| Package both brand new and barely used | Block (`--allow` for your own)     | The profile of a name registered as a trap                       |
| Install-time scripts                   | Warn                               | The usual way malware runs on your machine                       |
| Known vulnerabilities, deprecation     | Warn, with the first fixed version | Old projects and AI-suggested versions often pin broken releases |
| Build provenance                       | Info                               | Links the version to its public source and CI                    |

When something cannot be verified, relais says so. It never reports "safe" by default.

## For agents and CI

```sh
npx @paskod121/relais check some-package --json
```

| Exit code | Meaning                                                                |
| --------- | ---------------------------------------------------------------------- |
| 0         | Nothing blocking. Read the warnings.                                   |
| 2         | At least one package is blocked. Do not install.                       |
| 1         | Could not verify (network, registry, invalid name). Treat as not safe. |

Text written by package authors (deprecation notes) never appears in `message`: it is returned in `untrusted.authorNote`, so an agent cannot mistake it for an instruction.

You can tell your coding agent, in its instructions file: _"Before adding any npm dependency, run `npx @paskod121/relais check <name> --json` and do not install if the exit code is not 0."_

## Why relais

- **Built for agents first.** Structured output, strict exit codes, plain explanations a model can relay to a human.
- **Frugal.** Under 10 KB per check for popular packages; the full metadata document is fetched only for rarely used packages, where it is small. Made in Lomé, where data is paid by the megabyte.
- **No telemetry, no account, MIT.** Nothing about what you install leaves your machine except the queries to npm and OSV.
- **Zero runtime dependencies.** A security tool should not widen your attack surface.

## Security of relais itself

A tool in this position is a target. Every string from a registry is treated as hostile (escape codes, invisible characters and oversized responses are stripped or refused), relais has no runtime dependencies and no npm token, and releases are published from CI with provenance. What we defend against, and the known gaps: [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).

## Ecosystems

npm today. The core is built so that a new registry is one file: PyPI is next, and contributions are welcome ([guide](docs/ADDING_AN_ECOSYSTEM.md)). `relais check pypi:requests` already tells you it is planned.

## Where it is going

`relais check` is the first brick. Next comes a local registry that applies the same rules automatically to everything that installs on a machine or a network, npm, pnpm, bun, `npx` inside MCP configs and agents included, keeps a readable log of what each agent installed, records attempts to install packages that do not exist, and serves cached packages offline. See [ROADMAP.md](ROADMAP.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Contributing

Bug reports, suspicious packages, docs and code are welcome, in English or French. Start with [CONTRIBUTING.md](CONTRIBUTING.md). If an AI suggested a package that looked wrong, [report it](https://github.com/Paskod121/relais/issues/new?template=package_report.yml). If the name does not exist yet, report it [privately](https://github.com/Paskod121/relais/security/advisories/new): a public list of invented names helps attackers.
- [Security policy](SECURITY.md)
- [Governance](GOVERNANCE.md)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

[MIT](LICENSE) © Pascal Sewonou and contributors.
