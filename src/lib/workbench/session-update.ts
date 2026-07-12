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

export const SessionUpdateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  pyramidArea: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]).optional(),
  hour: z.number().int().min(0).max(23).optional(),
  minute: z.number().int().min(0).max(59).optional(),
  durationMin: z.number().int().min(5).max(480).optional(),
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
