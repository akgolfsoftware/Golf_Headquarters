/**
 * Additiv DDL for Workbench-kjernen (natt-plan 25.08.2026, Loop 1).
 *
 * Oppretter workbench_sessions + workbench_drills. Rører INGEN eksisterende
 * tabell og utvider ingen enum — status/pyramide/origin lagres som tekst.
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md §Schema-endringer). Kirurgisk
 * CREATE TABLE mot DIRECT_URL er den dokumenterte veien.
 *
 * Idempotent — trygg å kjøre flere ganger.
 *
 *   npx tsx scripts/add-workbench-sessions-2026-08-25.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS workbench_sessions (
      "id"                   text NOT NULL,
      "playerId"             text NOT NULL,
      "coachId"              text NOT NULL,
      "groupId"              text,
      "sourceGroupSessionId" text,
      "date"                 date NOT NULL,
      "startMinute"          integer NOT NULL,
      "durationMinutes"      integer NOT NULL,
      "title"                text NOT NULL,
      "pyramid"              text NOT NULL,
      "status"               text NOT NULL DEFAULT 'DRAFT',
      "blockType"            text NOT NULL DEFAULT 'OEKT',
      "environment"          text,
      "practiceType"         text,
      "location"             text,
      "notes"                text,
      "origin"               text NOT NULL DEFAULT 'COACH',
      "needsPlayerApproval"  boolean NOT NULL DEFAULT false,
      "approvalStatus"       text,
      "localOverride"        boolean NOT NULL DEFAULT false,
      "publishedAt"          timestamp(3),
      "publishedBy"          text,
      "isAgentProposal"      boolean NOT NULL DEFAULT false,
      "planActionId"         text,
      "createdBy"            text NOT NULL,
      "createdAt"            timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"            timestamp(3) NOT NULL,
      CONSTRAINT workbench_sessions_pkey PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS workbench_drills (
      "id"              text NOT NULL,
      "sessionId"       text NOT NULL,
      "title"           text NOT NULL,
      "description"     text,
      "durationMinutes" integer NOT NULL,
      "akFormel"        jsonb NOT NULL,
      "techniqueFocus"  text,
      "sourceId"        text,
      "sortOrder"       integer NOT NULL,
      CONSTRAINT workbench_drills_pkey PRIMARY KEY ("id"),
      CONSTRAINT workbench_drills_sessionId_fkey
        FOREIGN KEY ("sessionId") REFERENCES workbench_sessions("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  for (const sql of [
    `CREATE INDEX IF NOT EXISTS "workbench_sessions_playerId_date_idx" ON workbench_sessions ("playerId", "date");`,
    `CREATE INDEX IF NOT EXISTS "workbench_sessions_coachId_date_idx"  ON workbench_sessions ("coachId", "date");`,
    `CREATE INDEX IF NOT EXISTS "workbench_sessions_groupId_idx"       ON workbench_sessions ("groupId");`,
    `CREATE INDEX IF NOT EXISTS "workbench_sessions_status_idx"        ON workbench_sessions ("status");`,
    `CREATE INDEX IF NOT EXISTS "workbench_drills_sessionId_sortOrder_idx" ON workbench_drills ("sessionId", "sortOrder");`,
  ]) {
    await prisma.$executeRawUnsafe(sql);
  }

  console.log("workbench_sessions + workbench_drills OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
