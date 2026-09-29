/** Syntetiske data for Spiller 360-prøvene (AG-08, AG-A02, AG-A04). Oppdiktede navn, ingen ekte spillere. */
import type {
  S360Hode, S360Iup, S360Plan, S360RailSpiller, S360Samtaler, S360Stats, S360Talent, S360Tester, S360Tp,
} from "@/lib/admin-spiller/spiller360-typer";
import { snittscore } from "@/lib/admin-spiller/spiller360-visning";
import { tpPlan } from "./_tp-data";

export const hode: S360Hode = {
  id: "u1",
  navn: "Eira Solvang",
  avatarUrl: null,
  grupper: ["Konkurransegruppe junior", "Vintertrening innendørs med et ganske langt gruppenavn"],
  kategori: "D",
  hcp: "6,1",
  fodtAar: 2010,
  tilhorighet: "AK GOLF",
  etterlevelse: { pct: 84, kilde: "WORKBENCH · 4 UKER · 29.09.2026" },
  avtale: { verdi: "3 av 4 klipp", hint: "PERFORMANCE PRO · FORNYES 14.10.2026" },
  nesteTurnering: { navn: "Høstpokalen junior", dato: "04.10.2026" },
  sisteBooking: { dato: "24.09.2026", tjeneste: "Privattime 60 min" },
  kreverDeg: [
    { id: "k1", tittel: "Forslag til godkjenning · lettere uke", sub: "PLAN-VAKTEN · 28.09.2026" },
    { id: "k2", tittel: "Forslag til godkjenning · bytt økt", sub: "RUNDE-AGENT · 27.09.2026" },
  ],
};
export const hodeTom: S360Hode = { ...hode, kategori: null, hcp: "—", etterlevelse: { pct: null, kilde: "WORKBENCH · 4 UKER · 29.09.2026" }, avtale: null, nesteTurnering: null, sisteBooking: null, kreverDeg: [] };

export const rail: S360RailSpiller[] = [
  { id: "u1", navn: "Eira Solvang", sub: "HCP 6,1 · Konkurransegruppe junior" },
  { id: "u2", navn: "Mathias Tveit", sub: "HCP 12,4" },
  { id: "u3", navn: "Sofie Lunde-Haraldsen", sub: "HCP 2,0 · Elite" },
];

export const plan: S360Plan = {
  ukeLabel: "Uke 40",
  uke: [
    { id: "o1", dag: "Man 28.09", tittel: "Styrke · morgenøkt", akse: "fys", minutter: 90, status: "COMPLETED" },
    { id: "o2", dag: "Tir 29.09", tittel: "Innspill 50–100 m", akse: "slag", minutter: 75, status: "SKIPPED" },
    { id: "o3", dag: "Ons 30.09", tittel: "Privattime · teknikk i treffsonen med et langt øktnavn", akse: "tek", minutter: 60, status: "PUBLISHED" },
    { id: "o4", dag: "Lør 03.10", tittel: "Treningsrunde 18 hull", akse: "spill", minutter: 270, status: "PUBLISHED" },
  ],
  iDag: [{ id: "d1", tittel: "Innspill 50–100 m", klokke: "16:00", omrade: "SLAG", sted: "Rangen" }],
  naa: null,
  aktivPlan: { navn: "Høstplan 2026", periode: "01.09.2026–30.11.2026", okter: "18 av 24", venter: "Forslag 28.09.2026" },
  sesong: { navn: "2026 · Sesongplan", naa: { navn: "Turneringsperiode", til: "11.10.2026" }, neste: { navn: "Evaluering", fra: "12.10.2026" } },
  kommende: [{ navn: "Høstpokalen junior", dato: "04.10.2026" }],
  resultater: [{ navn: "Klubbmesterskapet", dato: "30.08.2026", plassering: 3, score: 74 }],
  permisjoner: [{ id: "l1", aarsak: "Skoletur", fra: "12.10.2026", til: "16.10.2026", beskrivelse: "—", status: "Planlagt slutt" }],
};
export const planTom: S360Plan = { ...plan, uke: [], iDag: [], aktivPlan: null, sesong: null, kommende: [], resultater: [], permisjoner: [] };

