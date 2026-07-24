/**
 * Wipe testdata / demo-rot — ALDRI uten dry-run + eksplisitt bekreftelse.
 *
 * Bruk:
 *   npx tsx scripts/wipe-testdata.ts --dry-run
 *   npx tsx scripts/wipe-testdata.ts --execute --i-confirm-ja-slett
 *   npx tsx scripts/wipe-testdata.ts --execute --i-confirm-ja-slett --purge-auth
 *
 * Tier 1 (@akgolf.test m.fl.): tøm data; med --purge-auth også soft-delete User + auth.
 * Tier 2 (kjent demo på ekte e-post): tøm seed-data, BEHOLD konto.
 * EXCLUDE: beta-spillere + kjerne-admin (aldri rørt).
 */

import "./_env";

import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry-run") || !args.has("--execute");
const EXECUTE = args.has("--execute") && args.has("--i-confirm-ja-slett");
const PURGE_AUTH = args.has("--purge-auth");

/** Beta / ekte stall — HARD exclude. */
const EXCLUDE_EMAILS = new Set(
  [
    "fredrik.hovland@akgolf.no",
    "aksel.lind@akgolf.no",
    "ludvig.vanberg@akgolf.no",
    "jakob.holm@akgolf.no",
    "anders.rafshol@akgolf.no",
    "constanse.hauglid@akgolf.no",
    "viktoria.hammer@akgolf.no",
    "max.risvag@akgolf.no",
    "sondre.thogersen@akgolf.no",
    "marius.nesset@akgolf.no",
    "oskar.hammer@akgolf.no",
    "karl.braathen@akgolf.no",
    "filip.svendsen@akgolf.no",
    "elias.fosback@akgolf.no",
    "anders@akgolf.no",
    "markus@akgolf.no",
  ].map((e) => e.toLowerCase()),
);

/** Tier 2: tøm demo-data, behold konto. */
const TIER2_DEMO_EMAILS = new Set(
  [
    "akgolfgroup@gmail.com",
    "demo@akgolf.no",
    "anders+spiller@akgolfgroup.com",
    "anders.skarpnord@akgolf.no",
  ].map((e) => e.toLowerCase()),
);

type Tier = "tier1" | "tier2" | "exclude" | "skip";

function classify(email: string): Tier {
  const e = email.toLowerCase();
  if (EXCLUDE_EMAILS.has(e)) return "exclude";
  if (e.endsWith("@akgolf.test") || e.includes("screentest") || e.includes("coachtest")) {
    return "tier1";
  }
  if (TIER2_DEMO_EMAILS.has(e)) return "tier2";
  return "skip";
}

type Counts = Record<string, number>;

async function countForUser(userId: string): Promise<Counts> {
  const [
    rounds,
    trackMan,
    testResults,
    health,
    trainingPlans,
    sgInsights,
    clubTrends,
    sessionV2,
    tournamentEntries,
    notifications,
    fysPlans,
    planActions,
  ] = await Promise.all([
    prisma.round.count({ where: { userId } }),
    prisma.trackManSession.count({ where: { userId } }),
    prisma.testResult.count({ where: { userId } }),
    prisma.healthEntry.count({ where: { userId } }),
    prisma.trainingPlan.count({ where: { userId } }),
    prisma.sgInsight.count({ where: { userId } }),
    prisma.clubMetricTrend.count({ where: { userId } }),
    prisma.trainingSessionV2.count({ where: { studentId: userId } }),
    prisma.tournamentEntry.count({ where: { userId } }),
    prisma.notification.count({ where: { userId } }),
    prisma.fysiskPlan.count({ where: { userId } }),
    prisma.planAction.count({ where: { userId } }),
  ]);
  return {
    Round: rounds,
    TrackManSession: trackMan,
    TestResult: testResults,
    HealthEntry: health,
    TrainingPlan: trainingPlans,
    SgInsight: sgInsights,
    ClubMetricTrend: clubTrends,
    TrainingSessionV2: sessionV2,
    TournamentEntry: tournamentEntries,
    Notification: notifications,
    FysiskPlan: fysPlans,
    PlanAction: planActions,
  };
}

async function wipeUserData(
  userId: string,
  opts: { softAdmin: boolean },
): Promise<Counts> {
  // softAdmin: ADMIN/COACH på tier2 — tøm trenings-/demo-data, behold
  // PlanAction + Notification (kan være ekte coach-kø).
  const before = await countForUser(userId);

  await prisma.trackManSession.deleteMany({ where: { userId } });
  await prisma.testResult.deleteMany({ where: { userId } });
  await prisma.healthEntry.deleteMany({ where: { userId } });
  await prisma.sgInsight.deleteMany({ where: { userId } });
  await prisma.clubMetricTrend.deleteMany({ where: { userId } });
  await prisma.trainingSessionV2.deleteMany({ where: { studentId: userId } });
  await prisma.tournamentEntry.deleteMany({ where: { userId } });
  await prisma.fysiskPlan.deleteMany({ where: { userId } });
  await prisma.trainingPlan.deleteMany({ where: { userId } });
  await prisma.round.deleteMany({ where: { userId } });
  await prisma.document.deleteMany({ where: { userId } });

  if (!opts.softAdmin) {
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.planAction.deleteMany({ where: { userId } });
  }

  return before;
}

