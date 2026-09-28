import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Bruker = { id: string; role: "ADMIN" | "COACH" | "PLAYER"; email: string };
type Medlemskap = { role: string; group: { id: string; name: string; slug: string; hovedcoachId: string | null } };

let bruker: Bruker | null = null;
let medlemskap: Medlemskap[] = [];

const EKTE = { id: "wang-ekte", name: "WANG Toppidrett Fredrikstad", slug: "wang-toppidrett", hovedcoachId: "anders" };
const DEMO = { id: "wang-demo", name: "Demo · WANG", slug: "wang-toppidrett-demo", hovedcoachId: "demo-sjef" };

class Omdirigert extends Error {
  constructor(readonly til: string) {
    super(`redirect:${til}`);
  }
}
class IkkeFunnet extends Error {}

mock.module("next/navigation", {
  namedExports: {
    redirect: (til: string) => {
      throw new Omdirigert(til);
    },
    notFound: () => {
      throw new IkkeFunnet("404");
    },
  },
});

mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUserRaw: async () => bruker },
});

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      groupMember: { findMany: async () => medlemskap },
      group: { findUnique: async () => EKTE },
    },
  },
});

async function port() {
  // Ny import per test: `cache()` utenfor en forespørsel husker ikke mellom kall,
  // men modulen lastes bare én gang.
  return import("./wang-trener-tilgang");
}

async function omdirigering(fn: () => Promise<unknown>): Promise<string> {
  try {
    await fn();
  } catch (e) {
    if (e instanceof Omdirigert) return e.til;
    throw e;
  }
  return "(ingen)";
}

test.beforeEach(() => {
  bruker = null;
  medlemskap = [];
});

test("uten innlogging sendes brukeren til WANG-innloggingen", async () => {
  const { krevWangTrener } = await port();
  assert.equal(await omdirigering(krevWangTrener), "/team-wang/logg-inn");
});

test("trener med @wang.no og trenermedlemskap slipper inn som Trener", async () => {
  const { krevWangTrener } = await port();
  bruker = { id: "t1", role: "COACH", email: "Trener@Wang.no" };
  medlemskap = [{ role: "COACH", group: EKTE }];
  const k = await krevWangTrener();
  assert.equal(k.rolle, "TRENER");
  assert.equal(k.gruppe.id, "wang-ekte");
  assert.equal(k.erDemo, false);
});

test("feil domene avvises selv med trenermedlemskap", async () => {
  const { krevWangTrener } = await port();
  bruker = { id: "t1", role: "COACH", email: "trener@gmail.com" };
  medlemskap = [{ role: "COACH", group: EKTE }];
  assert.equal(await omdirigering(krevWangTrener), "/team-wang/logg-inn?avvist=domene");
});

test("lignende domene avvises", async () => {
  const { krevWangTrener } = await port();
  bruker = { id: "t1", role: "COACH", email: "trener@xwang.no" };
  medlemskap = [{ role: "COACH", group: EKTE }];
  assert.equal(await omdirigering(krevWangTrener), "/team-wang/logg-inn?avvist=domene");
});

test("@wang.no uten trenermedlemskap avvises med rolle", async () => {
  const { krevWangTrener } = await port();
  bruker = { id: "e1", role: "PLAYER", email: "elev@wang.no" };
  assert.equal(await omdirigering(krevWangTrener), "/team-wang/logg-inn?avvist=rolle");
});

test("ADMIN slipper inn uten wang.no og uten medlemskap, som Sportssjef i den ekte gruppen", async () => {
  const { krevWangTrener } = await port();
  bruker = { id: "anders", role: "ADMIN", email: "anders@gmail.com" };
  const k = await krevWangTrener();
  assert.equal(k.rolle, "SPORTSSJEF");
  assert.equal(k.gruppe.slug, "wang-toppidrett");
});

test("demotreneren får demogruppen og er Sportssjef der som hovedcoach", async () => {
  const { krevWangTrener } = await port();
  bruker = { id: "demo-sjef", role: "COACH", email: "demo.sportssjef@wang.no" };
  medlemskap = [{ role: "COACH", group: DEMO }];
  const k = await krevWangTrener();
  assert.equal(k.gruppe.id, "wang-demo");
  assert.equal(k.erDemo, true);
  assert.equal(k.rolle, "SPORTSSJEF");
});

test("den ekte gruppen vinner når en trener står i begge", async () => {
  const { krevWangTrener } = await port();
  bruker = { id: "t2", role: "COACH", email: "t2@wang.no" };
  medlemskap = [{ role: "ASSISTANT", group: DEMO }, { role: "COACH", group: EKTE }];
  assert.equal((await krevWangTrener()).gruppe.id, "wang-ekte");
});

test("Administrasjon: trener får 404, sportssjef slipper inn", async () => {
  const { krevWangSportssjef } = await port();
  bruker = { id: "t1", role: "COACH", email: "t1@wang.no" };
  medlemskap = [{ role: "COACH", group: EKTE }];
  await assert.rejects(krevWangSportssjef(), IkkeFunnet);
  bruker = { id: "anders", role: "COACH", email: "anders@wang.no" };
  assert.equal((await krevWangSportssjef()).rolle, "SPORTSSJEF");
});

test("wangRolleFor: bare ADMIN og hovedcoach er Sportssjef", async () => {
  const { wangRolleFor } = await port();
  assert.equal(wangRolleFor({ plattformRolle: "ADMIN", brukerId: "a", hovedcoachId: null }), "SPORTSSJEF");
  assert.equal(wangRolleFor({ plattformRolle: "COACH", brukerId: "a", hovedcoachId: "a" }), "SPORTSSJEF");
  assert.equal(wangRolleFor({ plattformRolle: "COACH", brukerId: "a", hovedcoachId: "b" }), "TRENER");
  assert.equal(wangRolleFor({ plattformRolle: "COACH", brukerId: "a", hovedcoachId: null }), "TRENER");
});
