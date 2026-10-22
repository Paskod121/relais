import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estimateSavings, formatMB, formatMoney } from "../src/savings.ts";

describe("estimateSavings", () => {
  it("counts one download with a relay and one per machine without", () => {
    const e = estimateSavings({ sizeMB: 215, installs: 30 });
    assert.equal(e.withoutRelayMB, 6450);
    assert.equal(e.withRelayMB, 215);
    assert.equal(e.avoidedMB, 6235);
    assert.equal(e.cost, undefined);
  });

  it("converts sizes to cost with a price per GB", () => {
    const e = estimateSavings({ sizeMB: 215, installs: 30, pricePerGB: 540 });
    assert.ok(e.cost);
    assert.equal(Math.round(e.cost.withoutRelay), 3483);
    assert.equal(Math.round(e.cost.withRelay), 116);
    assert.equal(Math.round(e.cost.saved), 3367);
  });

  it("saves nothing for a single machine", () => {
    const e = estimateSavings({ sizeMB: 100, installs: 1, pricePerGB: 1000 });
    assert.equal(e.avoidedMB, 0);
    assert.equal(e.cost?.saved, 0);
  });

  it("rejects invalid input", () => {
    assert.throws(() => estimateSavings({ sizeMB: 0, installs: 3 }), RangeError);
    assert.throws(() => estimateSavings({ sizeMB: 10, installs: 2.5 }), RangeError);
    assert.throws(() => estimateSavings({ sizeMB: 10, installs: 2, pricePerGB: -1 }), RangeError);
    assert.throws(() => estimateSavings({ sizeMB: Number.NaN, installs: 2 }), RangeError);
  });
});

describe("formatting", () => {
  it("switches to GB from 1000 MB", () => {
    assert.equal(formatMB(215), "215 MB");
    assert.equal(formatMB(6450), "6.45 GB");
  });

  it("uses Mo and Go in French", () => {
    assert.equal(formatMB(215, "fr-FR"), "215 Mo");
    assert.equal(formatMB(6450, "fr-FR"), "6,45 Go");
  });

  it("rounds money to whole units", () => {
    assert.match(formatMoney(3366.9, "XOF", "en-US"), /3,367/);
  });
});
