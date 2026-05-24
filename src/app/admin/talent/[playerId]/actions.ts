"use server";

/**
 * Server actions for /admin/talent/[playerId] — 360-profil.
 * Bruker zod for validering. Krever COACH eller ADMIN.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const NotaterSchema = z.object({
  playerId: z.string().min(1),
  notater: z.string().max(5000),
});

export async function lagreNotater(formData: FormData) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const parsed = NotaterSchema.safeParse({
    playerId: formData.get("playerId"),
    notater: formData.get("notater"),
  });
  if (!parsed.success) {
    throw new Error("Ugyldig input");
  }

  await prisma.talentTracking.update({
    where: { id: parsed.data.playerId },
    data: { notater: parsed.data.notater },
  });

  revalidatePath(`/admin/talent/${parsed.data.playerId}`);
}

const MilepaelSchema = z.object({
  playerId: z.string().min(1),
  tittel: z.string().min(2).max(120),
  beskrivelse: z.string().max(500).optional(),
});

type Milepael = { tittel: string; dato: string; beskrivelse?: string };

export async function loggMilepael(formData: FormData) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const parsed = MilepaelSchema.safeParse({
    playerId: formData.get("playerId"),
    tittel: formData.get("tittel"),
    beskrivelse: formData.get("beskrivelse") || undefined,
  });
  if (!parsed.success) {
    throw new Error("Ugyldig input");
  }

  const eksisterende = await prisma.talentTracking.findUnique({
    where: { id: parsed.data.playerId },
    select: { milepaeler: true },
  });

  const rawMilepaeler: unknown = eksisterende?.milepaeler;
  const naa: Milepael[] = Array.isArray(rawMilepaeler)
    ? (rawMilepaeler as Milepael[])
    : [];

  const ny: Milepael = {
    tittel: parsed.data.tittel,
    dato: new Date().toISOString(),
    ...(parsed.data.beskrivelse ? { beskrivelse: parsed.data.beskrivelse } : {}),
  };

  await prisma.talentTracking.update({
    where: { id: parsed.data.playerId },
    data: { milepaeler: [...naa, ny] as unknown as object },
  });

  revalidatePath(`/admin/talent/${parsed.data.playerId}`);
}
