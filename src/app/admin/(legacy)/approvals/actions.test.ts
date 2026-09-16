/**
 * R-I · søskentest for `admin/(legacy)/approvals/actions.ts`.
 *
 * Godkjenningsfila skriver til PlanAction, kjører `acceptAndApplyPlanAction`
 * (som endrer spillerens plan) og varsler spilleren. Den hadde rollevakt og
 * coach-avgrensning i koden, men ingen regresjonstest. Denne filen låser:
 * spiller/forelder slipper aldri inn, en annen coachs sak er «not-found» uten
 * skriving, og tomme begrunnelser stopper før noe endres.
 *
 * Kjør med: npm test
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "COACH" | "ADMIN" | "PLAYER" | "PARENT";
let bruker = { id: "coach-a", role: "COACH" as Rolle, name: "Coach A" };

/** Sak eid av coach-b — skal aldri være synlig for coach-a. */
const SAKER: Record<string, { id: string; coachId: string | null; status: string; userId: string; actionType: string }> = {
  "sak-egen": { id: "sak-egen", coachId: "coach-a", status: "PENDING", userId: "spiller-1", actionType: "ADD_DRILL" },
  "sak-fremmed": { id: "sak-fremmed", coachId: "coach-b", status: "PENDING", userId: "spiller-2", actionType: "ADD_DRILL" },
};

let akseptert: string[] = [];
let oppdateringer: unknown[] = [];
let varsler: unknown[] = [];
let sisteFindManyWhere: unknown = null;
let redirects: string[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  akseptert = [];
  oppdateringer = [];
  varsler = [];
  sisteFindManyWhere = null;
  redirects = [];
}

/** Speiler `coachScopeWhere`: `{ OR: [{ coachId }, { coachId: null }] }`. */
function synligFor(coachId: string, where: Record<string, unknown>): boolean {
  const or = where.OR as { coachId: string | null }[] | undefined;
  if (!or) return true;
  return or.some((k) => k.coachId === coachId || k.coachId === null);
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (sti: string) => {
      redirects.push(sti);
      throw new Error("NEXT_REDIRECT");
    },
  },
});
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async ({ allow }: { allow?: Rolle[] } = {}) => {
      if (allow && !allow.includes(bruker.role)) throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/lib/agents/accept-plan-action", {
  namedExports: {
    acceptAndApplyPlanAction: async (id: string) => {
      akseptert.push(id);
      return { status: "ACCEPTED" };
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      planAction: {
        findUnique: async ({ where }: { where: Record<string, unknown> }) => {
          const sak = SAKER[String(where.id)];
          if (!sak) return null;
          // `select: { suggestion }`-varianten i attachCoachNote har ingen OR.
          if (where.OR && !synligFor(bruker.id, where)) return null;
          if (sak.coachId !== null && sak.coachId !== bruker.id && where.OR) return null;
          return { ...sak, suggestion: {} };
        },
        findMany: async ({ where }: { where: Record<string, unknown> }) => {
          sisteFindManyWhere = where;
          return Object.values(SAKER).filter(
            (s) => s.status === "PENDING" && (s.coachId === bruker.id || s.coachId === null),
          );
        },
        update: async (arg: unknown) => {
          oppdateringer.push(arg);
          return {};
        },
        updateMany: async (arg: unknown) => {
          oppdateringer.push(arg);
          return { count: 1 };
        },
      },
      notification: {
        create: async (arg: unknown) => {
          varsler.push(arg);
          return {};
        },
      },
    },
  },
});

/** Lastes dovent — toppnivå-await er ikke støttet av testtransformen. */
async function actions() {
  return import("./actions");
}

test("spiller og forelder avvises på alle fem handlinger — uten skriving", async () => {
  const {
    approveRequestDetailed,
    declineRequestDetailed,
    requestMoreInfo,
    batchApproveSelected,
    batchApproveLowRisk,
  } = await actions();
  for (const rolle of ["PLAYER", "PARENT"] as const) {
    nullstill();
    bruker = { id: "spiller-1", role: rolle, name: "Uvedkommende" };

    await assert.rejects(() => approveRequestDetailed("sak-egen"), /forbidden/);
    await assert.rejects(() => declineRequestDetailed("sak-egen", "ikke greit"), /forbidden/);
    await assert.rejects(() => requestMoreInfo("sak-egen", "hvorfor?"), /forbidden/);
    await assert.rejects(() => batchApproveSelected(["sak-egen"]), /forbidden/);
    await assert.rejects(() => batchApproveLowRisk(), /forbidden/);

    assert.deepEqual(akseptert, [], `${rolle} skal ikke få kjørt en plan-handling`);
    assert.deepEqual(oppdateringer, [], `${rolle} skal ikke skrive til PlanAction`);
    assert.deepEqual(varsler, [], `${rolle} skal ikke sende varsel`);
  }
});

test("en annen coachs sak er not-found — ingen godkjenning, avslag eller varsel", async () => {
  const { approveRequestDetailed, declineRequestDetailed, requestMoreInfo } = await actions();
  nullstill();

  await assert.rejects(() => approveRequestDetailed("sak-fremmed"), /not-found/);
  await assert.rejects(() => declineRequestDetailed("sak-fremmed", "ikke greit"), /not-found/);
  await assert.rejects(() => requestMoreInfo("sak-fremmed", "hvorfor?"), /not-found/);

  assert.deepEqual(akseptert, []);
  assert.deepEqual(oppdateringer, []);
  assert.deepEqual(varsler, []);
});

test("tom eller for kort begrunnelse stopper før skriving", async () => {
  const { declineRequestDetailed, requestMoreInfo } = await actions();
  nullstill();

  await assert.rejects(() => declineRequestDetailed("sak-egen", "  "), /begrunnelse-påkrevd/);
  await assert.rejects(() => declineRequestDetailed("sak-egen", "no"), /begrunnelse-påkrevd/);
  await assert.rejects(() => requestMoreInfo("sak-egen", ""), /spørsmål-påkrevd/);
  await assert.rejects(() => requestMoreInfo("sak-egen", "hm"), /spørsmål-påkrevd/);

  assert.deepEqual(oppdateringer, []);
  assert.deepEqual(varsler, []);
});

test("bunkegodkjenning spør bare etter saker coachen eier eller ueide saker", async () => {
  const { batchApproveSelected } = await actions();
  nullstill();

  const res = await batchApproveSelected(["sak-egen", "sak-fremmed"]);

  assert.equal(res.coachId, "coach-a");
  const where = sisteFindManyWhere as { OR?: { coachId: string | null }[]; status?: string };
  assert.equal(where.status, "PENDING");
  assert.deepEqual(where.OR, [{ coachId: "coach-a" }, { coachId: null }]);
  assert.deepEqual(akseptert, ["sak-egen"], "en annen coachs sak skal ikke godkjennes i bunke");
});

test("tom id-liste gjør ingenting", async () => {
  const { batchApproveSelected } = await actions();
  nullstill();

  const res = await batchApproveSelected([]);

  assert.deepEqual(res, { godkjent: 0, feilet: 0, coachId: "coach-a" });
  assert.deepEqual(akseptert, []);
  assert.equal(sisteFindManyWhere, null);
});
