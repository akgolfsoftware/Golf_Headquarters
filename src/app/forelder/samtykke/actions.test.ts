/**
 * O05/O07: eksporterte samtykke- og datahandlinger. Ugodkjent relasjon,
 * andres barn og feil rolle skriver ingenting. Tilbakekalling av deling
 * er en ny rad med gitt=false.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "forelder-a", role: "PARENT" as string };
let relasjon: { parentId: string; childId: string; approved: boolean } | null = {
  parentId: "forelder-a",
  childId: "barn-a",
  approved: true,
};
let preferencesSkrevet: unknown = null;
let eksportSkrevet: unknown[] = [];
let delingRegistrert: Array<Record<string, unknown>> = [];
let helseRegistrert: Array<Record<string, unknown>> = [];
let medlem = true;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async ({ allow }: { allow?: string | string[] } = {}) => {
      const tillatt = allow ? (Array.isArray(allow) ? allow : [allow]) : null;
      if (tillatt && !tillatt.includes(bruker.role)) {
        throw new Error("REDIRECT:/portal");
      }
      return bruker;
    },
  },
});
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/health/samtykke", {
  namedExports: {
    registrerHelseSamtykke: async (input: Record<string, unknown>) => {
      helseRegistrert.push(input);
    },
  },
});
mock.module("@/lib/deling/samtykke", {
  namedExports: {
    registrerDelingsSamtykke: async (input: Record<string, unknown>) => {
      delingRegistrert.push(input);
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      parentRelation: {
        findFirst: async ({
          where,
        }: {
          where: { parentId: string; childId: string; approved?: boolean };
        }) => {
          if (!relasjon) return null;
          if (relasjon.parentId !== where.parentId) return null;
          if (relasjon.childId !== where.childId) return null;
          if (where.approved !== undefined && relasjon.approved !== where.approved) {
            return null;
          }
          return relasjon;
        },
      },
      user: {
        findUnique: async () => ({ preferences: {} }),
        update: async ({ data }: { data: { preferences: unknown } }) => {
          preferencesSkrevet = data.preferences;
          return {};
        },
      },
      groupMember: {
        findFirst: async () => (medlem ? { id: "medlem-1" } : null),
      },
      dataExportRequest: {
        create: async ({ data }: { data: unknown }) => {
          eksportSkrevet.push(data);
          return {};
        },
      },
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  bruker = { id: "forelder-a", role: "PARENT" };
  relasjon = { parentId: "forelder-a", childId: "barn-a", approved: true };
  preferencesSkrevet = null;
  eksportSkrevet = [];
  delingRegistrert = [];
  helseRegistrert = [];
  medlem = true;
});

test("lagreSamtykker avviser ugodkjent relasjon og skriver ingenting", async () => {
  relasjon = { parentId: "forelder-a", childId: "barn-a", approved: false };
  const { lagreSamtykker } = await actions();
  await assert.rejects(
    () => lagreSamtykker("barn-a", { markedsforing: true }),
    /godkjent foresatt/,
  );
  assert.equal(preferencesSkrevet, null);
});

test("lagreSamtykker avviser andres barn", async () => {
  const { lagreSamtykker } = await actions();
  await assert.rejects(
    () => lagreSamtykker("barn-fremmed", { markedsforing: true }),
    /godkjent foresatt/,
  );
  assert.equal(preferencesSkrevet, null);
});

test("lagreSamtykker avviser spiller-rolle uten skriving", async () => {
  bruker = { id: "spiller-a", role: "PLAYER" };
  const { lagreSamtykker } = await actions();
  await assert.rejects(() => lagreSamtykker("barn-a", { markedsforing: true }), /REDIRECT/);
  assert.equal(preferencesSkrevet, null);
});

test("lagreSamtykker skriver for godkjent foresatt", async () => {
  const { lagreSamtykker } = await actions();
  const svar = await lagreSamtykker("barn-a", { markedsforing: true });
  assert.equal(svar.ok, true);
  assert.equal(
    (preferencesSkrevet as { markedsforing?: boolean }).markedsforing,
    true,
  );
});

test("settDelingsSamtykkeForBarn avviser ugodkjent relasjon", async () => {
  relasjon = { parentId: "forelder-a", childId: "barn-a", approved: false };
  const { settDelingsSamtykkeForBarn } = await actions();
  const svar = await settDelingsSamtykkeForBarn(
    "barn-a",
    "TEST_RESULTATER",
    "gruppe-1",
    true,
  );
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.feil, /godkjent foresatt/);
  assert.equal(delingRegistrert.length, 0);
});

test("settDelingsSamtykkeForBarn trekker deling med gitt=false", async () => {
  const { settDelingsSamtykkeForBarn } = await actions();
  const svar = await settDelingsSamtykkeForBarn(
    "barn-a",
    "TEST_RESULTATER",
    "gruppe-1",
    false,
  );
  assert.equal(svar.ok, true);
  assert.equal(delingRegistrert.length, 1);
  assert.equal(delingRegistrert[0]?.gitt, false);
  assert.equal(delingRegistrert[0]?.userId, "barn-a");
  assert.equal(delingRegistrert[0]?.gittAvRolle, "FORESATT");
});

test("settHelseSamtykkeForBarn avviser andres barn", async () => {
  const { settHelseSamtykkeForBarn } = await actions();
  const svar = await settHelseSamtykkeForBarn("barn-fremmed", "WEARABLE_HELSE", true);
  assert.equal(svar.ok, false);
  assert.equal(helseRegistrert.length, 0);
});

test("beOmDataeksport avviser andres barn uten rad", async () => {
  const { beOmDataeksport } = await actions();
  await assert.rejects(() => beOmDataeksport("barn-fremmed"), /godkjent foresatt/);
  assert.equal(eksportSkrevet.length, 0);
});

test("beOmDataSletting avviser andres barn uten rad", async () => {
  const { beOmDataSletting } = await actions();
  await assert.rejects(() => beOmDataSletting("barn-fremmed"), /godkjent foresatt/);
  assert.equal(eksportSkrevet.length, 0);
});
