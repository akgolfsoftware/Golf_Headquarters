/**
 * Målrettede tester for TN-utvidelsen 14.09.2026: spillertilgang (lest FØR
 * data, aldri en rå spillerId), test-gruppering uten summering på tvers av
 * protokoller, og gruppeanalyse som aldri blander protokoller og aldri
 * later som manglende data er en 0-verdi.
 */
import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import { tnProtocol, type TnField, type TnRow } from "../portal-tester/tn-catalog";
import { tnScore } from "../portal-tester/tn-scoring";

const GRUPPE = { id: "tn-gruppe", name: "Team Norway Golf" };

type Medlem = { userId: string; role: string; navn: string; aktiv: boolean };
let medlemmer: Medlem[] = [
  { userId: "coach-1", role: "COACH", navn: "Coach", aktiv: true },
  { userId: "assistent-1", role: "ASSISTANT", navn: "Hjelpetrener", aktiv: true },
  { userId: "player-a", role: "PLAYER", navn: "Spiller A", aktiv: true },
  { userId: "player-b", role: "PLAYER", navn: "Spiller B", aktiv: true },
  { userId: "player-utmeldt", role: "PLAYER", navn: "Utmeldt Spiller", aktiv: false },
];

type Resultat = { id: string; userId: string; testId: string; takenAt: Date; score: number; details: unknown; recordedById: string | null };
let resultater: Resultat[] = [];
let deltakerKoblinger: { id: string; resultId: string }[] = [];
let testDefinisjoner: Record<string, { name: string; scoringRule: string; protocol: unknown }> = {};
let ovrigeTesterData: Record<string, {
  groups: { axis: string; label: string; done: number; total: number; rows: { id: string; href: string; name: string; latest: string | null; latestDate: string | null }[] }[];
  planned: { id: string; testId: string; name: string; axis: string; state: "ongoing" | "planned"; step: null; when: string | null; href: string }[];
}> = {};
type Tildeling = { id: string; playerId: string; testId: string; dueDate: Date | null };
let tildelinger: Tildeling[] = [];
let planerPerBruker: Record<string, { id: string; name: string; status: string; startDate: Date; endDate: Date | null }[]> = {};
let analyseHubPerBruker: Record<string, { dagLabel: string; vindu: null; lekkasje: null; lekkasjeLinje: null; sgAkser: { id: string; etikett: string; tekst: string; verdi: number | null }[]; trackman: { sessionId: string; klubb: string; datoKort: string; setning: string; meta: string; kpis: string; variant: string; punkter: unknown[]; ellipse: null } | null; dypere: { href: string; tittel: string; meta: string }[] }> = {};

function feltVerdi(f: TnField, row: TnRow, presis: boolean): string | number {
  if (f.choices) return f.choices[0];
  if (f.key === "carry") return presis ? (row.target ?? 0) : (row.target ?? 0) + 30;
  if (f.key === "side") return presis ? 0 : 15;
  if (f.key === "result") return presis ? 0.3 : 20;
  if (f.key === "strokes") return presis ? 1 : 4;
  return presis ? 1 : 10;
}

/**
 * Bygger et EKTE, kanonisk gyldig `TnResult` ved faktisk å kjøre `tnScore`
 * på den virkelige protokollen — ikke en hånddiktet forenkling. `presis`
 * styrer om forsøkene er «gode» (lav score for slag/near, høy for 8-ball-
 * poeng) eller «dårlige», slik testene kan bevise faktisk retning uten å
 * kjenne interne konstanter i scoringmotoren.
 */
