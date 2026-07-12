/**
 * scripts/migrate-kommando-tables-2026-06-25.ts
 *
 * Additiv, kirurgisk migrasjon for AK Agency OS (Kommando) Etappe 1 (jf. gotchas.md):
 * oppretter kommando_tasks + kommando_chats + kommando_messages via
 * CREATE TABLE IF NOT EXISTS mot DIRECT_URL. Rører KUN egne tabeller — ingen drift
 * på eksisterende skjema. Idempotent (IF NOT EXISTS).
 *
 * Kjøres med: npx tsx scripts/migrate-kommando-tables-2026-06-25.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS "kommando_tasks" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "kommando_tasks_userId_status_createdAt_idx"
    ON "kommando_tasks" ("userId", "status", "createdAt")`,

  `CREATE TABLE IF NOT EXISTS "kommando_chats" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "kommando_chats_userId_updatedAt_idx"
    ON "kommando_chats" ("userId", "updatedAt")`,

  `CREATE TABLE IF NOT EXISTS "kommando_messages" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "kommando_messages_userId_conversationId_createdAt_idx"
    ON "kommando_messages" ("userId", "conversationId", "createdAt")`,
];

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");
  for (const sql of STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.replace(/\s+/g, " ").slice(0, 70));
  }
  console.log("Ferdig — kommando_tasks + kommando_chats + kommando_messages klare.");
}

main()
  .catch((e) => {
    console.error("FEIL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
