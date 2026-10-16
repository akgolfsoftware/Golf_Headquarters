import assert from "node:assert/strict";
import { test } from "node:test";
import { tnProtocol } from "./tn-catalog";
import { tnScore } from "./tn-scoring";
import { foreslaGodkjenteOvelser, sammenlignMedForrige, testOmraader } from "./test-anbefaling";

const bank = [{
  id: "godkjent-putt",
  type: "DRILL",
  navn: "kort-putt",
  beskrivelse: "Putt fra to meter.",
  status: "GODKJENT",
  minKategori: "K",
  maxKategori: "A",
  environment: ["RANGE", "BANE"],
  fasilitetKrav: ["PUTTING_GREEN_KORT"],
  akFormel: { pyramidArea: "SLAG", omraade: "PUTT_5_10" },
  facilityRequirements: { longestShotM: 2, longestShotKind: "PUTT_ROLL" },
}];
const fasilitet = [{ capabilities: ["PUTTING_GREEN_KORT"], maksPuttLengdeM: 3, rangeLengdeM: null }];
const grunnlag = { test: { id: "tn-v3-putt-1-3m", omraade: null }, bank, fasiliteter: fasilitet, spillerKategori: null };

test("bare godkjent, eksakt område og bekreftet fasilitet gir handlingsbart forslag", () => {
  const forslag = foreslaGodkjenteOvelser(grunnlag);
  assert.equal(forslag.length, 1);
  assert.equal(forslag[0].kanLeggesTil, true);
  assert.equal(foreslaGodkjenteOvelser({ ...grunnlag, bank: [{ ...bank[0], status: "KANDIDAT" }] }).length, 0);
  assert.equal(foreslaGodkjenteOvelser({ ...grunnlag, bank: [{ ...bank[0], akFormel: { pyramidArea: "SLAG", omraade: "CHIP" } }] }).length, 0);
  assert.equal(foreslaGodkjenteOvelser({ ...grunnlag, bank: [{ ...bank[0], minKategori: "D", maxKategori: "A" }] }).length, 0);
});

test("manglende eller for kort fasilitet gir synlig, men ikke handlingsbart forslag", () => {
  assert.equal(foreslaGodkjenteOvelser({ ...grunnlag, fasiliteter: [] })[0].kanLeggesTil, false);
  assert.equal(foreslaGodkjenteOvelser({ ...grunnlag, fasiliteter: [{ ...fasilitet[0], maksPuttLengdeM: 1 }] })[0].kanLeggesTil, false);
  assert.equal(foreslaGodkjenteOvelser({ ...grunnlag, environment: "SIMULATOR" })[0].kanLeggesTil, false);
});

test("ukjent eller blandet testområde får ingen navngitte forslag", () => {
  assert.deepEqual(testOmraader({ id: "annen-test", omraade: null }), []);
  assert.deepEqual(foreslaGodkjenteOvelser({ ...grunnlag, test: { id: "annen-test", omraade: null } }), []);
});

test("ett resultat og uforenlige forhold gir ingen trend; sammenlignbare målinger gir bare retning", () => {
  const protocol = tnProtocol("putt-1-3m")!;
  const values = Object.fromEntries(protocol.rows.map((_, i) => [String(i + 1), { strokes: 1 }]));
  const first = tnScore(protocol, values);
  values["1"].strokes = 2;
  const second = tnScore(protocol, values);
  const eldre = { id: "r1", testId: "tn-v3-putt-1-3m", score: first.score, details: first, takenAt: new Date("2026-06-01") };
  const nyere = { id: "r2", testId: "tn-v3-putt-1-3m", score: second.score, details: second, takenAt: new Date("2026-07-01") };
  assert.equal(sammenlignMedForrige(nyere, [nyere]), "IKKE_SAMMENLIGNBAR");
  assert.equal(sammenlignMedForrige(nyere, [nyere, { ...eldre, details: { ...first, unit: "annen enhet" } }]), "IKKE_SAMMENLIGNBAR");
  assert.equal(sammenlignMedForrige(nyere, [nyere, eldre]), "HOYERE");
});
