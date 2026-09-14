/**
 * R-I: admin/grupper/[id]/actions.ts. `eierGruppen` skal avvise en coach som
 * verken er hovedtrener eller aktivt COACH-medlem i gruppen — uten den porten
 * kunne en coach endre en annen coachs gruppe ved å bytte groupId. Rolle
 * (COACH) alene er ikke nok.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "coach-a", role: "COACH" as string, name: "Coach A" };
let tillatteSpillere = new Set<string>(["spiller-a"]);

const groups: Record<string, { id: string; coachId: string }> = {
  "gruppe-a": { id: "gruppe-a", coachId: "coach-a" },
  "gruppe-fremmed": { id: "gruppe-fremmed", coachId: "coach-b" },
};
const groupMembers: Record<string, { id: string; endedAt: Date | null; role: string }> = {};
const groupSchedules: Record<string, { id: string; groupId: string; title: string; startAt: Date; endAt: Date; description: string | null; location: string | null; recurring: string; maxParticipants: number | null }> = {
  "time-a": {
    id: "time-a",
    groupId: "gruppe-a",
    title: "Fellestrening",
    startAt: new Date("2026-02-01T17:00:00Z"),
    endAt: new Date("2026-02-01T18:00:00Z"),
    description: null,
    location: null,
    recurring: "NONE",
    maxParticipants: null,
  },
  "time-fremmed": {
    id: "time-fremmed",
    groupId: "gruppe-fremmed",
    title: "Fremmed trening",
    startAt: new Date("2026-02-01T17:00:00Z"),
    endAt: new Date("2026-02-01T18:00:00Z"),
    description: null,
    location: null,
    recurring: "NONE",
    maxParticipants: null,
  },
};

let memberWrites: unknown[] = [];
let memberCreates: unknown[] = [];
let scheduleCreates: unknown[] = [];
let auditWrites: Array<{ action: string; target: string }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  tillatteSpillere = new Set(["spiller-a"]);
  for (const k of Object.keys(groupMembers)) delete groupMembers[k];
  memberWrites = [];
  memberCreates = [];
  scheduleCreates = [];
  auditWrites = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/lib/auth/effective-capabilities", {
  namedExports: { assertCapability: async () => undefined },
});
mock.module("@/lib/auth/coached", {
  namedExports: {
    coachScopedPlayerWhere: () => ({ __scoped: true }),
  },
});
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string; target: string }) => {
      auditWrites.push({ action: input.action, target: input.target });
    },
  },
});
mock.module("@/lib/google-calendar-kilder", {
  namedExports: { pushGruppeTime: async () => undefined },
});
mock.module("@/lib/email", {
  namedExports: {
    resendKlient: () => ({ emails: { send: async () => undefined } }),
    FRA_EPOST: "post@akgolf.no",
  },
});
mock.module("@/lib/error-tracking", {
  namedExports: { logError: async () => undefined },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      group: {
        findFirst: async ({
          where,
        }: {
          where: { id: string; coachId?: string; OR?: Array<Record<string, unknown>> };
        }) => {
          const gruppe = groups[where.id];
          if (!gruppe) return null;
          if (where.coachId) return gruppe.coachId === where.coachId ? gruppe : null;
          if (where.OR) {
            const eierMatch = gruppe.coachId === bruker.id;
            // Aktivt COACH-medlemskap sjekkes via memberOf-settet i denne
            // testen — ingen syntetisk bruker har det, kun eierskap testes.
            return eierMatch ? gruppe : null;
          }
          return gruppe;
        },
      },
      user: {
        findFirst: async ({ where }: { where: { AND?: Array<{ id?: string }>; id?: string; role?: { in: string[] } } }) => {
          const id = where.AND ? where.AND.find((c) => c.id)?.id : where.id;
          if (!id) return null;
          if (where.role) {
            return null; // ingen syntetisk trener-bruker i denne testen
          }
          if (!tillatteSpillere.has(id)) return null;
          return { id, role: "PLAYER", deletedAt: null };
        },
      },
      groupMember: {
        findUnique: async ({ where }: { where: { groupId_userId: { groupId: string; userId: string } } }) => {
          const key = `${where.groupId_userId.groupId}:${where.groupId_userId.userId}`;
          return groupMembers[key] ?? null;
        },
        update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
          memberWrites.push({ id: where.id, data });
          return { id: where.id };
        },
        create: async ({ data }: { data: { groupId: string; userId: string } }) => {
          memberCreates.push(data);
          const key = `${data.groupId}:${data.userId}`;
          groupMembers[key] = { id: key, endedAt: null, role: "PLAYER" };
          return { id: key };
        },
      },
      groupSchedule: {
        create: async ({ data }: { data: { groupId: string } }) => {
          scheduleCreates.push(data);
          return { id: "ny-time" };
        },
        findFirst: async ({ where }: { where: { id: string; groupId: string } }) => {
          const time = groupSchedules[where.id];
          if (!time || time.groupId !== where.groupId) return null;
          return time;
        },
      },
      $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({}),
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("leggTilGruppemedlem avviser fremmed gruppe uten å legge til medlem", async () => {
  const { leggTilGruppemedlem } = await actions();
  const svar = await leggTilGruppemedlem("gruppe-fremmed", "spiller-a");
  assert.equal(svar.ok, false);
  assert.equal(memberCreates.length, 0);
});

test("leggTilGruppemedlem avviser spiller coachen ikke har tilgang til, selv i egen gruppe", async () => {
  const { leggTilGruppemedlem } = await actions();
  const svar = await leggTilGruppemedlem("gruppe-a", "spiller-fremmed");
  assert.equal(svar.ok, false);
  assert.equal(memberCreates.length, 0);
});

test("leggTilGruppemedlem legger til egen spiller i egen gruppe", async () => {
  const { leggTilGruppemedlem } = await actions();
  const svar = await leggTilGruppemedlem("gruppe-a", "spiller-a");
  assert.equal(svar.ok, true);
  assert.equal(memberCreates.length, 1);
  assert.equal(auditWrites.at(-1)?.action, "group_member.added");
});

test("fjernGruppemedlem avviser fremmed gruppe uten å fjerne noen", async () => {
  const { fjernGruppemedlem } = await actions();
  const svar = await fjernGruppemedlem("gruppe-fremmed", "spiller-a");
  assert.equal(svar.ok, false);
  assert.equal(memberWrites.length, 0);
});

test("inviterSpillereTilGruppe avviser fremmed gruppe uten å invitere noen", async () => {
  const { inviterSpillereTilGruppe } = await actions();
  const svar = await inviterSpillereTilGruppe("gruppe-fremmed", ["ny@test.no"]);
  assert.equal(svar.ok, false);
});

test("opprettGruppeTrening avviser fremmed gruppe uten å opprette time", async () => {
  const { opprettGruppeTrening } = await actions();
  const svar = await opprettGruppeTrening("gruppe-fremmed", {
    title: "Ny time",
    startAt: new Date("2026-02-02T17:00:00Z"),
    endAt: new Date("2026-02-02T18:00:00Z"),
  });
  assert.equal(svar.ok, false);
  assert.equal(scheduleCreates.length, 0);
});

test("dupliserGruppeTime avviser fremmed gruppe uten å duplisere", async () => {
  const { dupliserGruppeTime } = await actions();
  const svar = await dupliserGruppeTime("gruppe-fremmed", "time-fremmed", new Date("2026-02-03T17:00:00Z"));
  assert.equal(svar.ok, false);
  assert.equal(scheduleCreates.length, 0);
});

test("dupliserGruppeTime avviser å kopiere en time FRA en annen gruppe inn i egen gruppe", async () => {
  const { dupliserGruppeTime } = await actions();
  // Coachen eier gruppe-a, men originalen (time-fremmed) tilhører gruppe-fremmed.
  const svar = await dupliserGruppeTime("gruppe-a", "time-fremmed", new Date("2026-02-03T17:00:00Z"));
  assert.equal(svar.ok, false);
  assert.equal(scheduleCreates.length, 0);
});

test("dupliserGruppeTime dupliserer en egen times innenfor egen gruppe", async () => {
  const { dupliserGruppeTime } = await actions();
  const svar = await dupliserGruppeTime("gruppe-a", "time-a", new Date("2026-02-03T17:00:00Z"));
  assert.equal(svar.ok, true);
  assert.equal(scheduleCreates.length, 1);
});
