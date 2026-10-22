import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_POLICY,
  evaluate,
  type PackageFacts,
  pickFixVersion,
  type Report,
} from "../src/policy.ts";
import { daysAgo, NOW } from "./fake-registry.ts";

function facts(over: Partial<PackageFacts> = {}): PackageFacts {
  return {
    ecosystem: "npm",
    name: "good-lib",
    requested: "",
    exists: true,
    versionFound: true,
    version: "2.0.0",
    publishedAt: new Date(daysAgo(40)),
    createdAt: new Date(daysAgo(900)),
    weeklyDownloads: 50_000,
    installScripts: [],
    hasProvenance: true,
    advisories: [],
    ...over,
  };
}

const codes = (r: Report) => r.findings.map((f) => f.code);
const find = (r: Report, code: string) => r.findings.find((f) => f.code === code);

describe("evaluate", () => {
  it("passes an established package", () => {
    const r = evaluate(facts(), undefined, NOW);
    assert.equal(r.verdict, "pass");
    assert.deepEqual(codes(r), ["age", "provenance"]);
  });

  it("blocks a name that does not exist and suggests the real one", () => {
    const r = evaluate(
      facts({ name: "reactt", exists: false, versionFound: false, lookalikeOf: "react" }),
      undefined,
      NOW,
    );
    assert.equal(r.verdict, "block");
    assert.deepEqual(r.findings, [{ code: "not-found", level: "block", lookalikeOf: "react" }]);
  });

  it("blocks a missing version", () => {
    const r = evaluate(facts({ versionFound: false, requested: "9.9.9" }), undefined, NOW);
    assert.deepEqual(codes(r), ["version-not-found"]);
  });

  it("blocks known malware, even for an allowed name", () => {
    const r = evaluate(
      facts({ advisories: [{ id: "MAL-2025-1" }] }),
      { ...DEFAULT_POLICY, allow: ["good-lib"] },
      NOW,
    );
    assert.equal(r.verdict, "block");
  });

  it("warns on ordinary vulnerabilities and names the first fixed version", () => {
    const r = evaluate(
      facts({
        version: "4.17.15",
        advisories: [
          { id: "GHSA-a", fixed: ["4.17.19"] },
          { id: "GHSA-b", fixed: ["4.17.21", "3.10.2"] },
        ],
      }),
      undefined,
      NOW,
    );
    assert.equal(r.verdict, "warn");
    assert.deepEqual(find(r, "vulnerabilities"), {
      code: "vulnerabilities",
      level: "warn",
      ids: ["GHSA-a", "GHSA-b"],
      fixVersion: "4.17.21",
    });
  });

  it("blocks a release younger than the cooldown unless the user allows the name", () => {
    const fresh = facts({ publishedAt: new Date(NOW.getTime() - 5 * 3_600_000) });
    assert.equal(evaluate(fresh, undefined, NOW).verdict, "block");
    const allowed = evaluate(fresh, { ...DEFAULT_POLICY, allow: ["good-lib"] }, NOW);
    assert.equal(allowed.verdict, "warn");
    assert.equal(find(allowed, "too-new")?.level, "warn");
  });

  it("blocks a package that is both brand new and unused", () => {
    const r = evaluate(
      facts({ createdAt: new Date(daysAgo(3)), weeklyDownloads: 12, lookalikeOf: "react" }),
      undefined,
      NOW,
    );
    assert.equal(r.verdict, "block");
    assert.ok(codes(r).includes("unproven"));
    assert.ok(codes(r).includes("lookalike"));
    assert.equal(codes(r).includes("young-package"), false);
  });

  it("only warns when a package is new or little used, not both", () => {
    const young = evaluate(facts({ createdAt: new Date(daysAgo(3)) }), undefined, NOW);
    assert.equal(young.verdict, "warn");
    assert.ok(codes(young).includes("young-package"));
    const quiet = evaluate(facts({ weeklyDownloads: 5 }), undefined, NOW);
    assert.equal(quiet.verdict, "warn");
    assert.ok(codes(quiet).includes("low-downloads"));
  });

  it("does not call an established package a lookalike", () => {
    const r = evaluate(
      facts({ name: "preact", lookalikeOf: "react", weeklyDownloads: 4_000_000 }),
      undefined,
      NOW,
    );
    assert.equal(codes(r).includes("lookalike"), false);
  });

  it("says so when something could not be checked", () => {
    const { advisories: _a, publishedAt: _p, ...rest } = facts();
    const r = evaluate(rest, undefined, NOW);
    assert.equal(r.verdict, "warn");
    assert.ok(codes(r).includes("advisories-unchecked"));
    assert.ok(codes(r).includes("age-unchecked"));
  });
});

describe("pickFixVersion", () => {
  it("returns undefined when one advisory has no fix above the current version", () => {
    assert.equal(pickFixVersion("1.0.0", [{ id: "A", fixed: ["1.0.1"] }, { id: "B" }]), undefined);
    assert.equal(pickFixVersion("2.0.0", [{ id: "A", fixed: ["1.5.0"] }]), undefined);
  });
});
