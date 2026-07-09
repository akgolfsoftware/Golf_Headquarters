"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

const NIVAA = ["U10", "U12", "U14", "U16", "U18", "Senior"] as const;

const Input = z.object({
  userId: z.string().min(1, "userId mangler"),
  niva: z.enum(NIVAA),
  klubb: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  region: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type LeggTilState = { ok: boolean; error?: string };

export async function leggTilITalent(
  _prev: LeggTilState,
  formData: FormData,
): Promise<LeggTilState> {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const parsed = Input.safeParse({
    userId: formData.get("userId"),
    niva: formData.get("niva"),
    klubb: formData.get("klubb") ?? undefined,
    region: formData.get("region") ?? undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  const { userId, niva, klubb, region } = parsed.data;

  const eksisterer = await prisma.talentTracking.findUnique({
    where: { userId },
  });
  if (eksisterer) {
    return { ok: false, error: "Spilleren er allerede i talent-tracking." };
  }

  await prisma.talentTracking.create({
    data: { userId, niva, klubb, region },
  });

  revalidatePath("/admin/talent/discovery");
  revalidatePath("/admin/talent");
  return { ok: true };
}
