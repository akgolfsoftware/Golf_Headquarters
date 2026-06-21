/**
 * Seed en innloggbar test-FORELDER for skjerm-paritet-screenshots av Foreldreportalen.
 *
 * Lager:
 *  - Supabase Auth-bruker (email_confirm, kjent passord) — så Playwright kan logge inn.
 *  - Prisma User (role PARENT) koblet via authId.
 *  - ParentRelation til den eksisterende test-SPILLEREN (screentest@akgolf.test / Øyvind Rohjan).
 *
 * VIKTIG: Dette fabrikkerer INGEN forelder-data. Forelderen ser spillerens EKTE data
 * (økter, bookinger, betalinger, varsler) via parent_relations. Kun selve test-kontoen
 * + koblingen opprettes — samme prinsipp som screentest-spilleren er en test-konto.
 *
 * Idempotent. Kjør: npx tsx scripts/seed-screentest-parent.ts
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

const PARENT_EMAIL = "screentest-parent@akgolf.test";
const PARENT_PASSWORD = "Screentest123!";
const PARENT_NAME = "Kari Rohjan";
const CHILD_EMAIL = "screentest@akgolf.test"; // eksisterende test-spiller (Øyvind Rohjan)

/** Opprett (eller hent) Supabase Auth-bruker og returner auth-id. */
async function ensureAuthUser(): Promise<string> {
  const created = await admin.auth.admin.createUser({
    email: PARENT_EMAIL,
    password: PARENT_PASSWORD,
    email_confirm: true,
    user_metadata: { role: "PARENT", firstName: "Kari", lastName: "Rohjan" },
  });
  if (created.data.user) {
    console.log(`Auth-bruker opprettet: ${created.data.user.id}`);
    return created.data.user.id;
  }
  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list.data.users.find((u) => u.email === PARENT_EMAIL);
  if (!existing) throw new Error(`Kunne ikke opprette eller finne auth-bruker: ${created.error?.message}`);
  await admin.auth.admin.updateUserById(existing.id, {
    password: PARENT_PASSWORD,
    email_confirm: true,
    user_metadata: { role: "PARENT", firstName: "Kari", lastName: "Rohjan" },
  });
  console.log(`Auth-bruker fantes — passord resatt: ${existing.id}`);
  return existing.id;
}

async function main() {
  console.log("Seeder skjermtest-forelder (Kari Rohjan)...");

  const child = await prisma.user.findUnique({ where: { email: CHILD_EMAIL }, select: { id: true, name: true } });
  if (!child) {
    throw new Error(`Fant ikke test-spilleren ${CHILD_EMAIL}. Kjør scripts/seed-screentest.ts først.`);
  }

  const authId = await ensureAuthUser();

  // 1. Prisma User (PARENT) koblet via authId
  const parent = await prisma.user.upsert({
    where: { email: PARENT_EMAIL },
    update: { authId, name: PARENT_NAME, role: "PARENT", avatarUrl: null },
    create: { authId, email: PARENT_EMAIL, name: PARENT_NAME, role: "PARENT" },
  });
  console.log(`Forelder-User: ${parent.id}`);

  // 2. ParentRelation → test-spilleren (ekte data via kobling, ingen fabrikering)
  await prisma.parentRelation.upsert({
    where: { parentId_childId: { parentId: parent.id, childId: child.id } },
    update: { relationship: "Foresatt", approved: true },
    create: { parentId: parent.id, childId: child.id, relationship: "Foresatt", approved: true },
  });
  console.log(`Kobling: ${PARENT_NAME} → ${child.name} (${child.id})`);

  // 3. GDPR-samtykke gitt av forelderen (modellerer den ekte samtykke-handlingen,
  //    ikke fabrikert metrikk) — så Foreldreportalen viser «Samtykke aktivt».
  await prisma.user.update({
    where: { id: child.id },
    data: {
      requiresGuardianConsent: true,
      guardianConsentGivenAt: new Date(),
      guardianConsentByUserId: parent.id,
    },
  });
  console.log(`Samtykke registrert for ${child.name} (gitt av ${PARENT_NAME}).`);

  console.log(`\n✓ Ferdig. Login: ${PARENT_EMAIL} / ${PARENT_PASSWORD}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