const runderInn = Array.from({ length: 14 }, (_, i) => ({ score: 74 + (i % 4), playedAt: new Date(Date.UTC(2026, 8, 27 - i * 3)), hull: i === 5 ? 9 : 18 }));
export const stats: S360Stats = {
  snitt: { ...snittscore(runderInn), kilde: "RUNDER · BRUTTO · 13 TELLENDE · 27.09.2026" },
  runder: [
    { id: "r1", dato: "27.09.2026", bane: "Nordre golfbane", brutto: 74, tilPar: "+3", hull: 18, sg: -0.6, type: "Turnering", grunnlag: "Slag for slag" },
    { id: "r2", dato: "24.09.2026", bane: "Bane med et veldig langt navn golfklubb og country club", brutto: 77, tilPar: "+5", hull: 18, sg: null, type: "Trening", grunnlag: "Hullkort" },
    { id: "r3", dato: "20.09.2026", bane: "Søndre golfbane", brutto: 39, tilPar: "+3", hull: 9, sg: null, type: "Trening", grunnlag: "Hullkort" },
  ],
  tigerFive: [
    { navn: "Bogey på par 5", verdi: "1", status: "varsel" },
    { navn: "Dobbelbogey", verdi: "0", status: "god" },
    { navn: "Tre-putt", verdi: "2", status: "risiko" },
  ],
  sg: {
    verdi: "−0,6", trend: "+0,2", runder: 8, baseline: "Scratch", grunnlag: "8 runder", kilde: "BEREGNET", datagrunnlag: "ok",
    omrader: [
      { kode: "OTT", navn: "Utslag", sg: 0.3, motNeste: 0.4, nesteNivaa: 5, stallen: -0.2 },
      { kode: "APP", navn: "Innspill", sg: -0.9, motNeste: 1.1, nesteNivaa: 5, stallen: -0.6 },
      { kode: "ARG", navn: "Nærspill", sg: 0.1, motNeste: null, nesteNivaa: null, stallen: 0 },
      { kode: "PUTT", navn: "Putting", sg: -0.1, motNeste: 0.2, nesteNivaa: 5, stallen: null },
    ],
    stallKilde: "RUNDER SISTE 8 UKER · 29.09.2026",
    motSegSelv: { harSvar: true, grunnlag: "10 siste runder mot 10 før", akser: [{ navn: "Innspill", nylig: -0.9, tidligere: -0.5, endring: -0.4 }, { navn: "Putting", nylig: -0.1, tidligere: -0.3, endring: 0.2 }], verst: "Innspill −0,40" },
    nesteFokus: { omrade: "Innspill 100–150 m", sgTap: "−0,7", grunnlag: "8 runder", lekkasje: [{ label: "100–150 m", sg: -0.7 }, { label: "50–100 m", sg: -0.2 }] },
    uker: [{ kode: "APP", navn: "Innspill", siste: -0.9, trend: -0.2, antall: 4 }],
  },
  trening: {
    analyse: { planlagteOkter: 12, gjennomforteOkter: 10, etterlevelsePct: 83, planlagteReps: 900, faktiskeReps: 760, ballerSlatt: 640, svingerUtenBall: 120 },
    volumOmrader: [{ kode: "APP", navn: "Innspill", minutter: 320 }, { kode: "PUTT", navn: "Putting", minutter: 150 }],
    volumTotal: 470,
    volumUker: [{ uke: "W37", minutter: 120 }, { uke: "W38", minutter: 180 }, { uke: "W39", minutter: 170 }],
    korrelasjon: [{ navn: "Innspill", r: 0.41, datapunkter: 9, tolkning: "svak positiv" }],
    planMotFaktisk: [{ akse: "fys", plan: 180, faktisk: 90 }, { akse: "slag", plan: 150, faktisk: 210 }, { akse: "spill", plan: 270, faktisk: 0 }],
    planKilde: "WORKBENCH · UKE 40 · 29.09.2026",
  },
  trackman: {
    koller: [{ club: "Driver", shots: 96, avgTotal: 232.4, avgSmash: 1.46, avgBallSpeed: 148 }, { club: "7-jern", shots: 60, avgTotal: 142, avgSmash: 1.33, avgBallSpeed: 108 }],
    okter: [{ id: "tm1", dato: "24.09.2026", slag: 96, kolle: "Driver" }],
  },
  putting: { band: [{ band: "0–3 ft", pct: 96 }, { band: "3–5 ft", pct: 78 }], baseline: "PGA Tour" },
  progresjon: { nivaa: "Kategori D", nesteNivaa: "Kategori C", krav: [{ navn: "Snittscore under 74", bestatt: false, verdi: "75,1", mal: "74,0" }] },
  vekstrate: { egenRate: -2.1, kohortRate: -1.4, fraAar: 2024, tilAar: 2026, harSvar: true, harKohort: true, grunnlag: "3 sesonger" },
  turneringer: { antall: 6, bestePlassering: 3, kilder: ["GOLFBOX"], tomGrunn: "", aar: [{ aar: 2026, rader: [{ navn: "Klubbmesterskapet", dato: "30.08.2026", plassering: 3, motPar: 2 }] }] },
  tester: [{ id: "t1", navn: "Innspill 50 m", dato: "12.09.2026", score: "7" }],
};

