import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let profileRows: unknown[] = [];
let roundRows: unknown[] = [];
let profileError: unknown;
let roundError: unknown;
let taker: unknown[] = [];
let ownRounds: unknown[] = [];
let ownDgId: number | null = null;
let lastRoundParameters: unknown[] = [];
const imported = { aar: [], kilde: "syntetisk" };
mock.module("@/lib/portal/turneringshistorikk-data", { namedExports: {
  hentTurneringshistorikk: async () => imported,
} });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  $queryRaw: async (query: TemplateStringsArray, ...parameters: unknown[]) => {
    if (query.join("").includes("dg_skill_ratings")) {
      if (profileError) throw profileError;
      return profileRows;
    }
    lastRoundParameters = parameters;
    if (roundError) throw roundError;
    return roundRows;
  },
  user: { findUnique: async () => ({ publicPlayer: { dataGolfId: ownDgId } }) },
  round: { findMany: async ({ where }: { where: { userId: string } }) => {
    assert.equal(where.userId, "syntetisk-spiller");
    return ownRounds;
  } },
  datagolfTak: { findMany: async () => taker },
} } });
let hent: typeof import("./player-tool-data").hentSpillerverktoy;
let hentRunder: typeof import("./player-tool-data").hentProffRunder;
before(async () => {
  const m = await import("./player-tool-data");
  hent = m.hentSpillerverktoy; hentRunder = m.hentProffRunder;
});
beforeEach(() => {
  profileRows = []; roundRows = []; taker = []; ownRounds = [];
  profileError = undefined; roundError = undefined; ownDgId = null; lastRoundParameters = [];
});
const profile = { dgId: 7, name: "Proff A", country: null, asOf: new Date("2026-09-01"),
  total: 1.2, ott: null, app: 0.8, arg: null, putt: null, distance: null, accuracy: null };
const round = { eventId: "syntetisk", eventName: "Testturnering", date: new Date("2026-09-01"),
  tour: "test", round: 1, courseId: 1, score: 70, toPar: -2, position: null, madeCut: null,
  total: null, ott: null, app: null, arg: null, putt: null, distance: null, accuracy: null,
  gir: null, importedAt: new Date("2026-09-02") };
const missing = (code: string) => ({ code: "P2010", meta: { driverAdapterError: { cause: { originalCode: code } } } });

test("manglende schema og tabell klassifiseres fra nestet Prisma-feil, uten rå feiltekst", async () => {
  for (const code of ["3F000", "42P01"]) {
    profileError = { ...missing(code), message: "privat forbindelsesinformasjon" };
    const d = await hent("syntetisk-spiller", {});
    assert.equal(d.kildestatus.profiler, "ikke-konfigurert");
    assert.equal(d.kildefeil, false);
    assert.equal(d.proff, null);
    assert.equal(JSON.stringify(d).includes("privat forbindelsesinformasjon"), false);
  }
});
test("nettverks-, rettighets- og kolonnefeil er lesefeil, ikke tom eller manglende referanse", async () => {
  for (const error of [new Error("connection reset"), missing("42501"), missing("42703"), { code: "P1001" }]) {
    profileError = error;
    const d = await hent("syntetisk-spiller", {});
    assert.equal(d.kildestatus.profiler, "feil");
    assert.equal(d.kildefeil, true);
  }
  profileError = undefined; profileRows = [profile];
  const recovered = await hent("syntetisk-spiller", {});
  assert.equal(recovered.kildestatus.profiler, "tilgjengelig");
  assert.equal(recovered.kildefeil, false);
});
test("tilgjengelig datasett uten treff er normal tom historikk", async () => {
  let d = await hent("syntetisk-spiller", {});
  assert.equal(d.kildestatus.profiler, "tom");
  assert.equal(d.kildestatus.proffRunder, null);
  profileRows = [profile];
  d = await hent("syntetisk-spiller", {});
  assert.equal(d.kildestatus.profiler, "tilgjengelig");
  assert.equal(d.kildestatus.proffRunder, "tom");
  assert.equal(d.kildefeil, false);
});
test("faktiske syntetiske runder beholder brutto score og manglende SG", async () => {
  profileRows = [profile]; roundRows = [round];
  const d = await hent("syntetisk-spiller", { pro: "7", runder: "12" });
  assert.equal(d.kildestatus.proffRunder, "tilgjengelig");
  assert.equal(d.proffRunder[0].score, 70);
  assert.equal(d.proffRunder[0].total, null);
  assert.deepEqual(lastRoundParameters, [7, 12]);
});
test("delvis datasett skiller manglende rundekilde fra fungerende ferdighetsprofil", async () => {
  profileRows = [profile]; roundError = missing("42P01");
  let d = await hent("syntetisk-spiller", {});
  assert.equal(d.kildestatus.profiler, "tilgjengelig");
  assert.equal(d.kildestatus.proffRunder, "ikke-konfigurert");
  assert.equal(d.proff?.total, 1.2);
  roundError = new Error("timeout");
  d = await hent("syntetisk-spiller", {});
  assert.equal(d.kildestatus.proffRunder, "feil");
  assert.equal(d.kildefeil, true);
});
test("manglende referansedatasett beholder tak, egne 18-hullsresultater og turneringshistorikk", async () => {
  profileError = missing("42P01"); roundError = missing("42P01");
  taker = [{ dgPlayerId: 7, name: "Proff A", country: null, asOf: new Date("2026-09-01"), bands: [] }];
  ownRounds = [{ playedAt: new Date("2026-09-01"), score: 72,
    holeScores: Array.from({ length: 18 }, (_, i) => ({ holeNumber: i + 1, par: 4, strokes: 4, fairway: true, gir: null })) }];
  const d = await hent("syntetisk-spiller", {});
  assert.equal(d.brukerTakReserve, true);
  assert.equal(d.proff?.dgId, 7);
  assert.equal(d.proff?.total, null);
  assert.equal(d.approach?.asOf, "2026-09-01T00:00:00.000Z");
  assert.equal(d.egne.score.value, 72);
  assert.equal(d.egne.gir.value, null);
  assert.equal(d.turneringshistorikk, imported);
});
test("ugyldige kilderader blir ikke friskmeldt som tomt datasett", async () => {
  profileRows = [{ dgId: "ugyldig" }];
  let d = await hent("syntetisk-spiller", {});
  assert.equal(d.kildestatus.profiler, "feil");
  profileRows = [profile]; roundRows = [{ score: "ugyldig" }];
  d = await hent("syntetisk-spiller", {});
  assert.equal(d.kildestatus.proffRunder, "feil");
});
test("rundegrenser og ugyldige ID-er gir ingen ubegrenset lesing", async () => {
  assert.deepEqual(await hentRunder(-1, 1000), []);
  assert.deepEqual(lastRoundParameters, []);
  await hentRunder(7, 1000);
  assert.deepEqual(lastRoundParameters, [7, 50]);
});
