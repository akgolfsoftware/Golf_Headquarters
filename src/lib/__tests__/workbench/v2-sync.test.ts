/**
 * Regresjonstest for 14.5A: upsertV2ForPlanSession skal aldri kunne lage to
 * V2-speil-økter for samme plan-økt. Før fiksen sjekket funksjonen først med
 * findFirst og opprettet/oppdaterte deretter — to separate databasekall med
 * et vindu mellom seg der et samtidig kall kunne rekke å opprette sin egen
 * rad. Nå er det ett atomisk upsert-kall mot databasens unike nøkkel
 * (generertFra, generertFraId).
 *
 * Mock-mønster som resten av suiten (t.mock.module før dynamisk import).
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";

type UpsertArgs = {
  where: { generertFra_generertFraId: { generertFra: string; generertFraId: string } };
  update: Record<string, unknown>;
  create: Record<string, unknown>;
};
type Rad = { id: string; status: string; createdAt: Date; updatedAt: Date } & Record<string, unknown>;

test("upsertV2ForPlanSession — ingen dobbel speil-rad (14.5A)", async (t) => {
  const butikk = new Map<string, Rad>();
  const upsertKall: UpsertArgs[] = [];
  const drillSyncKall: { v2SessionId: string; planSessionId: string }[] = [];
  let idTeller = 0;

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        trainingSessionV2: {
          upsert: async (args: UpsertArgs) => {
            upsertKall.push(args);
            const key = args.where.generertFra_generertFraId.generertFraId;
            const eksisterende = butikk.get(key);
            if (eksisterende) {
              const oppdatert: Rad = {
                ...eksisterende,
                ...args.update,
                updatedAt: new Date(eksisterende.updatedAt.getTime() + 1000),
              };
              butikk.set(key, oppdatert);
              return oppdatert;
            }
            idTeller++;
            const ny: Rad = {
              id: `v2-${idTeller}`,
              ...args.create,
              createdAt: new Date(0),
              updatedAt: new Date(0),
            } as Rad;
            butikk.set(key, ny);
            return ny;
          },
        },
      },
    },
  });

  t.mock.module("@/lib/workbench/v2-drill-mirror", {
    namedExports: {
      GENERERT_FRA: "WORKBENCH_PLAN",
      syncDrillsToV2: async (v2SessionId: string, planSessionId: string) => {
        drillSyncKall.push({ v2SessionId, planSessionId });
      },
    },
  });

  const { upsertV2ForPlanSession } = await import("@/lib/workbench/v2-sync");

  const basisInput = {
    planSessionId: "plan-1",
    playerId: "spiller-1",
    title: "Chip-økt",
    scheduledAt: new Date("2026-09-08T08:00:00Z"),
    durationMin: 60,
    pyramidArea: "TEK" as const,
    coachId: "coach-1",
  };

  await t.test("første kall → oppretter én rad, status PLANNED, drill speilet", async () => {
    await upsertV2ForPlanSession(basisInput);
    assert.equal(upsertKall.length, 1);
    assert.equal(upsertKall[0].create.status, "PLANNED");
    assert.equal(butikk.size, 1);
    assert.equal(drillSyncKall.length, 1);
  });

  await t.test(
    "gjentatt kall for SAMME plan-økt (dobbelklikk/retry) → oppdaterer samme rad, oppretter aldri en ny",
    async () => {
      await upsertV2ForPlanSession({ ...basisInput, title: "Chip-økt (redigert)" });
      assert.equal(upsertKall.length, 2);
      // Nøkkelen som avgjør 14.5A: fortsatt kun ÉN rad i "databasen" for
      // denne plan-økten, uansett hvor mange ganger funksjonen kalles.
      assert.equal(butikk.size, 1);
      // Status skal aldri stå i update-grenen — annet ville nullstilt
      // COMPLETED/CANCELLED tilbake til PLANNED (kjent gotcha).
      assert.equal(upsertKall[1].update.status, undefined);
    },
  );

  await t.test("økt som er fullført (COMPLETED) → drill speiles IKKE på nytt, status urørt", async () => {
    const rad = butikk.get("plan-1");
    assert.ok(rad);
    butikk.set("plan-1", { ...rad, status: "COMPLETED" });
    drillSyncKall.length = 0;

    await upsertV2ForPlanSession({ ...basisInput, title: "Chip-økt (enda en redigering)" });

    assert.equal(drillSyncKall.length, 0);
    assert.equal(butikk.get("plan-1")?.status, "COMPLETED");
  });

  await t.test("sourceGroupId settes kun når den er oppgitt", async () => {
    await upsertV2ForPlanSession({ ...basisInput, planSessionId: "plan-2", sourceGroupId: "gruppe-1" });
    const siste = upsertKall.at(-1);
    assert.equal(siste?.create.groupId, "gruppe-1");

    await upsertV2ForPlanSession({ ...basisInput, planSessionId: "plan-3" });
    const utenGruppe = upsertKall.at(-1);
    assert.equal("groupId" in (utenGruppe?.create ?? {}), false);
  });
});
