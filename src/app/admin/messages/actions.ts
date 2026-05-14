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
  let sisteFeil: unknown = null;
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
          const eksisterende: ChatMelding[] = Array.isArray(tråd.messages)
            ? (tråd.messages as unknown as ChatMelding[])
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
      sisteFeil = err;
      // Postgres serialization failure (40001) eller deadlock (40P01)
      // → vent kort og retry
      const kode = (err as { code?: string } | null)?.code;
      if (kode === "40001" || kode === "40P01") {
        await new Promise((r) => setTimeout(r, 25 * (forsøk + 1)));
        continue;
      }
      throw err;
    }
  }
  return {
    ok: false,
    error:
      sisteFeil instanceof Error
        ? `Kunne ikke lagre melding: ${sisteFeil.message}`
        : "Kunne ikke lagre melding etter flere forsøk",
  };
}
