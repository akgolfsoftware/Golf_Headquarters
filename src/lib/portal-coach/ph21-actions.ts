"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { resolveValgtCoachId } from "@/lib/domain/valgt-coach";
import { prisma } from "@/lib/prisma";
import { erCoachetSpiller } from "@/lib/auth/coached";
import { z } from "zod";
import { hentPH21MottakerCoachId } from "./ph21-mottaker";
import type { Prisma } from "@/generated/prisma/client";

const meldingInput = z.object({
  coachId: z.string().trim().min(1).max(128),
  content: z.string().trim().min(1, "Meldingstekst kan ikke være tom").max(4000),
});

export async function sendPH21MeldingAction(
  coachIdInput: string,
  contentInput: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Ikke autentisert" };

    const parsed = meldingInput.safeParse({ coachId: coachIdInput, content: contentInput });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig melding" };
    }
    const { coachId, content } = parsed.data;

    // Mottakeren avgjøres på serveren: bare coachen spilleren faktisk ser i
    // Innboks, og bare for spillere med coach-tilknytning (samme regel som
    // skjermen bruker for å vise skrivefeltet).
    const [mottakerId, coachet] = await Promise.all([
      hentPH21MottakerCoachId(user.id),
      erCoachetSpiller(user.id),
    ]);
    const harCoachTilgang = coachet || user.role === "COACH" || user.role === "ADMIN";
    if (!harCoachTilgang || !mottakerId || mottakerId !== coachId) {
      return { ok: false, error: "Du kan bare sende melding til din egen coach" };
    }

    const nyMelding: Prisma.InputJsonValue = {
      role: "user",
      content,
      ts: new Date().toISOString(),
    };

    const eksisterende = await prisma.coachingSession.findFirst({
      where: { userId: user.id, coachId, kind: "DIRECT" },
      orderBy: { updatedAt: "desc" },
    });

    if (eksisterende) {
      const msgs = Array.isArray(eksisterende.messages)
        ? (eksisterende.messages as Prisma.InputJsonValue[])
        : [];
      await prisma.coachingSession.update({
        where: { id: eksisterende.id },
        data: { messages: [...msgs, nyMelding] },
      });
    } else {
      await prisma.coachingSession.create({
        data: {
          userId: user.id,
          coachId,
          kind: "DIRECT",
          messages: [nyMelding] as Prisma.InputJsonValue[],
        },
      });
    }

    revalidatePath("/portal/coach");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kunne ikke sende melding";
    return { ok: false, error: msg };
  }
}

export async function sendPH21SporsmalAction(title: string, body?: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Ikke autentisert" };
    if (!title.trim()) return { ok: false, error: "Spørsmålet kan ikke være tomt" };

    const coachId = await resolveValgtCoachId(user.id);

    await prisma.question.create({
      data: {
        askerUserId: user.id,
        coachUserId: coachId ?? null,
        title: title.trim(),
        body: (body || title).trim(),
        status: "OPEN",
      },
    });

    revalidatePath("/portal/coach");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kunne ikke opprette spørsmål";
    return { ok: false, error: msg };
  }
}

export async function sendPH21TilbakemeldingAction(
  sessionId: string,
  rating: number,
  comment?: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Ikke autentisert" };

    const session = await prisma.trainingSessionV2.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.studentId !== user.id) {
      return { ok: false, error: "Økt ikke funnet" };
    }

    const noteText = comment?.trim() ? `[Dagsform ${rating}/5] ${comment.trim()}` : `[Dagsform ${rating}/5]`;

    await prisma.trainingSessionV2.update({
      where: { id: sessionId },
      data: { notes: noteText },
    });

    revalidatePath("/portal/coach");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kunne ikke sende tilbakemelding";
    return { ok: false, error: msg };
  }
}

export async function sendPH21OnskeAction(data: {
  day: string;
  area: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Ikke autentisert" };
    if (!data.text.trim()) return { ok: false, error: "Beskriv hva du vil jobbe med" };

    const coachId = await resolveValgtCoachId(user.id);

    await prisma.planChangeRequest.create({
      data: {
        playerId: user.id,
        coachId: coachId ?? null,
        changeType: "CREATE",
        status: "PENDING",
        payload: {
          requestedDay: data.day,
          area: data.area,
          note: data.text.trim(),
        } as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/portal/coach");
    revalidatePath("/portal/onskeligokt");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kunne ikke sende ønske";
    return { ok: false, error: msg };
  }
}

export async function respondPH21PlanAction(
  planId: string,
  status: "Godtatt" | "Avvist",
): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Ikke autentisert" };

    const plan = await prisma.trainingPlan.findUnique({
      where: { id: planId },
    });
    if (!plan || plan.userId !== user.id) {
      return { ok: false, error: "Plan ikke funnet" };
    }

    await prisma.trainingPlan.update({
      where: { id: planId },
      data: { isActive: status === "Godtatt" },
    });

    revalidatePath("/portal/coach");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kunne ikke oppdatere plan";
    return { ok: false, error: msg };
  }
}
