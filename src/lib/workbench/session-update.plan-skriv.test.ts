import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import type { PrismaClient } from "@/generated/prisma/client";

mock.module("@/lib/workbench/v2-sync", {
  namedExports: { upsertV2ForPlanSession: async () => undefined },
});

let executeSessionUpdate: typeof import("./session-update").executeSessionUpdate;

before(async () => {
  ({ executeSessionUpdate } = await import("./session-update"));
});

test("feilet drill-skriving ruller tilbake tittelendringen", async () => {
  const rad = {
    id: "okt-1",
    scheduledAt: new Date("2026-06-22T09:00:00.000Z"),
    title: "Driver",
    durationMin: 60,
    pyramidArea: "TEK" as const,
    miljo: "M2" as const,
    location: "Range",
    maalsetning: "Treff",
    plan: { userId: "spiller" },
  };
  let tittel = rad.title;
  const tx = {
    trainingPlanSession: {
      update: async ({ data }: { data: { title?: string } }) => {
        if (data.title) tittel = data.title;
        return { ...rad, title: tittel };
      },
    },
    user: { findUnique: async () => ({ drillDelingGodtatt: false }) },
    exerciseDefinition: {
      create: async () => {
        throw new Error("drill-feil");
      },
    },
    sessionDrill: {
      deleteMany: async () => ({ count: 0 }),
      createMany: async () => ({ count: 0 }),
    },
  };
  const prisma = {
    trainingPlanSession: {
      findUnique: async () => rad,
    },
    $transaction: async (fn: (inner: typeof tx) => Promise<unknown>) => {
      const forrige = tittel;
      try {
        return await fn(tx);
      } catch (feil) {
        tittel = forrige;
        throw feil;
      }
    },
  };

  const resultat = await executeSessionUpdate(prisma as unknown as PrismaClient, {
    sessionId: "okt-1",
    playerId: "spiller",
    patch: { title: "Ny tittel", drills: [{ nyNavn: "Ny øvelse", nivaa: "vanlig" }] },
  });
  assert.equal(resultat.ok, false);
  assert.equal(tittel, "Driver");
});
