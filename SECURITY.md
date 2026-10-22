# Security policy

relais sits between developers and the npm registry. A flaw in it could put code on many machines at once, so security reports get priority over everything else.

## Reporting a vulnerability

**Do not open a public issue.** Report privately through GitHub:
[Report a vulnerability](https://github.com/Paskod121/relais/security/advisories/new).

Please include what you found, how to reproduce it, and the impact you expect. English or French.

## What happens next

| Step                                                | Target         |
| --------------------------------------------------- | -------------- |
| Acknowledgement of your report                      | within 3 days  |
| First assessment and severity                       | within 7 days  |
| Fix released for a confirmed high or critical issue | within 30 days |

You will be credited in the advisory unless you ask otherwise.

## Supported versions

Only the latest published version receives security fixes while the project is below 1.0.

## Security design commitments

- Every package served by a relay is verified against the integrity hash published by the official registry. A relay never serves a tarball it cannot verify.
- No package metadata is generated locally.
- Releases are published only from CI, with npm trusted publishing and provenance. No long-lived npm token exists for this project.
- GitHub Actions are pinned to full commit SHAs and run with read-only tokens by default.
