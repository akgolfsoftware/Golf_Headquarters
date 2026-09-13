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
import { coachLiveSummaryUpdate } from "./live-summary-update";

type ActionResult = { ok: true } | { ok: false; error: string };

const MeldingSchema = z.object({
  sessionId: z.string().min(1, "Økt-ID er påkrevd"),
  melding: z.string().trim().min(1, "Skriv en melding").max(1000, "Maks 1000 tegn"),
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
    const skrevet = await prisma.$executeRaw(coachLiveSummaryUpdate(
      parsed.data.sessionId, me.id, me.role === "ADMIN", { kind: "message", value: ny },
    ));
    if (skrevet === 0) return { ok: false, error: "Økt ikke funnet" };
  } catch (error) {
    await logError({ context: "admin.live.sendLiveMelding", error, meta: { sessionId: parsed.data.sessionId } });
    return { ok: false, error: "Kunne ikke sende melding" };
  }

  revalidatePath(`/admin/agencyos/live/${parsed.data.sessionId}`);
  return { ok: true };
}

const BriefSchema = z.object({
  sessionId: z.string().min(1, "Økt-ID er påkrevd"),
  melding: z.string().trim().min(1, "Skriv en melding").max(4000, "Maks 4000 tegn"),
});

export async function sendBriefTilSpiller(sessionId: string, melding: string): Promise<ActionResult> {
  const parsed = BriefSchema.safeParse({ sessionId, melding });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };

  const me = await getCurrentUser();
  if (!me || !hasRole(me.role, ["COACH", "ADMIN"])) return { ok: false, error: "Ikke tilgang" };

  const trimmet = parsed.data.melding.trim();

  try {
    const skrevet = await prisma.$executeRaw(coachLiveSummaryUpdate(
      parsed.data.sessionId, me.id, me.role === "ADMIN", {
        kind: "brief",
        value: { melding: trimmet, sentAt: new Date().toISOString(), sentById: me.id },
      },
    ));
    if (skrevet === 0) return { ok: false, error: "Økt ikke funnet" };
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
 * eksisterende objektet i databasen og oppdater kun coach-feltene atomisk.
 */
export async function lagreCoachVurdering(sessionId: string, rating: number, notat: string): Promise<ActionResult> {
  const parsed = VurderingSchema.safeParse({ sessionId, rating, notat });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };

  const me = await getCurrentUser();
  if (!me || !hasRole(me.role, ["COACH", "ADMIN"])) return { ok: false, error: "Ikke tilgang" };

  const trimmet = parsed.data.notat.trim();

  try {
    const skrevet = await prisma.$executeRaw(coachLiveSummaryUpdate(
      parsed.data.sessionId, me.id, me.role === "ADMIN", {
        kind: "rating",
        rating: parsed.data.rating,
        at: new Date().toISOString(),
        ...(trimmet.length > 0 ? { note: trimmet } : {}),
      },
    ));
    if (skrevet === 0) return { ok: false, error: "Økt ikke funnet" };
  } catch (error) {
    await logError({ context: "admin.live.lagreCoachVurdering", error, meta: { sessionId: parsed.data.sessionId } });
    return { ok: false, error: "Kunne ikke lagre vurdering" };
  }

  revalidatePath(`/admin/agencyos/live/${parsed.data.sessionId}`);
  return { ok: true };
}
