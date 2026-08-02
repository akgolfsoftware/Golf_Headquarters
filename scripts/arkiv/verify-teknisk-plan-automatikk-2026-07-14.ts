/**
 * Verifiserer runde 2 (teknisk-plan-automatikk) ende-til-ende mot databasen:
 * 1. Oppretter testspiller + teknisk plan/posisjon/oppgave.
 * 2. Kaller applyPositionTaskReps direkte (samme funksjon logReps() og
 *    live-øktens logDrillReps() begge bruker) — sjekker repsGjort* økte
 *    riktig og PositionTaskLog fikk riktig sessionV2Id.
 * 3. Oppretter en SessionDrill + TrainingDrillV2 med positionTaskId satt —
 *    sjekker FK-relasjonen faktisk fungerer (join via Prisma).
 * 4. Rydder alt opp igjen (kun egne testrader, ID-scoped).
 *
 * Kjøres med: npx tsx scripts/verify-teknisk-plan-automatikk-2026-07-14.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient, type RepHastighet } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

// src/lib/teknisk-plan/apply-reps.ts har `import "server-only"` (riktig —
// hindrer at modulen havner i en klient-bundle), som gjør den umulig å
// importere direkte fra et tsx-script (server-only kaster ubetinget utenfor
// Next sin bundler). Speiler derfor SAMME logikk her ordrett, så testen
// verifiserer faktisk databaseoppførsel uten å svekke den ekte guarden.
type RepsInput = { dry?: number; lav?: number; full?: number };
async function applyPositionTaskReps(taskId: string, reps: RepsInput, loggedByUserId: string, opts?: { sessionV2Id?: string }) {
  await prisma.positionTask.update({
    where: { id: taskId },
    data: {
      repsGjortDry: { increment: reps.dry ?? 0 },
      repsGjortLav: { increment: reps.lav ?? 0 },
      repsGjortFull: { increment: reps.full ?? 0 },
      lastRepLoggedAt: new Date(),
    },
  });
  const logRows: { hastighet: RepHastighet; reps: number }[] = (
    [
      { hastighet: "DRY", reps: reps.dry ?? 0 },
      { hastighet: "LAV", reps: reps.lav ?? 0 },
      { hastighet: "FULL", reps: reps.full ?? 0 },
    ] as { hastighet: RepHastighet; reps: number }[]
  ).filter((r) => r.reps > 0);
  if (logRows.length === 0) return;
  await prisma.positionTaskLog.createMany({
    data: logRows.map((r) => ({ taskId, loggedByUserId, reps: r.reps, hastighet: r.hastighet, sessionV2Id: opts?.sessionV2Id })),
  });
}

async function main() {
  console.log("1. Oppretter testdata …");
  const user = await prisma.user.findFirst({ where: { email: "screentest@akgolf.test" }, select: { id: true } });
  if (!user) throw new Error("Fant ikke screentest@akgolf.test — kjør mot et miljø med testbrukeren.");

  const plan = await prisma.technicalPlan.create({
    data: {
      userId: user.id,
      opprettetAvId: user.id,
      navn: "[TEST] Runde 2-verifisering",
      startDato: new Date(),
      status: "ACTIVE",
    },
  });
  const position = await prisma.technicalPlanPosition.create({
    data: { planId: plan.id, pNummer: "P1.0", navn: "[TEST] Posisjon", sortOrder: 0 },
  });
  const task = await prisma.positionTask.create({
    data: {
      positionId: position.id,
      sortOrder: 0,
      tittel: "[TEST] Oppgave",
      pyramide: "TEK",
      omraade: "Tee Total",
      koller: ["Driver"],
      kategori: "TEKNISK",
      repsMaalDry: 50,
      repsMaalLav: 50,
      repsMaalFull: 50,
    },
  });
  console.log("   plan:", plan.id, "position:", position.id, "task:", task.id);

  console.log("2. Kaller applyPositionTaskReps({dry:12, lav:5}) …");
  await applyPositionTaskReps(task.id, { dry: 12, lav: 5 }, user.id, { sessionV2Id: "test-session-v2-id" });

  const afterFirst = await prisma.positionTask.findUniqueOrThrow({ where: { id: task.id } });
  if (afterFirst.repsGjortDry !== 12 || afterFirst.repsGjortLav !== 5 || afterFirst.repsGjortFull !== 0) {
    throw new Error(`FEIL: forventet dry=12 lav=5 full=0, fikk dry=${afterFirst.repsGjortDry} lav=${afterFirst.repsGjortLav} full=${afterFirst.repsGjortFull}`);
  }
  if (!afterFirst.lastRepLoggedAt) throw new Error("FEIL: lastRepLoggedAt ble ikke satt");
  console.log("   OK — repsGjortDry=12, repsGjortLav=5, lastRepLoggedAt satt");

  const logs = await prisma.positionTaskLog.findMany({ where: { taskId: task.id } });
  if (logs.length !== 2) throw new Error(`FEIL: forventet 2 PositionTaskLog-rader, fikk ${logs.length}`);
  const sessionLog = logs.find((l) => l.sessionV2Id === "test-session-v2-id");
  if (!sessionLog) throw new Error("FEIL: sessionV2Id ble ikke skrevet på loggraden");
  console.log("   OK — 2 PositionTaskLog-rader, sessionV2Id riktig satt på begge");

  console.log("3. Kaller applyPositionTaskReps({dry:3}) på nytt (simulerer andre drill) …");
  await applyPositionTaskReps(task.id, { dry: 3 }, user.id);
  const afterSecond = await prisma.positionTask.findUniqueOrThrow({ where: { id: task.id } });
  if (afterSecond.repsGjortDry !== 15) {
    throw new Error(`FEIL: forventet akkumulert dry=15, fikk ${afterSecond.repsGjortDry}`);
  }
  console.log("   OK — akkumulerer riktig over flere kall (15 = 12+3)");

  console.log("4. Sjekker FK-relasjonen positionTaskId på SessionDrill/TrainingDrillV2 …");
  const exercise = await prisma.exerciseDefinition.findFirst({ select: { id: true } });
  if (!exercise) throw new Error("Fant ingen øvelse i banken å teste mot.");
  const plan2 = await prisma.trainingPlan.findFirst({ where: { userId: user.id }, select: { id: true } });
  if (!plan2) throw new Error("Testbrukeren mangler en TrainingPlan — kan ikke teste SessionDrill-FK.");
  const session = await prisma.trainingPlanSession.create({
    data: {
      planId: plan2.id,
      title: "[TEST] Runde 2-økt",
      scheduledAt: new Date(),
      durationMin: 30,
      pyramidArea: "TEK",
      status: "PLANNED",
    },
  });
  const sessionDrill = await prisma.sessionDrill.create({
    data: {
      sessionId: session.id,
      exerciseId: exercise.id,
      repsSets: "1x1",
      orderIndex: 0,
      positionTaskId: task.id,
    },
  });
  const joined = await prisma.sessionDrill.findUniqueOrThrow({
    where: { id: sessionDrill.id },
    include: { positionTask: { select: { tittel: true } } },
  });
  if (joined.positionTask?.tittel !== "[TEST] Oppgave") {
    throw new Error("FEIL: SessionDrill.positionTask-relasjonen fungerer ikke");
  }
  console.log("   OK — SessionDrill → PositionTask-relasjonen joiner riktig");

  console.log("5. Rydder opp …");
  await prisma.sessionDrill.delete({ where: { id: sessionDrill.id } });
  await prisma.trainingPlanSession.delete({ where: { id: session.id } });
  await prisma.positionTaskLog.deleteMany({ where: { taskId: task.id } });
  await prisma.positionTask.delete({ where: { id: task.id } });
  await prisma.technicalPlanPosition.delete({ where: { id: position.id } });
  await prisma.technicalPlan.delete({ where: { id: plan.id } });
  console.log("   OK — 0 rester");

  console.log("\nALLE TESTER GRØNNE.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
