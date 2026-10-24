import assert from "node:assert/strict";
import { test } from "node:test";
import { hentGodkjenteOvelsesbankElementer } from "@/lib/masterbrain/drill-bank";
import { byggAkBankkopi } from "./ak-bankkobling-format";
import { beregnAkSpillerniva } from "./ak-spillerniva";
import { vurderAkUkekandidat as vurder } from "./ak-ukekandidat-vurdering";

const kilde = hentGodkjenteOvelsesbankElementer()[0];
const bank = byggAkBankkopi({ ...kilde, minKategori: "A", maxKategori: "K", environment: ["HJEM"],
  fasilitetKrav: ["PUTTING_GREEN_LANG"], facilityRequirements: { longestShotM: 10, longestShotKind: "PUTT_ROLL",
    minimumFacilityLengthM: 12, surface: "PUTTING_GREEN" } });
const basis: Parameters<typeof vurder>[1] = { niva: beregnAkSpillerniva([], 12, 2026),
  fasiliteter: [{ capabilities: ["PUTTING_GREEN_LANG"], type: "HJEMME", isIndoor: true, rangeLengdeM: null, maksPuttLengdeM: 12 }],
  budsjett: { TEK: 1 }, harManedsEllerUkevalg: false,
  modell: { category: null, categorySource: "UKJENT", context: { daysUntilTournament: null, completedSessions: 0, sgWeaknesses: [] },
    signals: { aktivFase: "GRUNN", okterPerUke: null, foretrukneDager: [] } } };

test("combined observations preserve estimated level and never certify sporting suitability", () => {
  const r = vurder(bank, basis);
  assert.equal(r.niva.status, "INNENFOR_OPPGITT_SPENN"); assert.equal(r.niva.kilde, "HCP_ESTIMAT");
  assert.equal(r.fasilitetsstatus, "KRAV_OPPFYLT_VED_ETT_STED");
  assert.deepEqual(r.periode, { type: "GRUNN", ovelsesSamsvar: "IKKE_VURDERT" });
  assert.equal(r.fagligVurdering, "GJENSTAR");
  for (const field of ["bruttoSnitt", "hcp", "runder", "maksPuttLengdeM", "rangeLengdeM", "description", "name"]) {
    assert.ok(!JSON.stringify(r).includes(`"${field}"`));
  }
});
test("unknown and outside levels remain observations rather than filtered exercises", () => {
  const begrenset = byggAkBankkopi({ ...kilde, minKategori: "A", maxKategori: "A" });
  assert.equal(vurder(begrenset, basis).niva.status, "UTENFOR_OPPGITT_SPENN");
  const ukjent = { ...basis, niva: beregnAkSpillerniva([], null, 2026) };
  assert.equal(vurder(begrenset, ukjent).niva.status, "MANGLER_GRUNNLAG");
  assert.equal(vurder(bank, ukjent).niva.status, "INNENFOR_OPPGITT_SPENN");
  assert.equal(vurder(bank, ukjent).niva.kilde, "UKJENT");
});
test("missing periods, zero budget and overrides do not invent a phase or veto a candidate", () => {
  for (const aktivFase of [null, "L3", "untrusted text"]) {
    const r = vurder(bank, { ...basis, modell: { ...basis.modell, signals: { ...basis.modell.signals, aktivFase } },
      budsjett: {}, harManedsEllerUkevalg: true });
    assert.deepEqual(r.periode, { type: null, ovelsesSamsvar: "IKKE_VURDERT" });
    assert.deepEqual(r.ukebudsjett, { omradeErPlanlagt: false, harManedsEllerUkevalg: true });
    assert.equal(r.omrade, bank.data.pyramidArea);
  }
  assert.equal(vurder(bank, { ...basis, budsjett: null }).ukebudsjett.omradeErPlanlagt, null);
});
test("no places, unknown places and incompatible places have distinct summaries", () => {
  assert.equal(vurder(bank, { ...basis, fasiliteter: [] }).fasilitetsstatus, "INGEN_REGISTRERTE_STEDER");
  const sted = basis.fasiliteter[0];
  assert.equal(vurder(bank, { ...basis, fasiliteter: [{ ...sted, maksPuttLengdeM: null }] }).fasilitetsstatus, "MANGLER_GRUNNLAG");
  assert.equal(vurder(bank, { ...basis, fasiliteter: [{ ...sted, maksPuttLengdeM: 2 }] }).fasilitetsstatus, "AVVIK_VED_ALLE_STEDER");
  assert.equal(vurder(bank, { ...basis, fasiliteter: [{ ...sted, maksPuttLengdeM: 2 }, sted] }).fasilitetsstatus, "KRAV_OPPFYLT_VED_ETT_STED");
});
