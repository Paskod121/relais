import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareVersions, isSafeAdvisoryId, isSafeVersion, sanitize } from "../src/core/text.ts";

describe("sanitize", () => {
  it("removes terminal escape codes and control characters", () => {
    assert.equal(sanitize("\u001b[31mred\u001b[0m text"), "red text");
    assert.equal(sanitize("a\u0007b\u0000c"), "a b c");
    assert.equal(sanitize("\u001b]8;;https://evil.example\u0007link\u001b]8;;\u0007"), "link");
  });

  it("removes invisible bidirectional characters", () => {
    assert.equal(sanitize("safe‮exe.txt"), "safe exe.txt");
  });

  it("caps the length", () => {
    assert.equal(sanitize("x".repeat(500), 10), "xxxxxxx...");
  });
});

describe("validators", () => {
  it("accepts versions and advisory ids, refuses anything else", () => {
    assert.ok(isSafeVersion("1.2.3-beta.1+build"));
    assert.ok(!isSafeVersion("1.2.3; rm -rf /"));
    assert.ok(!isSafeVersion("../../x"));
    assert.ok(isSafeAdvisoryId("GHSA-35jh-r3h4-6jhm"));
    assert.ok(isSafeAdvisoryId("MAL-2025-1234"));
    assert.ok(!isSafeAdvisoryId("<script>"));
  });
});

describe("compareVersions", () => {
  it("orders numerically, pre-releases before releases", () => {
    assert.equal(compareVersions("1.2.10", "1.2.9"), 1);
    assert.equal(compareVersions("4.17.21", "4.17.21"), 0);
    assert.equal(compareVersions("2.0.0-beta.1", "2.0.0"), -1);
    assert.equal(compareVersions("1.0", "1.0.1"), -1);
  });
});
