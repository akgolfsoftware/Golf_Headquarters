/**
 * scripts/test-drill-akformel-2026-06-30.ts
 *
 * Del B verifikasjon: opprett en SessionDrill med full per-drill AK-formel →
 * les tilbake → bekreft at alle dimensjonene persisteres. Selv-ryddende.
 *
 * Kjøres med: npx tsx scripts/test-drill-akformel-2026-06-30.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FEIL: " + msg);
  console.log("  ✓ " + msg);
}

async function main() {
  const player = await prisma.user.findFirst({ where: { role: "PLAYER", deletedAt: null }, select: { id: true, name: true } });
  if (!player) throw new Error("Ingen PLAYER-bruker");
  console.log(`Testspiller: ${player.name}`);

  let plan = await prisma.trainingPlan.findFirst({ where: { userId: player.id }, select: { id: true } });
  if (!plan) plan = await prisma.trainingPlan.create({ data: { userId: player.id, name: "Drill-test", startDate: new Date(), status: "DRAFT" }, select: { id: true } });

  const session = await prisma.trainingPlanSession.create({
    data: { planId: plan.id, title: "Drill-AK verifikasjon", scheduledAt: new Date(), durationMin: 60, pyramidArea: "TEK", status: "PLANNED" },
    select: { id: true },
  });

  const exercise = await prisma.exerciseDefinition.findFirst({ select: { id: true, name: true } });
  if (!exercise) throw new Error("Ingen ExerciseDefinition å koble drillen til");
  console.log(`Øvelse: ${exercise.name}`);

  console.log("\nOpprett drill med full AK-formel + les tilbake:");
  const drill = await prisma.sessionDrill.create({
    data: {
      sessionId: session.id,
      exerciseId: exercise.id,
      repsSets: "3×8",
      csTarget: 95,
      lFase: "L_AUTO",
      miljo: "M4",
      csNivaa: "CS90",
      prPress: "PR3",
      pPosisjoner: ["P6", "P7"],
    },
    select: { id: true },
  });

  const back = await prisma.sessionDrill.findUniqueOrThrow({
    where: { id: drill.id },
    select: { csTarget: true, lFase: true, miljo: true, csNivaa: true, prPress: true, pPosisjoner: true },
  });
  assert(back.csTarget === 95, "csTarget = 95 (beholdt ved siden av AK-formel)");
  assert(back.lFase === "L_AUTO", "L-fase = L_AUTO");
  assert(back.miljo === "M4", "miljø = M4");
  assert(back.csNivaa === "CS90", "CS = CS90");
  assert(back.prPress === "PR3", "press = PR3");
  assert(JSON.stringify(back.pPosisjoner) === '["P6","P7"]', "P-posisjoner = [P6,P7]");
  console.log("  → per-drill AK-formel persistert ✓");

  console.log("\nRydder opp...");
  await prisma.sessionDrill.delete({ where: { id: drill.id } });
  await prisma.trainingPlanSession.delete({ where: { id: session.id } });

  console.log("\nFerdig — drill-nivå AK-formel verifisert.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
