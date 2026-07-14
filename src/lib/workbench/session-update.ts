/**
 * I6 · Inline-redigering av planlagt økt (Workbench «Valgt økt»-panelet):
 * tittel, pyramide-område, klokkeslett og varighet oppdateres ved trykk —
 * aldri slett-og-lag-ny. Delt kjerne for spiller- og coach-action (samme
 * mønster som executeSessionMove). V2-speilet holdes i synk og miljø-feltet
 * bevares (jf. session-move — ellers nullstilles det til "M2").
 */

import { z } from "zod";
import type { PrismaClient, PyramidArea } from "@/generated/prisma/client";
import { upsertV2ForPlanSession } from "@/lib/workbench/v2-sync";

// 8c.7: drill-rad i økt-komponisten. Intensitetsnivå (Anders: «uten · lav
// hastighet · vanlig») mappes til datamodellen: uten → repType
// SVINGER_UTEN_BALL; lav → BALLER_SLATT + PR1; vanlig → BALLER_SLATT + PR3.
export const OktDrillSchema = z.object({
  /** Fra øvelsesbanken. Mangler den: nyNavn oppretter egen øvelse. */
  exerciseId: z.string().min(1).optional(),
  nyNavn: z.string().trim().min(2).max(120).optional(),
  nyPyramidArea: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]).optional(),
  minutter: z.number().int().min(1).max(240).nullish(),
  sett: z.number().int().min(1).max(50).nullish(),
  reps: z.number().int().min(1).max(500).nullish(),
  nivaa: z.enum(["uten", "lav", "vanlig"]).default("vanlig"),
  /** Kobling til teknisk-plan-oppgave (runde 2 · 2026-07-14) — når satt,
   * logges reps automatisk mot oppgaven når drillen fullføres i live-økt. */
  positionTaskId: z.string().min(1).optional(),
});
export type OktDrillInput = z.infer<typeof OktDrillSchema>;

export const SessionUpdateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  pyramidArea: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]).optional(),
  hour: z.number().int().min(0).max(23).optional(),
  minute: z.number().int().min(0).max(59).optional(),
  durationMin: z.number().int().min(5).max(480).optional(),
  /** 8c.7: AK-formel-akser i økt-popupen (valgfritt — aldri sperre). */
  lFase: z.enum(["L_KROPP", "L_ARM", "L_KOLLE", "L_BALL", "L_AUTO"]).nullish(),
  miljo: z.enum(["M0", "M1", "M2", "M3", "M4", "M5"]).nullish(),
  /** 8c.7: full drill-liste (replace-semantikk). undefined = ikke rør drills. */
  drills: z.array(OktDrillSchema).max(20).optional(),
});
export type SessionUpdateInput = z.infer<typeof SessionUpdateSchema>;

export async function executeSessionUpdate(
  prisma: PrismaClient,
  input: {
    sessionId: string;
    playerId: string;
    patch: SessionUpdateInput;
    coachId?: string;
  },
): Promise<{ ok: boolean; error?: string }> {
  const parsed = SessionUpdateSchema.safeParse(input.patch);
  if (!parsed.success) return { ok: false, error: "Ugyldig endring." };
  const patch = parsed.data;
  if (Object.keys(patch).length === 0) return { ok: true };

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: input.sessionId },
    select: {
      id: true,
      scheduledAt: true,
      title: true,
      durationMin: true,
      pyramidArea: true,
      plan: { select: { userId: true } },
    },
  });
  if (!session || session.plan.userId !== input.playerId) {
    return { ok: false, error: "Økt ikke funnet" };
  }

  // Nytt klokkeslett på SAMME dato (dag flyttes via executeSessionMove).
  let scheduledAt = session.scheduledAt;
  if (patch.hour != null || patch.minute != null) {
    scheduledAt = new Date(session.scheduledAt);
    if (patch.hour != null) scheduledAt.setHours(patch.hour);
    if (patch.minute != null) scheduledAt.setMinutes(patch.minute);
  }

  const updated = await prisma.trainingPlanSession.update({
    where: { id: session.id },
    data: {
      ...(patch.title != null ? { title: patch.title } : {}),
      ...(patch.pyramidArea != null ? { pyramidArea: patch.pyramidArea as PyramidArea } : {}),
      ...(patch.durationMin != null ? { durationMin: patch.durationMin } : {}),
      ...(patch.lFase !== undefined ? { lFase: patch.lFase } : {}),
      ...(patch.miljo !== undefined ? { miljo: patch.miljo } : {}),
      scheduledAt,
    },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      durationMin: true,
      pyramidArea: true,
      miljo: true,
    },
  });

  // 8c.7: drill-liste (replace) — egen øvelse opprettes i banken ved behov.
  if (patch.drills) {
    await skrivSessionDrills(prisma, {
      sessionId: session.id,
      drills: patch.drills,
      fallbackPyramidArea: updated.pyramidArea,
      playerId: input.playerId,
      coachId: input.coachId,
    });
  }

  await upsertV2ForPlanSession({
    planSessionId: updated.id,
    playerId: input.playerId,
    title: updated.title,
    scheduledAt: updated.scheduledAt,
    durationMin: updated.durationMin,
    pyramidArea: updated.pyramidArea,
    coachId: input.coachId,
    miljo: updated.miljo,
  });

  return { ok: true };
}