function ekteResultat(protocolId: string, presis: boolean, count?: number) {
  const p = tnProtocol(protocolId, count);
  if (!p) throw new Error(`Ukjent testprotokoll i fixture: ${protocolId}`);
  const values: Record<string, Record<string, string | number>> = {};
  p.rows.forEach((row, i) => {
    const felter: Record<string, string | number> = {};
    for (const f of row.fields) felter[f.key] = feltVerdi(f, row, presis);
    values[String(i + 1)] = felter;
  });
  return tnScore(p, values);
}

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      group: { findUnique: async () => GRUPPE },
      groupMember: {
        findFirst: async ({ where }: { where: { userId: string; role?: string } }) => {
          const m = medlemmer.find((x) => x.userId === where.userId && x.aktiv && (!where.role || x.role === where.role));
          return m ? { role: m.role, user: { name: m.navn } } : null;
        },
        findMany: async ({ where }: { where: { role?: string } }) =>
          medlemmer.filter((m) => m.aktiv && (!where.role || m.role === where.role)).map((m) => ({ userId: m.userId, user: { name: m.navn } })),
        count: async () => 0,
      },
      testResult: {
        findMany: async ({ where, orderBy, take }: { where: { userId?: string; testId?: string | { startsWith: string }; id?: { in: string[] } }; orderBy?: { takenAt?: string; score?: string }; take?: number }) => {
          let rows = resultater;
          if (where.userId) rows = rows.filter((r) => r.userId === where.userId);
          if (typeof where.testId === "string") { const testId = where.testId; rows = rows.filter((r) => r.testId === testId); }
          else if (where.testId) { const prefiks = where.testId.startsWith; rows = rows.filter((r) => r.testId.startsWith(prefiks)); }
          if (where.id?.in) rows = rows.filter((r) => where.id!.in.includes(r.id));
          rows = [...rows].sort((a, b) => {
            if (orderBy?.takenAt) return orderBy.takenAt === "desc" ? b.takenAt.getTime() - a.takenAt.getTime() : a.takenAt.getTime() - b.takenAt.getTime();
            if (orderBy?.score) return orderBy.score === "asc" ? a.score - b.score : b.score - a.score;
            return 0;
          });
          return take ? rows.slice(0, take) : rows;
        },
      },
      testDayParticipant: {
        findMany: async ({ where }: { where: { resultId: { in: string[] } } }) =>
          deltakerKoblinger.filter((k) => where.resultId.in.includes(k.resultId)),
      },
      testDefinition: {
        findUnique: async ({ where }: { where: { id: string } }) => testDefinisjoner[where.id] ?? null,
        findFirst: async ({ where }: { where: { id: string } }) => testDefinisjoner[where.id] ?? null,
      },
      user: {
        findUnique: async ({ where }: { where: { id: string } }) => {
          const m = medlemmer.find((x) => x.userId === where.id);
          return m ? { id: m.userId, name: m.navn, hcp: null, tier: "GRATIS" } : null;
        },
      },
      testAssignment: {
        findMany: async ({ where }: { where: { playerId: string; status: string; testId?: { not: { startsWith: string } } } }) => {
          const prefiks = where.testId?.not.startsWith;
          return tildelinger
            .filter((t) => t.playerId === where.playerId && (!prefiks || !t.testId.startsWith(prefiks)))
            .map((t) => ({ id: t.id, testId: t.testId, dueDate: t.dueDate, test: { name: testDefinisjoner[t.testId]?.name ?? t.testId } }));
        },
      },
      subscription: { findUnique: async () => null },
      trainingPlan: {
        findMany: async ({ where }: { where: { userId: string } }) => planerPerBruker[where.userId] ?? [],
      },
    },
  },
});

mock.module("@/lib/portal-analyse/tm-hub-data", {
  namedExports: {
    hentAnalyseHub: async (userId: string) =>
      analyseHubPerBruker[userId] ?? {
        dagLabel: "", vindu: null, lekkasje: null, lekkasjeLinje: null, sgAkser: [], trackman: null,
        // dypere peker til coachens EGEN /portal — bevisst med her for å
        // bevise at hentTnSpillerAnalyseHub faktisk utelater feltet.
        dypere: [{ href: "/portal/mal/runder", tittel: "Mine runder", meta: "" }],
      },
  },
});

mock.module("@/lib/portal-tester/tester-data", {
  namedExports: {
    loadTesterScreen: async (spiller: { id: string }) => ovrigeTesterData[spiller.id] ?? { groups: [], planned: [] },
    deriveLowerIsBetter: (regel: string) => /sekund|tid/i.test(regel),
    fmtNum: (n: number) => String(n),
  },
});

let hentTnSpillerTilgang: typeof import("./tn-arbeidsflate").hentTnSpillerTilgang;
let hentTnSpillerTester: typeof import("./tn-arbeidsflate").hentTnSpillerTester;
let hentTnSpillerTestDetalj: typeof import("./tn-arbeidsflate").hentTnSpillerTestDetalj;
let hentTnSpillerOvrigeTester: typeof import("./tn-arbeidsflate").hentTnSpillerOvrigeTester;
let hentTnSpillerOvrigTestDetalj: typeof import("./tn-arbeidsflate").hentTnSpillerOvrigTestDetalj;
let hentTnSpillerAktivePlaner: typeof import("./tn-arbeidsflate").hentTnSpillerAktivePlaner;
let hentTnSpillerAnalyseHub: typeof import("./tn-arbeidsflate").hentTnSpillerAnalyseHub;
before(async () => {
  const mod = await import("./tn-arbeidsflate");
  hentTnSpillerTilgang = mod.hentTnSpillerTilgang;
  hentTnSpillerTester = mod.hentTnSpillerTester;
  hentTnSpillerTestDetalj = mod.hentTnSpillerTestDetalj;
  hentTnSpillerOvrigeTester = mod.hentTnSpillerOvrigeTester;
  hentTnSpillerOvrigTestDetalj = mod.hentTnSpillerOvrigTestDetalj;
  hentTnSpillerAktivePlaner = mod.hentTnSpillerAktivePlaner;
  hentTnSpillerAnalyseHub = mod.hentTnSpillerAnalyseHub;
});

