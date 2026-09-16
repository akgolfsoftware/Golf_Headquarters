/**
 * OW-3 fase 2 — engangsmigrering: kopierer training_plan_sessions-rader inn i
 * workbench_sessions. Idempotent — hopper over rader som allerede er migrert
 * (matcher på migrertFraTrainingPlanSessionId).
 *
 * Skriver IKKE til training_plan_sessions — kildene beholdes til fase 6.
 * Barnetabellene (session_drills, training_plan_session_logs, clubs_practiced)
 * hadde 0 rader ved kartleggingen 16.09.2026 — ingen barnedata å migrere.
 *
 * coachId: TrainingPlan.createdById er null på alle 12 kilderadene (verifisert
 * 16.09.2026) — WorkbenchSession.coachId er påkrevd. Faller tilbake til Anders'
 * ADMIN-bruker (samme mønster som andre eksisterende WorkbenchSession-rader for
 * samme testspiller).
 *
 * Se docs/planer/ow-3-en-oekt-modell-2026-09-16.md.
 *
 *   npx tsx scripts/ow3-fase2-migrer-training-plan-sessions-2026-09-16.ts
 *   npx tsx scripts/ow3-fase2-migrer-training-plan-sessions-2026-09-16.ts --dry-run
 */
import "./_env";
import { prisma } from "@/lib/prisma";

const FALLBACK_COACH_ID = "cmacgoers0000andersadmin01"; // akgolfgroup@gmail.com (ADMIN)

const STATUS_TIL_WB: Record<string, string> = {
  PLANNED: "PUBLISHED",
  ACTIVE: "IN_PROGRESS",
  PAUSED: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ABANDONED: "CANCELLED",
  SKIPPED: "SKIPPED",
  CANCELLED: "CANCELLED",
};

const OSLO_DATO = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const OSLO_TID = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Oslo",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Oslo-lokal kalenderdato som UTC-midnatt (gotcha: dato-strenger → UTC-midnatt). */
function osloDatoUtcMidnatt(d: Date): Date {
  const iso = OSLO_DATO.format(d); // YYYY-MM-DD
  return new Date(`${iso}T00:00:00.000Z`);
}

/** Minutter fra midnatt, Oslo lokal tid. */
function osloMinutterFraMidnatt(d: Date): number {
  const [t, m] = OSLO_TID.format(d).split(":");
  return parseInt(t, 10) * 60 + parseInt(m, 10);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const kilder = await prisma.trainingPlanSession.findMany({
    include: { plan: { select: { userId: true, createdById: true } } },
    orderBy: { scheduledAt: "asc" },
  });

  console.log(`${kilder.length} training_plan_sessions-rader funnet.`);

  let migrert = 0;
  let hoppet = 0;

  for (const s of kilder) {
    const finnes = await prisma.workbenchSession.findUnique({
      where: { migrertFraTrainingPlanSessionId: s.id },
      select: { id: true },
    });
    if (finnes) {
      hoppet++;
      continue;
    }

    const data = {
      playerId: s.plan.userId,
      coachId: s.plan.createdById ?? FALLBACK_COACH_ID,
      date: osloDatoUtcMidnatt(s.scheduledAt),
      startMinute: osloMinutterFraMidnatt(s.scheduledAt),
      durationMinutes: s.durationMin,
      title: s.title,
      pyramid: s.pyramidArea,
      status: STATUS_TIL_WB[s.status] ?? "PUBLISHED",
      environment: s.environment ?? null,
      location: s.location,
      origin: "COACH",
      createdBy: s.plan.createdById ?? FALLBACK_COACH_ID,
      planId: s.planId,
      rationale: s.rationale,
      skillArea: s.skillArea,
      pressureLevel: s.pressureLevel,
      pPosisjoner: s.pPosisjoner,
      maalsetning: s.maalsetning,
      liveSnapshot: s.liveSnapshot ?? undefined,
      lFase: s.lFase,
      miljo: s.miljo,
      csNivaa: s.csNivaa,
      migrertFraTrainingPlanSessionId: s.id,
    };

    if (dryRun) {
      console.log("[dry-run]", s.id, "→", data.title, data.date.toISOString().slice(0, 10), `${data.startMinute} min`);
    } else {
      await prisma.workbenchSession.create({ data });
    }
    migrert++;
  }

  console.log(`${dryRun ? "[dry-run] Ville migrert" : "Migrert"}: ${migrert}. Hoppet over (alt migrert): ${hoppet}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
