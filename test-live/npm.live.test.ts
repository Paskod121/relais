/**
 * Live checks against the real npm registry and OSV. They are not part of `npm test`:
 * they run on a schedule (.github/workflows/canary.yml) to notice quickly when an
 * upstream service changes its answers. Assertions only use facts that stay true over time.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkPackage } from "../src/check.ts";
import { DEFAULT_SOURCES } from "../src/core/http.ts";
import { npm } from "../src/ecosystems/npm.ts";

describe("live: npm registry", () => {
  it("blocks a name that does not exist and suggests the real one", async () => {
    const report = await checkPackage("react_dom");
    assert.equal(report.verdict, "block");
    assert.deepEqual(report.findings[0], {
      code: "not-found",
      level: "block",
      lookalikeOf: "react-dom",
    });
  });

  it("reads a popular package without downloading its full document", async () => {
    const facts = await npm.gatherFacts("express", "", DEFAULT_SOURCES);
    assert.equal(facts.exists, true);
    assert.ok(facts.version, "resolves the latest version");
    assert.ok(
      (facts.weeklyDownloads ?? 0) > 1_000_000,
      "search API still returns weekly downloads",
    );
    assert.ok(facts.publishedAt, "search API still returns the publish date");
  });

  it("handles scoped packages", async () => {
    const facts = await npm.gatherFacts("@types/node", "", DEFAULT_SOURCES);
    assert.equal(facts.exists, true);
  });

  it("tells a missing version apart from a missing package", async () => {
    const facts = await npm.gatherFacts("express", "0.0.0-relais-canary", DEFAULT_SOURCES);
    assert.equal(facts.exists, true);
    assert.equal(facts.versionFound, false);
  });

  it("reads install scripts from the version manifest", async () => {
    // esbuild has shipped a postinstall script for years.
    const facts = await npm.gatherFacts("esbuild", "", DEFAULT_SOURCES);
    assert.ok(facts.installScripts.length > 0);
  });
});

describe("live: OSV advisories", () => {
  it("still answers, knows old lodash flaws, and gives a fixed version", async () => {
    const report = await checkPackage("lodash@4.17.15");
    const vulns = report.findings.find((f) => f.code === "vulnerabilities");
    assert.ok(vulns, "osv.dev answered with known advisories");
    assert.ok("fixVersion" in vulns && vulns.fixVersion, "fixed versions are still published");
  });
});
