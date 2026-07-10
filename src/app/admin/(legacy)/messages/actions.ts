"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { nonEmpty } from "@/lib/validation/schemas";

const SendMeldingSchema = z.object({
  threadId: z.string().min(1, "Thread-ID er påkrevd"),
  body: nonEmpty(4000),
});

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
  const schemaResult = SendMeldingSchema.safeParse({ threadId, body });
  if (!schemaResult.success) {
    return { ok: false, error: schemaResult.error.issues[0]?.message ?? "Ugyldig input" };
  }

  let me;
  try {
    me = await krevCoach();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "forbidden" };
  }

  const trimmet = body.trim();

  const ny: ChatMelding = {
    role: "coach",
    content: trimmet,
    ts: new Date().toISOString(),
  };

  // Atomic append: read + write i samme transaksjon på Serializable-nivå
  // for å unngå race condition der to samtidige coach-svar overskriver
  // hverandre (read-modify-write på messages-JSON).
  // Postgres vil avbryte den ene transaksjonen med 40001 ved konflikt;
  // vi retry-er da inntil 3 ganger.
  const MAX_FORSØK = 3;
  for (let forsøk = 0; forsøk < MAX_FORSØK; forsøk++) {
    try {
      const utfall = await prisma.$transaction(
        async (tx) => {
          const tråd = await tx.coachingSession.findUnique({
            where: { id: threadId },
            select: { id: true, messages: true, coachId: true },
          });
          if (!tråd) return { ok: false as const, error: "Tråd ikke funnet" };
          if (tråd.coachId !== me.id && me.role !== "ADMIN") {
            return { ok: false as const, error: "Ikke tilgang til denne tråden" };
          }
          const rawMessages: unknown = tråd.messages;
          const eksisterende: ChatMelding[] = Array.isArray(rawMessages)
            ? (rawMessages as ChatMelding[])
            : [];
          await tx.coachingSession.update({
            where: { id: threadId },
            data: {
              messages: [...eksisterende, ny] as unknown as object,
            },
          });
          return { ok: true as const };
        },
        { isolationLevel: "Serializable" },
      );

      if (!utfall.ok) return { ok: false, error: utfall.error };
      revalidatePath("/admin/messages");
      return { ok: true };
    } catch (err) {
      // Postgres serialization failure (40001) eller deadlock (40P01)
      // → vent kort og retry
      const kode = (err as { code?: string } | null)?.code;
      if (kode === "40001" || kode === "40P01") {
        await new Promise((r) => setTimeout(r, 25 * (forsøk + 1)));
        continue;
      }
      throw new Error("intern feil");
    }
  }
  return {
    ok: false,
    error: "Kunne ikke lagre melding etter flere forsøk",
  };
}
