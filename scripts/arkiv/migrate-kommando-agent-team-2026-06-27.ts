/**
 * scripts/migrate-kommando-agent-team-2026-06-27.ts
 *
 * Additiv migrasjon for AK Agency OS (Kommando) Etappe 3: oppretter
 * kommando_agent_runs + kommando_agent_steps via CREATE TABLE IF NOT EXISTS
 * mot DIRECT_URL (jf. gotchas.md). Rører kun egne tabeller. Idempotent.
 *
 * Kjøres med: npx tsx scripts/migrate-kommando-agent-team-2026-06-27.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS "kommando_agent_runs" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3)
  )`,
  `CREATE INDEX IF NOT EXISTS "kommando_agent_runs_userId_createdAt_idx"
    ON "kommando_agent_runs" ("userId", "createdAt")`,

  `CREATE TABLE IF NOT EXISTS "kommando_agent_steps" (
    "id" TEXT PRIMARY KEY,
    "runId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "output" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3)
  )`,
  `CREATE INDEX IF NOT EXISTS "kommando_agent_steps_runId_orderIndex_idx"
    ON "kommando_agent_steps" ("runId", "orderIndex")`,
];

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");
  for (const sql of STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.replace(/\s+/g, " ").slice(0, 70));
  }
  console.log("Ferdig — kommando_agent_runs + kommando_agent_steps klare.");
}

main()
  .catch((e) => {
    console.error("FEIL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
