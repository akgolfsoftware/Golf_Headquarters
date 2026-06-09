/**
 * Seed en innloggbar test-COACH (ADMIN) for AgencyOS skjerm-paritet.
 * Speiler seed-screentest.ts, men ADMIN-rolle for full /admin-tilgang.
 *
 * Login: coachtest@akgolf.test / Screentest123!  (Anders Kristiansen, kanon coach)
 * Idempotent. Kjør: npx tsx scripts/seed-screentest-coach.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = "coachtest@akgolf.test";
const PASSWORD = "Screentest123!";
const NAME = "Anders Kristiansen";

async function ensureAuthUser(): Promise<string> {
  const created = await admin.auth.admin.createUser({
    email: EMAIL, password: PASSWORD, email_confirm: true,
    user_metadata: { role: "ADMIN", tier: "PRO", firstName: "Anders", lastName: "Kristiansen" },
  });
  if (created.data.user) { console.log(`Auth-bruker opprettet: ${created.data.user.id}`); return created.data.user.id; }
  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list.data.users.find((u) => u.email === EMAIL);
  if (!existing) throw new Error(`Kunne ikke opprette/finne auth-bruker: ${created.error?.message}`);
  await admin.auth.admin.updateUserById(existing.id, {
    password: PASSWORD, email_confirm: true,
    user_metadata: { role: "ADMIN", tier: "PRO", firstName: "Anders", lastName: "Kristiansen" },
  });
  console.log(`Auth-bruker fantes — passord resatt: ${existing.id}`);
  return existing.id;
}

async function main() {
  console.log("Seeder skjermtest-coach (Anders Kristiansen, ADMIN)...");
  const authId = await ensureAuthUser();
  const coach = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { authId, name: NAME, role: "ADMIN", tier: "PRO", homeClub: "Oslo GK" },
    create: { authId, email: EMAIL, name: NAME, role: "ADMIN", tier: "PRO", homeClub: "Oslo GK" },
  });
  console.log(`Coach-User: ${coach.id}`);
  console.log(`\n✓ Ferdig. Login: ${EMAIL} / ${PASSWORD}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
