"use server";

// CoachHQ · Live-økt brief — server actions
//
// sendBriefTilSpiller — coach skriver et fokuspunkt/kommentar som vises til
// spilleren før økten. Lagres som completedSummary.coachBrief slik at vi IKKE
// kolliderer med .notes (eid av summary-skjermen, coachens post-økt-notat).

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { hasRole } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";

const BriefSchema = z.object({
  sessionId: z.string().min(1, "Økt-ID er påkrevd"),
  melding: z.string().min(1, "Skriv en melding").max(4000, "Maks 4000 tegn"),
});

export type BriefResult = { ok: true } | { ok: false; error: string };

export async function sendBriefTilSpiller(
  sessionId: string,
  melding: string,
): Promise<BriefResult> {
  const parsed = BriefSchema.safeParse({ sessionId, melding });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  // Direkte rolle-sjekk i stedet for requirePortalUser: den kaster redirect(),
  // som try/catch her ville svelget — en action skal svare { ok: false }.
  const me = await getCurrentUser();
  if (!me || !hasRole(me.role, ["COACH", "ADMIN"])) {
    return { ok: false, error: "Ikke tilgang" };
  }

  const trimmet = parsed.data.melding.trim();

  try {
    // Eierskap: coach når kun egne økter; ADMIN (Anders) når alle.
    const session = await prisma.trainingSessionV2.findFirst({
      where: { id: parsed.data.sessionId, ...(me.role === "ADMIN" ? {} : { coachId: me.id }) },
      select: { id: true, completedSummary: true },
    });
    if (!session) return { ok: false, error: "Økt ikke funnet" };

    const raw: unknown = session.completedSummary;
    const eksisterende =
      raw && typeof raw === "object" && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};

    const oppdatert: Record<string, unknown> = {
      ...eksisterende,
      coachBrief: {
        melding: trimmet,
        sentAt: new Date().toISOString(),
        sentById: me.id,
      },
    };

    await prisma.trainingSessionV2.update({
      where: { id: parsed.data.sessionId },
      data: { completedSummary: oppdatert as object },
    });
  } catch (err) {
    console.error("[live/brief] sendBriefTilSpiller feilet", err);
    return { ok: false, error: "Kunne ikke sende til spiller" };
  }

  revalidatePath(`/admin/live/${parsed.data.sessionId}/brief`);
  return { ok: true };
}
