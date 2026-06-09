"use server";

// CoachHQ · Live-økt active — server actions
//
// sendLiveMelding — coach sender en rask melding mens spillerens økt pågår.
// Meldingen lagres økt-scopet i completedSummary.coachMessages[] (append).
// Bevisst valg: holdes på selve økten (ikke i den persistente DM-tråden) slik
// at det er minst mulig destruktivt og ikke oppretter nye rader. Se RETURNER-
// notatet i oppgaven.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const MeldingSchema = z.object({
  sessionId: z.string().min(1, "Økt-ID er påkrevd"),
  melding: z.string().min(1, "Skriv en melding").max(1000, "Maks 1000 tegn"),
});

type CoachLiveMelding = { content: string; ts: string; sentById: string };

export type LiveMeldingResult = { ok: true } | { ok: false; error: string };

export async function sendLiveMelding(
  sessionId: string,
  melding: string,
): Promise<LiveMeldingResult> {
  const parsed = MeldingSchema.safeParse({ sessionId, melding });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  let me;
  try {
    me = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  } catch {
    return { ok: false, error: "Ikke tilgang" };
  }

  const trimmet = parsed.data.melding.trim();
  const ny: CoachLiveMelding = {
    content: trimmet,
    ts: new Date().toISOString(),
    sentById: me.id,
  };

  try {
    const session = await prisma.trainingSessionV2.findUnique({
      where: { id: parsed.data.sessionId },
      select: { id: true, completedSummary: true },
    });
    if (!session) return { ok: false, error: "Økt ikke funnet" };

    const raw: unknown = session.completedSummary;
    const eksisterende =
      raw && typeof raw === "object" && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};
    const rawMsgs = eksisterende.coachMessages;
    const meldinger: CoachLiveMelding[] = Array.isArray(rawMsgs)
      ? (rawMsgs as CoachLiveMelding[])
      : [];

    const oppdatert: Record<string, unknown> = {
      ...eksisterende,
      coachMessages: [...meldinger, ny],
    };

    await prisma.trainingSessionV2.update({
      where: { id: parsed.data.sessionId },
      data: { completedSummary: oppdatert as object },
    });
  } catch (err) {
    console.error("[live/active] sendLiveMelding feilet", err);
    return { ok: false, error: "Kunne ikke sende melding" };
  }

  revalidatePath(`/admin/live/${parsed.data.sessionId}/active`);
  return { ok: true };
}
