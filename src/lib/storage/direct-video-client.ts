"use client";
import { createClient } from "@/lib/supabase/client";
import { videoHeaderMatches } from "./video-header";
export type VideoUploadTicket = { path: string; token: string; bucket: "player-swing-videos" | "coaching-videos" };
/** Filen går direkte til sitt godkjente lagringsobjekt, ikke gjennom en appfunksjon. */
export async function uploadSignedVideo(file: File, ticket: VideoUploadTicket): Promise<void> {
  const header = new Uint8Array(await file.slice(0, 65536).arrayBuffer());
  if (!videoHeaderMatches(header, file.type, file.size)) throw new Error("Velg en original MP4-, MOV- eller WEBM-video.");
  const result = await createClient().storage.from(ticket.bucket).uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
  if (result.error) throw new Error("Videoen kunne ikke lastes opp. Behold filen og prøv igjen.");
}
