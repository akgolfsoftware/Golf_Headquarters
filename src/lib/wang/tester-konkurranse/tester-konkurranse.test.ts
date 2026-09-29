import assert from "node:assert/strict";
import { test } from "node:test";

import { dagerMellom, datoTekst, enhetFraRegel, lesDatoTekst, motParTekst, periodeFor, tallTekst } from "./format";
import { bruttoRunder, fristTone, gruppeSnitt, rundeOppsummering, samlingStatus, sisteRunder, sorterResultater, spilte, type ElevResultat, type StatRunde } from "./konkurranse";
import { byggFysKort, byggTestko, endringTekst, ngfProtokoller, rangér, resultatTekst, testkoTellere, type KoDeltakerKilde, type TestDefinisjonInfo } from "./tester";

const FYS: TestDefinisjonInfo = { id: "fys-benk", name: "Benkpress", scoringRule: "Maks vekt (kg)", pyramidArea: "FYS" };
const NGF_BLOKKERT: TestDefinisjonInfo = { id: "tn-v3-driver-gate", name: "Driver Gate", scoringRule: "tn-excel-v3-2026-09-10", pyramidArea: "SLAG" };
const dag = (iso: string) => new Date(`${iso}T10:00:00Z`);

test("format: dato, tall, til par og enhet", () => {
  assert.equal(datoTekst(dag("2026-09-29")), "29.09.2026");
  assert.equal(datoTekst(null), "—");
  assert.equal(tallTekst(12.34, 1), "12,3");
  assert.equal(tallTekst(null), "—");
  assert.equal(motParTekst(3), "+3");
  assert.equal(motParTekst(-2), "−2");
  assert.equal(motParTekst(0), "E");
  assert.equal(enhetFraRegel("Beste kast (cm)"), "cm");
  assert.equal(enhetFraRegel("kg"), null);
});

test("format: DD.MM.ÅÅÅÅ avviser ugyldige datoer", () => {
  assert.equal(lesDatoTekst("31.02.2026"), null);
  assert.equal(lesDatoTekst("2026-09-29"), null);
  assert.equal(datoTekst(lesDatoTekst("01.10.2026")), "01.10.2026");
});

test("format: dager regnes mot Oslo-kalenderdag, ikke UTC", () => {
  // 23:30 UTC 29.09 er 30.09 i Oslo.
  assert.equal(dagerMellom(new Date("2026-09-29T23:30:00Z"), dag("2026-10-01")), 1);
  assert.equal(periodeFor("sesong", dag("2026-09-29")).etikett, "Høsten 2026");
  assert.equal(periodeFor("sesong", dag("2027-02-01")).etikett, "Våren 2027");
});

test("WG-03: første måling, endring mot egen forrige måling, og «—» uten måling", () => {
  const tom = byggFysKort(FYS, []);
  assert.equal(tom.verdi, "—");
  assert.equal(tom.soyler.length, 0);
  const en = byggFysKort(FYS, [{ dato: dag("2026-09-01"), score: 60 }]);
  assert.match(en.vurdering, /Første måling/);
  const to = byggFysKort(FYS, [{ dato: dag("2026-09-01"), score: 60 }, { dato: dag("2026-09-20"), score: 62.5 }]);
  assert.equal(to.verdi, "62,5");
  assert.equal(to.vurdering, "+2,5 kg siden egen måling 01.09.2026.");
  assert.equal(to.soyler.at(-1)?.siste, true);
});

test("NGF-protokoll uten avklart skala viser «—», aldri et regnet tall", () => {
  const r = resultatTekst(NGF_BLOKKERT, 4, { any: "thing" });
  assert.equal(r.verdi, "—");
  assert.equal(r.tall, null);
  const fys = resultatTekst(FYS, 70, null);
  assert.equal(fys.verdi, "70");
  assert.equal(fys.enhet, "kg");
  const uavklarte = ngfProtokoller().filter((p) => p.status === "Uavklart");
  assert.ok(uavklarte.some((p) => p.id === "tn-v3-driver-gate"));
});

test("endring: PEI som prosentpoeng, andre enheter som de er", () => {
  assert.equal(endringTekst(-0.012, "PEI"), "−1,2 prosentpoeng");
  assert.equal(endringTekst(2.5, "kg"), "+2,5 kg");
  assert.equal(endringTekst(0, "kg"), "±0");
});

