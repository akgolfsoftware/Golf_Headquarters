/** Only this browser test's synthetic fixture, after target and DB identity checks. */
import { readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import pg from "pg";
import { assertLocalUsersDatabase, assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";
async function main() {
const targets = assertLocalUsersTargets(process.env);
const { ownerId, authId, email } = JSON.parse(readFileSync(0, "utf8"));
if (!ownerId.startsWith("synthetic-result-browser-") || !email.endsWith("@akgolf.test")) throw new Error("Synthetic identity required");
const sql = new pg.Pool({ connectionString: targets.database.toString() });
await assertLocalUsersDatabase(sql); await sql.end();
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: targets.database.toString() }) });
try {
  await db.user.create({ data: { id: ownerId, authId, email, name: "Syntetisk resultatspiller", role: "PLAYER", tier: "PRO",
    profilKilde: "LOCAL_SYNTHETIC_TEST", dateOfBirth: new Date("2000-01-01"), preferences: { onboarding: { stepCompleted: 7 } } } });
  const plan = await db.technicalPlan.create({ data: { userId: ownerId, opprettetAvId: ownerId, navn: "Syntetisk nettleserplan", status: "ACTIVE", startDato: new Date(),
    positions: { create: { pNummer: "P1.0", navn: "Oppstilling", sortOrder: 0, tasks: { create: { tittel: "Syntetisk oppgave", pyramide: "TEK", omraade: "Tee Total", koller: [], sortOrder: 0, motorikk: "AUTO" } } } } }, include: { positions: { include: { tasks: true } } } });
  const taskId = plan.positions[0].tasks[0].id;
  const session = await db.trainingSessionV2.create({ data: { title: "Syntetisk resultatkjede", coachId: ownerId, studentId: ownerId,
    startTime: new Date(), endTime: new Date(Date.now() + 1800000), status: "IN_PROGRESS", miljo: "M0", practiceType: "BLOKK",
    drills: { create: [
      { name: "Syntetisk teknikk", sortOrder: 0, durationMinutes: 15, repetitions: 30, repType: "BALLER_SLATT", pyramide: "TEK", positionTaskId: taskId },
      { name: "Syntetisk styrke", sortOrder: 1, durationMinutes: 5, pyramide: "FYS", fysTreningstype: "styrke" },
    ] } }, include: { drills: { orderBy: { sortOrder: "asc" } } } });
  const sessionId = session.id, drillId = session.drills[0].id, physicalId = session.drills[1].id;
  await db.drillLogV2.create({ data: { drillId: physicalId, loggedBy: ownerId, repsTotal: 6, repsHit: 6, successRate: 100, notes: "Styrke: 90 kg × 6 (RIR 2)" } });
  process.stdout.write(JSON.stringify({ sessionId, taskId, drillId, physicalId }));
} finally { await db.$disconnect(); }

}
main().catch(error => { console.error("Synthetic browser fixture failed:", error.name, error.code ?? "unknown"); process.exitCode = 1; });