export const tp: S360Tp = {
  planer: [{ id: "plan1", navn: "Teknisk plan høst 2026", status: "Aktiv", periode: "01.09.2026–åpen", oppdatert: "26.09.2026" }],
  aktiv: tpPlan,
  aktivId: "plan1",
};
export const tpTom: S360Tp = { planer: [], aktiv: null, aktivId: null };

export const tester: S360Tester = {
  profil: {
    player: { name: "Eira Solvang", initials: "ES", hcp: 6.1, homeClub: "Nordre GK", alder: 16, tier: "FULL", sistAktiv: "27.09" },
    testsTotal: 20, testsDone: 7, measurements: 11, omraderDekket: 3,
    omrader: [
      { area: "FYS", label: "Fysisk", available: 5, measured: 2, coveragePct: 40, measurements: 3, lastDate: "12.09", bestLevel: null },
      { area: "TEK", label: "Teknisk", available: 4, measured: 0, coveragePct: 0, measurements: 0, lastDate: null, bestLevel: null },
      { area: "SLAG", label: "Slag", available: 6, measured: 4, coveragePct: 67, measurements: 6, lastDate: "20.09", bestLevel: "D" },
      { area: "SPILL", label: "Spill", available: 3, measured: 1, coveragePct: 33, measurements: 2, lastDate: "02.09", bestLevel: null },
      { area: "TURN", label: "Turnering", available: 2, measured: 0, coveragePct: 0, measurements: 0, lastDate: null, bestLevel: null },
    ],
    sterkeste: null, svakeste: null,
  },
  testdager: [{ id: "td1", dato: "10.10.2026", tittel: "Testdag høst", gjennomfort: false }],
  tildelinger: [{ id: "ta1", navn: "Putt 3–6 fot", frist: "05.10.2026" }],
  resultater: [{
    id: "res1", navn: "Innspill 50 m", score: "7 OK av 10", dato: "12.09.2026", trend: "Høyere score enn forrige sammenlignbare test. Dette er ikke et nivåvarsel.",
    forslag: [{ id: "ov1", navn: "Wedge-stige 40–70 m", beskrivelse: "Fem baller per lengde, notér treff.", begrunnelse: "Treffer testområdet innspill", kanLeggesTil: true, okter: [{ id: "s1", label: "30.09.2026 · Innspill 50–100 m" }] }],
  }],
  tn: [{ id: "tn1", navn: "8-ball", forsok: 8, score: "19 p", dato: "12.09.2026" }],
  workbenchHref: "/admin/workbench/u1",
};
tester.profil.sterkeste = tester.profil.omrader[2]!;
tester.profil.svakeste = tester.profil.omrader[1]!;

