/**
 * Seed de 3 kanon-demo/coach-brukerne for auth-bølgen (v2) — Øyvind, Anders, Markus.
 *
 * Auth-bølgen (8 skjermer: login, signup, forgot-password, reset-password,
 * check-email, logget-ut, bankid, guardian-consent + samtykke-venter) trenger
 * innloggbare kontoer og — for guardian-consent/samtykke-venter — en reell
 * ParentInvitation med gyldig token. Denne scripten gjenbruker eksisterende
 * kontoer der de finnes (screentest@akgolf.test / coachtest@akgolf.test) og
 * legger til det som mangler:
 *
 *  - Øyvind Rohjan (PLAYER) — gjenbruker screentest@akgolf.test hvis den
 *    finnes (rik demo-data fra seed-screentest.ts), ellers oppretter en tynn
 *    konto. Rører ALDRI eksisterende rik data.
 *  - Anders Kristiansen (ADMIN) — gjenbruker coachtest@akgolf.test hvis den
 *    finnes, ellers oppretter en tynn konto.
 *  - Markus Røinås Pedersen (COACH, ikke ADMIN) — ekte coach-navn fra
 *    markedssidene (CLAUDE.md-kanon). Ny konto: gir en COACH-rolle å teste
 *    CBAC-differensiert AgencyOS-tilgang mot (Anders=ADMIN har alt).
 *  - En mindreårig demo-spiller «Junior Testesen» som AWAITING guardian
 *    consent + en ParentInvitation med token — så /v2-guardian-consent/[token]
 *    og /v2-samtykke-venter har ekte data å vise. Skriver ut token ved slutt.
 *
 * Idempotent. Kjør: npx tsx scripts/seed-natt-brukere.ts
 */

import "./_env";

import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = process.env.SCREENTEST_PASSWORD ?? "";
if (!PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler i .env.local");
  process.exit(1);
}

const OYVIND = { email: "screentest@akgolf.test", name: "Øyvind Rohjan" };
const ANDERS = { email: "coachtest@akgolf.test", name: "Anders Kristiansen" };
const MARKUS = { email: "markustest@akgolf.test", name: "Markus Røinås Pedersen" };
const JUNIOR = { email: "junior-samtykke@akgolf.test", name: "Junior Testesen" };
const GUARDIAN_EMAIL = "guardian-samtykke@akgolf.test";

/** Opprett (eller hent+resett) en Supabase Auth-bruker og returner auth-id. */
async function ensureAuthUser(email: string, role: string, firstName: string, lastName: string): Promise<string> {
  const created = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { role, firstName, lastName },
  });
  if (created.data.user) {
    console.log(`Auth-bruker opprettet: ${email} (${created.data.user.id})`);
    return created.data.user.id;
  }
  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list.data.users.find((u) => u.email === email);
  if (!existing) throw new Error(`Kunne ikke opprette eller finne auth-bruker: ${created.error?.message}`);
  await admin.auth.admin.updateUserById(existing.id, {
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { role, firstName, lastName },
  });
  console.log(`Auth-bruker fantes: ${email} (${existing.id})`);
  return existing.id;
}

