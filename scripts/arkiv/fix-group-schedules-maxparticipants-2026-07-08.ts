/**
 * Additiv DDL-fiks for skjema-drift på group_schedules (gotcha: migrate dev / db push er blokkert).
 * Schema fikk maxParticipants 2026-07-07 uten at kolonnen ble lagt i DB → P2022 på /team-wang og /gfgk-junior.
 * Idempotent.
 *
 *   npx tsx scripts/fix-group-schedules-maxparticipants-2026-07-08.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function listColumns(): Promise<string[]> {
  const rows = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'group_schedules' ORDER BY ordinal_position;`,
  );
  return rows.map((r) => r.column_name);
}

async function main() {
  console.log("Før:", (await listColumns()).join(", "));

  await prisma.$executeRawUnsafe(
    `ALTER TABLE group_schedules ADD COLUMN IF NOT EXISTS "maxParticipants" integer;`,
  );

  console.log("Etter:", (await listColumns()).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