export const iup: S360Iup = {
  ak: false,
  person: { navn: "Eira Solvang", fodt: "14.03.2010", klubb: "Nordre GK", skole: "Nordre videregående · VG1", hovedcoach: "Jonas Brekke", telefon: "400 00 000", epost: "eira@eksempel.no", spilteAar: "8 år", ambisjon: "Spille college i USA", grupper: ["Konkurransegruppe junior"] },
  foreldre: [{ id: "f1", navn: "Kari Solvang", relasjon: "Mor", kontakt: "kari@eksempel.no" }],
  ranking: [{ navn: "WAGR", verdi: null, kilde: "WAGR · IKKE RANGERT" }, { navn: "NGF juniorranking", verdi: null, kilde: "NGF · FINNES IKKE I APPEN ENNÅ" }],
  resultatmaal: [{ id: "g1", tittel: "Snittscore under 74", frist: "01.06.2027", pct: 40 }],
  prosessmaal: [{ id: "g2", tittel: "Rutine før hvert slag under 20 sekunder", frist: null, pct: null }],
  perioder: [{ navn: "Grunnperiode", uker: "Uke 1–14", timer: "360–480 min/uke" }, { navn: "Turneringsperiode", uker: "Uke 21–40", timer: "—" }],
  turneringer: [{ navn: "Klubbmesterskapet", dato: "30.08.2026", resultat: "74 · 3. plass" }],
  uke: [{ dag: "Man 28.09", tittel: "Styrke · morgenøkt", meta: "FYS · 90 min" }],
  trening: { gjennomfort: 14, planlagt: 17, timer: [{ akse: "fys", timer: 6 }, { akse: "tek", timer: 2.5 }, { akse: "slag", timer: 9 }, { akse: "spill", timer: 4.5 }, { akse: "turn", timer: 0 }], kilde: "WORKBENCH · 4 UKER · 29.09.2026" },
  tester: [{ navn: "Innspill 50 m", verdi: "7 OK", kilde: "TEST · 12.09.2026" }],
  teknikk: [{ p: "P4.0", tittel: "Toppen av baksvingen", status: "Aktiv" }],
  teknikkKilde: "TEKNISK PLAN · JONAS BREKKE · 26.09.2026",
  fys: [{ navn: "Club Speed driver", verdi: "98,4", kilde: "FYS-TEST · 12.09.2026" }],
};
export const iupAk: S360Iup = { ...iup, ak: true };
export const iupTom: S360Iup = { ...iup, foreldre: [], resultatmaal: [], prosessmaal: [], perioder: [], turneringer: [], uke: [], trening: null, tester: [], teknikk: [], teknikkKilde: null, fys: [] };

export const samtaler: S360Samtaler = {
  traader: [{ id: "c1", type: "Meldinger", antall: 14, sist: "28.09.2026" }, { id: "c2", type: "Live-økt", antall: 6, sist: "24.09.2026" }],
  notat: { tekst: "Jobber godt med tempo. Følg opp putting 3–6 fot før turneringen.", coach: "Jonas Brekke", dato: "26.09.2026" },
  videoer: [{ id: "v1", tittel: "Driver bakfra", dato: "20.09.2026", kilde: "Coach" }],
  caddie: { antall: 3, sisteTittel: "Plan før turnering", sist: "27.09.2026" },
};

export const talent: S360Talent = {
  radar: [{ akse: "Fysisk", verdi: 7 }, { akse: "Teknikk", verdi: 6 }, { akse: "Taktikk", verdi: 8 }, { akse: "Mental", verdi: 5 }, { akse: "Motivasjon", verdi: 9 }],
  kilde: "TALENTVURDERING · 20.09.2026",
  niva: "U18", region: "Østfold", klubb: "Nordre GK", inkludertFra: "01.03", notater: "Sterk konkurranseinstinkt.",
  milepaeler: [{ tittel: "Første turneringsseier", dato: "2026-06-12" }],
};
export const talentTom: S360Talent = { radar: null, kilde: "—", niva: null, region: null, klubb: null, inkludertFra: null, notater: null, milepaeler: [] };
