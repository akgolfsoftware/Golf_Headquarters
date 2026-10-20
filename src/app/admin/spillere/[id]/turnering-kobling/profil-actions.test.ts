import { before, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";

// Kun fiktive personer.
const BARN = { id: "u-barn", name: "Ola Barnesen", dateOfBirth: new Date("2013-03-02T00:00:00Z") };
const TENÅRING = { id: "u-stor", name: "Pia Egenes", dateOfBirth: new Date("2009-04-12T00:00:00Z") };
let spiller: typeof BARN | null = BARN;
let harTilgang = true;
let kandidater: { person_id: number; name: string; birth_year: number | null }[] = [];
let kall: string[] = [];
let revisjon: { actorId: string; action: string }[] = [];

mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/auth/action-guards", { namedExports: { requireCoachActionUser: async () => ({ id: "coach-1", role: "COACH" }) } });
mock.module("@/lib/auth/coached", { namedExports: { assertCoachTilgangTilSpiller: async () => { if (!harTilgang) throw new Error("Du har ikke tilgang til denne spilleren."); } } });
mock.module("@/lib/audit", { namedExports: { audit: async (e: { actorId: string; action: string }) => { revisjon.push(e); } } });
mock.module("@/lib/prisma", { namedExports: { prisma: { user: { findFirst: async () => spiller } } } });
class ForMangeOppslag extends Error {}
class AlleredeKoblet extends Error {}
mock.module("@/lib/profil-kobling/data", { namedExports: {
  ForMangeOppslag, AlleredeKoblet,
  finnKandidater: async (id: string) => { kall.push(`finn:${id}`); return { method: "name_birth", candidates: kandidater.map((k) => ({ ...k, club: null, tournaments: 1, evidence: [] })) }; },
  beOmKobling: async (id: string, person: number) => { kall.push(`be:${id}:${person}`); return 5; },
  bekreftKobling: async (link: number, id: string) => { kall.push(`bekreft:${link}:${id}`); return true; },
  angreKobling: async (id: string) => { kall.push(`angre:${id}`); return true; },
} });

let a: typeof import("./profil-actions");
before(async () => { a = await import("./profil-actions"); });
beforeEach(() => {
  spiller = BARN; harTilgang = true; kall = []; revisjon = [];
  kandidater = [{ person_id: 11, name: "Ola Barnesen", birth_year: 2013 }, { person_id: 12, name: "Ola Barnesen", birth_year: 2011 }];
});

test("søket viser bare kandidater som stemmer med spillerens egen profil", async () => {
  const r = await a.sokKandidaterForSpiller({ spillerId: "u-barn" });
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.kandidater.map((k) => k.person_id), [11]);
  assert.deepEqual(kall, ["finn:u-barn"]);
});

test("treneren kobler en kandidat og aktøren i loggen er treneren", async () => {
  const r = await a.kobleSpillerUnder16({ spillerId: "u-barn", personId: 11 });
  assert.deepEqual(r, { ok: true });
  assert.deepEqual(kall, ["finn:u-barn", "be:u-barn:11", "bekreft:5:u-barn"]);
  assert.deepEqual(revisjon, [{ actorId: "coach-1", action: "profilkobling.bekreftet_av_trener", target: "person:11", metadata: { spillerId: "u-barn", metode: "name_birth" } }]);
});

test("en person-id utenfor treffene kobler ingen", async () => {
  const r = await a.kobleSpillerUnder16({ spillerId: "u-barn", personId: 12 });
  assert.equal(r.ok, false);
  assert.ok(!kall.some((k) => k.startsWith("be:")));
  assert.equal(revisjon.length, 0);
});

test("spillere fra 16 år kobles ikke av treneren", async () => {
  spiller = TENÅRING as unknown as typeof BARN;
  const r = await a.kobleSpillerUnder16({ spillerId: "u-stor", personId: 11 });
  assert.equal(r.ok, false);
  assert.equal(kall.length, 0);
});

test("uten skrivetilgang til spilleren skjer ingenting", async () => {
  harTilgang = false;
  await assert.rejects(() => a.kobleSpillerUnder16({ spillerId: "u-barn", personId: 11 }));
  await assert.rejects(() => a.sokKandidaterForSpiller({ spillerId: "u-barn" }));
  await assert.rejects(() => a.fjernKoblingForSpiller({ spillerId: "u-barn" }));
  assert.equal(kall.length, 0);
});

test("fjerning virker bare for spillere under 16 og logges", async () => {
  assert.deepEqual(await a.fjernKoblingForSpiller({ spillerId: "u-barn" }), { ok: true });
  assert.deepEqual(kall, ["angre:u-barn"]);
  spiller = TENÅRING as unknown as typeof BARN; kall = [];
  assert.equal((await a.fjernKoblingForSpiller({ spillerId: "u-stor" })).ok, false);
  assert.equal(kall.length, 0);
});

test("ugyldig input avvises", async () => {
  assert.deepEqual(await a.kobleSpillerUnder16({ spillerId: "", personId: -1 }), { ok: false, feil: "Ugyldig forespørsel." });
});
