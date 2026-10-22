# Adding an ecosystem

relais is built so that a new registry (PyPI, crates.io, RubyGems, VS Code extensions...) is one file, without touching the rules, the messages or the output. This is the best way to make a big contribution.

## What you write

One module in `src/ecosystems/`, exporting an object that matches the `Ecosystem` interface in [`src/ecosystems/types.ts`](../src/ecosystems/types.ts):

| Member                                  | What it does                                                                                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`, `displayName`                     | `"pypi"`, `"PyPI"`. The id is what users type: `relais check pypi:requests`                                                                          |
| `parseSpec(input)`                      | Splits the ecosystem's own syntax into a name and a requested version; throws `InvalidNameError` for anything the registry would refuse              |
| `gatherFacts(name, requested, sources)` | Fills a `PackageFacts` object. Throws `RegistryError` when the registry itself is unusable; leaves a field undefined when a secondary source is down |
| `popular`                               | A sorted list of widely used names, only for lookalike detection                                                                                     |
| `commands`                              | The install, uninstall and list-versions commands shown to beginners                                                                                 |

Then register it in `ECOSYSTEMS` in [`src/ecosystems/index.ts`](../src/ecosystems/index.ts) and remove it from `PLANNED`.

## Rules every adapter follows

1. **Use the shared helpers.** `getJson` and `tryJson` from `src/core/http.ts` (size cap, timeout, no redirects), `queryAdvisories` from `src/core/osv.ts` with the ecosystem's OSV name (`"PyPI"`, `"crates.io"`...).
2. **Treat every string from the registry as hostile.** Run author text through `sanitize`; accept versions only through `isSafeVersion`.
3. **Download as little as possible.** Prefer small endpoints; fetch big documents only when needed, and say why in a comment.
4. **Never guess.** If a fact cannot be read, leave it undefined: the policy turns unknowns into visible warnings.
5. **Tests without the network.** Add `test/<id>.test.ts` using `fakeSources`, including the hostile-registry cases (escape codes, bad versions, oversized responses). Add a live test in `test-live/` so the canary watches the real registry.

## Suggested order

PyPI first: OSV covers its malware with the same `MAL-` advisories as npm, and the JSON API at `https://pypi.org/pypi/<name>/json` gives upload times; attestations come from its integrity API (PEP 740).

Open an issue before you start, so two people do not build the same adapter.
