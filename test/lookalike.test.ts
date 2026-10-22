import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { POPULAR_NPM } from "../src/ecosystems/npm-popular.ts";
import { editDistance, findLookalike } from "../src/lookalike.ts";

const like = (name: string) => findLookalike(name, POPULAR_NPM);

describe("editDistance", () => {
  it("counts edits and adjacent swaps as one", () => {
    assert.equal(editDistance("react", "react"), 0);
    assert.equal(editDistance("reactt", "react"), 1);
    assert.equal(editDistance("raect", "react"), 1);
    assert.equal(editDistance("expres", "express"), 1);
    assert.equal(editDistance("kitten", "sitting"), 3);
  });
});

describe("findLookalike", () => {
  it("spots typos of popular names", () => {
    assert.equal(like("reactt"), "react");
    assert.equal(like("expres"), "express");
    assert.equal(like("axois"), "axios");
  });

  it("spots separator tricks and scope impersonation", () => {
    assert.equal(like("react_dom"), "react-dom");
    assert.equal(like("reactdom"), "react-dom");
    assert.equal(like("@helpful/express"), "express");
  });

  it("leaves popular and unrelated names alone", () => {
    assert.equal(like("react"), undefined);
    assert.equal(like("left-pad"), undefined);
    assert.equal(like("vuex"), undefined);
  });

  it("keeps the popular list sorted, lowercase and free of duplicates", () => {
    const sorted = [...POPULAR_NPM].sort();
    assert.deepEqual([...POPULAR_NPM], sorted);
    assert.equal(new Set(POPULAR_NPM).size, POPULAR_NPM.length);
    for (const n of POPULAR_NPM) assert.equal(n, n.toLowerCase());
  });
});
