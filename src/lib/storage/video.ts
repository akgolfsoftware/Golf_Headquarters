/**
 * Coaching-video opplasting via Supabase Storage.
 *
 * Bucket 'coaching-videos' (privat, 500 MB max, mp4/mov/webm).
 * Lagrer som videos/<videoId>.<ext>. URL hentes som signert URL for
 * å gi player + coach midlertidig tilgang.
 */
"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notify } from "@/lib/notifications";

const MAX_BYTES = 500 * 1024 * 1024; // 500 MB
const ALLOWED_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);
const EXT_FOR_TYPE: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

export type UploadVideoResult = {
  ok: true;
  videoId: string;
};

/**
 * Last opp ny coaching-video. Krever ADMIN eller COACH-rolle.
 */
export async function uploadVideo(formData: FormData): Promise<UploadVideoResult> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "ADMIN" && user.role !== "COACH") {
    throw new Error("forbidden — kun coach/admin kan laste opp video");
  }

  const fil = formData.get("file");
  const title = String(formData.get("title") ?? "").trim();
  const playerId = String(formData.get("playerId") ?? "").trim();
  const bookingId = formData.get("bookingId") ? String(formData.get("bookingId")) : null;
  const tag = formData.get("tag") ? String(formData.get("tag")) : null;
  const notes = formData.get("notes") ? String(formData.get("notes")) : null;

  if (!(fil instanceof File)) throw new Error("Ingen fil sendt.");
  if (fil.size === 0) throw new Error("Tom fil.");
  if (fil.size > MAX_BYTES) {
    throw new Error("Video er for stor (maks 500 MB).");
  }
  if (!ALLOWED_TYPES.has(fil.type)) {
    throw new Error("Kun MP4, MOV eller WEBM tillatt.");
  }
  if (!title) throw new Error("Tittel mangler.");
  if (!playerId) throw new Error("Spiller mangler.");

  const player = await prisma.user.findUnique({
    where: { id: playerId },
    select: { id: true, name: true },
  });
  if (!player) throw new Error("Spiller finnes ikke.");

  // Opprett DB-rad først (få ID til filnavn)
  const ext = EXT_FOR_TYPE[fil.type];
  const video = await prisma.sessionVideo.create({
    data: {
      playerId: player.id,
      coachId: user.id,
      bookingId: bookingId || null,
      title,
      tag: tag || null,
      notes: notes || null,
      videoUrl: "", // settes etter opplasting
      sizeBytes: fil.size,
      status: "PROCESSING",
    },
  });

  const path = `videos/${video.id}.${ext}`;
  const sb = supabaseAdmin();
  const buf = Buffer.from(await fil.arrayBuffer());

  const { error } = await sb.storage
    .from("coaching-videos")
    .upload(path, buf, {
      contentType: fil.type,
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    // Rull tilbake DB-rad ved feil
    await prisma.sessionVideo.delete({ where: { id: video.id } }).catch(() => {});
    throw new Error(`Opplasting feilet: ${error.message}`);
  }

  await prisma.sessionVideo.update({
    where: { id: video.id },
    data: { videoUrl: path, status: "READY" },
  });

  // Varsle spilleren
  await notify({
    userId: player.id,
    type: "melding",
    title: `Ny video fra coach: ${title}`,
    body: tag ?? "Klikk for å se",
    link: "/portal/coach/notes",
  });

  revalidatePath("/admin/recording");
  revalidatePath("/portal/coach/notes");
  revalidatePath(`/admin/elever/${player.id}`);

  return { ok: true, videoId: video.id };
}

/**
 * Hent signert URL for en video (1 time gyldig).
 * Bare spilleren selv eller coach/admin kan be om signed URL.
 */
export async function getSignedVideoUrl(videoId: string): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const video = await prisma.sessionVideo.findUnique({
    where: { id: videoId },
    select: { id: true, videoUrl: true, playerId: true, coachId: true },
  });
  if (!video) throw new Error("not-found");

  const erStaff = user.role === "ADMIN" || user.role === "COACH";
  if (video.playerId !== user.id && video.coachId !== user.id && !erStaff) {
    throw new Error("forbidden");
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb.storage
    .from("coaching-videos")
    .createSignedUrl(video.videoUrl, 60 * 60); // 1 time
  if (error || !data?.signedUrl) {
    throw new Error("Kunne ikke generere URL.");
  }
  return data.signedUrl;
}

/**
 * Slett video — coach/admin only.
 */
export async function deleteVideo(videoId: string): Promise<{ ok: true }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "ADMIN" && user.role !== "COACH") {
    throw new Error("forbidden");
  }

  const video = await prisma.sessionVideo.findUnique({
    where: { id: videoId },
    select: { id: true, videoUrl: true, playerId: true },
  });
  if (!video) throw new Error("not-found");

  const sb = supabaseAdmin();
  await sb.storage.from("coaching-videos").remove([video.videoUrl]).catch(() => {});
  await prisma.sessionVideo.delete({ where: { id: video.id } });

  revalidatePath("/admin/recording");
  revalidatePath("/portal/coach/notes");
  revalidatePath(`/admin/elever/${video.playerId}`);

  return { ok: true };
}
