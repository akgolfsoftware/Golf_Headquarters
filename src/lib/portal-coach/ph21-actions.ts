"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { resolveValgtCoachId } from "@/lib/domain/valgt-coach";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function sendPH21MeldingAction(coachId: string, content: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Ikke autentisert" };
    if (!content.trim()) return { ok: false, error: "Meldingstekst kan ikke være tom" };

    const nyMelding: Prisma.InputJsonValue = {
      role: "user",
      content: content.trim(),
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
