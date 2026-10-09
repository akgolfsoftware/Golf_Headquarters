/**
 * S2 / D-55 (07.10.2026): WANG-testresultater deles med WANG-skolen og Team
 * Norway bare etter elevens engangssamtykke mot WANG-gruppa (forelder under
 * 16). D-69: trekk virker med en gang. Ingen rolle har en sti forbi
 * samtykket. Syntetiske data.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rad = { userId: string; scope: string; mottakerGruppeId: string; gitt: boolean; gittAvRolle: string; gittAvUserId: string; createdAt: Date };
type Bruker = { name: string; requiresGuardianConsent: boolean; dateOfBirth: Date | null };

const TN = "tn-group";
const brukere: Record<string, Bruker> = {
  "player-a": { name: "Spiller A", requiresGuardianConsent: false, dateOfBirth: new Date("2008-01-01T00:00:00Z") },
  "player-b": { name: "Spiller B", requiresGuardianConsent: true, dateOfBirth: new Date("2012-01-01T00:00:00Z") },
  "ak-player": { name: "AK Player", requiresGuardianConsent: false, dateOfBirth: null },
};
const grupper = [
  { id: "wang-a", name: "WANG Skole A", program: "WANG_TOPPIDRETT", spillere: ["player-a", "player-a"] },
  { id: "wang-b", name: "WANG Skole B", program: "WANG_UNG", spillere: ["player-b"] },
  { id: "ak-group", name: "AK Academy", program: "AK_ACADEMY", spillere: ["ak-player"] },
];
let avsluttet = new Set<string>(); // "gruppeId:userId" med endedAt satt
let trenerIWang: string[] = [];
let tnMedlem = false;
let rader: Rad[] = [];
let klokke = 0;
const nå = () => new Date(Date.UTC(2026, 9, 8) + ++klokke * 1000);
const aktiv = (gruppeId: string, userId: string) => !avsluttet.has(`${gruppeId}:${userId}`);
const iListe = (verdi: string, filter: string | { in: string[] }) => (typeof filter === "string" ? verdi === filter : filter.in.includes(verdi));

mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  group: {
    findMany: async ({ where }: { where: { id?: { in: string[] }; program: { in: string[] } } }) =>
      grupper
        .filter((g) => where.program.in.includes(g.program) && (!where.id || where.id.in.includes(g.id)))
        .map((g) => ({
          id: g.id,
          name: g.name,
          members: g.spillere.filter((id) => aktiv(g.id, id)).map((userId) => ({ userId, user: brukere[userId] })),
        })),
    findUnique: async () => ({ id: TN }),
  },
  groupMember: {
    findMany: async ({ where }: { where: { userId?: string; role: string | { in: string[] }; group: { program: { in: string[] } } } }) => {
      if (where.role === "PLAYER") {
        return grupper
          .filter((g) => where.group.program.in.includes(g.program) && g.spillere.includes(where.userId ?? "") && aktiv(g.id, where.userId ?? ""))
          .map((g) => ({ group: { id: g.id, name: g.name } }));
      }
      return trenerIWang.map((groupId) => ({ groupId }));
    },
    findFirst: async ({ where }: { where: { groupId?: string } }) => (tnMedlem && where.groupId === TN ? { id: "tn-coach-membership" } : null),
  },
  user: {
    findUnique: async ({ where }: { where: { id: string } }) => brukere[where.id] ?? null,
  },
  delingsSamtykke: {
    findMany: async ({ where }: { where: { userId: string | { in: string[] }; scope: string; mottakerGruppeId: string | { in: string[] } } }) =>
      rader.filter((r) => iListe(r.userId, where.userId) && r.scope === where.scope && iListe(r.mottakerGruppeId, where.mottakerGruppeId)),
    create: async ({ data }: { data: Omit<Rad, "createdAt"> }) => { rader.push({ ...data, createdAt: nå() }); return {}; },
  },
} } });

const tilgang = import("./wang-resultat-tilgang");
const tnCoach = { id: "tn-coach", role: "COACH" as const };
const wangCoach = { id: "wang-coach", role: "COACH" as const };
const admin = { id: "admin", role: "ADMIN" as const };
const ider = (skoler: { playerIds: string[] }[]) => skoler.flatMap((s) => s.playerIds);
const forTn = async () => ider(await (await tilgang).hentWangTestresultatSkolerForTeamNorway(tnCoach));
const forWang = async () => ider(await (await tilgang).hentWangTestresultatSkolerForTrener(wangCoach));
const svar = async (userId: string, gruppeId: string, gitt: boolean, rolle: "SELV" | "FORESATT" = "SELV") =>
  (await tilgang).registrerWangTestsvar({ userId, gruppeId, gitt, gittAvUserId: rolle === "SELV" ? userId : `forelder-${userId}`, gittAvRolle: rolle });

test.beforeEach(() => {
  rader = [];
  avsluttet = new Set();
  tnMedlem = true;
  trenerIWang = ["wang-a", "wang-b"];
});

test("uten samtykke ser verken WANG-trener, Team Norway eller administrator noen elev", async () => {
  assert.deepEqual(await forTn(), []);
  assert.deepEqual(await forWang(), []);
  assert.deepEqual(ider(await (await tilgang).hentWangTestresultatSkolerForTrener(admin)), []);
  assert.deepEqual(ider(await (await tilgang).hentWangTestresultatSkolerForTeamNorway(admin)), []);
  const status = await (await tilgang).hentWangTestdeling("player-a");
  assert.deepEqual(status.map((d) => [d.gruppeId, d.status]), [["wang-a", "IKKE_SVART"]]);
});

test("ett samtykke mot WANG-gruppa deler testene med både WANG-skolen og Team Norway (D-55)", async () => {
  const delt = await svar("player-a", "wang-a", true);
  assert.equal(delt.status, "DELT");
  assert.deepEqual(await forTn(), ["player-a"]);
  assert.deepEqual(await forWang(), ["player-a"]);
  // Skolen vises med bare den samtykkede eleven; duplikatmedlemskap gir én rad.
  const skoler = await (await tilgang).hentWangTestresultatSkolerForTeamNorway(tnCoach);
  assert.deepEqual(skoler.map(({ groupId, playerIds }) => ({ groupId, playerIds })), [
    { groupId: "wang-a", playerIds: ["player-a"] },
    { groupId: "wang-b", playerIds: [] },
  ]);
  // Bare omfanget «tester» mot WANG-gruppa er lagret, aldri statistikk, profil eller Team Norway-gruppa.
  assert.deepEqual(rader.map((r) => [r.scope, r.mottakerGruppeId]), [["TEST_RESULTATER", "wang-a"]]);
});

test("trukket samtykke skjuler eleven med en gang for alle (D-69)", async () => {
  await svar("player-a", "wang-a", true);
  const trukket = await svar("player-a", "wang-a", false);
  assert.equal(trukket.status, "IKKE_DELT");
  assert.deepEqual(await forTn(), []);
  assert.deepEqual(await forWang(), []);
});

test("avsluttet medlemskap fjerner eleven selv om samtykket står", async () => {
  await svar("player-a", "wang-a", true);
  avsluttet.add("wang-a:player-a");
  assert.deepEqual(await forTn(), []);
  assert.deepEqual(await forWang(), []);
  assert.deepEqual(await (await tilgang).hentWangTestdeling("player-a"), []);
});

test("samtykke mot Team Norway-gruppa eller en annen WANG-gruppe åpner ikke", async () => {
  rader.push({ userId: "player-a", scope: "TEST_RESULTATER", mottakerGruppeId: TN, gitt: true, gittAvRolle: "SELV", gittAvUserId: "player-a", createdAt: nå() });
  rader.push({ userId: "player-a", scope: "TEST_RESULTATER", mottakerGruppeId: "wang-b", gitt: true, gittAvRolle: "SELV", gittAvUserId: "player-a", createdAt: nå() });
  assert.deepEqual(await forTn(), []);
});

test("statistikk- eller profilsamtykke åpner ikke testene", async () => {
  for (const scope of ["STATS", "KOMPLETT_PROFIL"]) {
    rader.push({ userId: "player-a", scope, mottakerGruppeId: "wang-a", gitt: true, gittAvRolle: "SELV", gittAvUserId: "player-a", createdAt: nå() });
  }
  assert.deepEqual(await forTn(), []);
});

test("under 16: elevens ja venter på forelder; forelderens ja deler; elevens nei stopper", async () => {
  const elev = await svar("player-b", "wang-b", true);
  assert.equal(elev.status, "VENTER_PA_FORELDER");
  assert.deepEqual(await forTn(), []);
  const forelder = await svar("player-b", "wang-b", true, "FORESATT");
  assert.equal(forelder.status, "DELT");
  assert.deepEqual(await forTn(), ["player-b"]);
  await svar("player-b", "wang-b", false);
  assert.deepEqual(await forTn(), []);
});

test("under 16: forelderens nei stopper delingen", async () => {
  await svar("player-b", "wang-b", true, "FORESATT");
  await svar("player-b", "wang-b", false, "FORESATT");
  assert.deepEqual(await forTn(), []);
});

test("forespørselen gjelder bare aktive WANG-elever og deres egne WANG-grupper", async () => {
  const { hentWangTestdeling, registrerWangTestsvar } = await tilgang;
  assert.deepEqual(await hentWangTestdeling("ak-player"), []);
  await assert.rejects(registrerWangTestsvar({ userId: "ak-player", gruppeId: "ak-group", gitt: true, gittAvUserId: "ak-player", gittAvRolle: "SELV" }));
  await assert.rejects(registrerWangTestsvar({ userId: "player-a", gruppeId: "wang-b", gitt: true, gittAvUserId: "player-a", gittAvRolle: "SELV" }));
  assert.equal(rader.length, 0);
});

test("trener uten Team Norway-medlemskap, spiller og forelder får ingenting fra Team Norway-stien", async () => {
  await svar("player-a", "wang-a", true);
  tnMedlem = false;
  assert.deepEqual(await forTn(), []);
  tnMedlem = true;
  const { hentWangTestresultatSkolerForTeamNorway } = await tilgang;
  assert.deepEqual(await hentWangTestresultatSkolerForTeamNorway({ id: "p", role: "PLAYER" }), []);
  assert.deepEqual(await hentWangTestresultatSkolerForTeamNorway({ id: "f", role: "PARENT" }), []);
});

test("WANG-trener ser bare egne skolegrupper, og bare samtykkede elever der", async () => {
  await svar("player-a", "wang-a", true);
  await svar("player-b", "wang-b", true, "FORESATT");
  trenerIWang = ["wang-b"];
  assert.deepEqual(await forWang(), ["player-b"]);
  trenerIWang = [];
  assert.deepEqual(await forWang(), []);
});

test("administrator ser bare samtykkede elever, både på WANG- og Team Norway-flaten", async () => {
  await svar("player-a", "wang-a", true);
  const { hentWangTestresultatSkolerForTrener, hentWangTestresultatSkolerForTeamNorway } = await tilgang;
  assert.deepEqual(ider(await hentWangTestresultatSkolerForTrener(admin)), ["player-a"]);
  assert.deepEqual(ider(await hentWangTestresultatSkolerForTeamNorway(admin)), ["player-a"]);
});
