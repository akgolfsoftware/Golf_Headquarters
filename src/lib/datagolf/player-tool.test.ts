import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bandEtikett, egneRundeTall, fellesRunder, gjennomsnitt, lesValg,
  rundeOppsummering, skillDifferanse, turneringer, type HistoriskRunde, type Proff,
} from "./player-tool";
import { gyldigStart, lesUtfordring, utfordringInput } from "./challenge";

const round: HistoriskRunde = {
  eventId: "pga:2026:1", eventName: "Testturnering", date: "2026-09-01T00:00:00.000Z",
  tour: "pga", round: 1, courseId: 1, score: 70, toPar: -2, position: null, madeCut: null,
  total: 1, ott: null, app: null, arg: null, putt: null, distance: 300, accuracy: 0.5,
  gir: 0.75, importedAt: "2026-09-08T00:00:00.000Z",
};
const pro: Proff = { dgId: 1, name: "Proff A", country: null, asOf: "2026-09-01T00:00:00.000Z",
  total: 2, ott: 1, app: 1, arg: 0, putt: 0, distance: 12, accuracy: -3 };

test("ukjente verdier blir ikke nullpoeng og har egen dekning", () => {
  assert.deepEqual(gjennomsnitt([null, NaN, 0, 2]), { value: 1, count: 2 });
  const result = rundeOppsummering([round, { ...round, app: 0.4, score: null, accuracy: null }]);
  assert.deepEqual(result.sg.find(s => s.key === "app"), { key: "app", label: "Innspill", value: 0.4, count: 1 });
  assert.equal(result.distance.value, 274.32);
  assert.deepEqual(result.accuracy, { value: 50, count: 1 });
  assert.deepEqual(result.score, { value: 70, count: 1 });
});
test("9 hull, manglende hull og inkonsistent totalscore utelates fra 18-hullssnitt", () => {
  const holes = Array.from({ length: 18 }, (_, i) => ({ holeNumber: i + 1, par: i < 4 ? 3 : 4, strokes: 4,
    fairway: i < 4 ? true : null, gir: i === 0 ? false : null }));
  const own = { playedAt: new Date("2026-09-01"), score: 72, holeScores: holes };
  const result = egneRundeTall([own, { ...own, holeScores: holes.slice(0, 9) }, { ...own, score: 71 }]);
  assert.equal(result.count, 1);
  assert.equal(result.accuracy.value, null); // par-3 er ikke fairwayforsøk
  assert.equal(result.gir.value, null); // delvis registrering er ikke full rundestatistikk
});
test("rå SG sammenlignes bare ved samme felt, bane og runde", () => {
  assert.deepEqual(fellesRunder([round], [{ ...round, total: -1 }]), { value: 2, count: 1 });
  for (const other of [{ ...round, courseId: 2 }, { ...round, round: 2 }, { ...round, eventId: "other" }, { ...round, courseId: null }])
    assert.equal(fellesRunder([round], [other]).value, null);
});
test("predikert skill kan ikke trekkes fra et annet uttak", () => {
  assert.equal(skillDifferanse(pro, { ...pro, total: -1 }, "total"), 3);
  assert.equal(skillDifferanse(pro, { ...pro, asOf: "2026-08-01" }, "total"), null);
  assert.equal(skillDifferanse(pro, null, "total"), null);
});
test("åpne avstandsintervaller oppfinner ingen øvre grense", () => {
  assert.equal(bandEtikett({ band: "innspill200", lie: "fairway" }), "Over 182,9 m · fairway");
  assert.equal(bandEtikett({ band: "innspill100", lie: "rough" }), "Under 137,2 m · rough");
});
test("URL-valg er avgrenset og array/SQL/halvgyldig ID avvises", () => {
  assert.deepEqual(lesValg({ pro: "1;drop", mot: ["2"], runder: "100000" }), { pro: null, mot: null, runder: 24 });
  assert.deepEqual(lesValg({ pro: "12", mot: "25", runder: "50" }), { pro: 12, mot: 25, runder: 50 });
});
test("resultater grupperes på event-ID og sluttplassering gjettes ikke", () => {
  const result = turneringer([{ ...round, round: 2 }, round, { ...round, eventId: "other" }]);
  assert.equal(result.length, 2);
  assert.deepEqual(result[0].rounds.map(r => r.round), [1, 2]);
  assert.equal(result[0].position, null);
});
test("lagring krever ti ferdige slag, gyldig avstand og avgrenset tidspunkt", () => {
  const input = { attemptId: "e141256c-e12f-45a8-b018-81183a542ac7", tak: 1, slag: "innspill100", carry: 100,
    lie: "fairway", baller: Array(10).fill("inne"), startedAt: "2026-09-01T10:00:00.000Z", target: 5 };
  assert.equal(utfordringInput.safeParse(input).success, true);
  assert.equal(utfordringInput.safeParse({ ...input, baller: Array(9).fill("inne") }).success, false);
  assert.equal(utfordringInput.safeParse({ ...input, carry: Infinity }).success, false);
  assert.equal(utfordringInput.safeParse({ ...input, baller: Array(10).fill("tom") }).success, false);
  assert.equal(gyldigStart(input.startedAt, new Date("2026-09-01T11:00:00Z")), true);
  assert.equal(gyldigStart(input.startedAt, new Date("2026-08-01")), false);
  assert.equal(lesUtfordring({ arbitrary: 2 }), null);
});
