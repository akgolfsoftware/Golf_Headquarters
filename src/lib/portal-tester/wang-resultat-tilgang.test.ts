import assert from "node:assert/strict";
import { mock, test } from "node:test";

const wangA = { id: "wang-a", name: "WANG Skole A", program: "WANG_TOPPIDRETT", arkivertAt: null, members: [{ userId: "player-a", user: { name: "Spiller A" } }, { userId: "player-a", user: { name: "Spiller A" } }] };
const wangB = { id: "wang-b", name: "WANG Skole B", program: "WANG_UNG", arkivertAt: null, members: [{ userId: "player-b", user: { name: "Spiller B" } }] };
const grupper = [wangA, wangB, { id: "ak-group", name: "AK Academy", program: "AK_ACADEMY", arkivertAt: null, members: [{ userId: "ak-player", user: { name: "AK Player" } }] }];
let medlemskap: { groupId: string }[] = [];
let tnMedlem = false;

mock.module("@/lib/prisma", { namedExports: { prisma: {
  group: {
    findMany: async ({ where }: { where: { id?: { in: string[] }; program: { in: string[] }; arkivertAt: null } }) => {
      assert.deepEqual(where.program.in, ["WANG_UNG", "WANG_TOPPIDRETT"]);
      assert.equal(where.arkivertAt, null);
      return grupper.filter((g) => where.program.in.includes(g.program) && g.arkivertAt === null && (!where.id || where.id.in.includes(g.id)));
    },
    findUnique: async () => ({ id: "tn-group" }),
  },
  groupMember: {
    findMany: async ({ where }: { where: { role: { in: string[] }; endedAt: null; group: { program: { in: string[] }; arkivertAt: null } } }) => {
      assert.deepEqual(where.role.in, ["COACH", "ASSISTANT"]);
      assert.equal(where.endedAt, null);
      assert.deepEqual(where.group.program.in, ["WANG_UNG", "WANG_TOPPIDRETT"]);
      return medlemskap;
    },
    findFirst: async () => tnMedlem ? { id: "tn-coach-membership" } : null,
  },
} } });

const tilgang = import("./wang-resultat-tilgang");

test("WANG-trener får bare aktive resultatskoler der treneren er medlem", async () => {
  medlemskap = [{ groupId: "wang-a" }];
  const { hentWangTestresultatSkolerForTrener } = await tilgang;
  const scopes = await hentWangTestresultatSkolerForTrener({ id: "coach-a", role: "COACH" });
  assert.deepEqual(scopes, [{ groupId: "wang-a", schoolName: "WANG Skole A", playerIds: ["player-a"], players: [{ id: "player-a", name: "Spiller A" }] }]);
});

test("Team Norway-trener får alle aktive WANG-resultatskoler, uten andre grupper", async () => {
  tnMedlem = true;
  const { hentWangTestresultatSkolerForTeamNorway } = await tilgang;
  const scopes = await hentWangTestresultatSkolerForTeamNorway({ id: "tn-coach", role: "COACH" });
  assert.deepEqual(scopes.map(({ groupId, playerIds }) => ({ groupId, playerIds })), [
    { groupId: "wang-a", playerIds: ["player-a"] },
    { groupId: "wang-b", playerIds: ["player-b"] },
  ]);
});

test("spillerrolle i Team Norway-gruppen åpner ikke skoleoversikten", async () => {
  tnMedlem = true;
  const { hentWangTestresultatSkolerForTeamNorway } = await tilgang;
  assert.deepEqual(await hentWangTestresultatSkolerForTeamNorway({ id: "tn-player", role: "PLAYER" }), []);
});

test("WANG-trenerrolle uten aktiv WANG-medlemskap gir ingen skoletilgang", async () => {
  medlemskap = [];
  const { hentWangTestresultatSkolerForTrener } = await tilgang;
  assert.deepEqual(await hentWangTestresultatSkolerForTrener({ id: "coach-outsider", role: "COACH" }), []);
});

test("admin kan se alle registrerte WANG-skolegrupper", async () => {
  const { hentWangTestresultatSkolerForTeamNorway, hentWangTestresultatSkolerForTrener } = await tilgang;
  assert.equal((await hentWangTestresultatSkolerForTeamNorway({ id: "admin", role: "ADMIN" })).length, 2);
  assert.equal((await hentWangTestresultatSkolerForTrener({ id: "admin", role: "ADMIN" })).length, 2);
});
