/**
 * Seed 12 BETA-SPILLERE for AK Golf HQ (autorisert av Anders, beta-testing).
 *
 * Lager Supabase Auth-brukere (email_confirm, kjent passord) + kobler
 * Prisma User via authId + PlayerEnrollment mot coach anders@akgolf.no —
 * samme mønster som scripts/seed-natt-brukere.ts og
 * scripts/batch-import-gfgk-2026.ts.
 *
 * Idempotent: oppdaterer hvis brukeren finnes (på email), oppretter ellers.
 * role=PLAYER, passord=Golf2026, program=AK_ACADEMY (generisk voksen/individuell
 * beta-gruppe, ingen skole-tilknytning), tier=default (GRATIS — gratisForAlle
 * gjelder for beta).
 *
 * Ingen treningsdata seedes — spillerne legger inn ekte data selv i beta.
 *
 * Kjør: npx tsx scripts/seed-beta-spillere.ts
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

const COACH_EMAIL = "anders@akgolf.no";
const PASSWORD = "Golf2026";

type BetaSpiller = { email: string; name: string };

const SPILLERE: BetaSpiller[] = [
  { email: "fredrik.hovland@akgolf.no", name: "Fredrik Kjølberg Hovland" },
  { email: "aksel.lind@akgolf.no", name: "Aksel Lind" },
  { email: "ludvig.vanberg@akgolf.no", name: "Ludvig Vanberg" },
  { email: "jakob.holm@akgolf.no", name: "Jakob Holm" },
  { email: "anders.rafshol@akgolf.no", name: "Anders Rafshol" },
  { email: "constanse.hauglid@akgolf.no", name: "Constanse Hauglid" },
  { email: "viktoria.hammer@akgolf.no", name: "Viktoria Hammer" },
  { email: "max.risvag@akgolf.no", name: "Max Risvåg" },
  { email: "sondre.thogersen@akgolf.no", name: "Sondre Undhjem Thøgersen" },
  { email: "marius.nesset@akgolf.no", name: "Marius Nesset" },
  { email: "oskar.hammer@akgolf.no", name: "Oskar Hammer" },
  { email: "karl.braathen@akgolf.no", name: "Karl Ludvig Braathen" },
  { email: "filip.svendsen@akgolf.no", name: "Filip Svendsen" },
  { email: "elias.fosback@akgolf.no", name: "Elias Fosback" },
];

/** Opprett (eller hent + resett passord på) Supabase Auth-bruker og returner auth-id. */
async function ensureAuthUser(u: BetaSpiller): Promise<string> {
  const created = await admin.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { role: "PLAYER", name: u.name, kilde: "beta-2026-07" },
  });
  if (created.data.user) {
    console.log(`Auth-bruker opprettet: ${u.email} (${created.data.user.id})`);
    return created.data.user.id;
  }
  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list.data.users.find((x) => x.email === u.email);
  if (!existing) throw new Error(`Kunne ikke opprette eller finne auth-bruker ${u.email}: ${created.error?.message}`);
  await admin.auth.admin.updateUserById(existing.id, {
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { role: "PLAYER", name: u.name, kilde: "beta-2026-07" },
  });
  console.log(`Auth-bruker fantes — passord resatt: ${u.email} (${existing.id})`);
  return existing.id;
}

async function main() {
  console.log("Seeder 12 beta-spillere for AK Golf HQ...\n");

  // ── Navnekollisjon-sjekk (rapporteres, rører ikke eksisterende rader) ──
  const navn = SPILLERE.map((s) => s.name);
  const kollisjoner = await prisma.user.findMany({
    where: { name: { in: navn } },
    select: { id: true, name: true, email: true, role: true },
  });
  if (kollisjoner.length > 0) {
    console.log("── Navnekollisjoner (eksisterende rader, IKKE rørt) ──");
    for (const k of kollisjoner) {
      console.log(`  "${k.name}" finnes allerede: ${k.email} (role=${k.role}, id=${k.id})`);
    }
    console.log("");
  }

  const coach = await prisma.user.findUnique({ where: { email: COACH_EMAIL }, select: { id: true } });
  if (!coach) throw new Error(`Fant ikke coach-bruker ${COACH_EMAIL} — kjør seed-natt-brukere.ts først.`);

  for (const s of SPILLERE) {
    const authId = await ensureAuthUser(s);
    const row = await prisma.user.upsert({
      where: { email: s.email },
      update: { authId, name: s.name, role: "PLAYER" },
      create: { authId, email: s.email, name: s.name, role: "PLAYER" },
    });
    console.log(`Prisma User: ${s.email} → ${row.id} (${row.role})`);

    const eksisterendeEnrollment = await prisma.playerEnrollment.findFirst({
      where: { userId: row.id, endedAt: null },
    });
    if (eksisterendeEnrollment) {
      console.log(`  Enrollment finnes allerede (aktiv): ${eksisterendeEnrollment.id}`);
    } else {
      const enrollment = await prisma.playerEnrollment.create({
        data: {
          userId: row.id,
          program: "AK_ACADEMY",
          coachId: coach.id,
          notes: "Beta-testing 2026-07 — seedet av seed-beta-spillere.ts",
        },
      });
      console.log(`  PlayerEnrollment opprettet: ${enrollment.id} → coach=${COACH_EMAIL}`);
    }
  }

  // ── Verifikasjon ──
  console.log("\n── Verifikasjon ──");
  for (const s of SPILLERE) {
    const row = await prisma.user.findUnique({
      where: { email: s.email },
      include: { enrollmentsAsPlayer: { where: { endedAt: null } } },
    });
    if (!row) {
      console.error(`MANGLER: ${s.email}`);
      continue;
    }
    const enr = row.enrollmentsAsPlayer[0];
    console.log(
      `OK ${s.email} — id=${row.id} navn="${row.name}" role=${row.role} tier=${row.tier} authId=${row.authId} enrollment=${enr ? `${enr.program}/coach=${enr.coachId}` : "MANGLER"}`,
    );
  }

  console.log("\nFerdig.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