beforeEach(() => {
  medlemmer = [
    { userId: "coach-1", role: "COACH", navn: "Coach", aktiv: true },
    { userId: "assistent-1", role: "ASSISTANT", navn: "Hjelpetrener", aktiv: true },
    { userId: "player-a", role: "PLAYER", navn: "Spiller A", aktiv: true },
    { userId: "player-b", role: "PLAYER", navn: "Spiller B", aktiv: true },
    { userId: "player-utmeldt", role: "PLAYER", navn: "Utmeldt Spiller", aktiv: false },
    { userId: "guest-1", role: "GUEST", navn: "Gjest", aktiv: true },
    { userId: "parent-1", role: "PARENT", navn: "Forelder", aktiv: true },
    // Datainkonsistens/spoofing-scenario: GRUPPE-rollen sier COACH/ASSISTANT,
    // men den faktiske PLATTFORMROLLEN (User.role) er PLAYER/GUEST/PARENT.
    // Gruppemedlemskap alene skal ALDRI være nok.
    { userId: "spoofed-coach-gruppe", role: "COACH", navn: "Spoofed", aktiv: true },
    // Motsatt spoofing: GRUPPE-rollen sier PLAYER, men PLATTFORMROLLEN er
    // GUEST — selv-tilgang-grenen skal IKKE gi en personlig lesevei bare
    // fordi gruppe-raden sier PLAYER.
    { userId: "spoofed-guest-player-gruppe", role: "PLAYER", navn: "Spoofed gjest", aktiv: true },
    { userId: "spoofed-assistant-gruppe", role: "ASSISTANT", navn: "Spoofed hjelpetrener", aktiv: true },
  ];
  resultater = [];
  deltakerKoblinger = [];
  testDefinisjoner = {};
  ovrigeTesterData = {};
  tildelinger = [];
  planerPerBruker = {};
  analyseHubPerBruker = {};
});

// ---------------------------------------------------------------------
// Tilgang — leses FØR data, aldri en rå spillerId
// ---------------------------------------------------------------------

