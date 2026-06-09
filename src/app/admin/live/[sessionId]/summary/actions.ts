"use server";

// CoachHQ · Live-økt summary — server actions
//
// lagreCoachVurdering — coach vurderer øktens kvalitet (1–5) og skriver et
// fritekst-notat. Vurderingen merges forsiktig inn i TrainingSessionV2
// .completedSummary (uten å overskrive spiller-frosne nøkler), og notatet
// lagres i .notes.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const VurderingSchema = z.object({
  sessionId: z.string().min(1, "Økt-ID er påkrevd"),
  rating: z.number().int().min(1, "Velg 1–5").max(5, "Velg 1–5"),
  notat: z.string().max(4000, "Maks 4000 tegn"),
});

export type CoachVurderingResult = { ok: true } | { ok: false; error: string };

/**
 * Lagrer coachens øktvurdering. completedSummary er et JSON-objekt som
 * spiller-siden allerede kan ha frosset (SessionSummaryShape). Vi leser det
 * eksisterende objektet, beholder alle nøklene, og legger kun til coach-feltene.
 */
export async function lagreCoachVurdering(
  sessionId: string,
  rating: number,
  notat: string,
): Promise<CoachVurderingResult> {
  const parsed = VurderingSchema.safeParse({ sessionId, rating, notat });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  let me;
  try {
    me = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  } catch {
    return { ok: false, error: "Ikke tilgang" };
  }

  const trimmet = parsed.data.notat.trim();

  try {
    const session = await prisma.trainingSessionV2.findUnique({
      where: { id: parsed.data.sessionId },
      select: { id: true, completedSummary: true },
    });
    if (!session) return { ok: false, error: "Økt ikke funnet" };

    // Behold eksisterende summary-objekt (spiller-frosne nøkler) og legg til
    // coach-felt. Hvis feltet er null/ikke-objekt, start fra tomt objekt.
    const raw: unknown = session.completedSummary;
    const eksisterende =
      raw && typeof raw === "object" && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};

    const oppdatert: Record<string, unknown> = {
      ...eksisterende,
      coachRating: parsed.data.rating,
      coachRatedAt: new Date().toISOString(),
      coachRatedById: me.id,
    };

    await prisma.trainingSessionV2.update({
      where: { id: parsed.data.sessionId },
      data: {
        completedSummary: oppdatert as object,
        notes: trimmet.length > 0 ? trimmet : null,
      },
    });
  } catch (err) {
    console.error("[live/summary] lagreCoachVurdering feilet", err);
    return { ok: false, error: "Kunne ikke lagre vurdering" };
  }

  revalidatePath(`/admin/live/${parsed.data.sessionId}/summary`);
  return { ok: true };
}
