"use server";

/**
 * 8c.7 — søk i øvelsesbanken fra økt-komponisten. Read-only; synlighet:
 * SYSTEM-øvelser + egne (spiller/coach). Zod-lett (kun strenger inn).
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export async function sokOvelser(
  query: string,
  area?: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN",
): Promise<{ id: string; name: string; pyramidArea: string }[]> {
  const user = await requirePortalUser();
  const q = query.trim().slice(0, 80);
  return prisma.exerciseDefinition.findMany({
    where: {
      AND: [
        q ? { name: { contains: q, mode: "insensitive" } } : {},
        area ? { pyramidArea: area } : {},
        { OR: [{ source: "SYSTEM" }, { createdBy: user.id }] },
      ],
    },
    orderBy: { name: "asc" },
    take: 12,
    select: { id: true, name: true, pyramidArea: true },
  });
}

/** Nåtilstand for økt-komponisten: formel-akser + drill-liste. */
export async function hentOktKomponist(sessionId: string): Promise<{
  ok: boolean;
  lFase?: string | null;
  miljo?: string | null;
  drills?: { exerciseId: string; navn: string; minutter: number | null; sett: number | null; reps: number | null; nivaa: "uten" | "lav" | "vanlig" }[];
}> {
  const user = await requirePortalUser();
  const okt = await prisma.trainingPlanSession.findFirst({
    where: {
      id: sessionId,
      // Eier eller coach/admin (coach-tilgang håndheves av workbench-siden).
      ...(user.role === "PLAYER" ? { plan: { userId: user.id } } : {}),
    },
    select: {
      lFase: true,
      miljo: true,
      drills: {
        orderBy: { orderIndex: "asc" },
        select: {
          exerciseId: true,
          repMinutter: true,
          repSett: true,
          repReps: true,
          sets: true,
          reps: true,
          repType: true,
          prPress: true,
          exercise: { select: { name: true } },
        },
      },
    },
  });
  if (!okt) return { ok: false };
  return {
    ok: true,
    lFase: okt.lFase,
    miljo: okt.miljo,
    drills: okt.drills.map((d) => ({
      exerciseId: d.exerciseId,
      navn: d.exercise.name,
      minutter: d.repMinutter,
      sett: d.repSett ?? d.sets,
      reps: d.repReps ?? d.reps,
      nivaa: d.repType === "SVINGER_UTEN_BALL" ? ("uten" as const) : d.prPress === "PR1" ? ("lav" as const) : ("vanlig" as const),
    })),
  };
}

/** Formen på PlanTemplateSession.drillsJson (zod-regelen for JSON-blobs). */
const MalDrillsSchema = z
  .array(
    z.object({
      exerciseId: z.string().min(1),
      sets: z.number().int().nullish(),
      reps: z.number().int().nullish(),
      csTarget: z.number().nullish(),
      notes: z.string().nullish(),
    }),
  )
  .max(20);

/**
 * Malens driller for «Ny økt»-arket: biblioteks-økter (PlanTemplateSession)
 * skal ta med innholdet sitt, ikke bare tittelen. Øvelsesnavn slås opp i
 * banken; rader uten kjent øvelse hoppes over.
 */
export async function hentMalOktDrills(templateSessionId: string): Promise<{
  ok: boolean;
  drills?: { exerciseId: string; navn: string; minutter: number | null; sett: number | null; reps: number | null; nivaa: "uten" | "lav" | "vanlig" }[];
}> {
  await requirePortalUser();
  const rad = await prisma.planTemplateSession.findUnique({
    where: { id: templateSessionId },
    select: { drillsJson: true },
  });
  if (!rad) return { ok: false };

  const parsed = MalDrillsSchema.safeParse(rad.drillsJson);
  if (!parsed.success) return { ok: true, drills: [] };

  const ovelser = await prisma.exerciseDefinition.findMany({
    where: { id: { in: parsed.data.map((d) => d.exerciseId) } },
    select: { id: true, name: true, durationMin: true },
  });
  const perId = new Map(ovelser.map((o) => [o.id, o]));

  return {
    ok: true,
    drills: parsed.data.flatMap((d) => {
      const ovelse = perId.get(d.exerciseId);
      if (!ovelse) return [];
      return [
        {
          exerciseId: d.exerciseId,
          navn: ovelse.name,
          minutter: ovelse.durationMin ?? null,
          sett: d.sets ?? null,
          reps: d.reps ?? null,
          nivaa: "vanlig" as const,
        },
      ];
    }),
  };
}
