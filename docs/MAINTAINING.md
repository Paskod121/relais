# Maintaining relais

Settings that live outside the code. Keep this file in sync when a setting changes.

## Repository settings

| Area              | Setting                                                                                              | Why                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| General           | Issues and Discussions on, Wiki off                                                                  | One place for questions, docs live in the repo               |
| Pull requests     | Squash merge only, title used as commit message, auto-delete branches                                | Clean history that release-please can read                   |
| Rules for `main`  | Pull request required, CI checks required, no force push, linear history                             | Nothing reaches users without passing CI                     |
| Actions           | Default workflow token read-only; allow Actions to create pull requests                              | Least privilege; release-please needs to open its release PR |
| Environment `npm` | Used by the publish job; optional required reviewer                                                  | A human can gate each publish                                |
| Security          | Private vulnerability reporting, Dependabot alerts and updates, secret scanning with push protection | Matches SECURITY.md                                          |
| Code scanning     | CodeQL runs from `.github/workflows/codeql.yml`; keep GitHub's default setup off                     | Avoid two CodeQL configurations                              |

## Publishing

Releases are fully automated:
1. Merged Conventional Commits accumulate on `main`.
2. release-please opens or updates a release PR with the version bump and changelog.
3. Merging that PR tags the release and the `publish` job runs `npm publish` with npm trusted publishing (OIDC). Provenance is attached automatically.

npm trusted publisher configuration for `@paskod121/relais`: provider GitHub Actions, owner `Paskod121`, repository `relais`, workflow `release.yml`, environment `npm`. The workflow file name must match exactly, and `repository.url` in `package.json` must match the GitHub repository.

## Staying current

Nothing here needs a human unless something breaks.

| What changes upstream                | What catches it                                            | What happens                                                                |
| ------------------------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| Dev tools (TypeScript, Biome, types) | Dependabot, daily, 3-day cooldown                          | Patch and minor updates merge alone after CI passes; majors wait for review |
| GitHub Actions                       | Dependabot, weekly, pinned SHAs                            | Same as above                                                               |
| npm registry or OSV API answers      | `canary.yml`, every 6 hours, `npm run test:live`           | An issue labelled `canary` is opened or updated                             |
| New Node release                     | `canary.yml` runs on the newest Node; CI runs on 22 and 24 | Same issue                                                                  |
| Our own features and fixes           | release-please on every merge to `main`                    | A release PR; merging it publishes to npm                                   |

Auto-merge needs "Allow auto-merge" enabled and the CI jobs marked as required checks on `main`; without required checks GitHub would merge before CI finishes. relais has no runtime dependencies, so dependency updates never change what users install and do not trigger a release.

## Labels to keep

`good first issue`, `help wanted`, `package report`, `canary`, `needs triage`, `bug`, `enhancement`, `security`, `docs`.
