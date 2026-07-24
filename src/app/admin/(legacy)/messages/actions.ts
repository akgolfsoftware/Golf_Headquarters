"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { nonEmpty } from "@/lib/validation/schemas";

const SendMeldingSchema = z.object({
  threadId: z.string().min(1, "Thread-ID er påkrevd"),
  body: nonEmpty(4000),
});


const chatMeldingSchema = z.object({
  role: z.enum(["user", "assistant", "coach"]),
  content: z.string(),
  ts: z.string(),
});
type ChatMelding = z.infer<typeof chatMeldingSchema>;

/** Leser messages-JSON-blobben trygt — ugyldige rader filtreres bort i stedet for å telle som gyldige. */
function lesChatMeldinger(raw: unknown): ChatMelding[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((rad) => {
    const parsed = chatMeldingSchema.safeParse(rad);
    return parsed.success ? [parsed.data] : [];
  });
}

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
    me = await requireCoachActionUser();
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
          const eksisterende: ChatMelding[] = lesChatMeldinger(tråd.messages);
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

const SendMeldingTilSpillerSchema = z.object({
  playerId: z.string().min(1, "Spiller-ID er påkrevd"),
  body: nonEmpty(4000),
});

export type SendMeldingTilSpillerResult = {
  ok: boolean;
  error?: string;
  threadId?: string;
};

/**
 * Sender en melding fra innlogget coach direkte til en spiller — finner
 * eller oppretter DIRECT-tråden mellom dem (stall-rad har ingen kjent
 * threadId fra før, i motsetning til sendMelding over). Samme
 * Serializable+retry-mønster som sendMelding for å unngå race condition
 * på messages-JSON-arrayet.
 */
export async function sendMeldingTilSpiller(
  playerId: string,
  body: string,
): Promise<SendMeldingTilSpillerResult> {
  const schemaResult = SendMeldingTilSpillerSchema.safeParse({ playerId, body });
  if (!schemaResult.success) {
    return { ok: false, error: schemaResult.error.issues[0]?.message ?? "Ugyldig input" };
  }

  let me;
  try {
    me = await requireCoachActionUser();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "forbidden" };
  }

  const spiller = await prisma.user.findFirst({
    where: { id: playerId, deletedAt: null },
    select: { id: true },
  });
  if (!spiller) return { ok: false, error: "Spiller ikke funnet" };

  const trimmet = body.trim();
  const ny: ChatMelding = {
    role: "coach",
    content: trimmet,
    ts: new Date().toISOString(),
  };

  const MAX_FORSØK = 3;
  for (let forsøk = 0; forsøk < MAX_FORSØK; forsøk++) {
    try {
      const threadId = await prisma.$transaction(
        async (tx) => {
          const eksisterende = await tx.coachingSession.findFirst({
            where: { userId: playerId, coachId: me.id, kind: "DIRECT" },
            select: { id: true, messages: true },
          });
          if (eksisterende) {
            const meldinger = lesChatMeldinger(eksisterende.messages);
            const oppdatert = await tx.coachingSession.update({
              where: { id: eksisterende.id },
              data: { messages: [...meldinger, ny] as unknown as object },
            });
            return oppdatert.id;
          }
          const opprettet = await tx.coachingSession.create({
            data: {
              userId: playerId,
              coachId: me.id,
              kind: "DIRECT",
              messages: [ny] as unknown as object,
            },
          });
          return opprettet.id;
        },
        { isolationLevel: "Serializable" },
      );

      revalidatePath("/admin/messages");
      revalidatePath("/admin/analysere/compliance");
      return { ok: true, threadId };
    } catch (err) {
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
    error: "Kunne ikke sende melding etter flere forsøk",
  };
}
