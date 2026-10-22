<h1 align="center">relais</h1>

<p align="center"><strong>Download your dependencies once. Install them on every machine in the room.</strong></p>

<p align="center">
  <a href="https://github.com/Paskod121/relais/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Paskod121/relais/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@pasod121/relais"><img alt="npm" src="https://img.shields.io/npm/v/@pasod121/relais"></a>
  <a href="https://scorecard.dev/viewer/?uri=github.com/Paskod121/relais"><img alt="OpenSSF Scorecard" src="https://api.scorecard.dev/projects/github.com/Paskod121/relais/badge"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue"></a>
</p>

<p align="center"><a href="README.fr.md">Lire en français</a></p>

---

A fresh Next.js project downloads about **215 MB** of packages. In a classroom of 30, that is **6.45 GB** of identical bytes pulled from the internet 30 times, paid for out of students' own mobile data.

relais is a small local relay for npm. One machine in the room fetches each package once; every other machine installs it from that machine, over the local Wi-Fi or a phone hotspot, without spending data.

## Status

**Early. The relay is being designed in the open.** What ships today is `relais estimate`, which computes what a group would save. We are collecting real numbers from classrooms before building the relay itself, so the design follows the field, not the other way round.

If you teach, organise a bootcamp or run a hackathon, a [field report](https://github.com/Paskod121/relais/issues/new?template=field_report.yml) is the most useful thing you can give right now.

## What it costs today

Measured on 22 October 2026 with an empty npm cache (npm 10.9, Node 22):

| Starter stack             | Downloaded per machine | For a class of 30 |
| ------------------------- | ---------------------- | ----------------- |
| Next.js + React           | 215 MB                 | 6.45 GB           |
| Tailwind + Vite           | 181 MB                 | 5.43 GB           |
| Vite + React + TypeScript | 177 MB                 | 5.31 GB           |
| Express                   | 8 MB                   | 240 MB            |

Method and raw numbers: [docs/MEASUREMENTS.md](docs/MEASUREMENTS.md).

## Try the estimator

```sh
npx @pasod121/relais estimate --size 215 --installs 30 --price 540 --currency XOF
```

```text
30 machines installing 215 MB each

  Downloaded without a relay  6.45 GB
  Downloaded with a relay    215 MB
  Data avoided              6.24 GB

  Cost: F CFA 3,483 -> F CFA 116
  Saved                      F CFA 3,367
```

Set `RELAIS_LANG=fr` for French output. Requires Node 22.18 or later.

## How the relay will work

1. One machine runs `relais` and announces itself on the local network.
2. Other machines point npm at it with a single command.
3. The first request for a package goes to the official registry; every later request is served locally.
4. Every package served is checked against the integrity hash published by the official registry, so a relay can never inject code.
5. A counter shows the data and money saved after each session.

The design is open for discussion in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Principles

- **Zero configuration** for the person installing. If it takes a tutorial, it failed.
- **Never weaker than npm.** Integrity is verified; nothing is trusted because it is local.
- **Cheap to contribute to.** No runtime dependencies. The full dev setup downloads about 71 MB, most of it the TypeScript and Biome compilers.
- **Measured, not assumed.** Features ship when field reports show they matter.

## Why this exists

Package managers are built for unlimited fibre. In much of Africa, and in classrooms, conferences and community centres everywhere, bandwidth is metered, shared or unreliable. Earlier projects such as local-npm proved the idea and were abandoned where bandwidth is cheap. relais is built in Lomé, Togo, for the places where it is not.

## Contributing

Bug reports, field reports, docs and code are all welcome, in English or French. Start with [CONTRIBUTING.md](CONTRIBUTING.md) and look for issues labelled `good first issue`.
- [Roadmap](ROADMAP.md)
- [Governance](GOVERNANCE.md)
- [Security policy](SECURITY.md)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

[MIT](LICENSE) © Pascal Sewonou and contributors.
