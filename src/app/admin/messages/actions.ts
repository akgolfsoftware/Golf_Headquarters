"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

type ChatMelding = { role: "user" | "assistant" | "coach"; content: string; ts: string };

export type SendMeldingResult = {
  ok: boolean;
  error?: string;
};

/**
 * Sender en melding fra coach inn i en eksisterende CoachingSession-tråd.
 * Appender til messages-JSON-array og bumper updatedAt.
 */
export async function sendMelding(
  threadId: string,
  body: string,
): Promise<SendMeldingResult> {
  let me;
  try {
    me = await krevCoach();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "forbidden" };
  }

  const trimmet = body.trim();
  if (trimmet.length < 1) {
    return { ok: false, error: "Melding kan ikke være tom" };
  }
  if (trimmet.length > 4000) {
    return { ok: false, error: "Melding er for lang (maks 4000 tegn)" };
  }
  if (!threadId || threadId.length < 1) {
    return { ok: false, error: "Mangler thread-ID" };
  }

  const tråd = await prisma.coachingSession.findUnique({
    where: { id: threadId },
    select: { id: true, messages: true, coachId: true },
  });
  if (!tråd) {
    return { ok: false, error: "Tråd ikke funnet" };
  }
  // Coach må eie tråden, eller være ADMIN
  if (tråd.coachId !== me.id && me.role !== "ADMIN") {
    return { ok: false, error: "Ikke tilgang til denne tråden" };
  }

  const eksisterende: ChatMelding[] = Array.isArray(tråd.messages)
    ? (tråd.messages as unknown as ChatMelding[])
    : [];

  const ny: ChatMelding = {
    role: "coach",
    content: trimmet,
    ts: new Date().toISOString(),
  };

  await prisma.coachingSession.update({
    where: { id: threadId },
    data: {
      messages: [...eksisterende, ny] as unknown as object,
    },
  });

  revalidatePath("/admin/messages");
  return { ok: true };
}
