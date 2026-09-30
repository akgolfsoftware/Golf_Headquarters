import assert from "node:assert/strict";
import { mock, test } from "node:test";

class Omdirigert extends Error {}

let innlogget: { id: string } | null = { id: "t1" };
let wangPort: "trener" | "elev" = "trener";
let tnKontekst: { erSpiller: boolean } = { erSpiller: false };
const opprettForslag = mock.fn(async (_k: unknown, _i: unknown) => ({ ok: true as const, data: { id: "f1" } }));
const opprettSamtale = mock.fn(async (_k: unknown, _i: unknown) => ({ ok: true as const, data: { id: "s1" } }));

mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => innlogget } });
mock.module("@/app/team-wang/_data/wang-trener-tilgang", {
  namedExports: {
    krevWangTrener: async () => {
      // Elev og foresatt sendes til innlogging; porten slipper dem aldri gjennom.
      if (wangPort === "elev") throw new Omdirigert("/team-wang/logg-inn?avvist=rolle");
      return { bruker: { id: "t1" }, gruppe: { id: "g1" } };
    },
  },
});
mock.module("@/lib/domain/tn-flate-tilgang", {
  namedExports: { krevTnTrenerflate: async () => ({ bruker: { id: "t1" }, kontekst: { gruppe: { id: "tng" }, ...tnKontekst } }) },
});
mock.module("@/lib/oppfolging/data", { namedExports: { opprettForslag, opprettSamtale } });

function skjema(felt: Record<string, string>) {
  const fd = new FormData();
  for (const [n, v] of Object.entries(felt)) fd.set(n, v);
  return fd;
}
const forslag = { elevId: "e1", type: "PLAN", tekst: "Flytt økt" };
const samtale = { elevId: "e1", dag: "2026-09-29", type: "OPPFOLGING", avtalt: "Følg opp" };

test.beforeEach(() => {
  innlogget = { id: "t1" };
  wangPort = "trener";
  tnKontekst = { erSpiller: false };
  opprettForslag.mock.resetCalls();
  opprettSamtale.mock.resetCalls();
});

test("WANG: trener kan opprette forslag og samtale, med flate WANG og gruppe fra porten", async () => {
  const { opprettWangForslag, opprettWangSamtale } = await import("@/app/team-wang/(trener)/elever/oppfolging-actions");
  assert.deepEqual(await opprettWangForslag(null, skjema(forslag)), { ok: true, melding: "Forslaget er sendt. Det står som Venter til eleven svarer." });
  assert.deepEqual(opprettForslag.mock.calls[0].arguments[0], { flate: "WANG", groupId: "g1", trenerId: "t1" });
  assert.equal((await opprettWangSamtale(null, skjema(samtale)))?.ok, true);
  assert.deepEqual(opprettSamtale.mock.calls[0].arguments[0], { flate: "WANG", groupId: "g1", trenerId: "t1" });
});

test("WANG: elev eller foresatt slipper aldri gjennom porten, og ingenting lagres", async () => {
  const { opprettWangForslag, opprettWangSamtale } = await import("@/app/team-wang/(trener)/elever/oppfolging-actions");
  wangPort = "elev";
  await assert.rejects(() => opprettWangForslag(null, skjema(forslag)), Omdirigert);
  await assert.rejects(() => opprettWangSamtale(null, skjema(samtale)), Omdirigert);
  assert.equal(opprettForslag.mock.callCount(), 0);
  assert.equal(opprettSamtale.mock.callCount(), 0);
});

test("WANG: utlogget bruker får beskjed og ingenting lagres", async () => {
  const { opprettWangForslag } = await import("@/app/team-wang/(trener)/elever/oppfolging-actions");
  innlogget = null;
  assert.equal((await opprettWangForslag(null, skjema(forslag)))?.ok, false);
  assert.equal(opprettForslag.mock.callCount(), 0);
});

test("TN: trener kan opprette, med flate TEAM_NORWAY", async () => {
  const { opprettTnForslag, opprettTnSamtale } = await import("@/app/team-norway/tn-oppfolging-actions");
  assert.equal((await opprettTnForslag(null, skjema(forslag)))?.ok, true);
  assert.deepEqual(opprettForslag.mock.calls[0].arguments[0], { flate: "TEAM_NORWAY", groupId: "tng", trenerId: "t1" });
  assert.equal((await opprettTnSamtale(null, skjema(samtale)))?.ok, true);
});

test("TN: spiller nektes selv om noen får kontekst med erSpiller", async () => {
  const { opprettTnForslag, opprettTnSamtale } = await import("@/app/team-norway/tn-oppfolging-actions");
  tnKontekst = { erSpiller: true };
  assert.equal((await opprettTnForslag(null, skjema(forslag)))?.ok, false);
  assert.equal((await opprettTnSamtale(null, skjema(samtale)))?.ok, false);
  assert.equal(opprettForslag.mock.callCount(), 0);
  assert.equal(opprettSamtale.mock.callCount(), 0);
});
