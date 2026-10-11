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
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { logError } from "@/lib/error-tracking";

const MAKS_TRANSKRIPT_TEGN = 4000;

/**
 * Lagrer den transkriberte observasjonen direkte som et notat på en aktiv økt,
 * eller som et CoachNote for coachen.
 *
 * Svarer `ok: true` BARE når noe faktisk ble lagret. Økta må tilhøre brukeren
 * (spiller eller økt-coach), eller brukeren må være coach/admin med tilgang til
 * spilleren (kodegjennomgang 06.10: TP-06, RF-02, RF-03).
 */
export async function saveVoiceRangeMemo(params: {
  sessionId?: string;
  observation: ParsedVoiceObservation;
  destination: "session" | "coach_inbox" | "task_proposal";
}): Promise<{ ok: boolean; message: string }> {
  const user = await requireConsentingUser();
  const { sessionId, observation, destination } = params;

  const tekst = observation.rawTranscript?.trim() ?? "";
  if (!tekst) {
    return { ok: false, message: "Notatet er tomt og ble ikke lagret." };
  }
  if (tekst.length > MAKS_TRANSKRIPT_TEGN) {
    return { ok: false, message: "Notatet er for langt og ble ikke lagret." };
  }

  try {
    if (destination === "session") {
      if (!sessionId) {
        return { ok: false, message: "Ingen økt valgt. Notatet ble ikke lagret." };
      }
      const notatTekst = `Talenotat (${observation.club ?? "Uspesifisert kølle"}${
        observation.position ? ` · ${observation.position}` : ""
      }): ${tekst}`;

      const existing = await prisma.trainingSessionV2.findUnique({
        where: { id: sessionId },
        select: { notes: true, studentId: true, coachId: true },
      });
      const harTilgang =
        existing != null &&
        (existing.studentId === user.id ||
          existing.coachId === user.id ||
          (existing.studentId != null &&
            (user.role === "COACH" || user.role === "ADMIN") &&
            (await harCoachTilgangTilSpiller(user, existing.studentId))));
      if (!existing || !harTilgang) {
        return { ok: false, message: "Fant ikke økta. Notatet ble ikke lagret." };
      }

      const updated = existing.notes ? `${existing.notes}\n\n${notatTekst}` : notatTekst;
      await prisma.trainingSessionV2.update({
        where: { id: sessionId },
        data: { notes: updated },
      });
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
          content: tekst,
          isPrivate: false,
          tags: ["range-memo", observation.position ?? "range"].filter(Boolean),
        },
      });
      return { ok: true, message: "Sendt til coach." };
    }
  } catch (error) {
    await logError({ context: "voice.saveVoiceRangeMemo", error, userId: user.id });
    return { ok: false, message: "Noe gikk galt. Notatet ble ikke lagret." };
  }

  // task_proposal lagrer ingenting ennå — ikke meld at det er registrert.
  return { ok: false, message: "Dette valget lagrer ikke noe ennå. Notatet ble ikke lagret." };
}
