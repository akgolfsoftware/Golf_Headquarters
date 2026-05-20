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

    // Allerede fryst — returnér eksisterende snapshot.
    if (session.completedSummary) {
      const cached = session.completedSummary as unknown as SessionSummaryShape;
      return { success: true, data: { summary: cached } };
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
      data: { completedSummary: summary as unknown as object },
    });

    return { success: true, data: { summary } };
  } catch (err) {
    console.error("freezeSessionSummary failed", err);
    return { error: "Kunne ikke fryse økt-summary" };
  }
}
