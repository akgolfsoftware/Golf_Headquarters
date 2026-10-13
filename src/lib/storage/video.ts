/**
 * Coaching-video opplasting via Supabase Storage.
 *
 * Privat bucket 'coaching-videos'. Appen tillater opptil 500 MB (mp4/mov/webm);
 * bucketens faktiske grense må kontrolleres separat.
 * Lagrer som videos/<videoId>.<ext>. URL hentes som signert URL for
 * å gi player + coach midlertidig tilgang.
 */
"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
  assertCoachTilgangTilSpiller,
  harCoachTilgangTilSpiller,
} from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notify } from "@/lib/notifications";
import { z } from "zod";
import { storedVideoHeaderMatches } from "./video-content";

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

const VideoUploadMetadataSchema = z.strictObject({
  title: z.string().trim().min(1),
  playerId: z.string().trim().min(1),
  bookingId: z.string().trim().optional(),
  tag: z.string().optional(),
  notes: z.string().optional(),
  sizeBytes: z.number().int().min(1).max(MAX_BYTES),
  mimeType: z.enum(["video/mp4", "video/quicktime", "video/webm"]),
});
export type VideoUploadMetadata = z.infer<typeof VideoUploadMetadataSchema>;
export type CoachingVideoUploadTicket = {
  videoId: string;
  path: string;
  token: string;
  bucket: "coaching-videos";
};

async function checkVideoBooking(bookingId: string | null, playerId: string, coachId: string) {
  if (!bookingId) return;
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, select: { userId: true, coachId: true } });
  if (!booking || booking.userId !== playerId || booking.coachId !== coachId) {
    throw new Error("Bookingen må tilhøre denne spilleren og coachen.");
  }
}

/** Appen mottar bare metadata; selve filen sendes direkte til privat lagring. */
export async function createVideoUploadTicket(metadata: VideoUploadMetadata): Promise<CoachingVideoUploadTicket> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "ADMIN" && user.role !== "COACH") throw new Error("forbidden");
  const parsed = VideoUploadMetadataSchema.safeParse(metadata);
  if (!parsed.success) throw new Error("Kontroller tittel, spiller, videoformat og filstørrelse (maks 500 MB).");
  const input = parsed.data;
  const player = await prisma.user.findUnique({ where: { id: input.playerId }, select: { id: true } });
  if (!player) throw new Error("Spiller finnes ikke.");
  await assertCoachTilgangTilSpiller(user, player.id);
  await checkVideoBooking(input.bookingId || null, player.id, user.id);
  const video = await prisma.sessionVideo.create({ data: {
    playerId: player.id, coachId: user.id, bookingId: input.bookingId || null,
    title: input.title, tag: input.tag || null, notes: input.notes || null,
    videoUrl: "", sizeBytes: input.sizeBytes, status: "PROCESSING",
  } });
  const path = `videos/${video.id}.${EXT_FOR_TYPE[input.mimeType]}`;
  const { data, error } = await supabaseAdmin().storage.from("coaching-videos").createSignedUploadUrl(path, { upsert: false });
  // Behold raden også ved uavklart svar fra lagringstjenesten.
  if (error || !data?.token) throw new Error("Kunne ikke gjøre videoen klar for opplasting. Prøv igjen.");
  return { videoId: video.id, path, token: data.token, bucket: "coaching-videos" };
}

