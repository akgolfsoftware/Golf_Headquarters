"use server";

/**
 * AgencyOS · Live-økt — server actions (T9, 27.08.2026).
 *
 * Flyttet hit fra de pensjonerte `(legacy)/live/[sessionId]/{active,brief,
 * summary}/actions.ts` — samme logikk, samme rollesjekk og samme
 * datafelt (completedSummary.coachMessages[]/.coachBrief/.coachRating),
 * kun ny plassering. Alle tre handlinger vises nå som seksjoner i
 * `/admin/agencyos/live/[sessionId]` (LiveOktCoachTrainLock) i stedet for
 * tre separate ruter — se docs/natt/T9-DONE.md.
 *
 * sendLiveMelding — coach sender en rask melding mens spillerens økt pågår.
 * sendBriefTilSpiller — coach skriver et fokuspunkt som vises før økten.
 * lagreCoachVurdering — coach vurderer øktens kvalitet (1–5) + notat.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { hasRole } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-tracking";

type ActionResult = { ok: true } | { ok: false; error: string };

async function hentEidSesjon(sessionId: string, meId: string, erAdmin: boolean) {
  return prisma.trainingSessionV2.findFirst({
    where: { id: sessionId, ...(erAdmin ? {} : { coachId: meId }) },
    select: { id: true, completedSummary: true },
  });
}

function somObjekt(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
}

const MeldingSchema = z.object({
  sessionId: z.string().min(1, "Økt-ID er påkrevd"),
  melding: z.string().min(1, "Skriv en melding").max(1000, "Maks 1000 tegn"),
});

type CoachLiveMelding = { content: string; ts: string; sentById: string };

export async function sendLiveMelding(sessionId: string, melding: string): Promise<ActionResult> {
  const parsed = MeldingSchema.safeParse({ sessionId, melding });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };

  // Direkte rolle-sjekk i stedet for requirePortalUser: den kaster redirect(),
  // som try/catch her ville svelget — en action skal svare { ok: false }.
  const me = await getCurrentUser();
  if (!me || !hasRole(me.role, ["COACH", "ADMIN"])) return { ok: false, error: "Ikke tilgang" };

  const trimmet = parsed.data.melding.trim();
  const ny: CoachLiveMelding = { content: trimmet, ts: new Date().toISOString(), sentById: me.id };

  try {
    const session = await hentEidSesjon(parsed.data.sessionId, me.id, me.role === "ADMIN");
    if (!session) return { ok: false, error: "Økt ikke funnet" };

    const eksisterende = somObjekt(session.completedSummary);
    const rawMsgs = eksisterende.coachMessages;
    const meldinger: CoachLiveMelding[] = Array.isArray(rawMsgs) ? (rawMsgs as CoachLiveMelding[]) : [];

    await prisma.trainingSessionV2.update({
      where: { id: parsed.data.sessionId },
      data: { completedSummary: { ...eksisterende, coachMessages: [...meldinger, ny] } as object },
    });
  } catch (error) {
    await logError({ context: "admin.live.sendLiveMelding", error, meta: { sessionId: parsed.data.sessionId } });
    return { ok: false, error: "Kunne ikke sende melding" };
  }

  revalidatePath(`/admin/agencyos/live/${parsed.data.sessionId}`);
  return { ok: true };
}

const BriefSchema = z.object({
  sessionId: z.string().min(1, "Økt-ID er påkrevd"),
  melding: z.string().min(1, "Skriv en melding").max(4000, "Maks 4000 tegn"),
});

export async function sendBriefTilSpiller(sessionId: string, melding: string): Promise<ActionResult> {
  const parsed = BriefSchema.safeParse({ sessionId, melding });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };

  const me = await getCurrentUser();
  if (!me || !hasRole(me.role, ["COACH", "ADMIN"])) return { ok: false, error: "Ikke tilgang" };

  const trimmet = parsed.data.melding.trim();

  try {
    const session = await hentEidSesjon(parsed.data.sessionId, me.id, me.role === "ADMIN");
    if (!session) return { ok: false, error: "Økt ikke funnet" };

    const eksisterende = somObjekt(session.completedSummary);
    await prisma.trainingSessionV2.update({
      where: { id: parsed.data.sessionId },
      data: {
        completedSummary: {
          ...eksisterende,
          coachBrief: { melding: trimmet, sentAt: new Date().toISOString(), sentById: me.id },
        } as object,
      },
    });
  } catch (error) {
    await logError({ context: "admin.live.sendBriefTilSpiller", error, meta: { sessionId: parsed.data.sessionId } });
    return { ok: false, error: "Kunne ikke sende til spiller" };
  }

  revalidatePath(`/admin/agencyos/live/${parsed.data.sessionId}`);
  return { ok: true };
}

const VurderingSchema = z.object({
  sessionId: z.string().min(1, "Økt-ID er påkrevd"),
  rating: z.number().int().min(1, "Velg 1–5").max(5, "Velg 1–5"),
  notat: z.string().max(4000, "Maks 4000 tegn"),
});

/**
 * Lagrer coachens øktvurdering. completedSummary er et JSON-objekt som
 * spiller-siden allerede kan ha frosset (SessionSummaryShape) — les det
 * eksisterende objektet, behold alle nøklene, legg kun til coach-feltene.
 */
export async function lagreCoachVurdering(sessionId: string, rating: number, notat: string): Promise<ActionResult> {
  const parsed = VurderingSchema.safeParse({ sessionId, rating, notat });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };

  const me = await getCurrentUser();
  if (!me || !hasRole(me.role, ["COACH", "ADMIN"])) return { ok: false, error: "Ikke tilgang" };

  const trimmet = parsed.data.notat.trim();

  try {
    const session = await hentEidSesjon(parsed.data.sessionId, me.id, me.role === "ADMIN");
    if (!session) return { ok: false, error: "Økt ikke funnet" };

    const eksisterende = somObjekt(session.completedSummary);
    await prisma.trainingSessionV2.update({
      where: { id: parsed.data.sessionId },
      data: {
        completedSummary: {
          ...eksisterende,
          coachRating: parsed.data.rating,
          coachRatedAt: new Date().toISOString(),
          coachRatedById: me.id,
        } as object,
        // Tomt notat lar eksisterende .notes stå — nuller ikke destruktivt.
        ...(trimmet.length > 0 ? { notes: trimmet } : {}),
      },
    });
  } catch (error) {
    await logError({ context: "admin.live.lagreCoachVurdering", error, meta: { sessionId: parsed.data.sessionId } });
    return { ok: false, error: "Kunne ikke lagre vurdering" };
  }

  revalidatePath(`/admin/agencyos/live/${parsed.data.sessionId}`);
  return { ok: true };
}
