import { videoHeaderMatches } from "@/lib/storage/video-header";
import type { CoachingVideoUploadTicket, VideoUploadMetadata, UploadVideoResult } from "@/lib/storage/video";

export type CoachingUploadAttempt = { file: File; metadataKey: string; ticket: CoachingVideoUploadTicket; uploaded: boolean };
export type CoachingUploadActions = {
  createTicket: (metadata: VideoUploadMetadata) => Promise<CoachingVideoUploadTicket>;
  upload: (file: File, ticket: CoachingVideoUploadTicket) => Promise<void>;
  confirm: (videoId: string) => Promise<UploadVideoResult>;
};
export function validateCoachingVideo(file: File): string | null {
  if (file.size === 0) return "Videofilen er tom. Velg en annen fil.";
  if (file.size > 500 * 1024 * 1024) return "Filen er for stor. Maks 500 MB.";
  if (!["video/mp4", "video/quicktime", "video/webm"].includes(file.type)) return "Velg en original MP4-, MOV- eller WEBM-video.";
  return null;
}
function confirmed(receipt: UploadVideoResult, videoId: string): UploadVideoResult {
  if (receipt?.ok !== true || receipt.videoId !== videoId) throw new Error("Videoen er ikke bekreftet lagret. Behold filen og prøv igjen.");
  return receipt;
}
/** Beholder fil/ticket ved feil. Klientens sendekvittering er aldri en READY-kvittering. */
export async function completeCoachingVideoUpload(
  file: File, metadata: VideoUploadMetadata, previous: CoachingUploadAttempt | null,
  actions: CoachingUploadActions, remember: (attempt: CoachingUploadAttempt) => void,
  phase: (text: string) => void,
): Promise<UploadVideoResult> {
  const invalid = validateCoachingVideo(file);
  if (invalid) throw new Error(invalid);
  const header = new Uint8Array(await file.slice(0, 65536).arrayBuffer());
  if (!videoHeaderMatches(header, file.type, file.size)) throw new Error("Velg en original MP4-, MOV- eller WEBM-video.");
  const metadataKey = JSON.stringify(metadata);
  let attempt = previous;
  if (!attempt || attempt.file !== file || attempt.metadataKey !== metadataKey) {
    phase("Gjør videoen klar for opplasting …");
    const ticket = await actions.createTicket(metadata);
    if (!ticket.videoId || ticket.bucket !== "coaching-videos") throw new Error("Opplastingstilgangen kunne ikke bekreftes. Prøv igjen.");
    attempt = { file, metadataKey, ticket, uploaded: false };
    remember(attempt);
  }
  if (!attempt.uploaded) {
    phase("Sender videofilen …");
    try { await actions.upload(file, attempt.ticket); attempt.uploaded = true; }
    catch (uploadError) {
      // Et mistet svar kan skjule en ferdig fil. Serveren kontrollerer faktiske bytes.
      phase("Kontrollerer om filen allerede er lagret …");
      try {
        const receipt = confirmed(await actions.confirm(attempt.ticket.videoId), attempt.ticket.videoId);
        attempt.uploaded = true;
        return receipt;
      } catch { throw uploadError; }
    }
  }
  phase("Kontrollerer lagringen …");
  return confirmed(await actions.confirm(attempt.ticket.videoId), attempt.ticket.videoId);
}