/** READY gis først etter kontroll av den faktiske filen, aldri etter klientens kvittering alene. */
export async function confirmVideoUpload(videoId: string): Promise<UploadVideoResult> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "ADMIN" && user.role !== "COACH") throw new Error("forbidden");
  if (!z.string().min(1).safeParse(videoId).success) throw new Error("Video mangler.");
  const video = await prisma.sessionVideo.findUnique({ where: { id: videoId } });
  if (!video) throw new Error("not-found");
  if (video.coachId !== user.id) throw new Error("forbidden");
  await assertCoachTilgangTilSpiller(user, video.playerId);
  await checkVideoBooking(video.bookingId, video.playerId, user.id);
  if (video.status === "READY") return { ok: true, videoId: video.id };
  if (video.status !== "PROCESSING" || video.videoUrl || !video.sizeBytes || video.sizeBytes > MAX_BYTES) {
    throw new Error("Videoen kan ikke bekreftes. Den er beholdt.");
  }
  const bucket = supabaseAdmin().storage.from("coaching-videos");
  // SessionVideo har ikke eget MIME-/sti-felt før fullføring. Undersøk kun
  // de tre mulige objektnavnene som serveren kan ha gitt tillatelse til.
  let verifiedPath: string | null = null;
  for (const [mimeType, extension] of Object.entries(EXT_FOR_TYPE)) {
    const path = `videos/${video.id}.${extension}`;
    const info = await bucket.info(path);
    if (info.error || !info.data) continue;
    if (info.data.name !== path || info.data.contentType !== mimeType || info.data.size !== video.sizeBytes) {
      throw new Error("Den lagrede videoens format eller størrelse stemmer ikke. Videoen er ikke delt.");
    }
    const signed = await bucket.createSignedUrl(path, 60);
    if (signed.error || !signed.data?.signedUrl || !(await storedVideoHeaderMatches(signed.data.signedUrl, mimeType, video.sizeBytes))) {
      throw new Error("Kunne ikke bekrefte videoinnholdet. Videoen er beholdt; prøv igjen.");
    }
    verifiedPath = path;
    break;
  }
  if (!verifiedPath) throw new Error("Videofilen er ikke bekreftet lagret. Behold filen og prøv igjen.");
  // Bare én fullføring vinner, også ved parallelle forsøk eller mistet svar.
  const updated = await prisma.sessionVideo.updateMany({
    where: { id: video.id, coachId: user.id, status: "PROCESSING", videoUrl: "" },
    data: { videoUrl: verifiedPath, status: "READY" },
  });
  if (!updated.count) {
    const current = await prisma.sessionVideo.findUnique({ where: { id: video.id } });
    if (current?.status !== "READY" || current.videoUrl !== verifiedPath || current.coachId !== user.id) {
      throw new Error("Videoen er ikke bekreftet. Prøv igjen.");
    }
  } else {
    await notify({ userId: video.playerId, type: "melding", title: `Ny video fra coach: ${video.title}`,
      body: video.tag ?? "Klikk for å se", link: "/portal/coach/notes" });
  }
  revalidatePath("/admin/recording");
  revalidatePath("/portal/coach/notes");
  revalidatePath(`/admin/spillere/${video.playerId}`);
  return { ok: true, videoId: video.id };
}

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
  // TP-01: spilleren må være coachens egen (ADMIN slipper gjennom).
  await assertCoachTilgangTilSpiller(user, player.id);

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
  revalidatePath(`/admin/spillere/${player.id}`);

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
    select: { id: true, videoUrl: true, playerId: true },
  });
  if (!video) throw new Error("not-found");

  // TP-01: spilleren selv, eller coach/admin med tilgang til akkurat denne spilleren.
  const erStaff = user.role === "ADMIN" || user.role === "COACH";
  const harTilgang =
    video.playerId === user.id ||
    (erStaff && (await harCoachTilgangTilSpiller(user, video.playerId)));
  if (!harTilgang) {
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
  // TP-01: bare coach med tilgang til spilleren (eller admin).
  await assertCoachTilgangTilSpiller(user, video.playerId);

  // RF-13: Supabase kaster ikke, men returnerer { error }. Ved feil beholdes
  // databaseraden så filen ikke blir foreldreløs i lagringen.
  const sb = supabaseAdmin();
  // Rader uten fil (videoUrl tom, opplasting aldri fullført) har ingenting å fjerne.
  const { error: fjernFeil } = video.videoUrl
    ? await sb.storage.from("coaching-videos").remove([video.videoUrl])
    : { error: null };
  if (fjernFeil) {
    throw new Error(`Kunne ikke slette videofilen: ${fjernFeil.message}`);
  }
  await prisma.sessionVideo.delete({ where: { id: video.id } });

  revalidatePath("/admin/recording");
  revalidatePath("/portal/coach/notes");
  revalidatePath(`/admin/spillere/${video.playerId}`);

  return { ok: true };
}
