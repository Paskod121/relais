# Contributing to relais

Thanks for helping. Contributions in English or French are equally welcome. [Version française](CONTRIBUTING.fr.md).

## The most useful contributions right now

1. **Package reports.** An AI suggested a package that looked like a copy of a known one, or did something odd at install? Use the [package report form](https://github.com/Paskod121/relais/issues/new?template=package_report.yml). If the name **does not exist yet**, report it [privately](https://github.com/Paskod121/relais/security/advisories/new) instead: a public list of invented names is a gift to attackers.
2. **Design feedback** on [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), in [Discussions](https://github.com/Paskod121/relais/discussions).
3. **Code**, starting with issues labelled `good first issue`. The biggest contribution is a new ecosystem: see [docs/ADDING_AN_ECOSYSTEM.md](docs/ADDING_AN_ECOSYSTEM.md).
4. **Attacks.** Read [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) and try to break relais. Report what works privately.

## Set up

Requires Node 22.23.4 or later (24 recommended, see `.nvmrc`).

```sh
git clone https://github.com/Paskod121/relais.git
cd relais
npm ci
npm run check
```

`npm ci` downloads about 71 MB. If data is expensive for you, run it once on Wi-Fi; nothing else in the workflow needs the network.

| Command                         | What it does                                      |
| ------------------------------- | ------------------------------------------------- |
| `npm run check`                 | Lint, typecheck and tests. Run before every push. |
| `npm test`                      | Tests only, with Node's built-in test runner.     |
| `npm run format`                | Formats and fixes lint issues with Biome.         |
| `npm run build`                 | Compiles `src/` to `dist/`.                       |
| `node src/cli.ts check express` | Runs the CLI from source, no build needed.        |

## How we work

- **Open an issue before large changes**, so nobody spends a week on something that will not be merged.
- **One pull request, one change.** Small PRs are reviewed faster.
- **Tests come with the code.** Bug fixes include a test that fails without the fix.
- **No new runtime dependencies** without discussion. Every dependency costs every user data and trust.
- **Commit and PR titles follow [Conventional Commits](https://www.conventionalcommits.org/)**: `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`. PRs are squash-merged, so the PR title becomes the commit and feeds the changelog.

## Code style

TypeScript, strict mode, ES modules. Relative imports use the `.ts` extension; the build rewrites them. Biome handles formatting, so do not argue with it, run `npm run format`.

## Releases

Maintainers merge the release PR opened automatically by release-please. Publishing to npm then happens from CI with trusted publishing and provenance. Nobody publishes from a laptop.

## Conduct

By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
