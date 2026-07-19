/**
 * Bilde/video-opplasting for teknisk-plan-oppgaver via Supabase Storage
 * (runde 2 · 2026-07-14). Samme mønster som src/lib/storage/avatar.ts —
 * autorisasjon via ensurePlanAccess (spiller eller coach/admin på planen).
 *
 * Bucket 'task-media' (public read, se buckets.ts for tak).
 * Lagrer som tasks/<taskId>/<kind>.<ext> så hver oppgave har én av hver.
 */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { ensurePlanAccess } from "@/lib/teknisk-plan/ensure-plan-access";

const MAX_BYTES: Record<"bilde" | "video", number> = {
  bilde: 5 * 1024 * 1024, // 5 MB
  video: 50 * 1024 * 1024, // 50 MB — Supabase tier-tak, se buckets.ts
};

const ALLOWED_TYPES: Record<"bilde" | "video", Record<string, string>> = {
  bilde: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
  video: { "video/mp4": "mp4", "video/quicktime": "mov" },
};

// Feil RETURNERES, aldri kastes (utenom manglende tilgang): Next maskerer
// kastede server action-feil i prod, så norske meldinger må gå som verdier.
export type UploadTaskMediaResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadTaskMedia(
  taskId: string,
  formData: FormData,
  kind: "bilde" | "video",
): Promise<UploadTaskMediaResult> {
  const task = await prisma.positionTask.findUnique({
    where: { id: taskId },
    include: { position: { select: { planId: true } } },
  });
  if (!task) return { ok: false, error: "Oppgave ikke funnet" };
  await ensurePlanAccess(task.position.planId);

  const fil = formData.get("file");
  if (!(fil instanceof File)) return { ok: false, error: "Ingen fil sendt." };
  if (fil.size === 0) return { ok: false, error: "Tom fil." };
  if (fil.size > MAX_BYTES[kind]) {
    return { ok: false, error: kind === "bilde" ? "Bilde er for stort (maks 5 MB)." : "Video er for stor (maks 50 MB)." };
  }
  const ext = ALLOWED_TYPES[kind][fil.type];
  if (!ext) {
    return { ok: false, error: kind === "bilde" ? "Bare JPG, PNG eller WEBP er tillatt." : "Bare MP4 eller MOV er tillatt." };
  }

  const path = `tasks/${taskId}/${kind}.${ext}`;
  const sb = supabaseAdmin();
  const buf = Buffer.from(await fil.arrayBuffer());

  const { error } = await sb.storage
    .from(STORAGE_BUCKETS.TASK_MEDIA)
    .upload(path, buf, { contentType: fil.type, upsert: true, cacheControl: "3600" });
  if (error) return { ok: false, error: `Opplasting feilet: ${error.message}` };

  const { data } = sb.storage.from(STORAGE_BUCKETS.TASK_MEDIA).getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`;

  await prisma.positionTask.update({
    where: { id: taskId },
    data: kind === "bilde" ? { bildeUrl: url } : { videoUrl: url },
  });

  revalidatePath(`/portal/tren/teknisk-plan/${task.position.planId}`);
  return { ok: true, url };
}
