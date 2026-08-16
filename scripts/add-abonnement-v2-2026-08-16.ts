/**
 * Abonnement v2 (plan A1): skille coaching- og PlayerHQ-abonnement + årspris
 * + vinn-tilbake-grunnlag.
 *
 * - subscriptions: kind/plan/interval/cancelAtPeriodEnd/stripePriceId,
 *   unikhet flyttes fra userId til (userId, kind)
 * - users: profilType (STANDARD|TALENT) + trialEndsAt
 * - ny tabell winback_tilbud (RLS deny-by-default)
 *
 * Backfill av eksisterende rader skjer i samme kjøring, med forhåndsrapport
 * (radene listes med utledet kind/plan FØR noe skrives — loggen legges i
 * PR-beskrivelsen som dokumentasjon).
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert
 * (se .claude/rules/gotchas.md §Schema-endringer). Kirurgisk DDL mot
 * DIRECT_URL er den dokumenterte veien. Idempotent.
 *
 *   npx tsx scripts/add-abonnement-v2-2026-08-16.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── 1. Nye kolonner (additivt) ────────────────────────────────────────────
  for (const ddl of [
    `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "kind" text NOT NULL DEFAULT 'PLAYERHQ';`,
    `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "plan" text;`,
    `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "interval" text;`,
    `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" boolean NOT NULL DEFAULT false;`,
    `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "stripePriceId" text;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "profilType" text NOT NULL DEFAULT 'STANDARD';`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "trialEndsAt" timestamp(3);`,
  ]) {
    await prisma.$executeRawUnsafe(ddl);
  }

  // ── 2. Forhåndsrapport: radene slik de står, med utledet kind/plan ───────
  const rader = await prisma.$queryRawUnsafe<
    {
      id: string;
      userId: string;
      tier: string;
      status: string;
      monthlyCredits: number;
      stripeSubscriptionId: string | null;
      kind: string;
      plan: string | null;
    }[]
  >(
    `SELECT id, "userId", tier::text, status::text, "monthlyCredits",
            "stripeSubscriptionId", kind, plan
       FROM subscriptions ORDER BY "createdAt";`,
  );
  console.log(`\nFØR backfill — ${rader.length} rader:`);
  for (const r of rader) {
    const utledetKind = r.monthlyCredits > 0 ? "COACHING" : "PLAYERHQ";
    const utledetPlan =
      r.monthlyCredits >= 4
        ? "PERFORMANCE_PRO"
        : r.monthlyCredits > 0
          ? "PERFORMANCE"
          : r.stripeSubscriptionId
            ? "PLAYERHQ_MND"
            : r.tier !== "GRATIS"
              ? "MANUELL"
              : "(anker — null)";
    console.log(
      `  ${r.id} tier=${r.tier} status=${r.status} credits=${r.monthlyCredits} ` +
        `stripe=${r.stripeSubscriptionId ? "ja" : "nei"} → kind=${utledetKind} plan=${utledetPlan}`,
    );
  }

  // ── 3. Backfill (kun rader som ikke alt er backfilt — idempotent) ────────
  const coaching = await prisma.$executeRawUnsafe(
    `UPDATE subscriptions
        SET kind = 'COACHING',
            plan = CASE WHEN "monthlyCredits" >= 4 THEN 'PERFORMANCE_PRO' ELSE 'PERFORMANCE' END,
            "interval" = 'month'
      WHERE "monthlyCredits" > 0 AND plan IS NULL;`,
  );
  const playerhqStripe = await prisma.$executeRawUnsafe(
    `UPDATE subscriptions
        SET plan = 'PLAYERHQ_MND', "interval" = 'month'
      WHERE kind = 'PLAYERHQ' AND "stripeSubscriptionId" IS NOT NULL AND plan IS NULL;`,
  );
  const manuelle = await prisma.$executeRawUnsafe(
    `UPDATE subscriptions
        SET plan = 'MANUELL'
      WHERE kind = 'PLAYERHQ' AND "stripeSubscriptionId" IS NULL
        AND tier <> 'GRATIS' AND plan IS NULL;`,
  );
  const cancelFlagg = await prisma.$executeRawUnsafe(
    `UPDATE subscriptions
        SET "cancelAtPeriodEnd" = true
      WHERE status = 'CANCELLED' AND "currentPeriodEnd" > now()
        AND "cancelAtPeriodEnd" = false;`,
  );
  console.log(
    `\nBackfill: coaching=${coaching}, playerhq-stripe=${playerhqStripe}, manuelle=${manuelle}, cancelAtPeriodEnd=${cancelFlagg}`,
  );

  // ── 4. Indeksbytte: userId-unikhet → (userId, kind) ──────────────────────
  // Den NYE unike indeksen legges alltid. Den GAMLE droppes kun med eksplisitt
  // flagg: gammel prod-kode (før A1-deploy) gjør upserts med ON CONFLICT
  // ("userId") og ville feilet uten den. Rekkefølge: kjør uten flagg FØR
  // merge → deploy A1 → kjør `--dropp-gammel-indeks` rett etter deploy.
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_userId_kind_key"
       ON subscriptions ("userId", "kind");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "subscriptions_userId_idx" ON subscriptions ("userId");`,
  );
  if (process.argv.includes("--dropp-gammel-indeks")) {
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "subscriptions_userId_key";`);
    console.log("Gammel unik indeks subscriptions_userId_key droppet.");
  } else {
    console.log(
      "Gammel unik indeks BEHOLDT (kjør med --dropp-gammel-indeks etter at A1-koden er deployet).",
    );
  }

  // ── 5. winback_tilbud ────────────────────────────────────────────────────
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS winback_tilbud (
      "id"                     text NOT NULL,
      "userId"                 text NOT NULL,
      "coachingSubscriptionId" text NOT NULL,
      "stripeSubscriptionId"   text,
      "utlopsDato"             timestamp(3),
      "status"                 text NOT NULL DEFAULT 'TILBUDT',
      "sendtAt"                timestamp(3),
      "paaminnelseSendtAt"     timestamp(3),
      "besvartAt"              timestamp(3),
      "akseptertPlan"          text,
      "createdAt"              timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"              timestamp(3) NOT NULL,
      CONSTRAINT winback_tilbud_pkey PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "winback_tilbud_userId_coachingSubscriptionId_key"
       ON winback_tilbud ("userId", "coachingSubscriptionId");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "winback_tilbud_status_utlopsDato_idx"
       ON winback_tilbud ("status", "utlopsDato");`,
  );
  const fkUser = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'winback_tilbud_userId_fkey'
     ) AS exists;`,
  );
  if (!fkUser[0]?.exists) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE winback_tilbud ADD CONSTRAINT "winback_tilbud_userId_fkey"
       FOREIGN KEY ("userId") REFERENCES users(id)
       ON DELETE CASCADE ON UPDATE CASCADE;`,
    );
  }
  // Abonnementsdata — aldri lesbart med anon-nøkkel (deny-by-default, ingen policies).
  await prisma.$executeRawUnsafe(`ALTER TABLE winback_tilbud ENABLE ROW LEVEL SECURITY;`);

  // ── 6. Verifikasjon ──────────────────────────────────────────────────────
  const etter = await prisma.$queryRawUnsafe<{ kind: string; plan: string | null; count: bigint }[]>(
    `SELECT kind, plan, count(*) FROM subscriptions GROUP BY kind, plan ORDER BY kind, plan;`,
  );
  console.log("\nETTER backfill (kind × plan):");
  for (const r of etter) console.log(`  ${r.kind} / ${r.plan ?? "(null)"}: ${r.count}`);

  const idx = await prisma.$queryRawUnsafe<{ indexname: string }[]>(
    `SELECT indexname FROM pg_indexes WHERE tablename = 'subscriptions' ORDER BY indexname;`,
  );
  console.log(`\nIndekser på subscriptions: ${idx.map((i) => i.indexname).join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