test("spilleren selv får tilgang til egne data", async () => {
  const tilgang = await hentTnSpillerTilgang({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-a");
  assert.ok(tilgang);
  assert.equal(tilgang!.spillerId, "player-a");
});

test("spilleren avvises fra en ANNEN spillers data — ingen spillerId-tillit fra URL alene", async () => {
  const tilgang = await hentTnSpillerTilgang({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-b");
  assert.equal(tilgang, null);
});

test("coach med aktivt medlemskap ser en aktiv spiller i samme gruppe", async () => {
  const tilgang = await hentTnSpillerTilgang({ id: "coach-1", role: "COACH", name: "Coach" }, "player-a");
  assert.ok(tilgang);
  assert.equal(tilgang!.spillerNavn, "Spiller A");
});

test("coach avvises for en UTMELDT spiller (endedAt satt)", async () => {
  const tilgang = await hentTnSpillerTilgang({ id: "coach-1", role: "COACH", name: "Coach" }, "player-utmeldt");
  assert.equal(tilgang, null);
});

test("hjelpetrener (ASSISTANT) kan lese en spillers data — samme innsyn som resten av TN", async () => {
  const tilgang = await hentTnSpillerTilgang({ id: "assistent-1", role: "COACH", name: "Hjelpetrener" }, "player-a");
  assert.ok(tilgang);
});

test("utenforstående uten TN-medlemskap avvises direkte — også med gyldig spillerId i URL", async () => {
  const tilgang = await hentTnSpillerTilgang({ id: "utenfor-1", role: "PLAYER", name: "Utenforstående" }, "player-a");
  assert.equal(tilgang, null);
});

// ---------------------------------------------------------------------
// Testoversikt — aldri summert mellom protokoller
// ---------------------------------------------------------------------

test("to ulike protokoller gir to separate rader, aldri én summert score", async () => {
  const putt = ekteResultat("putt-1-3m", true);
  const wedge = ekteResultat("wedge-variation", true);
  resultater = [
    { id: "r1", userId: "player-a", testId: "tn-v3-putt-1-3m", takenAt: new Date("2026-09-10"), score: putt.score, details: putt, recordedById: null },
    { id: "r2", userId: "player-a", testId: "tn-v3-wedge-variation", takenAt: new Date("2026-09-11"), score: wedge.score, details: wedge, recordedById: null },
  ];
  const data = await hentTnSpillerTester({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-a");
  assert.ok(data);
  assert.equal(data!.rader.length, 2);
  const testIder = data!.rader.map((r) => r.testId).sort();
  assert.deepEqual(testIder, ["tn-v3-putt-1-3m", "tn-v3-wedge-variation"]);
});

test("siste/forrige/beste er riktig for samme protokoll, med korrekt bedre-retning kanonisk reberegnet", async () => {
  const darlig = ekteResultat("putt-1-3m", false);
  const god = ekteResultat("putt-1-3m", true);
  resultater = [
    { id: "r1", userId: "player-a", testId: "tn-v3-putt-1-3m", takenAt: new Date("2026-09-01"), score: darlig.score, details: darlig, recordedById: null },
    { id: "r2", userId: "player-a", testId: "tn-v3-putt-1-3m", takenAt: new Date("2026-09-10"), score: god.score, details: god, recordedById: null },
  ];
  const data = await hentTnSpillerTester({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-a");
  const rad = data!.rader[0];
  assert.equal(rad.sisteScore, god.score);
  assert.equal(rad.forrigeScore, darlig.score);
  assert.equal(rad.besteScore, god.score); // putt-1-3m: færre slag er bedre
  assert.ok(god.score < darlig.score);
  assert.equal(rad.lowerIsBetter, true);
});

test("fravær av data: ingen resultater gir tom liste, ikke en feil", async () => {
  const data = await hentTnSpillerTester({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-a");
  assert.ok(data);
  assert.deepEqual(data!.rader, []);
});

test("testdetalj kobler til testdagens deltaker-URL når resultatet er trenerført", async () => {
  const r = ekteResultat("putt-1-3m", true);
  resultater = [
    { id: "r1", userId: "player-a", testId: "tn-v3-putt-1-3m", takenAt: new Date("2026-09-10"), score: r.score, details: r, recordedById: "coach-1" },
  ];
  deltakerKoblinger = [{ id: "deltaker-1", resultId: "r1" }];
  const detalj = await hentTnSpillerTestDetalj({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-a", "tn-v3-putt-1-3m");
  assert.ok(detalj);
  assert.equal(detalj!.historikk[0].recordedByCoach, true);
  assert.equal(detalj!.historikk[0].testdagDeltakerId, "deltaker-1");
});

test("testdetalj for en protokoll uten resultater gir null, ikke en tom/krasjet side", async () => {
  const detalj = await hentTnSpillerTestDetalj({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-a", "tn-v3-ukjent");
  assert.equal(detalj, null);
});

// ---------------------------------------------------------------------
// Gruppeanalyse — aldri blandet protokoller, manglende data = "Ukjent"
// ---------------------------------------------------------------------

let hentTnGruppeanalyseResultat: typeof import("./tn-arbeidsflate").hentTnGruppeanalyseResultat;
before(async () => {
  hentTnGruppeanalyseResultat = (await import("./tn-arbeidsflate")).hentTnGruppeanalyseResultat;
});

test("gruppeanalyse per protokoll: spiller uten resultat er UKJENT (null), ikke 0 og ikke utelatt", async () => {
  const r = ekteResultat("putt-1-3m", true);
  resultater = [
    { id: "r1", userId: "player-a", testId: "tn-v3-putt-1-3m", takenAt: new Date("2026-09-10"), score: r.score, details: r, recordedById: null },
    // player-b har ALDRI tatt denne protokollen.
  ];
  const resultat = await hentTnGruppeanalyseResultat({ id: "coach-1", role: "COACH", name: "Coach" }, { protokollId: "putt-1-3m" });
  assert.ok(resultat);
  const radA = resultat!.rader.find((rd) => rd.spillerId === "player-a");
  const radB = resultat!.rader.find((rd) => rd.spillerId === "player-b");
  assert.equal(radA?.score, r.score);
  assert.equal(radB?.score, null);
  // Kjente resultater sorteres FØR ukjente — aldri blandet inn i selve rangeringen.
  assert.equal(resultat!.rader[resultat!.rader.length - 1].score, null);
});

test("gruppeanalyse avvises for spiller uten TN-lese-rolle", async () => {
  const resultat = await hentTnGruppeanalyseResultat({ id: "player-a", role: "PLAYER", name: "Spiller A" }, { protokollId: "putt-1-3m" });
  assert.equal(resultat, null);
});

// ---------------------------------------------------------------------
// Regresjoner fra Codex uavhengig kontroll (root-review-main.md)
// ---------------------------------------------------------------------

test("8-ball: HØYEST poeng vinner som beste, selv om metrics[0] (PEI) er lowerIsBetter", async () => {
  const darlig = ekteResultat("8-ball-variation", false);
  const god = ekteResultat("8-ball-variation", true);
  assert.ok(god.score > darlig.score, "test-fixturen må faktisk gi flere poeng for gode forsøk");
  resultater = [
    { id: "r1", userId: "player-a", testId: "tn-v3-8-ball-variation", takenAt: new Date("2026-09-01"), score: darlig.score, details: darlig, recordedById: null },
    { id: "r2", userId: "player-a", testId: "tn-v3-8-ball-variation", takenAt: new Date("2026-09-10"), score: god.score, details: god, recordedById: null },
  ];
  const data = await hentTnSpillerTester({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-a");
  const rad = data!.rader.find((r) => r.testId === "tn-v3-8-ball-variation");
  assert.ok(rad);
  // Feil kode (metrics[0]/PEI, lowerIsBetter=true) ville gitt besteScore=darlig.score.
  assert.equal(rad!.besteScore, god.score);
  assert.equal(rad!.lowerIsBetter, false);
});

test("8-ball: uforenlig/annen versjon blir ALDRI 'beste', selv med et ekstremt tall", async () => {
  const darlig = ekteResultat("8-ball-variation", false);
  const god = ekteResultat("8-ball-variation", true);
  const forfalsket = { ...god, version: "gammel-versjon", score: god.score + 1000 };
  resultater = [
    { id: "r1", userId: "player-a", testId: "tn-v3-8-ball-variation", takenAt: new Date("2026-09-01"), score: darlig.score, details: darlig, recordedById: null },
    { id: "r2", userId: "player-a", testId: "tn-v3-8-ball-variation", takenAt: new Date("2026-09-10"), score: god.score, details: god, recordedById: null },
    // Score ville "vunnet stort" om raden ble tatt med — men versjonen er feil.
    { id: "r3", userId: "player-a", testId: "tn-v3-8-ball-variation", takenAt: new Date("2026-09-12"), score: forfalsket.score, details: forfalsket, recordedById: null },
  ];
  const data = await hentTnSpillerTester({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-a");
  const rad = data!.rader.find((r) => r.testId === "tn-v3-8-ball-variation");
  assert.equal(rad!.besteScore, god.score);
  assert.equal(rad!.antall, 2);
  assert.equal(rad!.antallUtelatt, 1);
});

test("feil ENHET i lagret JSON utelates fra beste/historikk (kanonisk reberegning avdekker det, ikke bare et strengmatch)", async () => {
  const god = ekteResultat("putt-1-3m", true);
  const feilEnhet = { ...god, unit: "sekunder" };
  resultater = [
    { id: "r1", userId: "player-a", testId: "tn-v3-putt-1-3m", takenAt: new Date("2026-09-10"), score: feilEnhet.score, details: feilEnhet, recordedById: null },
  ];
  const detalj = await hentTnSpillerTestDetalj({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-a", "tn-v3-putt-1-3m");
  assert.ok(detalj);
  assert.equal(detalj!.historikk.length, 0);
  assert.equal(detalj!.antallUtelatt, 1);
  assert.equal(detalj!.besteScore, null);
});

test("feil COUNT (færre forsøksrader enn protokollen krever) blir utelatt, ikke 'beste'", async () => {
  const god = ekteResultat("putt-1-3m", true);
  const feilCount = { ...god, count: god.count - 1 };
  resultater = [
    { id: "r1", userId: "player-a", testId: "tn-v3-putt-1-3m", takenAt: new Date("2026-09-10"), score: feilCount.score, details: feilCount, recordedById: null },
  ];
  const detalj = await hentTnSpillerTestDetalj({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-a", "tn-v3-putt-1-3m");
  assert.ok(detalj);
  assert.equal(detalj!.antallUtelatt, 1);
  assert.equal(detalj!.historikk.length, 0);
});

test("testdetalj: feil protocolId i lagret JSON utelates fra beste/historikk, blokkerer ikke resten", async () => {
  const god = ekteResultat("putt-1-3m", true);
  const annenProtokoll = ekteResultat("wedge-variation", true);
  const feilProtocolId = { ...annenProtokoll, protocolId: "putt-1-3m", score: 1 };
  resultater = [
    { id: "r1", userId: "player-a", testId: "tn-v3-putt-1-3m", takenAt: new Date("2026-09-01"), score: god.score, details: god, recordedById: null },
    // Feil protocolId-INNHOLD (verdier fra en annen protokoll) lagret under samme testId — skal ekskluderes, ikke bli "beste".
    { id: "r2", userId: "player-a", testId: "tn-v3-putt-1-3m", takenAt: new Date("2026-09-10"), score: feilProtocolId.score, details: feilProtocolId, recordedById: null },
  ];
  const detalj = await hentTnSpillerTestDetalj({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-a", "tn-v3-putt-1-3m");
  assert.ok(detalj);
  assert.equal(detalj!.besteScore, god.score);
  assert.equal(detalj!.historikk.length, 1);
  assert.equal(detalj!.antallUtelatt, 1);
});

test("alle rader utelatt: protokollen vises fortsatt, med synlig antallUtelatt — ikke et stille 404", async () => {
  const god = ekteResultat("putt-1-3m", true);
  const feilEnhet = { ...god, unit: "sekunder" };
  resultater = [
    { id: "r1", userId: "player-a", testId: "tn-v3-putt-1-3m", takenAt: new Date("2026-09-10"), score: feilEnhet.score, details: feilEnhet, recordedById: null },
  ];
  const oversikt = await hentTnSpillerTester({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-a");
  assert.equal(oversikt!.rader.length, 1);
  const rad = oversikt!.rader[0];
  assert.equal(rad.antall, 0);
  assert.equal(rad.antallUtelatt, 1);
  assert.equal(rad.sisteScore, null);
  assert.equal(rad.besteScore, null);

  const detalj = await hentTnSpillerTestDetalj({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-a", "tn-v3-putt-1-3m");
  assert.ok(detalj);
  assert.equal(detalj!.antallUtelatt, 1);
  assert.equal(detalj!.historikk.length, 0);
});

test("PEI formateres som norsk prosent, ikke rå desimal med enhet", async () => {
  const r = ekteResultat("wedge-variation", true);
  resultater = [
    { id: "r1", userId: "player-a", testId: "tn-v3-wedge-variation", takenAt: new Date("2026-09-10"), score: r.score, details: r, recordedById: null },
  ];
  const data = await hentTnSpillerTester({ id: "player-a", role: "PLAYER", name: "Spiller A" }, "player-a");
  const rad = data!.rader.find((rd) => rd.testId === "tn-v3-wedge-variation");
  assert.equal(rad!.sisteEnhet, "PEI");
  assert.match(rad!.sisteFormatert!, /%/);
  assert.doesNotMatch(rad!.sisteFormatert!, /PEI/);
});

test("GUEST-rolle i TN-gruppen avvises som personlig dataleser (ikke COACH/ASSISTANT/ADMIN)", async () => {
  const tilgang = await hentTnSpillerTilgang({ id: "guest-1", role: "COACH", name: "Gjest" }, "player-a");
  assert.equal(tilgang, null);
});

test("PARENT-rolle i TN-gruppen avvises som personlig dataleser", async () => {
  const tilgang = await hentTnSpillerTilgang({ id: "parent-1", role: "PARENT", name: "Forelder" }, "player-a");
  assert.equal(tilgang, null);
});

test("global PLAYER-rolle avvises for en annen spillers data, SELV med en GRUPPE-rad som sier COACH (gruppemedlemskap alene er ikke nok)", async () => {
  const tilgang = await hentTnSpillerTilgang({ id: "spoofed-coach-gruppe", role: "PLAYER", name: "Spoofed" }, "player-a");
  assert.equal(tilgang, null);
});

test("global GUEST-rolle avvises, selv med en GRUPPE-rad som sier ASSISTANT", async () => {
  const tilgang = await hentTnSpillerTilgang({ id: "spoofed-assistant-gruppe", role: "GUEST", name: "Spoofed" }, "player-a");
  assert.equal(tilgang, null);
});

test("global PARENT-rolle avvises, selv med en GRUPPE-rad som sier COACH", async () => {
  const tilgang = await hentTnSpillerTilgang({ id: "spoofed-coach-gruppe", role: "PARENT", name: "Spoofed" }, "player-a");
  assert.equal(tilgang, null);
});

test("global PLAYER ser KUN seg selv, selv om egen GRUPPE-rolle skulle vært feilaktig satt til COACH", async () => {
  const tilgang = await hentTnSpillerTilgang({ id: "spoofed-coach-gruppe", role: "PLAYER", name: "Spoofed" }, "spoofed-coach-gruppe");
  // kontekst.erSpiller avgjøres av GRUPPE-rollen — her "COACH", altså IKKE
  // erSpiller — og global PLAYER er heller ikke en gyldig personlig-data-
  // leser (erTnPersonligDataLeser krever global COACH/ADMIN). Riktig utfall
  // er avvisning, ikke en feilaktig "selv-tilgang".
  assert.equal(tilgang, null);
});

test("global GUEST kan IKKE selv-lese, selv om egen GRUPPE-rolle skulle vært (feilaktig) PLAYER", async () => {
  const tilgang = await hentTnSpillerTilgang({ id: "spoofed-guest-player-gruppe", role: "GUEST", name: "Spoofed gjest" }, "spoofed-guest-player-gruppe");
  assert.equal(tilgang, null);
});

test("øvrige PlayerHQ-tester OG pågående TestSession-er vises ved siden av TN-protokoller, med lenke bygget fra testId (IKKE session-id) til SPILLERENS TN-rute", async () => {
  // Mocktester bruker BEVISST ulike id (TestSession.id) og testId
  // (TestDefinition.id) — samme faktiske loaderkontrakt som
  // `loadTesterScreen` faktisk har. Samme streng for begge feltene ville
  // skjult bug-klassen der href/filter leser feil felt.
  ovrigeTesterData = {
    "player-a": {
      groups: [
        {
          axis: "fys", label: "Fysisk", done: 1, total: 1,
          rows: [
            { id: "tn-v3-putt-1-3m", href: "/portal/tren/tester/tn-v3-putt-1-3m", name: "Putt 1–3 m", latest: "50", latestDate: "10. sep" },
            { id: "vippetest", href: "/portal/tren/tester/vippetest", name: "Vippetest", latest: "12", latestDate: "5. sep" },
          ],
        },
      ],
      planned: [
        { id: "session-abc123", testId: "60m-sprint", name: "60m sprint", axis: "fys", state: "planned", step: null, when: "12. sep", href: "/portal/tren/tester/60m-sprint" },
        { id: "session-def456", testId: "tn-v3-putt-1-3m", name: "Putt 1–3 m", axis: "fys", state: "ongoing", step: null, when: null, href: "/portal/tren/tester/team-norway?test=putt-1-3m" },
      ],
    },
  };
  const ovrige = await hentTnSpillerOvrigeTester({ id: "coach-1", role: "COACH", name: "Coach" }, "player-a");
  assert.ok(ovrige);
  const alleRader = ovrige!.grupper.flatMap((g) => g.rows);
  // tn-v3-raden filtreres bort — den har sin egen, strengere visning.
  assert.equal(alleRader.some((r) => r.id === "tn-v3-putt-1-3m"), false);
  const vippe = alleRader.find((r) => r.id === "vippetest");
  assert.ok(vippe);
  assert.equal(vippe!.href, "/team-norway/spiller/player-a/tester/vippetest");
  // TN-protokollsesjonen (session-def456, testId tn-v3-...) filtreres bort
  // på testId — filteret må lese testId, ikke den tilfeldige session-id-en.
  assert.equal(ovrige!.planlagt.length, 1);
  const rad = ovrige!.planlagt[0];
  // Href bygges fra testId ("60m-sprint"), ALDRI fra session-id-en
  // ("session-abc123") — det var 404-bugen.
  assert.equal(rad.testId, "60m-sprint");
  assert.equal(rad.id, "session-abc123");
  assert.equal(rad.href, "/team-norway/spiller/player-a/tester/60m-sprint");
  assert.equal(rad.status, "PLANLAGT");
});

test("ekte ÅPEN TestAssignment for målspiller vises i planlagt-listen, med testdefinisjonens navn/id — ikke bare TestSession-baserte rader", async () => {
  testDefinisjoner["60m-sprint"] = { name: "60m sprint", scoringRule: "Tid i sekunder", protocol: { scoring: "time_seconds", shots: [], inputFields: [] } };
  tildelinger = [
    { id: "assignment-1", playerId: "player-a", testId: "60m-sprint", dueDate: new Date("2026-09-20") },
    // Skal ALDRI dukke opp her — TN-protokoller har sin egen, strengere visning.
    { id: "assignment-2", playerId: "player-a", testId: "tn-v3-putt-1-3m", dueDate: null },
    // Skal ALDRI dukke opp — tilhører en annen spiller.
    { id: "assignment-3", playerId: "player-b", testId: "60m-sprint", dueDate: null },
  ];
  const ovrige = await hentTnSpillerOvrigeTester({ id: "coach-1", role: "COACH", name: "Coach" }, "player-a");
  assert.ok(ovrige);
  assert.equal(ovrige!.planlagt.length, 1);
  const rad = ovrige!.planlagt[0];
  assert.equal(rad.testId, "60m-sprint");
  assert.equal(rad.id, "assignment-1");
  assert.equal(rad.navn, "60m sprint");
  assert.equal(rad.status, "ÅPEN TILDELING");
  assert.equal(rad.frist?.getTime(), new Date("2026-09-20").getTime());
  assert.equal(rad.href, "/team-norway/spiller/player-a/tester/60m-sprint");
});

test("planlagte pågående økter OG en ekte åpen tildeling vises SAMMEN, ikke gjensidig utelukkende", async () => {
  ovrigeTesterData = {
    "player-a": {
      groups: [],
      planned: [
        { id: "session-xyz", testId: "vippetest", name: "Vippetest", axis: "fys", state: "ongoing", step: null, when: "i dag", href: "/portal/tren/tester/vippetest" },
      ],
    },
  };
  testDefinisjoner["60m-sprint"] = { name: "60m sprint", scoringRule: "Tid i sekunder", protocol: { scoring: "time_seconds", shots: [], inputFields: [] } };
  tildelinger = [{ id: "assignment-1", playerId: "player-a", testId: "60m-sprint", dueDate: null }];
  const ovrige = await hentTnSpillerOvrigeTester({ id: "coach-1", role: "COACH", name: "Coach" }, "player-a");
  assert.ok(ovrige);
  assert.equal(ovrige!.planlagt.length, 2);
  const statuser = ovrige!.planlagt.map((p) => p.status).sort();
  assert.deepEqual(statuser, ["PÅGÅR", "ÅPEN TILDELING"]);
});

test("øvrig testdetalj: generisk test viser EKTE protokollsteg/retning fra parseProtocol/parseForScoring, ikke bare scoringRule-gjetting", async () => {
  testDefinisjoner["60m-sprint"] = {
    name: "60m sprint", scoringRule: "Tid i sekunder, lavest vinner",
    protocol: { scoring: "time_seconds", shots: [{ nr: 1, label: "60m sprint", target: 60 }], inputFields: [{ key: "tid", label: "Tid", unit: "sek" }] },
  };
  resultater = [
    { id: "r1", userId: "player-a", testId: "60m-sprint", takenAt: new Date("2026-09-10"), score: 7.2, details: null, recordedById: null },
  ];
  const detalj = await hentTnSpillerOvrigTestDetalj({ id: "coach-1", role: "COACH", name: "Coach" }, "player-a", "60m-sprint");
  assert.ok(detalj);
  assert.equal(detalj!.tilgang.spillerId, "player-a");
  assert.equal(detalj!.lowerIsBetter, true); // time_seconds → lavere er bedre, fra kanonisk lavereErBedre
  assert.equal(detalj!.enhet, "sek");
  assert.equal(detalj!.steg.length, 1);
  assert.equal(detalj!.steg[0].label, "60m sprint");
  assert.equal(detalj!.historikk.length, 1);
});

test("øvrig testdetalj avvises for annen spiller enn oppgitt tilgang (samme rolleport som TN)", async () => {
  const detalj = await hentTnSpillerOvrigTestDetalj({ id: "player-b", role: "PLAYER", name: "Spiller B" }, "player-a", "60m-sprint");
  assert.equal(detalj, null);
});

// ---------------------------------------------------------------------
// Aktive planer og SG/TrackMan — MÅLSPILLERENS data, ikke coachens,
// og aldri egne coach-portal-lenker. Outsider/ugyldig rolle avvist.
// ---------------------------------------------------------------------

test("hentTnSpillerAktivePlaner viser MÅLSPILLERENS planer, ikke den innloggede coachens", async () => {
  planerPerBruker = {
    "player-a": [{ id: "p1", name: "Plan A", status: "ACTIVE", startDate: new Date("2026-01-01"), endDate: null }],
    "coach-1": [{ id: "px", name: "Coachens egen plan", status: "ACTIVE", startDate: new Date("2026-01-01"), endDate: null }],
  };
  const tilgang = await hentTnSpillerTilgang({ id: "coach-1", role: "COACH", name: "Coach" }, "player-a");
  assert.ok(tilgang);
  const planer = await hentTnSpillerAktivePlaner(tilgang!);
  assert.equal(planer.length, 1);
  assert.equal(planer[0].navn, "Plan A");
});

test("hentTnSpillerAnalyseHub kaller hentAnalyseHub med MÅLSPILLERENS id og eksporterer ALDRI dypere-lenker (coachens egen /portal)", async () => {
  analyseHubPerBruker["player-a"] = {
    dagLabel: "Mandag", vindu: null, lekkasje: null, lekkasjeLinje: null,
    sgAkser: [{ id: "OTT", etikett: "Tee", tekst: "+0,5 slag", verdi: 0.5 }],
    trackman: { sessionId: "s1", klubb: "7-jern", datoKort: "10.09", setning: "God dag", meta: "12 slag", kpis: "", variant: "default", punkter: [], ellipse: null },
    dypere: [{ href: "/portal/mal/runder", tittel: "Mine runder", meta: "" }],
  };
  // Coachens EGEN id har en helt annen (feil) sgAkser-verdi i kilden — hvis
  // funksjonen ved en feil kalte hentAnalyseHub med coachens id i stedet
  // for spillerens, ville testen fange det her.
  analyseHubPerBruker["coach-1"] = {
    dagLabel: "", vindu: null, lekkasje: null, lekkasjeLinje: null,
    sgAkser: [{ id: "OTT", etikett: "Tee", tekst: "FEIL — coachens egen", verdi: -9 }],
    trackman: null, dypere: [],
  };
  const tilgang = await hentTnSpillerTilgang({ id: "coach-1", role: "COACH", name: "Coach" }, "player-a");
  assert.ok(tilgang);
  const hub = await hentTnSpillerAnalyseHub(tilgang!);
  assert.equal(hub.sgAkser[0].tekst, "+0,5 slag");
  assert.equal(hub.trackman!.klubb, "7-jern");
  assert.equal(Object.prototype.hasOwnProperty.call(hub, "dypere"), false);
});

test("outsider kan ikke oppnå tilgang, og kan derfor aldri lese aktive planer eller SG/TrackMan for en annen spiller", async () => {
  const tilgang = await hentTnSpillerTilgang({ id: "utenfor-1", role: "PLAYER", name: "Utenforstående" }, "player-a");
  assert.equal(tilgang, null);
  // Uten et gyldig tilgang-objekt finnes det ingen vei til å kalle
  // hentTnSpillerAktivePlaner/hentTnSpillerAnalyseHub for player-a —
  // funksjonene krever nå et verifisert TnSpillerTilgang, ikke en rå id.
});

test("global PLAYER/GUEST-rolle kan ikke oppnå tilgang til en annen spillers planer/analysehub, selv med en gruppe-rad som sier COACH", async () => {
  const tilgang1 = await hentTnSpillerTilgang({ id: "spoofed-coach-gruppe", role: "PLAYER", name: "Spoofed" }, "player-a");
  const tilgang2 = await hentTnSpillerTilgang({ id: "spoofed-assistant-gruppe", role: "GUEST", name: "Spoofed" }, "player-a");
  assert.equal(tilgang1, null);
  assert.equal(tilgang2, null);
});

// ---------------------------------------------------------------------
// Gate-parsergren — verifisert med ekte perSlag/ScoringDetailsSchema-
// fixture (count_ok/hit_rate), ikke bare time_seconds.
// ---------------------------------------------------------------------

test("øvrig testdetalj: Gate-protokoll (count_ok) med ekte perSlag gir korrekt OK/BOM + miss_side-rutenett", async () => {
  testDefinisjoner["putt-gate"] = {
    name: "Putt Gate", scoringRule: "Antall OK av forsøk",
    protocol: {
      scoring: "count_ok",
      shots: [{ nr: 1, label: "Putt 1" }, { nr: 2, label: "Putt 2" }],
      inputFields: [{ key: "ok", label: "Gjennom gate", type: "checkbox" }],
    },
  };
  const detaljer = {
    version: 2, scoring: "count_ok", unit: null, retning: "hoyere_bedre",
    perSlag: [
      { nr: 1, verdier: { ok: true } },
      { nr: 2, verdier: { ok: false, miss_side: "V" } },
    ],
    aggregat: { ok: 1 },
  };
  resultater = [
    { id: "r1", userId: "player-a", testId: "putt-gate", takenAt: new Date("2026-09-10"), score: 1, details: detaljer, recordedById: null },
  ];
  const detalj = await hentTnSpillerOvrigTestDetalj({ id: "coach-1", role: "COACH", name: "Coach" }, "player-a", "putt-gate");
  assert.ok(detalj);
  assert.equal(detalj!.lowerIsBetter, false); // count_ok → høyere er bedre
  assert.equal(detalj!.sisteForsok.length, 2);
  assert.equal(detalj!.sisteForsok[0].ok, true);
  assert.equal(detalj!.sisteForsok[0].side, null);
  assert.equal(detalj!.sisteForsok[1].ok, false);
  assert.equal(detalj!.sisteForsok[1].side, "V");
});

test("øvrig testdetalj UTEN resultater, men med gyldig definisjon, viser protokoll/steg — ikke null/404", async () => {
  testDefinisjoner["ubrukt-test"] = {
    name: "Ubrukt test", scoringRule: "Tid i sekunder",
    protocol: { scoring: "time_seconds", shots: [{ nr: 1, label: "Løp" }], inputFields: [{ key: "tid", label: "Tid", unit: "sek" }] },
  };
  const detalj = await hentTnSpillerOvrigTestDetalj({ id: "coach-1", role: "COACH", name: "Coach" }, "player-a", "ubrukt-test");
  assert.ok(detalj);
  assert.equal(detalj!.historikk.length, 0);
  assert.equal(detalj!.steg.length, 1);
  assert.equal(detalj!.lowerIsBetter, true);
});
