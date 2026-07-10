/**
 * Seed 3 innloggbare brukere for AK Golf HQ (nattseed, redesign/v2).
 *
 * Lager Supabase Auth-brukere (email_confirm, kjent passord) + kobler
 * Prisma User via authId — samme mønster som scripts/seed-screentest.ts.
 * Idempotent: oppdaterer hvis brukeren finnes (på email), oppretter ellers.
 *
 * 1. Øyvind Rohjan  — demo@akgolf.no   / demo123!         — role=ADMIN, tier=PRO
 *    (DEMO m/ dual tilgang: ADMIN gir tilgang til både /admin/AgencyOS og /portal)
 * 2. Anders Kristiansen — anders@akgolf.no / AndersGolf2026! — role=ADMIN (Head Coach)
 * 3. Markus Røinås Pedersen — markus@akgolf.no / MarkusGolf2026! — role=COACH
 *
 * Kjør: npx tsx scripts/seed-natt-brukere.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

type SeedUser = {
  email: string;
  password: string;
  name: string;
  role: "ADMIN" | "COACH";
  tier?: "GRATIS" | "PRO";
  hcp?: number;
  homeClub?: string;
};

const USERS: SeedUser[] = [
  { email: "demo@akgolf.no", password: "demo123!", name: "Øyvind Rohjan", role: "ADMIN", tier: "PRO", hcp: 4.2, homeClub: "Oslo GK" },
  { email: "anders@akgolf.no", password: "AndersGolf2026!", name: "Anders Kristiansen", role: "ADMIN" },
  { email: "markus@akgolf.no", password: "MarkusGolf2026!", name: "Markus Røinås Pedersen", role: "COACH" },
];

/** Opprett (eller hent + resett passord på) Supabase Auth-bruker og returner auth-id. */
async function ensureAuthUser(u: SeedUser): Promise<string> {
  const created = await admin.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { role: u.role, name: u.name },
  });
  if (created.data.user) {
    console.log(`Auth-bruker opprettet: ${u.email} (${created.data.user.id})`);
    return created.data.user.id;
  }
  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list.data.users.find((x) => x.email === u.email);
  if (!existing) throw new Error(`Kunne ikke opprette eller finne auth-bruker ${u.email}: ${created.error?.message}`);
  await admin.auth.admin.updateUserById(existing.id, {
    password: u.password,
    email_confirm: true,
    user_metadata: { role: u.role, name: u.name },
  });
  console.log(`Auth-bruker fantes — passord resatt: ${u.email} (${existing.id})`);
  return existing.id;
}

async function main() {
  console.log("Seeder 3 natt-brukere for AK Golf HQ...");
  const opprettet: string[] = [];

  for (const u of USERS) {
    const authId = await ensureAuthUser(u);
    const row = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        authId,
        name: u.name,
        role: u.role,
        ...(u.tier ? { tier: u.tier } : {}),
        ...(u.hcp !== undefined ? { hcp: u.hcp } : {}),
        ...(u.homeClub ? { homeClub: u.homeClub } : {}),
      },
      create: {
        authId,
        email: u.email,
        name: u.name,
        role: u.role,
        ...(u.tier ? { tier: u.tier } : {}),
        ...(u.hcp !== undefined ? { hcp: u.hcp } : {}),
        ...(u.homeClub ? { homeClub: u.homeClub } : {}),
      },
    });
    console.log(`Prisma User: ${u.email} → ${row.id} (${row.role})`);
    opprettet.push(u.email);
  }

  // ── Verifikasjon ──
  console.log("\n── Verifikasjon ──");
  for (const u of USERS) {
    const row = await prisma.user.findUnique({ where: { email: u.email } });
    if (!row) {
      console.error(`MANGLER: ${u.email}`);
      continue;
    }
    console.log(`OK ${u.email} — id=${row.id} navn="${row.name}" role=${row.role} tier=${row.tier} hcp=${row.hcp ?? "-"} homeClub=${row.homeClub ?? "-"} authId=${row.authId}`);
  }

  console.log("\n✓ Ferdig.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
