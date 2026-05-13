/**
 * Avatar-opplasting via Supabase Storage.
 *
 * Bucket 'avatars' (public read, 2 MB max, jpg/png/webp).
 * Lagrer som users/<userId>.<ext> så hver bruker har én avatar.
 */
"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXT_FOR_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type UploadAvatarResult = {
  ok: true;
  url: string;
};

export async function uploadAvatar(formData: FormData): Promise<UploadAvatarResult> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const fil = formData.get("file");
  if (!(fil instanceof File)) throw new Error("Ingen fil sendt.");
  if (fil.size === 0) throw new Error("Tom fil.");
  if (fil.size > MAX_BYTES) throw new Error("Bilde er for stort (maks 2 MB).");
  if (!ALLOWED_TYPES.has(fil.type)) {
    throw new Error("Bare JPG, PNG eller WEBP er tillatt.");
  }

  const ext = EXT_FOR_TYPE[fil.type];
  const path = `users/${user.id}.${ext}`;

  const sb = supabaseAdmin();
  const buf = Buffer.from(await fil.arrayBuffer());

  const { error } = await sb.storage
    .from("avatars")
    .upload(path, buf, {
      contentType: fil.type,
      upsert: true,
      cacheControl: "3600",
    });
  if (error) throw new Error(`Opplasting feilet: ${error.message}`);

  const { data } = sb.storage.from("avatars").getPublicUrl(path);
  // Legg til cache-buster så header oppdaterer umiddelbart
  const url = `${data.publicUrl}?v=${Date.now()}`;

  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl: url },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/meg");
  revalidatePath("/admin");
  revalidatePath("/admin/profile");

  return { ok: true, url };
}

export async function deleteAvatar(): Promise<{ ok: true }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const sb = supabaseAdmin();
  // Slett alle varianter (vi vet ikke hvilken ext bruker har akkurat nå)
  await sb.storage
    .from("avatars")
    .remove([
      `users/${user.id}.jpg`,
      `users/${user.id}.png`,
      `users/${user.id}.webp`,
    ]);

  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl: null },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/meg");
  revalidatePath("/admin");
  revalidatePath("/admin/profile");

  return { ok: true };
}
