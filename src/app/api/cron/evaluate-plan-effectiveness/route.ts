import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateEffectivenessScore,
  determineConfidence,
} from "@/lib/domain/ai-learning";

export async function GET(request: Request) {
  // Valider cron-kall (Vercel standard)
  const authHeader = request.headers.get("authorization");
  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    process.env.NODE_ENV === "production"
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    // Ser etter perioder som avsluttet i uken som gikk
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentlyCompletedPeriods = await prisma.periodBlock.findMany({
      where: {
        endDate: {
          gte: oneWeekAgo,
          lte: now,
        },
      },
      include: {
        seasonPlan: true, // For å få userId
      },
    });

    let processedRecords = 0;

    for (const period of recentlyCompletedPeriods) {
      const userId = period.seasonPlan.userId;

      // Hent alle drills gjennomført i denne perioden.
      // (Dette krever at Masterbrain sin 'TrainingDrillV2'-modell eller lignende logg avspørres)
      // Dette er en plassholder for logikken som avspør treningshistorikken fra databasen
      const drillsPerformed = await getDrillStatsForPeriod(
        userId,
        period.startDate,
        period.endDate,
      );

      for (const drill of drillsPerformed) {
        // Hopp over evaluering av FYS eller områder utenfor SG
        if (drill.pyramidArea === "FYS") continue;

        // Finn historisk SG før og etter perioden
        const baselineData = await getHistoricalSg(
          userId,
          drill.trainingArea,
          period.startDate,
        );
        const finalData = await getHistoricalSg(
          userId,
          drill.trainingArea,
          period.endDate,
        );

        if (baselineData.sg === null || finalData.sg === null) continue;

        const sgDelta = finalData.sg - baselineData.sg;
        const confidence = determineConfidence(
          drill.trainingArea,
          finalData.roundsSampled,
        );

        const { score, weight } = calculateEffectivenessScore({
          sgDelta,
          complianceRate: drill.complianceRate,
          confidence,
        });

        // Upsert sikrer at vi kan kjøre scriptet på nytt ved feil uten å duplisere effektivitetsdata
        await prisma.planEffectiveness.upsert({
          where: {
            userId_drillId_periodStart_periodEnd: {
              userId,
              drillId: drill.drillId,
              periodStart: period.startDate,
              periodEnd: period.endDate,
            },
          },
          update: {
            completedSessions: drill.completedSessions,
            complianceRate: drill.complianceRate,
            finalSg: finalData.sg,
            sgDelta,
            roundsSampledEnd: finalData.roundsSampled,
            confidence,
            effectivenessScore: score,
            weightInModel: weight,
          },
          create: {
            userId,
            planId: period.id,
            pyramidArea: drill.pyramidArea,
            trainingArea: drill.trainingArea,
            drillId: drill.drillId,
            periodStart: period.startDate,
            periodEnd: period.endDate,
            plannedSessions: drill.plannedSessions,
            completedSessions: drill.completedSessions,
            totalTimeMinutes: drill.totalTimeMinutes,
            complianceRate: drill.complianceRate,
            baselineSg: baselineData.sg,
            finalSg: finalData.sg,
            sgDelta,
            roundsSampledStart: baselineData.roundsSampled,
            roundsSampledEnd: finalData.roundsSampled,
            confidence,
            playerCategory: baselineData.playerCategory,
            effectivenessScore: score,
            weightInModel: weight,
          },
        });
        processedRecords++;
      }
    }

    return NextResponse.json({
      status: "success",
      message: `Processed ${processedRecords} effectiveness records.`,
    });
  } catch (error) {
    console.error("Plan Effectiveness Cron Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// ------------------------------------------------------------------
// Mock-funksjoner (Disse må erstattes med de faktiske Prisma-spørringene
// mot trenings- og SG-tabellene du allerede har i prosjektet).
// ------------------------------------------------------------------

async function getDrillStatsForPeriod(
  _userId: string,
  _startDate: Date,
  _endDate: Date,
): Promise<
  Array<{
    drillId: string;
    pyramidArea: import("@/generated/prisma/client").PyramidArea;
    trainingArea: import("@/generated/prisma/client").TrainingAreaCode;
    plannedSessions: number;
    completedSessions: number;
    totalTimeMinutes: number;
    complianceRate: number;
  }>
> {
  // Avspør TrainingSessionV2 / TrainingPlanSession mellom startDate og endDate
  return [
    {
      drillId: "ring-rundt-hull-1m-360",
      pyramidArea: "SLAG",
      trainingArea: "PUTT_0_3",
      plannedSessions: 4,
      completedSessions: 3,
      totalTimeMinutes: 45,
      complianceRate: 0.75,
    },
  ];
}

async function getHistoricalSg(
  _userId: string,
  _area: string,
  _date: Date,
): Promise<{
  sg: number | null;
  roundsSampled: number;
  playerCategory: import("@/generated/prisma/client").PlayerCategory;
}> {
  // Spør `dashboard.mv_topar_grunnlag` / `Round` opp til angitt dato
  return {
    sg: -1.2,
    roundsSampled: 18,
    playerCategory: "C",
  };
}
