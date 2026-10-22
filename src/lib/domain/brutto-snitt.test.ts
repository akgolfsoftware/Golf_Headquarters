import { before, mock, test } from "node:test";
import assert from "node:assert/strict";
import { osloAar } from "./brutto-snitt";

// Kun fiktive personer og turneringer. Én spiller, lest gjennom alle stedene som viser brutto snitt.
const aar = osloAar(new Date());
const turnering = (id: number, start: string, klasse: string | null, scores: (number | null)[], plassering: number | null = 5) => ({
  tournament_id: id, turnering: `Testcup ${id}`, start_date: start, year: Number(start.slice(0, 4)), kilde: "olyo", series: null,
  klasse, plassering, total_score: scores.every((s) => s != null) ? scores.reduce<number>((a, b) => a + (b ?? 0), 0) : null, to_par: null,
  runder: scores.map((score, i) => ({ runde: i + 1, score, til_par: null, mot_felt: null })),
});
const profil = {
  person: { name: "Testspiller", birth_year: 2009 }, sesonger: [], monster: [], runder: [],
  turneringer: [
    turnering(1, `${aar}-05-10`, "G19", [72, 74]),
    turnering(2, `${aar}-06-14`, "Gutter 19", [76]),
    turnering(3, `${aar}-07-01`, "G19N", [60, 61]), // nettoklasse: teller aldri
    turnering(4, `${aar - 1}-08-01`, "G19", [90]), // i fjor: teller ikke i år
    turnering(5, `${aar}-09-01`, "G19", [], null), // bare påmeldt
  ],
};
const egneRunder = [
  { playedAt: new Date(`${aar}-04-02T10:00:00Z`), score: 81, roundType: null, _count: { holeScores: 18 } },
  { playedAt: new Date(`${aar}-04-03T10:00:00Z`), score: 40, roundType: null, _count: { holeScores: 9 } },
  { playedAt: new Date(`${aar}-05-10T10:00:00Z`), score: 65, roundType: "turnering", _count: { holeScores: 18 } },
];
const db = {
  $queryRaw: async () => [],
  user: { findFirst: async (a: { where: { groupMemberships?: unknown } }) => (a.where.groupMemberships ? null : { name: "Testspiller" }) },
  testResult: { findMany: async () => [] },
  round: {
    aggregate: async () => ({ _count: { _all: 3 }, _avg: { sgTotal: null, sgOtt: null, sgApp: null, sgArg: null, sgPutt: null } }),
    findMany: async () => egneRunder,
  },
};

mock.module("@/lib/profil-kobling/data", { namedExports: { hentSpillerprofil: async () => profil } });
mock.module("@/lib/prisma", { namedExports: { prisma: db } });
mock.module("@/lib/profil-kobling/tilgang", { namedExports: { medSpillerTilgang: async () => null } });
mock.module("@/lib/iup/trener-profil-lesing", { namedExports: { lesLeverteIupForProfil: async () => [] } });
mock.module("@/lib/iup/maaltall-data", { namedExports: { hentIupMaaltallForSpiller: async () => null } });

const FASIT = (72 + 74 + 76) / 3;
let m: {
  snitt: typeof import("./brutto-snitt");
  data: typeof import("./brutto-snitt-data");
  rangliste: typeof import("./tn-rangliste");
  kategori: typeof import("./spiller-kategori");
  komplett: typeof import("@/lib/profil-kobling/komplett");
  turneringer: typeof import("@/lib/profil-kobling/til-turneringer");
  maaltall: typeof import("@/lib/iup/maaltall");
  sesonger: typeof import("@/lib/profil-kobling/sesonger");
};
before(async () => {
  m = {
    snitt: await import("./brutto-snitt"),
    data: await import("./brutto-snitt-data"),
    rangliste: await import("./tn-rangliste"),
    kategori: await import("./spiller-kategori"),
    komplett: await import("@/lib/profil-kobling/komplett"),
    turneringer: await import("@/lib/profil-kobling/til-turneringer"),
    maaltall: await import("@/lib/iup/maaltall"),
    sesonger: await import("@/lib/profil-kobling/sesonger"),
  };
});

test("brutto snitt er turneringsrunder i år, uten nettoklasser, fjoråret og påmeldinger", async () => {
  const s = await m.data.hentBruttoSnitt("u1");
  assert.equal(s.turnering.runder, 3);
  assert.equal(s.turnering.snitt, FASIT);
});

test("treningsrunder er et eget tall og teller ikke i snittet", async () => {
  const s = await m.data.hentBruttoSnitt("u1");
  // Bare egen 18-hullsrunde uten turneringsmerke er trening; ni hull og egenført turneringsrunde er ikke.
  assert.deepEqual(s.trening, { runder: 1, snitt: 81 });
  assert.notEqual(s.turnering.snitt, (72 + 74 + 76 + 81) / 4);
});

test("samme spiller får samme snitt i Rangliste/Uttak, IUP, Spiller 360, kategori og IUP-måltall", async () => {
  const iAar = m.snitt.turneringerIAar(m.turneringer.tilTurneringer(profil.turneringer as never), aar);
  // Rangliste, Uttak, College og TN-IUP (hentTnRangliste, hentTnSpillerProfil) aggregerer slik.
  const rangliste = m.rangliste.aggregerRangliste(iAar.map((t) => t.resultat)).bruttoSnitt;
  // PlayerHQ og A–K-kategorien.
  const kategori = await m.kategori.hentSesongSnittscore("u1");
  // Spiller 360 i AgencyOS, WANG og Team Norway.
  const spiller360 = (await m.komplett.byggKomplettProfil(db as never, "u1", { kanSeGolfId: false })).runder.bruttoSnitt.turnering.snitt;
  // IUP-måltallene (kvartal for kvartal) bruker de samme rundene.
  const runder = iAar.flatMap((t) => m.snitt.bruttoRunder([t.resultat]).map((score) => ({ dato: t.start.toISOString().slice(0, 10), score, konkurranseId: t.id })));
  const maaltall = m.maaltall.beregnPeriode([], [], runder)["snitt-turnering"];
  // Sesongen i Resultater: databasens egen snittscore byttes ut.
  const sesong = { year: aar, runder: 9, turneringer: 3, snitt_score: 99, snitt_til_par: null, snitt_mot_felt: null, justert_snitt: null, segment: null, persentil_kull: null, kull_n: null };
  const resultater = m.sesonger.medFellesSesongsnitt({ sesonger: [sesong], turneringer: profil.turneringer as never }).sesonger[0];
  assert.equal(resultater.runder, 3);
  for (const verdi of [rangliste, kategori, spiller360, maaltall, resultater.snitt_score]) assert.equal(verdi, FASIT);
});

test("året regnes i Oslo-tid: en turnering 31. desember kl. 23.30 UTC hører til neste år", () => {
  assert.equal(osloAar(new Date(`${aar - 1}-12-31T23:30:00Z`)), aar);
});
