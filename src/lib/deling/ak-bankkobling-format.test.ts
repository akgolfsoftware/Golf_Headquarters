import assert from "node:assert/strict";
import { test } from "node:test";
import { hentGodkjenteOvelsesbankElementer } from "@/lib/masterbrain/drill-bank";
import { byggAkBankkopi, byggAkBankkatalog } from "./ak-bankkobling-format";

const bank = hentGodkjenteOvelsesbankElementer();
const item = bank[0];
test("bank bridge validates the current approved source without inventing phase or dosage", () => {
  const katalog = byggAkBankkatalog(bank);
  assert.equal(katalog.length, 22);
  for (const k of katalog) {
    assert.equal(k.data.source, "SYSTEM"); assert.equal(k.data.visibility, "PLATFORM");
    assert.equal(k.data.createdBy, null); assert.equal(k.data.lPhase, null);
    assert.deepEqual(k.data.lPhases, []); assert.equal(k.data.durationMin, null);
    assert.equal(k.data.defaultRepsSets, null); assert.match(k.bankFingeravtrykk, /^[a-f0-9]{64}$/);
    assert.deepEqual(k.data.parametersJson.facilityRequirements, bank.find(r => r.id === k.bankId)?.facilityRequirements);
  }
});
test("bank bounds normalize explicitly to database order and preserve original source axes", () => {
  const k = byggAkBankkopi({ ...item, minKategori: "K", maxKategori: "A" });
  assert.equal(k.data.minKategori, "A"); assert.equal(k.data.maxKategori, "K");
  assert.deepEqual(k.data.parametersJson.akFormel, item.akFormel);
});
test("source checksum covers all source content and is independent of object key order", () => {
  const base = byggAkBankkopi(item);
  assert.equal(byggAkBankkopi(Object.fromEntries(Object.entries(item).reverse())).bankFingeravtrykk, base.bankFingeravtrykk);
  for (const changed of [{ ...item, beskrivelse: `${item.beskrivelse} Syntetisk endring.` },
    { ...item, facilityRequirements: { ...item.facilityRequirements, longestShotM: 101 } },
    { ...item, godkjentDato: "2026-10-24" }, { ...item, extraInstruction: "Syntetisk endring" }]) {
    assert.notEqual(byggAkBankkopi(changed).bankFingeravtrykk, base.bankFingeravtrykk);
  }
});
test("approval schema rejects invalid source fields rather than repairing them", () => {
  for (const changed of [{ ...item, status: "KANDIDAT" }, { ...item, godkjentAv: "Ukjent" },
    { ...item, beskrivelse: "kort" }, { ...item, id: "../invalid" }, { ...item, minKategori: "L" },
    { ...item, environment: [] }, { ...item, fasilitetKrav: ["UKJENT"] },
    { ...item, facilityRequirements: { ...item.facilityRequirements, minimumFacilityLengthM: -1 } },
    { ...item, facilityRequirements: { ...item.facilityRequirements, minimumCeilingHeightM: "ukjent" } },
    { ...item, akFormel: { ...item.akFormel, press: "UKJENT" } }]) assert.throws(() => byggAkBankkopi(changed));
});
test("test items and duplicate source identities do not become exercise links", () => {
  assert.throws(() => byggAkBankkopi({ ...item, type: "TEST" }), /test-er-ikke/);
  assert.throws(() => byggAkBankkatalog([item, item]), /tvetydig/);
});
