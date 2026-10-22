import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { run } from "../src/cli.ts";
import { detectLang } from "../src/messages.ts";

describe("cli", () => {
  it("prints help with no command", () => {
    const r = run([], "en");
    assert.equal(r.code, 0);
    assert.match(r.out, /Usage/);
  });

  it("prints the package version", () => {
    const r = run(["--version"], "en");
    assert.equal(r.code, 0);
    assert.match(r.out, /^\d+\.\d+\.\d+/);
  });

  it("estimates savings for a classroom", () => {
    const r = run(
      ["estimate", "--size", "215", "--installs", "30", "--price", "540", "--currency", "xof"],
      "en",
    );
    assert.equal(r.code, 0);
    assert.match(r.out, /6\.45 GB/);
    assert.match(r.out, /3,367/);
  });

  it("answers in French", () => {
    const r = run(["estimate", "--size", "215", "--installs", "30"], "fr");
    assert.equal(r.code, 0);
    assert.match(r.out, /Data évitée/);
  });

  it("fails clearly on bad input", () => {
    assert.equal(run(["estimate", "--installs", "3"], "en").code, 1);
    assert.equal(run(["estimate", "--size", "10", "--installs", "0"], "en").code, 1);
    assert.equal(
      run(["estimate", "--size", "10", "--installs", "2", "--price", "abc"], "en").code,
      1,
    );
    assert.equal(run(["deploy"], "en").code, 1);
  });

  it("detects French from the environment", () => {
    assert.equal(detectLang({ LANG: "fr_FR.UTF-8" }), "fr");
    assert.equal(detectLang({ LANG: "en_US.UTF-8" }), "en");
    assert.equal(detectLang({ RELAIS_LANG: "fr", LANG: "en_US" }), "fr");
  });
});
