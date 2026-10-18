import { test } from "node:test";
import assert from "node:assert/strict";

import { byggWangTrenerData } from "./wang-trener-data";
import type { WangLiveData } from "./hent-wang-gruppe";

// Syntetisk gruppe: 11 elever og én trener, som demogruppa for demo@wang.no.
const live: WangLiveData = {
  gruppeId: "g1",
  gruppeNavn: "WANG Toppidrett (demo)",
  antallElever: 11,
  elever: [
    ...Array.from({ length: 11 }, (_, i) => ({ id: `e${i}`, navn: `Elev ${i} Demo`, rolle: "PLAYER" })),
    { id: "t1", navn: "Demotrener WANG", rolle: "COACH" },
  ],
  perioder: [
    { id: "p1", fase: "GRUNN", startIso: "2026-08-01", endIso: "2026-09-30", fokus: "Sving", ukevolMin: null, ukevolMax: null },
    { id: "p2", fase: "SPESIAL", startIso: "2026-10-01", endIso: "2026-11-30", fokus: "Nærspill", ukevolMin: null, ukevolMax: null },
  ] as WangLiveData["perioder"],
  hendelser: [
    { id: "h1", tittel: "Turnering: Høstcup", startIso: "2026-10-20", startTid: "09:00", sluttIso: "2026-10-20", sluttTid: "17:00", kind: null, recurring: null, sted: null, beskrivelse: null },
    { id: "h2", tittel: "Fysisk test", startIso: "2026-10-15", startTid: "14:00", sluttIso: "2026-10-15", sluttTid: "15:30", kind: null, recurring: null, sted: "Demohallen", beskrivelse: null },
    { id: "h3", tittel: "Samling (demo)", startIso: "2026-09-10", startTid: "09:00", sluttIso: "2026-09-11", sluttTid: "15:00", kind: "SAMLING", recurring: null, sted: null, beskrivelse: null },
  ],
  fasteOkter: [{ ukedag: 1, startTid: "08:00", sluttTid: "10:00", sted: "Demo Golfklubb", tittel: "Morgentrening" }],
  skoleDager: [],
  fokusomraader: [],
  oppdatertIso: "2026-10-14",
};

test("elevene og antallet kommer fra gruppa, trenere holdes utenfor elevlista", () => {
  const data = byggWangTrenerData(live, "2026-10-14");
  assert.equal(data.elever.length, 11);
  assert.deepEqual(data.trenere, [{ id: "t1", navn: "Demotrener WANG", rolle: "Trener" }]);
});

test("uka bygges av faste økter og enkelthendelser, uten turneringer", () => {
  const data = byggWangTrenerData(live, "2026-10-14"); // onsdag i uke 42
  assert.equal(data.ukeTekst, "Uke 42 · 12.10–18.10.2026");
  assert.deepEqual(
    data.ukeOkter.map((o) => [o.datoIso, o.tittel, o.passert]),
    [
      ["2026-10-13", "Morgentrening", true],
      ["2026-10-15", "Fysisk test", false],
    ],
  );
});

test("periodestatus, turneringer, samlinger og testdager", () => {
  const data = byggWangTrenerData(live, "2026-10-14");
  assert.deepEqual(data.perioder.map((p) => [p.navn, p.status]), [["Grunnperiode", "avsluttet"], ["Spesialperiode", "naa"]]);
  assert.deepEqual(data.turneringer.map((t) => [t.tittel, t.passert]), [["Høstcup", false]]);
  assert.deepEqual(data.samlinger.map((s) => [s.tittel, s.passert]), [["Samling (demo)", true]]);
  assert.deepEqual(data.testdager.map((t) => t.tittel), ["Fysisk test"]);
});

test("ukenummer ved årsskiftet følger ISO 8601", () => {
  assert.match(byggWangTrenerData(live, "2027-01-01").ukeTekst, /^Uke 53 /);
  assert.match(byggWangTrenerData(live, "2027-01-04").ukeTekst, /^Uke 1 /);
});