function sumCounts(c: Counts): number {
  return Object.values(c).reduce((a, b) => a + b, 0);
}

function printDbTarget() {
  const url = process.env.DATABASE_URL ?? "";
  const host = url.match(/@([^/:]+)/)?.[1] ?? "(ukjent)";
  console.log(`\nDB-target (host): ${host}`);
  console.log(`DATABASE_URL satt: ${url ? "ja" : "NEI"}`);
}

async function main() {
  printDbTarget();
  console.log(`\nModus: ${DRY ? "DRY-RUN (ingen sletting)" : "EXECUTE"}`);
  if (PURGE_AUTH) console.log("purge-auth: JA (Tier 1 soft-delete + Supabase auth)");

  if (!DRY && !EXECUTE) {
    console.error("\nAvbrutt: --execute krever også --i-confirm-ja-slett");
    process.exit(1);
  }

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, authId: true, deletedAt: true },
    orderBy: { email: "asc" },
  });

  type Row = {
    email: string;
    name: string | null;
    role: string;
    tier: Tier;
    counts: Counts;
    total: number;
  };

  const rows: Row[] = [];
  for (const u of users) {
    if (!u.email) continue;
    const tier = classify(u.email);
    if (tier === "skip") continue;
    const counts = tier === "exclude" ? {} : await countForUser(u.id);
    rows.push({
      email: u.email,
      name: u.name,
      role: u.role,
      tier,
      counts,
      total: sumCounts(counts),
    });
  }

  console.log("\n=== Wipe-kandidater ===\n");
  console.log(
    "E-post".padEnd(42) +
      "Tier".padEnd(10) +
      "Rader".padStart(6) +
      "  Navn",
  );
  console.log("-".repeat(80));

  let wipeTotal = 0;
  for (const r of rows) {
    const mark =
      r.tier === "exclude" ? "EXCLUDE" : r.tier === "tier1" ? "TIER1" : "TIER2";
    console.log(
      r.email.padEnd(42) +
        mark.padEnd(10) +
        String(r.total).padStart(6) +
        `  ${r.name ?? "—"} (${r.role})`,
    );
    if (r.tier !== "exclude" && r.total > 0) {
      const detail = Object.entries(r.counts)
        .filter(([, n]) => n > 0)
        .map(([k, n]) => `${k}=${n}`)
        .join(", ");
      console.log(`  → ${detail}`);
      wipeTotal += r.total;
    }
  }

  console.log("-".repeat(80));
  console.log(`Sum rader som vil tømmes (ekskl. EXCLUDE): ${wipeTotal}`);
  console.log(
    `EXCLUDE (urørt): ${rows.filter((r) => r.tier === "exclude").map((r) => r.email).join(", ") || "—"}`,
  );

  if (DRY) {
    console.log("\nDry-run ferdig. For å slette:");
    console.log("  1) Les listen over");
    console.log("  2) Si JA SLETT til AI (prod: JA SLETT prod)");
    console.log(
      "  3) npx tsx scripts/wipe-testdata.ts --execute --i-confirm-ja-slett",
    );
    console.log(
      "     (+ --purge-auth for å soft-slette Tier1-kontoer i auth)",
    );
    await prisma.$disconnect();
    return;
  }

  // EXECUTE
  let wipedUsers = 0;
  for (const u of users) {
    if (!u.email) continue;
    const tier = classify(u.email);
    if (tier !== "tier1" && tier !== "tier2") continue;

    const softAdmin =
      tier === "tier2" && (u.role === "ADMIN" || u.role === "COACH");
    const before = await wipeUserData(u.id, { softAdmin });
    const n = sumCounts(before);
    console.log(
      `✓ Tømte data for ${u.email} (${n} rader før${softAdmin ? ", softAdmin: beholdt PlanAction/Notification" : ""})`,
    );
    wipedUsers += 1;

    if (tier === "tier1" && PURGE_AUTH) {
      await prisma.user.update({
        where: { id: u.id },
        data: { deletedAt: new Date() },
      });
      if (u.authId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } },
        );
        const { error } = await admin.auth.admin.deleteUser(u.authId);
        if (error) {
          console.warn(`  ! Auth-delete feilet for ${u.email}: ${error.message}`);
        } else {
          console.log(`  ✓ Auth slettet for ${u.email}`);
        }
      }
    }
  }

  console.log(`\nFerdig. ${wipedUsers} brukere tømt.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
