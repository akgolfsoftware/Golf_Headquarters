"use server";

// Sprint 3+ — Live-økt summary actions
//
// freezeSessionSummary — beregner stats fra alle SessionDrillInstance + SessionSet
// for en fullført økt og persisterer dem som JSON i TrainingSessionV2.completedSummary.
// Kalles fra summary-page når økten er COMPLETED og snapshot ennå ikke finnes.

import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { error: string };

const FreezeInput = z.object({
  sessionId: z.string().min(1),
});

export type SummaryDrillSnapshot = {
  id: string;
  name: string;
  pyramide: string | null;
  plannedSets: number | null;
  completedSets: number;
  totalReps: number;
  skipped: boolean;
};

export type SessionSummaryShape = {
  frozenAt: string; // ISO
  totalReps: number;
  totalDrills: number;
  completedDrills: number;
  skippedDrills: number;
  varighetMin: number | null;
  drills: SummaryDrillSnapshot[];
};

// Zod-validering av JSON-blobben (CLAUDE.md-regel: aldri rå `as` på Prisma-Json).
// Brukes til å avgjøre om completedSummary inneholder et EKTE spiller-snapshot —
// coach-feltene (coachBrief/coachMessages fra /admin/live) gjør feltet truthy
// uten at snapshot finnes, så truthiness alene er ikke nok.
const SummarySchema = z.object({
  frozenAt: z.string(),
  totalReps: z.number(),
  totalDrills: z.number(),
  completedDrills: z.number(),
  skippedDrills: z.number(),
  varighetMin: z.number().nullable(),
  drills: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      pyramide: z.string().nullable(),
      plannedSets: z.number().nullable(),
      completedSets: z.number(),
      totalReps: z.number(),
      skipped: z.boolean(),
    }),
  ),
});

export async function freezeSessionSummary(
  input: z.infer<typeof FreezeInput>,
): Promise<ActionResult<{ summary: SessionSummaryShape }>> {
  const user = await requirePortalUser();
  const parsed = FreezeInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const session = await prisma.trainingSessionV2.findUnique({
      where: { id: parsed.data.sessionId },
      select: {
        id: true,
        studentId: true,
        coachId: true,
        startTime: true,
        endTime: true,
        completedSummary: true,
        drillInstances: {
          select: {
            id: true,
            drillName: true,
            pyramideArea: true,
            plannedSets: true,
            sets: {
              select: {
                id: true,
                reps: true,
                completedAt: true,
              },
            },
          },
        },
      },
    });
    if (!session) return { error: "Økt ikke funnet" };
    if (
      session.studentId !== user.id &&
      user.role !== "ADMIN" &&
      user.role !== "COACH"
    ) {
      return { error: "Ikke tilgang" };
    }

    // Allerede fryst — returnér eksisterende snapshot. Validert med zod:
    // et objekt som bare har coach-felt (brief sendt før økten) er IKKE fryst.
    const rawSummary: unknown = session.completedSummary;
    const eksisterende =
      rawSummary && typeof rawSummary === "object" && !Array.isArray(rawSummary)
        ? (rawSummary as Record<string, unknown>)
        : {};
    const frosset = SummarySchema.safeParse(eksisterende);
    if (frosset.success) {
      return { success: true, data: { summary: frosset.data } };
    }

    let totalReps = 0;
    let completedDrills = 0;
    let skippedDrills = 0;
    const drills: SummaryDrillSnapshot[] = session.drillInstances.map((d) => {
      const completedSets = d.sets.filter((s) => s.completedAt != null).length;
      const drillReps = d.sets.reduce((acc, s) => acc + (s.reps ?? 0), 0);
      // Ingen skippedAt-felt i schema enda — drill regnes som "hoppet over"
      // hvis det ikke har sett eller ingen sett er fullført.
      const hasSets = d.sets.length > 0;
      const skipped = !hasSets || completedSets === 0;
      totalReps += drillReps;
      if (skipped) skippedDrills += 1;
      else if (
        d.plannedSets != null
          ? completedSets >= d.plannedSets
          : completedSets > 0
      ) {
        completedDrills += 1;
      }
      return {
        id: d.id,
        name: d.drillName,
        pyramide: d.pyramideArea ?? null,
        plannedSets: d.plannedSets,
        completedSets,
        totalReps: drillReps,
        skipped,
      };
    });

    const varighetMin =
      session.endTime && session.startTime
        ? Math.max(
            0,
            Math.round(
              (session.endTime.getTime() - session.startTime.getTime()) / 60000,
            ),
          )
        : null;

    const summary: SessionSummaryShape = {
      frozenAt: new Date().toISOString(),
      totalReps,
      totalDrills: session.drillInstances.length,
      completedDrills,
      skippedDrills,
      varighetMin,
      drills,
    };

    await prisma.trainingSessionV2.update({
      where: { id: parsed.data.sessionId },
      // Merge: coach-felt (coachBrief/coachMessages) som allerede ligger i
      // completedSummary skal overleve frysingen — ikke erstatt hele objektet.
      data: { completedSummary: { ...eksisterende, ...summary } as object },
    });

    return { success: true, data: { summary } };
  } catch (err) {
    console.error("freezeSessionSummary failed", err);
    return { error: "Kunne ikke fryse økt-summary" };
  }
}