/**
 * Skriv full drill-liste på en plan-økt (replace-semantikk) — egen øvelse
 * opprettes i banken ved behov. Delt mellom rediger (executeSessionUpdate)
 * og opprett (addWorkbenchSession), så «Ny økt» og «Rediger økt» har samme
 * kontrakt.
 */
export async function skrivSessionDrills(
  prisma: PrismaClient,
  input: {
    sessionId: string;
    drills: OktDrillInput[];
    fallbackPyramidArea: PyramidArea;
    playerId: string;
    coachId?: string;
  },
): Promise<void> {
  const rows: {
    sessionId: string;
    exerciseId: string;
    repsSets: string;
    sets: number | null;
    reps: number | null;
    repType: "SVINGER_UTEN_BALL" | "BALLER_SLATT" | "TID" | "SETT_REPS";
    repMinutter: number | null;
    repSett: number | null;
    repReps: number | null;
    prPress: "PR1" | "PR3" | null;
    orderIndex: number;
    positionTaskId: string | null;
  }[] = [];
  for (let i = 0; i < input.drills.length; i++) {
    const d = input.drills[i];
    let exerciseId = d.exerciseId ?? null;
    if (!exerciseId && d.nyNavn) {
      const ny = await prisma.exerciseDefinition.create({
        data: {
          name: d.nyNavn,
          pyramidArea: (d.nyPyramidArea ?? input.fallbackPyramidArea) as PyramidArea,
          source: input.coachId ? "COACH" : "PLAYER",
          createdBy: input.coachId ?? input.playerId,
        },
        select: { id: true },
      });
      exerciseId = ny.id;
    }
    if (!exerciseId) continue;
    const deler = [
      d.minutter != null ? `${d.minutter} min` : null,
      d.sett != null && d.reps != null ? `${d.sett}×${d.reps}` : null,
      d.nivaa === "uten" ? "uten ball" : d.nivaa === "lav" ? "lav hastighet" : null,
    ].filter(Boolean);
    rows.push({
      sessionId: input.sessionId,
      exerciseId,
      repsSets: deler.join(" · ") || "—",
      sets: d.sett ?? null,
      reps: d.reps ?? null,
      repType: d.nivaa === "uten" ? "SVINGER_UTEN_BALL" : d.minutter != null ? "TID" : d.sett != null ? "SETT_REPS" : "BALLER_SLATT",
      repMinutter: d.minutter ?? null,
      repSett: d.sett ?? null,
      repReps: d.reps ?? null,
      prPress: d.nivaa === "uten" ? null : d.nivaa === "lav" ? "PR1" : "PR3",
      orderIndex: i,
      positionTaskId: d.positionTaskId ?? null,
    });
  }
  await prisma.sessionDrill.deleteMany({ where: { sessionId: input.sessionId } });
  if (rows.length > 0) await prisma.sessionDrill.createMany({ data: rows });
}