test("WANG-37: statuser fra testdag og tildeling, avlyst dag teller ikke", () => {
  const naa = dag("2026-09-29");
  const grunn = { elevId: "e1", test: FYS, testDag: { id: "t1", title: "Høsttest", scheduledAt: dag("2026-09-20"), status: "COMPLETED" as const, coachNavn: "Trener" } };
  const deltakere: KoDeltakerKilde[] = [
    { ...grunn, id: "a", status: "DONE", resultat: { id: "r1", score: 70, details: null, takenAt: dag("2026-09-20"), witnessStatus: "PENDING", maltAv: "Trener" } },
    { ...grunn, id: "b", status: "DONE", resultat: { id: "r2", score: 72, details: null, takenAt: dag("2026-09-20"), witnessStatus: "ATTESTED", maltAv: "Trener" } },
    { ...grunn, id: "c", status: "ABSENT", resultat: null },
    { ...grunn, id: "d", status: "PENDING", resultat: null, testDag: { ...grunn.testDag, scheduledAt: dag("2026-10-06"), status: "PLANNED" } },
    { ...grunn, id: "e", status: "PENDING", resultat: null, testDag: { ...grunn.testDag, status: "CANCELLED" } },
  ];
  const rader = byggTestko(deltakere, [{ id: "o1", status: "OPEN", elevId: "e1", dueDate: dag("2026-09-01"), coachNavn: "Trener", test: FYS }], naa);
  assert.deepEqual(rader.map((r) => r.status), ["Ført", "Mangler", "Mangler", "Planlagt", "Kontrollert"]);
  assert.equal(rader.find((r) => r.id === "d-c")?.meta, "Fravær · Høsttest");
  assert.deepEqual(testkoTellere(rader, naa), { ikkeKontrollert: 1, mangler: 2, planlagtFireUker: 1 });
});

test("WANG-39: rangering etter retning, uten måling til slutt uten nummer", () => {
  const r = rangér([
    { elevId: "a", navn: "Ada", klasse: null, verdi: 74, tekst: "74", kilde: "" },
    { elevId: "b", navn: "Bo", klasse: null, verdi: null, tekst: "—", kilde: "" },
    { elevId: "c", navn: "Cia", klasse: null, verdi: 71, tekst: "71", kilde: "" },
  ], true);
  assert.deepEqual(r.map((x) => [x.elevId, x.nr]), [["c", 1], ["a", 2], ["b", null]]);
  assert.deepEqual(rangér(r, false).map((x) => x.elevId), ["a", "c", "b"]);
});

const runde = (nummer: number, brutto: number | null, hull: number | null = 18) => ({ nummer, brutto, motPar: null, hull, fullfort: true });
const elevRes = (elevId: string, runder: ReturnType<typeof runde>[], plassering: number | null): ElevResultat => ({
  elevId, navn: elevId, klasse: null, status: "FINISHED", runder, brutto: runder.reduce((a, r) => a + (r.brutto ?? 0), 0) || null, motPar: null, plasseringTekst: plassering ? String(plassering) : null, plassering, kildeDato: null,
});

test("Konkurranse: snitt bare av 18-hullsrunder med brutto", () => {
  assert.deepEqual(bruttoRunder([runde(1, 72), runde(2, 38, 9), runde(3, null)]), [72]);
  const d = [elevRes("a", [runde(1, 72), runde(2, 75)], 4), elevRes("b", [runde(1, 80)], 12), elevRes("c", [], null)];
  assert.deepEqual(gruppeSnitt(d), { snitt: 75.7, runder: 3 });
  assert.equal(spilte(d), 2);
  assert.deepEqual(sorterResultater(d).map((x) => x.elevId), ["a", "b", "c"]);
  assert.deepEqual(gruppeSnitt([]), { snitt: null, runder: 0 });
});

test("Konkurranse: frist og samlingsstatus", () => {
  const naa = dag("2026-09-29");
  assert.equal(fristTone(null, naa), "mangler");
  assert.equal(fristTone(dag("2026-09-28"), naa), "passert");
  assert.equal(fristTone(dag("2026-10-03"), naa), "snart");
  assert.equal(fristTone(dag("2026-11-03"), naa), "ok");
  assert.equal(samlingStatus(dag("2026-10-05"), dag("2026-10-07"), naa).tekst, "Planlagt");
  assert.equal(samlingStatus(dag("2026-09-28"), dag("2026-09-30"), naa).tekst, "Pågår");
  assert.equal(samlingStatus(dag("2026-09-01"), dag("2026-09-02"), naa).tekst, "Gjennomført");
});

test("WANG-27: siste ti 18-hullsrunder, eldst først, og beste runde", () => {
  const runder: StatRunde[] = Array.from({ length: 12 }, (_, i) => ({ dato: dag(`2026-08-${String(i + 1).padStart(2, "0")}`), turnering: `T${i}`, sted: null, brutto: 70 + i, motPar: null, hull: 18 }));
  runder.push({ dato: dag("2026-08-20"), turnering: "Ni hull", sted: null, brutto: 36, motPar: null, hull: 9 });
  const siste = sisteRunder(runder);
  assert.equal(siste.length, 10);
  assert.equal(siste[0].turnering, "T2");
  const { snitt, beste } = rundeOppsummering(siste);
  assert.equal(beste?.brutto, 72);
  assert.equal(snitt, 76.5);
  assert.deepEqual(rundeOppsummering([]), { snitt: null, beste: null });
});
