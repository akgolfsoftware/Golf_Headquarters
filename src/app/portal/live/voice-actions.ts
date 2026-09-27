"use server";

import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import {
  transcribeAudioWithWhisper,
  parseVoiceRangeNote,
  type ParsedVoiceObservation,
} from "@/lib/voice/whisper-transcribe";
import { revalidatePath } from "next/cache";

export interface VoiceUploadResponse {
  ok: boolean;
  transcript?: string;
  parsed?: ParsedVoiceObservation;
  error?: string;
}

/**
 * Tar imot et taleopptak fra rangen, transkriberer med Whisper,
 * og parser strukturerte golf-observasjoner.
 */
export async function uploadAndTranscribeRangeVoice(
  formData: FormData,
): Promise<VoiceUploadResponse> {
  try {
    await requireConsentingUser();

    const file = formData.get("audio") as File | null;
    if (!file) {
      return { ok: false, error: "Ingen lydfil mottatt." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const transcript = await transcribeAudioWithWhisper(
      buffer,
      file.name || "range-opptak.webm",
      file.type || "audio/webm",
    );

    const parsed = parseVoiceRangeNote(transcript);

    return {
      ok: true,
      transcript,
      parsed,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Kunne ikke transkribere opptak";
    return { ok: false, error: message };
  }
}

import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";

/**
 * Lagrer den transkriberte observasjonen direkte som et notat på en aktiv økt,
 * eller som et CoachNote for coachen.
 */
export async function saveVoiceRangeMemo(params: {
  sessionId?: string;
  observation: ParsedVoiceObservation;
  destination: "session" | "coach_inbox" | "task_proposal";
}): Promise<{ ok: boolean; message: string }> {
  const user = await requireConsentingUser();
  const { sessionId, observation, destination } = params;

  if (destination === "session" && sessionId) {
    const notatTekst = `Talenotat (${observation.club ?? "Uspesifisert kølle"}${
      observation.position ? ` · ${observation.position}` : ""
    }): ${observation.rawTranscript}`;

    try {
      const existing = await prisma.trainingSessionV2.findUnique({
        where: { id: sessionId },
        select: { notes: true },
      });
      if (existing) {
        const updated = existing.notes ? `${existing.notes}\n\n${notatTekst}` : notatTekst;
        await prisma.trainingSessionV2.update({
          where: { id: sessionId },
          data: { notes: updated },
        });
      }
    } catch {}

    revalidatePath("/portal/live");
    return { ok: true, message: "Notat lagret på økten." };
  }

  if (destination === "coach_inbox") {
    const coachId = await resolveCoachIdForPlayer(user.id);
    await prisma.coachNote.create({
      data: {
        coachId,
        playerId: user.id,
        title: `Talenotat fra rangen (${observation.club ?? "Uspesifisert"}${
          observation.position ? ` · ${observation.position}` : ""
        })`,
        content: observation.rawTranscript,
        isPrivate: false,
        tags: ["range-memo", observation.position ?? "range"].filter(Boolean),
      },
    });
    return { ok: true, message: "Sendt til coach." };
  }

  return { ok: true, message: "Observasjon registrert." };
}
