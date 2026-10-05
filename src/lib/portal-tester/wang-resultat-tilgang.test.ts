/**
 * D-04/D-13 (05.10.2026): Team Norway ser WANG-elevers tester bare med
 * uttrykkelig samtykke (omfang TEST_RESULTATER mot Team Norway-gruppen).
 * Under 16 år kreves forelderens godkjenning. Syntetiske data.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rad = { userId: string; scope: string; mottakerGruppeId: string; gitt: boolean; gittAvRolle: string; gittAvUserId: string; createdAt: Date };

const TN = "tn-group";
const wangA = { id: "wang-a", name: "WANG Skole A", program: "WANG_TOPPIDRETT", arkivertAt: null, members: [{ userId: "player-a", user: { name: "Spiller A" } }, { userId: "player-a", user: { name: "Spiller A" } }] };
const wangB = { id: "wang-b", name: "WANG Skole B", program: "WANG_UNG", arkivertAt: null, members: [{ userId: "player-b", user: { name: "Spiller B" } }] };
const grupper = [wangA, wangB, { id: "ak-group", name: "AK Academy", program: "AK_ACADEMY", arkivertAt: null, members: [{ userId: "ak-player", user: { name: "AK Player" } }] }];
const brukere: Record<string, { requiresGuardianConsent: boolean; dateOfBirth: Date | null }> = {
  "player-a": { requiresGuardianConsent: false, dateOfBirth: new Date("2008-01-01") },
  "player-b": { requiresGuardianConsent: true, dateOfBirth: new Date("2012-01-01") },
};
const wangElever = new Set(["player-a", "player-b"]);
let medlemskap: { groupId: string }[] = [];
let tnMedlem = false;
let rader: Rad[] = [];
let klokke = 0;
const nå = () => new Date(Date.UTC(2026, 9, 5) + ++klokke * 1000);

mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  group: {
    findMany: async ({ where }: { where: { id?: { in: string[] }; program: { in: string[] }; arkivertAt: null } }) => {
      assert.deepEqual(where.program.in, ["WANG_UNG", "WANG_TOPPIDRETT"]);
      return grupper.filter((g) => where.program.in.includes(g.program) && g.arkivertAt === null && (!where.id || where.id.in.includes(g.id)));
    },
    findUnique: async () => ({ id: TN }),
  },
  groupMember: {
    findMany: async ({ where }: { where: { role: { in: string[] }; endedAt: null } }) => {
      assert.deepEqual(where.role.in, ["COACH", "ASSISTANT"]);
      return medlemskap;
    },
    findFirst: async ({ where }: { where: { userId?: string; groupId?: string; user?: { role?: string } } }) => {
      if (where.user?.role === "PLAYER") return wangElever.has(where.userId ?? "") ? { id: "m" } : null;
      return tnMedlem && where.groupId === TN ? { id: "tn-coach-membership" } : null;
    },
  },
  user: {
    findUnique: async ({ where }: { where: { id: string } }) => brukere[where.id] ?? null,
    findMany: async ({ where }: { where: { id: { in: string[] } } }) => where.id.in.filter((id) => brukere[id]).map((id) => ({ id, ...brukere[id] })),
  },
  delingsSamtykke: {
    findMany: async ({ where }: { where: { userId: string | { in: string[] }; scope: string; mottakerGruppeId: string } }) =>
      rader.filter((r) => (typeof where.userId === "string" ? r.userId === where.userId : where.userId.in.includes(r.userId))
        && r.scope === where.scope && r.mottakerGruppeId === where.mottakerGruppeId),
    create: async ({ data }: { data: Omit<Rad, "createdAt"> }) => { rader.push({ ...data, createdAt: nå() }); return {}; },
  },
} } });

const tilgang = import("./wang-resultat-tilgang");
const tnCoach = { id: "tn-coach", role: "COACH" as const };
const synlige = async () => (await (await tilgang).hentWangTestresultatSkolerForTeamNorway(tnCoach)).flatMap((s) => s.playerIds);

test.beforeEach(() => {
  rader = [];
  tnMedlem = true;
  medlemskap = [];
});

test("1: Team Norway ser ingen WANG-elev uten samtykke (liste, søk og gruppeanalyse bruker samme kilde)", async () => {
  assert.deepEqual(await synlige(), []);
  const { hentWangTnTestdeling } = await tilgang;
  assert.equal((await hentWangTnTestdeling("player-a"))?.status, "IKKE_SVART");
  assert.equal((await hentWangTnTestdeling("player-b"))?.status, "IKKE_SVART");
});

test("2: etter samtykke ser Team Norway bare testene til den eleven", async () => {
  const { registrerWangTnTestsvar, hentWangTestresultatSkolerForTeamNorway } = await tilgang;
  const svar = await registrerWangTnTestsvar({ userId: "player-a", gitt: true, gittAvUserId: "player-a", gittAvRolle: "SELV" });
  assert.equal(svar.status, "DELT");
  const skoler = await hentWangTestresultatSkolerForTeamNorway(tnCoach);
  assert.deepEqual(skoler.map(({ groupId, playerIds }) => ({ groupId, playerIds })), [
    { groupId: "wang-a", playerIds: ["player-a"] },
    { groupId: "wang-b", playerIds: [] },
  ]);
  // Bare omfanget «tester» er lagret, aldri statistikk eller komplett profil.
  assert.deepEqual([...new Set(rader.map((r) => r.scope))], ["TEST_RESULTATER"]);
  assert.ok(rader.every((r) => r.mottakerGruppeId === TN));
});

test("3: trukket samtykke fjerner testene med en gang", async () => {
  const { registrerWangTnTestsvar } = await tilgang;
  await registrerWangTnTestsvar({ userId: "player-a", gitt: true, gittAvUserId: "player-a", gittAvRolle: "SELV" });
  assert.deepEqual(await synlige(), ["player-a"]);
  const svar = await registrerWangTnTestsvar({ userId: "player-a", gitt: false, gittAvUserId: "player-a", gittAvRolle: "SELV" });
  assert.equal(svar.status, "IKKE_DELT");
  assert.deepEqual(await synlige(), []);
});

test("«Ikke nå» gir ingen tilgang og stopper forespørselen", async () => {
  const { registrerWangTnTestsvar } = await tilgang;
  const svar = await registrerWangTnTestsvar({ userId: "player-a", gitt: false, gittAvUserId: "player-a", gittAvRolle: "SELV" });
  assert.equal(svar.status, "IKKE_DELT");
  assert.deepEqual(await synlige(), []);
});

test("4: under 16 år venter på forelder, og har ingen tilgang før forelderen godkjenner", async () => {
  const { registrerWangTnTestsvar } = await tilgang;
  const elev = await registrerWangTnTestsvar({ userId: "player-b", gitt: true, gittAvUserId: "player-b", gittAvRolle: "SELV" });
  assert.equal(elev.status, "VENTER_PA_FORELDER");
  assert.deepEqual(await synlige(), []);
  const forelder = await registrerWangTnTestsvar({ userId: "player-b", gitt: true, gittAvUserId: "parent-b", gittAvRolle: "FORESATT" });
  assert.equal(forelder.status, "DELT");
  assert.deepEqual(await synlige(), ["player-b"]);
  // Eleven kan selv trekke delingen, og det virker med en gang (art. 7-3).
  await registrerWangTnTestsvar({ userId: "player-b", gitt: false, gittAvUserId: "player-b", gittAvRolle: "SELV" });
  assert.deepEqual(await synlige(), []);
});

test("5: samtykke til WANG gir ikke Team Norway tilgang", async () => {
  rader.push({ userId: "player-a", scope: "TEST_RESULTATER", mottakerGruppeId: "wang-a", gitt: true, gittAvRolle: "SELV", gittAvUserId: "player-a", createdAt: nå() });
  assert.deepEqual(await synlige(), []);
});

test("forespørselen gjelder bare aktive WANG-elever", async () => {
  const { hentWangTnTestdeling, registrerWangTnTestsvar } = await tilgang;
  assert.equal(await hentWangTnTestdeling("ak-player"), null);
  await assert.rejects(registrerWangTnTestsvar({ userId: "ak-player", gitt: true, gittAvUserId: "ak-player", gittAvRolle: "SELV" }));
  assert.equal(rader.length, 0);
});

test("trener uten aktivt Team Norway-medlemskap og spillerrolle får ingenting", async () => {
  const { registrerWangTnTestsvar, hentWangTestresultatSkolerForTeamNorway } = await tilgang;
  await registrerWangTnTestsvar({ userId: "player-a", gitt: true, gittAvUserId: "player-a", gittAvRolle: "SELV" });
  tnMedlem = false;
  assert.deepEqual(await hentWangTestresultatSkolerForTeamNorway(tnCoach), []);
  tnMedlem = true;
  assert.deepEqual(await hentWangTestresultatSkolerForTeamNorway({ id: "tn-player", role: "PLAYER" }), []);
});

test("administrator på Team Norway-flaten ser også bare samtykkede elever", async () => {
  const { registrerWangTnTestsvar, hentWangTestresultatSkolerForTeamNorway } = await tilgang;
  assert.deepEqual((await hentWangTestresultatSkolerForTeamNorway({ id: "admin", role: "ADMIN" })).flatMap((s) => s.playerIds), []);
  await registrerWangTnTestsvar({ userId: "player-a", gitt: true, gittAvUserId: "player-a", gittAvRolle: "SELV" });
  assert.deepEqual((await hentWangTestresultatSkolerForTeamNorway({ id: "admin", role: "ADMIN" })).flatMap((s) => s.playerIds), ["player-a"]);
});

test("WANG-trener ser fortsatt egne skolegrupper (uendret)", async () => {
  medlemskap = [{ groupId: "wang-a" }];
  const { hentWangTestresultatSkolerForTrener } = await tilgang;
  const scopes = await hentWangTestresultatSkolerForTrener({ id: "coach-a", role: "COACH" });
  assert.deepEqual(scopes, [{ groupId: "wang-a", schoolName: "WANG Skole A", playerIds: ["player-a"], players: [{ id: "player-a", name: "Spiller A" }] }]);
  medlemskap = [];
  assert.deepEqual(await hentWangTestresultatSkolerForTrener({ id: "coach-outsider", role: "COACH" }), []);
});
