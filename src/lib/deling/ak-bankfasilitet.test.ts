import assert from "node:assert/strict";
import { test } from "node:test";
import { hentGodkjenteOvelsesbankElementer } from "@/lib/masterbrain/drill-bank";
import { byggAkBankkopi } from "./ak-bankkobling-format";
import { vurderAkBankfasilitet as vurder, vurderAkBankfasiliteter, type AkFasilitet } from "./ak-bankfasilitet";

// Synthetic variations exercise the rules; they are never new approved content.
const kilde = hentGodkjenteOvelsesbankElementer()[0];
const krav = { longestShotM: 10, longestShotKind: "PUTT_ROLL", minimumFacilityLengthM: 12,
  surface: "PUTTING_GREEN", minimumCeilingHeightM: null };
const bank = (overrides = {}, kravOver = {}) => byggAkBankkopi({ ...kilde, environment: ["HJEM"],
  fasilitetKrav: ["PUTTING_GREEN_LANG"], ...overrides, facilityRequirements: { ...krav, ...kravOver } });
const sted: AkFasilitet = { capabilities: ["PUTTING_GREEN_LANG"], type: "HJEMME", isIndoor: true,
  rangeLengdeM: null, maksPuttLengdeM: 12 };

test("both longest shot and minimum facility length must fit, including the exact boundary", () => {
  assert.equal(vurder(bank(), sted).status, "KRAV_OPPFYLT");
  assert.ok(vurder(bank(), { ...sted, maksPuttLengdeM: 11.99 }).avvik.includes("FOR_KORT"));
  assert.ok(vurder(bank({}, { longestShotM: 13 }), sted).avvik.includes("FOR_KORT"));
  assert.ok(vurder(bank(), { ...sted, maksPuttLengdeM: 0 }).avvik.includes("FOR_KORT"));
});
test("labels, range length and free text never substitute for measured putting length", () => {
  const r = vurder(bank(), { ...sted, maksPuttLengdeM: null, rangeLengdeM: 400, notes: "500 meter", name: "Lang green" });
  assert.equal(r.status, "MANGLER_GRUNNLAG"); assert.deepEqual(r.mangler, ["LENGDE_MANGLER"]);
  for (const bad of [-1, Infinity, NaN, "15", undefined]) {
    assert.deepEqual(vurder(bank(), { ...sted, maksPuttLengdeM: bad }).mangler, ["UGYLDIG_FASILITET"]);
  }
});
test("equipment, surface and length cannot be combined across places", () => {
  const kort = { ...sted, maksPuttLengdeM: 5 };
  const utenUtstyr = { ...sted, capabilities: [] };
  const results = vurderAkBankfasiliteter(bank(), [kort, utenUtstyr]);
  assert.deepEqual(results.map(r => r.indeks), [0, 1]);
  assert.ok(results.every(r => r.status === "AVVIK"));
  assert.ok(results[1].avvik.includes("UNDERLAG_AVVIKER"));
  assert.deepEqual(vurderAkBankfasiliteter(bank(), []), []);
});
test("only specific facility types identify environment; club and missing type remain unknown", () => {
  for (const type of ["KLUBBANLEGG", null]) {
    assert.ok(vurder(bank({ environment: ["RANGE", "BANE"] }), { ...sted, type }).mangler.includes("MILJO_MANGLER"));
  }
  assert.ok(vurder(bank({ environment: ["SIMULATOR"] }), sted).avvik.includes("MILJO_AVVIKER"));
  for (const [type, environment] of [["SIMULATOR", "SIMULATOR"], ["TRENINGSSENTER", "GYM"], ["HJEMME", "HJEM"]]) {
    assert.equal(vurder(bank({ environment: [environment] }), { ...sted, type }).status, "KRAV_OPPFYLT");
  }
});
test("range length cannot prove chip roll, running space, grass or ceiling clearance", () => {
  const r = vurder(bank({}, { longestShotKind: "CHIP_ROLL", surface: "GRASS", minimumCeilingHeightM: 3 }),
    { ...sted, rangeLengdeM: 400, isIndoor: false });
  assert.ok(r.mangler.includes("LENGDE_MANGLER")); assert.ok(r.mangler.includes("UNDERLAG_MANGLER"));
  assert.ok(r.mangler.includes("TAKHOYDE_MANGLER"));
  for (const kind of ["THROW", "RUN", "OTHER", "NONE"]) {
    assert.ok(vurder(bank({}, { longestShotKind: kind }), { ...sted, rangeLengdeM: 400 }).mangler.includes("LENGDE_MANGLER"));
  }
});
test("carry and total require an explicit range and enough recorded range length", () => {
  for (const kind of ["CARRY", "TOTAL"]) {
    const k = bank({ fasilitetKrav: ["DRIVING_RANGE"] }, { longestShotKind: kind, surface: "RANGE", longestShotM: 200 });
    const f = { ...sted, capabilities: ["DRIVING_RANGE"], rangeLengdeM: 200 };
    assert.equal(vurder(k, f).status, "KRAV_OPPFYLT");
    assert.ok(vurder(k, { ...f, rangeLengdeM: 199 }).avvik.includes("FOR_KORT"));
    assert.ok(vurder(k, { ...f, capabilities: [] }).mangler.includes("LENGDE_MANGLER"));
  }
});
test("new requirements and unsupported surfaces are never silently treated as satisfied", () => {
  assert.deepEqual(vurder(bank({}, { safetyClearanceM: 3 }), sted).mangler, ["UKJENT_KRAV"]);
  for (const surface of ["GRASS", "GYM_FLOOR", "INDOOR_MAT"]) {
    assert.ok(vurder(bank({}, { surface }), sted).mangler.includes("UNDERLAG_MANGLER"));
  }
  assert.equal(vurder(bank({ fasilitetKrav: [] }, { longestShotKind: "NONE", longestShotM: 0,
    minimumFacilityLengthM: 0, surface: "ANY" }), { ...sted, capabilities: [], maksPuttLengdeM: null }).status, "KRAV_OPPFYLT");
});
test("indoor demand and positive ceiling demand are independent checks", () => {
  const k = bank({ akFormel: { ...kilde.akFormel, belastning: "INNENDORS" } }, { minimumCeilingHeightM: 3 });
  const r = vurder(k, { ...sted, isIndoor: false });
  assert.ok(r.avvik.includes("INNENDORS_MANGLER")); assert.ok(r.mangler.includes("TAKHOYDE_MANGLER"));
  assert.equal(vurder(k, sted).status, "MANGLER_GRUNNLAG");
});
