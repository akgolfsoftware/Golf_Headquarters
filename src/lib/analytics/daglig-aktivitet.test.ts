/**
 * Enhetstester for daglig-aktivitet-modulen (STEG 16.3). Selve skrive-/lese-
 * pathen er verifisert manuelt mot prod-databasen (idempotent upsert, korrekt
 * Oslo-dag, korrekt aggregering) — her sikres kun kontrakten: modulen
 * eksporterer riktig funksjoner med riktig type.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("daglig-aktivitet modul", () => {
  it("eksporterer registrerDagligAktivitet og hentBruksmaaling", async () => {
    const mod = await import("@/lib/analytics/daglig-aktivitet");
    assert.equal(typeof mod.registrerDagligAktivitet, "function");
    assert.equal(typeof mod.hentBruksmaaling, "function");
  });
});
