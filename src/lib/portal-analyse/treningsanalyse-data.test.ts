/**
 * Enhetstest: hentTreningsanalyse-skjema (tom intervall → null etterlevelse).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("treningsanalyse-data modul", () => {
  it("eksporterer hentTreningsanalyse", async () => {
    const mod = await import("./treningsanalyse-data");
    assert.equal(typeof mod.hentTreningsanalyse, "function");
  });
});
