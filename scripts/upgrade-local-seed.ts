/** Kun syntetiske data i oppgraderingens særskilte lokale database. Leser aldri .env. */
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
const status = JSON.parse(readFileSync("tmp/upgrade/local/status.json", "utf8")) as Record<string, string>;
const api = new URL(status.API_URL), db = new URL(status.DB_URL);
if (api.origin !== "http://127.0.0.1:55321" || db.hostname !== "127.0.0.1" || db.port !== "55322" || db.pathname !== "/postgres") throw new Error("Bare isolert oppgraderingsmiljø tillatt.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: status.DB_URL }) });
const password = randomBytes(24).toString("base64url");
async function main() { try {
  const marker = await prisma.$queryRaw<{ marker: string | null }[]>`select obj_description(oid, 'pg_namespace') as marker from pg_namespace where nspname='public'`;
  if (marker[0]?.marker !== "AK_HQ_UPGRADE_LOCAL_SYNTHETIC_20261012") throw new Error("Oppgraderingens lokale databaseidentitet mangler.");
  if (process.argv.includes("advance-test-day")) {
    const today = new Date(`${new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date())}T00:00:00Z`);
    await prisma.workbenchSession.updateMany({ where: { id: { in: ["upgrade-wb", "upgrade-foreign-wb"] }, playerId: { in: ["upgrade-player", "upgrade-foreign"] }, status: "PUBLISHED" }, data: { date: today } });
    await prisma.trainingSessionV2.updateMany({ where: { id: "upgrade-v2", studentId: "upgrade-player", status: "PLANNED" }, data: { startTime: new Date(today.getTime() + 10 * 3600000), endTime: new Date(today.getTime() + 11 * 3600000) } });
    await prisma.trainingPlanSession.updateMany({ where: { id: "upgrade-plan-session", planId: "upgrade-plan", status: "PLANNED" }, data: { scheduledAt: new Date(today.getTime() + 14 * 3600000) } });
    console.log("Kun syntetiske, urørte testøkter er flyttet til dagens testdato."); return;
  }
  if (process.argv.includes("refresh-credentials")) {
    const users = await prisma.user.findMany({ where: { id: { in: ["upgrade-coach", "upgrade-player", "upgrade-foreign", "upgrade-admin"] } }, select: { id: true, authId: true, email: true, name: true, role: true } });
    if (users.length !== 4 || users.some(u => u.email !== `${u.id}@akgolf.test`)) throw new Error("Testkontoenes identitet kunne ikke bekreftes.");
    for (const user of users) {
      const response = await fetch(`${api.origin}/auth/v1/admin/users/${user.authId}`, { method: "PUT", headers: {
        Authorization: `Bearer ${status.SERVICE_ROLE_KEY}`, apikey: status.SERVICE_ROLE_KEY, "Content-Type": "application/json",
      }, body: JSON.stringify({ password, email_confirm: true }) });
      if (!response.ok) throw new Error("Lokal testinnlogging kunne ikke gjenopprettes.");
    }
    writeFileSync("tmp/upgrade/local/creds.json", JSON.stringify({ users, password }), { mode: 0o600 });
    console.log("Innlogging for de fire eksisterende syntetiske kontoene gjenopprettet. Appdata beholdt.");
    return;
  }
  if (await prisma.user.count()) throw new Error("Testkontoer finnes allerede. Ingen eksisterende data er endret.");
  const health = await fetch(`${api.origin}/auth/v1/health`, { headers: { apikey: status.ANON_KEY } });
  if (!health.ok) throw new Error("Lokal Auth er ikke frisk.");
  const users: { id: string; email: string; name: string; role: "PLAYER" | "COACH" | "ADMIN" }[] = [];
  for (const actor of [
    { id: "upgrade-coach", email: "upgrade-coach@akgolf.test", name: "Syntetisk coach", role: "COACH" as const },
    { id: "upgrade-player", email: "upgrade-player@akgolf.test", name: "Syntetisk spiller", role: "PLAYER" as const },
    { id: "upgrade-foreign", email: "upgrade-foreign@akgolf.test", name: "Syntetisk annen spiller", role: "PLAYER" as const },
    { id: "upgrade-admin", email: "upgrade-admin@akgolf.test", name: "Syntetisk administrator", role: "ADMIN" as const },
  ]) {
    const response = await fetch(`${api.origin}/auth/v1/admin/users`, { method: "POST", headers: {
      Authorization: `Bearer ${status.SERVICE_ROLE_KEY}`, apikey: status.SERVICE_ROLE_KEY, "Content-Type": "application/json",
    }, body: JSON.stringify({ email: actor.email, password, email_confirm: true }) });
    const auth = await response.json() as { id?: string };
    if (!response.ok || !auth.id) throw new Error("Syntetisk Auth-konto kunne ikke opprettes.");
    await prisma.user.create({ data: { ...actor, authId: auth.id, tier: actor.role === "PLAYER" ? "PRO" : "GRATIS",
      trialEndsAt: new Date("2099-01-01T00:00:00Z"), preferences: { onboarding: { stepCompleted: 7, isComplete: true } } } });
    users.push(actor);
  }
  await prisma.playerEnrollment.create({ data: { userId: "upgrade-player", coachId: "upgrade-coach", program: "AK_ACADEMY" } });
  const date = new Date(`${new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date())}T00:00:00Z`);
  for (const [id, playerId] of [["upgrade-wb", "upgrade-player"], ["upgrade-foreign-wb", "upgrade-foreign"]]) {
    await prisma.workbenchSession.create({ data: { id, playerId, coachId: "upgrade-coach", date,
      startMinute: 9 * 60, durationMinutes: 50, title: "Syntetisk Workbench-økt", pyramid: "TEK", status: "PUBLISHED",
      blockType: "OEKT", origin: "COACH", createdBy: "upgrade-coach", publishedAt: new Date(), publishedBy: "upgrade-coach",
      location: "Syntetisk treningsanlegg", notes: "Lokalt testgrunnlag", drills: { create: [{ title: "Syntetisk avstandskontroll",
        description: "Slå mot valgt mål og registrer faktisk antall.", durationMinutes: 25, sortOrder: 0,
        akFormel: { pyramid: "TEK", area: "INNSPILL_100" } }, { title: "Syntetisk startlinje", durationMinutes: 25,
        sortOrder: 1, akFormel: { pyramid: "SLAG", area: "PUTTING" } }] } } });
  }
  // Den eldre modellens obligatoriske M-felt er kun kompatibilitetsdata; brukes ikke i ny UI.
  await prisma.trainingSessionV2.create({ data: { id: "upgrade-v2", title: "Syntetisk eksisterende V2-økt", studentId: "upgrade-player",
    coachId: "upgrade-coach", startTime: new Date(date.getTime() + 10 * 3600000), endTime: new Date(date.getTime() + 11 * 3600000),
    miljo: "M1", practiceType: "BLOKK", status: "PLANNED", drills: { create: [{ name: "Syntetisk V2-øvelse", sortOrder: 0,
      durationMinutes: 50, pyramide: "TEK", repType: "BALLER_SLATT", repAntall: 7 }] } } });
  await prisma.trainingPlan.create({ data: { id: "upgrade-plan", userId: "upgrade-player", name: "Syntetisk eksisterende plan",
    startDate: date, isActive: true, status: "ACTIVE", createdById: "upgrade-coach" } });
  await prisma.exerciseDefinition.create({ data: { id: "upgrade-exercise", name: "Syntetisk øvelse", pyramidArea: "TEK", durationMin: 40 } });
  await prisma.trainingPlanSession.create({ data: { id: "upgrade-plan-session", planId: "upgrade-plan", title: "Syntetisk planøkt",
    scheduledAt: new Date(date.getTime() + 14 * 3600000), durationMin: 40, pyramidArea: "TEK", status: "PLANNED",
    drills: { create: [{ exerciseId: "upgrade-exercise", repsSets: "4 baller", orderIndex: 0, pyramidArea: "TEK", repType: "BALLER_SLATT", repAntall: 4 }] } } });
  writeFileSync("tmp/upgrade/local/creds.json", JSON.stringify({ users, password }), { mode: 0o600 });
  console.log("Fire syntetiske kontoer og tre separate øktmodeller opprettet. Ingen ekte data eller utsendinger.");
} finally { await prisma.$disconnect(); } }
main().catch(() => { console.error("Oppretting av syntetisk testgrunnlag mislyktes. Ingen produksjonsdata berørt."); process.exitCode = 1; });
