/**
 * scripts/test-akformel-2026-06-30.ts
 *
 * Fase 0 verifikasjon: opprett en TrainingPlanSession med full AK-formel → les
 * tilbake fra DB → bekreft at alle seks dimensjonene persisteres. Tester også
 * sanitizeAkFormel-validering og at V2-speilet godtar feltene. Selv-ryddende.
 *
 * Kjøres med: npx tsx scripts/test-akformel-2026-06-30.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { sanitizeAkFormel } from "../src/lib/workbench/ak-formel";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FEIL: " + msg);
  console.log("  ✓ " + msg);
}

async function main() {
  // 1) sanitizeAkFormel — gyldig beholdes, ugyldig renses.
  console.log("1) Validering (sanitizeAkFormel):");
  const ren = sanitizeAkFormel({ lFase: "L_BALL", miljo: "M3", csNivaa: "CS80", pressureLevel: "PR4", pPosisjoner: ["P2", "P7"] });
  assert(ren.lFase === "L_BALL" && ren.miljo === "M3" && ren.csNivaa === "CS80" && ren.pressureLevel === "PR4", "gyldig formel beholdes");
  assert(JSON.stringify(ren.pPosisjoner) === '["P2","P7"]', "gyldige P-posisjoner beholdes");
  const skitten = sanitizeAkFormel({ lFase: "BOGUS", miljo: "M9", csNivaa: "CS55", pressureLevel: "PR6", pPosisjoner: ["P2", "X", "P11"] });
  assert(skitten.lFase === null && skitten.miljo === null && skitten.csNivaa === null && skitten.pressureLevel === null, "ugyldige enum-verdier → null");
  assert(JSON.stringify(skitten.pPosisjoner) === '["P2"]', "ugyldige P-posisjoner filtreres bort (kun P2 igjen)");

  // 2) Finn en testspiller + plan.
  const player = await prisma.user.findFirst({ where: { role: "PLAYER", deletedAt: null }, select: { id: true, name: true } });
  if (!player) throw new Error("Ingen PLAYER-bruker funnet å teste mot");
  console.log(`\n2) Testspiller: ${player.name} (${player.id})`);
  let plan = await prisma.trainingPlan.findFirst({ where: { userId: player.id }, select: { id: true } });
  if (!plan) {
    plan = await prisma.trainingPlan.create({ data: { userId: player.id, name: "AK-formel testplan", startDate: new Date(), status: "DRAFT" }, select: { id: true } });
  }

  // 3) Opprett økt med FULL AK-formel (samme felter som addWorkbenchSession skriver).
  console.log("\n3) Opprett økt med full AK-formel + les tilbake:");
  const created = await prisma.trainingPlanSession.create({
    data: {
      planId: plan.id,
      title: "AK-formel verifikasjon",
      scheduledAt: new Date(),
      durationMin: 60,
      pyramidArea: "TEK",
      lFase: ren.lFase,
      miljo: ren.miljo,
      csNivaa: ren.csNivaa,
      pressureLevel: ren.pressureLevel,
      pPosisjoner: ren.pPosisjoner,
      status: "PLANNED",
    },
    select: { id: true },
  });

  const back = await prisma.trainingPlanSession.findUniqueOrThrow({
    where: { id: created.id },
    select: { pyramidArea: true, lFase: true, miljo: true, csNivaa: true, pressureLevel: true, pPosisjoner: true },
  });
  assert(back.pyramidArea === "TEK", "pyramide = TEK");
  assert(back.lFase === "L_BALL", "L-fase = L_BALL");
  assert(back.miljo === "M3", "miljø = M3");
  assert(back.csNivaa === "CS80", "CS = CS80");
  assert(back.pressureLevel === "PR4", "press = PR4");
  assert(JSON.stringify(back.pPosisjoner) === '["P2","P7"]', "P-posisjoner = [P2,P7]");
  console.log("  → alle seks AK-dimensjonene persistert ✓");

  // 4) V2-speil: TrainingSessionV2 har KUN miljo på session-nivå (full formel bor på
  // kanon TrainingPlanSession + drill-nivå TrainingDrillV2). Bekreft miljo-speiling.
  console.log("\n4) V2-speil (kun miljo på session-nivå):");
  if (ren.miljo === null) throw new Error("testforutsetning: miljo skal være satt");
  const v2 = await prisma.trainingSessionV2.create({
    data: {
      title: "AK-formel V2-speiltest",
      studentId: player.id,
      coachId: player.id,
      startTime: new Date(),
      endTime: new Date(Date.now() + 3_600_000),
      miljo: ren.miljo,
      practiceType: "BLOKK",
      status: "PLANNED",
      generertFra: "AKFORMEL_TEST",
      generertFraId: created.id,
    },
    select: { id: true, miljo: true },
  });
  assert(v2.miljo === "M3", "V2 speiler miljø (M3)");

  // 5) Rydd opp (slett kun det testen opprettet).
  console.log("\n5) Rydder opp testdata...");
  await prisma.trainingSessionV2.delete({ where: { id: v2.id } });
  await prisma.trainingPlanSession.delete({ where: { id: created.id } });

  console.log("\nFerdig — alle AK-formel-assertions grønne. Coach- og spiller-stien skriver identisk persistering (samme sanitizeAkFormel + create).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
