# Issues ready to open

Copy each block into a new GitHub issue with the label shown. They are sized for a first contribution. Maintainers: delete a block once it is opened.

---

**Title:** Add 20 widely used packages to the npm lookalike list
**Labels:** good first issue
**Body:** `src/ecosystems/npm-popular.ts` lists names used to spot lookalikes. Add 20 widely used packages that are missing (for example from your own projects). Keep the list sorted and lowercase; `npm test` checks both.

---

**Title:** Show how long until a too-new version becomes acceptable, in days when over 48 h
**Labels:** good first issue
**Body:** The "too-new" message counts in hours. Above 48 h, days read better. Change `describe` and `advise` in `src/messages.ts` and add a test.

---

**Title:** `relais check` reads names from a file
**Labels:** good first issue, enhancement
**Body:** Support `relais check --file names.txt` (one package per line, `#` for comments). Useful to check a list an AI produced. Add tests in `test/cli.test.ts`.

---

**Title:** Translate messages into a third language
**Labels:** good first issue, help wanted
**Body:** Messages live in `src/messages.ts` (English and French). Propose a third language you speak natively; the structure is the same for every language.

---

**Title:** `relais scan`: check every dependency in package-lock.json
**Labels:** enhancement, help wanted
**Body:** Read `package-lock.json` (v2 and v3), run the same checks on every installed package, and print only what is blocked or vulnerable, with the fix command. This is the "am I affected?" command for incidents. Discuss the design in the issue before coding.

---

**Title:** PyPI adapter
**Labels:** enhancement, help wanted
**Body:** Follow `docs/ADDING_AN_ECOSYSTEM.md`. Start with existence, upload time, OSV advisories and lookalikes.
