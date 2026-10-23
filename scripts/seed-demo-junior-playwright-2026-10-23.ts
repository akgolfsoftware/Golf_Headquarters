/**
 * Seed en fiktiv junior-testspiller (13 år) for Playwright-testing av under-16-flyten.
 *
 * Lager:
 *  - Supabase Auth-bruker (bekreftet e-post, passord = SCREENTEST_PASSWORD).
 *  - Prisma User (PLAYER) med fødselsdato 2013 og foresattsamtykke gitt.
 *  - ParentRelation fra eksisterende test-forelder (screentest-parent@akgolf.test).
 *
 * Fiktiv person. Ingen demodata fabrikkeres utover selve kontoen og koblingene.
 * Idempotent. Krever at seed-screentest.ts og seed-screentest-parent.ts er kjørt.
 *
 * Kjør: npx tsx scripts/seed-demo-junior-playwright-2026-10-23.ts
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

const EMAIL = "screentest-junior@akgolf.test";
const PARENT_EMAIL = "screentest-parent@akgolf.test";
const PASSWORD = process.env.SCREENTEST_PASSWORD ?? "";
const NAME = "Sofie Testesen";
const FODT = new Date(Date.UTC(2013, 4, 15));

if (!PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler i .env.local");
  process.exit(1);
}

async function ensureAuthUser(): Promise<string> {
  const meta = { role: "PLAYER", firstName: "Sofie", lastName: "Testesen" };
  const created = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: meta,
  });
  if (created.data.user) return created.data.user.id;
  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list.data.users.find((u) => u.email === EMAIL);
  if (!existing) throw new Error(`Kunne ikke opprette eller finne auth-bruker: ${created.error?.message}`);
  await admin.auth.admin.updateUserById(existing.id, {
    password: PASSWORD,
    email_confirm: true,
    user_metadata: meta,
  });
  return existing.id;
}

async function main() {
  const parent = await prisma.user.findUnique({ where: { email: PARENT_EMAIL }, select: { id: true } });
  if (!parent) throw new Error(`Fant ikke ${PARENT_EMAIL}. Kjør scripts/seed-screentest-parent.ts først.`);

  const authId = await ensureAuthUser();
  const junior = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { authId, name: NAME, role: "PLAYER", tier: "PRO", dateOfBirth: FODT },
    create: { authId, email: EMAIL, name: NAME, role: "PLAYER", tier: "PRO", dateOfBirth: FODT },
  });

  await prisma.parentRelation.upsert({
    where: { parentId_childId: { parentId: parent.id, childId: junior.id } },
    update: { relationship: "Foresatt", approved: true },
    create: { parentId: parent.id, childId: junior.id, relationship: "Foresatt", approved: true },
  });
  await prisma.user.update({
    where: { id: junior.id },
    data: {
      requiresGuardianConsent: true,
      guardianConsentGivenAt: new Date(),
      guardianConsentByUserId: parent.id,
    },
  });

  console.log(`Ferdig: ${EMAIL} (${junior.id}), koblet til ${PARENT_EMAIL}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
