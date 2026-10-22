import { before, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Kun fiktive personer. Alle leserne logger hvilken spiller de ble bedt om å lese.
let lest: string[] = [];
const logg = (id: string) => { lest.push(id); };
const profil = { navn: "Jørn Johnsen", erTnMedlem: true, fodselsdato: null, klubb: null, skole: null, hcp: null, turneringer: [], aaret: { runder: 0, bruttoSnitt: null } };

mock.module("@/lib/domain/tn-arbeidsflate", { namedExports: {
  hentTnSpillerProfil: async (_b: unknown, id: string) => { logg(id); return profil; },
  hentTnSpillerTester: async (_b: unknown, id: string) => { logg(id); return { tilgang: {}, rader: [] }; },
  hentTnSpillerTrening: async (_b: unknown, id: string) => { logg(id); return { trening: {}, kommende: [], sistGjort: [] }; },
  hentTnSpillerAktivePlaner: async (_b: unknown, id: string) => { logg(id); return []; },
  hentTnSpillerIup: async (_b: unknown, id: string) => { logg(id); return []; },
  medTnSpillerData: async (_b: unknown, id: string, les: (tx: unknown) => Promise<unknown>) => { logg(id); return les({}); },
} });
mock.module("@/lib/domain/tn-iup-oversikt", { namedExports: {
  hentTnIupDelt: async (_b: unknown, id: string) => { logg(id); return null; },
  hentTnIupRanking: async (_b: unknown, id: string) => { logg(id); return { wagr: null, historikk: [] }; },
} });
mock.module("@/lib/domain/tn-evaluering", { namedExports: { hentTnEvalueringGrunnlag: async (_tx: unknown, id: string) => { logg(id); return { planer: [], aktivPlan: null, nesteTiltak: null, tester: [] }; } } });
mock.module("@/lib/domain/tn-teknisk-plan", { namedExports: { hentTnTekniskPlaner: async (_tx: unknown, id: string) => { logg(id); return []; } } });
mock.module("@/lib/domain/tn-post", { namedExports: { hentSpillerpostTidslinje: async (id: string, leser: string) => { logg(id); logg(leser); return []; } } });
mock.module("@/lib/turneringsplan/data", { namedExports: { byggPlanvisning: async (_tx: unknown, id: string) => { logg(id); return null; } } });

let m: typeof import("./tn-innsyn-data");
let faner: typeof import("./tn-innsyn-faner");
before(async () => { m = await import("./tn-innsyn-data"); faner = await import("./tn-innsyn-faner"); });
beforeEach(() => { lest = []; });

const meg = { id: "spiller-1", role: "PLAYER" as const, name: "Jørn Johnsen" };

test("alle åtte fanene leser bare den innloggede spilleren", async () => {
  for (const f of faner.TN_INNSYN_FANER) await m.hentTnInnsyn(meg, f.id);
  assert.ok(lest.length >= 8);
  assert.deepEqual([...new Set(lest)], ["spiller-1"]);
});

test("fanene er de samme åtte som treneren har, i samme rekkefølge", () => {
  assert.deepEqual(faner.TN_INNSYN_FANER.map((f) => f.navn), ["Oversikt", "Turneringsplan", "Ranking", "Turneringer", "Trening", "Tester", "Teknisk plan", "Fireukerssjekk"]);
  assert.equal(faner.tilTnInnsynFane("spiller-2"), "oversikt");
  assert.equal(faner.tilTnInnsynFane("tester"), "tester");
});

test("siden tar ingen spiller-id fra adressen, er bare for Team Norway-spillere og har ingen knapper", () => {
  const side = readFileSync(new URL("../../app/portal/meg/deling/team-norway/page.tsx", import.meta.url), "utf8");
  assert.match(side, /hentTnInnsyn\(bruker, fane\)/);
  assert.match(side, /hentTnSpillergrupper\(bruker\.id\)[\s\S]*notFound\(\)/);
  assert.doesNotMatch(side, /\bparams\b|spillerId/);
  const visning = readFileSync(new URL("../../components/portal/precision/TnInnsynSpiller.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(visning, /<button|<form|action=|\/team-norway\//);
});