async function main() {
  console.log("Seeder natt-brukere (Øyvind/Anders/Markus) for auth-bølgen...\n");

  // 1. Øyvind Rohjan — PLAYER. Rør aldri eksisterende rik demo-data.
  const oyvindExisting = await prisma.user.findUnique({ where: { email: OYVIND.email } });
  if (oyvindExisting) {
    console.log(`Øyvind Rohjan finnes allerede (${oyvindExisting.id}) — beholder eksisterende data.`);
  } else {
    const authId = await ensureAuthUser(OYVIND.email, "PLAYER", "Øyvind", "Rohjan");
    const created = await prisma.user.create({
      data: { authId, email: OYVIND.email, name: OYVIND.name, role: "PLAYER", tier: "PRO", hcp: 4.2, homeClub: "Oslo GK" },
    });
    console.log(`Øyvind Rohjan opprettet (${created.id}).`);
  }

  // 2. Anders Kristiansen — ADMIN.
  const andersExisting = await prisma.user.findUnique({ where: { email: ANDERS.email } });
  if (andersExisting) {
    console.log(`Anders Kristiansen finnes allerede (${andersExisting.id}) — beholder eksisterende data.`);
  } else {
    const authId = await ensureAuthUser(ANDERS.email, "ADMIN", "Anders", "Kristiansen");
    const created = await prisma.user.create({
      data: { authId, email: ANDERS.email, name: ANDERS.name, role: "ADMIN" },
    });
    console.log(`Anders Kristiansen opprettet (${created.id}).`);
  }

  // 3. Markus Røinås Pedersen — COACH (ikke ADMIN — for CBAC-differensiert testing).
  const markusAuthId = await ensureAuthUser(MARKUS.email, "COACH", "Markus", "Røinås Pedersen");
  const markus = await prisma.user.upsert({
    where: { email: MARKUS.email },
    update: { authId: markusAuthId, name: MARKUS.name, role: "COACH" },
    create: { authId: markusAuthId, email: MARKUS.email, name: MARKUS.name, role: "COACH" },
  });
  console.log(`Markus Røinås Pedersen: ${markus.id}\n`);

  // 4. Foresatt-konto (kun for koblingen — testes ikke selv innlogget her).
  const guardianAuthId = await ensureAuthUser(GUARDIAN_EMAIL, "PARENT", "Foresatt", "Testesen");
  const guardian = await prisma.user.upsert({
    where: { email: GUARDIAN_EMAIL },
    update: { authId: guardianAuthId, name: "Foresatt Testesen", role: "PARENT" },
    create: { authId: guardianAuthId, email: GUARDIAN_EMAIL, name: "Foresatt Testesen", role: "PARENT" },
  });
  console.log(`Foresatt Testesen: ${guardian.id}`);

  // 5. Mindreårig demo-spiller AWAITING guardian consent — for guardian-consent + samtykke-venter.
  const juniorAuthId = await ensureAuthUser(JUNIOR.email, "PLAYER", "Junior", "Testesen");
  const fjortenAarSiden = new Date();
  fjortenAarSiden.setFullYear(fjortenAarSiden.getFullYear() - 14);
  const junior = await prisma.user.upsert({
    where: { email: JUNIOR.email },
    update: {
      authId: juniorAuthId,
      name: JUNIOR.name,
      role: "PLAYER",
      dateOfBirth: fjortenAarSiden,
      requiresGuardianConsent: true,
      guardianConsentGivenAt: null,
      guardianConsentByUserId: null,
    },
    create: {
      authId: juniorAuthId,
      email: JUNIOR.email,
      name: JUNIOR.name,
      role: "PLAYER",
      dateOfBirth: fjortenAarSiden,
      requiresGuardianConsent: true,
    },
  });
  console.log(`Junior Testesen (14 år, venter samtykke): ${junior.id}`);

  // 6. ParentInvitation med gyldig token — for /v2-guardian-consent/[token].
  await prisma.parentInvitation.deleteMany({ where: { playerId: junior.id, acceptedAt: null } });
  const invitation = await prisma.parentInvitation.create({
    data: {
      playerId: junior.id,
      email: GUARDIAN_EMAIL,
      relation: "GUARDIAN",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`ParentInvitation opprettet — token: ${invitation.token}`);
  console.log(`  → /v2-guardian-consent/${invitation.token}`);
  console.log(`  → /v2-samtykke-venter (logg inn som ${JUNIOR.email})`);

  console.log(`\n✓ Ferdig. Passord for alle nye kontoer = SCREENTEST_PASSWORD i .env.local`);
  console.log(`  Øyvind (spiller):  ${OYVIND.email}`);
  console.log(`  Anders (admin):    ${ANDERS.email}`);
  console.log(`  Markus (coach):    ${MARKUS.email}`);
  console.log(`  Foresatt:          ${GUARDIAN_EMAIL}`);
  console.log(`  Junior (venter):   ${JUNIOR.email}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
