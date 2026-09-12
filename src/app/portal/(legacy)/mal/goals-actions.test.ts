/**
 * R-I fortsettelse: mål slettes og avbrytes bare av eieren.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "spiller-a", role: "PLAYER" as const };
let slettet = 0;
let oppdatert = 0;
let goal = { id: "maal-1", userId: "spiller-a", payload: {} as Record<string, unknown> };

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: { redirect: (to: string) => { throw new Error(`REDIRECT:${to}`); } },
});
mock.module("@/lib/auth/requireConsentingUser", {
  namedExports: { requireConsentingUser: async () => bruker },
});
mock.module("@/lib/notifications", { namedExports: { notify: async () => undefined } });
mock.module("@/lib/workbench/v2-sync", {
  namedExports: { resolveCoachIdForPlayer: async () => null },
});
mock.module("@/lib/portal/sg-omrade-snitt", {
  namedExports: { hentSgSnittPerOmrade: async () => ({}) },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      goal: {
        findUnique: async () => goal,
        delete: async () => {
          slettet += 1;
          return {};
        },
        update: async () => {
          oppdatert += 1;
          return {};
        },
      },
    },
  },
});

async function actions() {
  return import("./goals-actions");
}

test.beforeEach(() => {
  bruker = { id: "spiller-a", role: "PLAYER" };
  slettet = 0;
  oppdatert = 0;
  goal = { id: "maal-1", userId: "spiller-a", payload: {} };
});

test("slettGoal avviser andres mål uten sletting", async () => {
  goal = { ...goal, userId: "spiller-b" };
  const { slettGoal } = await actions();
  await assert.rejects(() => slettGoal("maal-1"), /forbidden/);
  assert.equal(slettet, 0);
});

test("avbrytGoal avviser andres mål uten oppdatering", async () => {
  goal = { ...goal, userId: "spiller-b" };
  const { avbrytGoal } = await actions();
  await assert.rejects(() => avbrytGoal("maal-1", "pause"), /forbidden/);
  assert.equal(oppdatert, 0);
});

test("slettGoal sletter eget mål", async () => {
  const { slettGoal } = await actions();
  await assert.rejects(() => slettGoal("maal-1"), /REDIRECT:\/portal\/mal/);
  assert.equal(slettet, 1);
});
