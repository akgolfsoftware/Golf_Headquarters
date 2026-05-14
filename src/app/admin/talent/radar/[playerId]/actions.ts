"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

const Akse = z
  .preprocess((v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }, z.number().int().min(1).max(10).nullable());

const Input = z.object({
  playerId: z.string().min(1, "playerId mangler"),
  fysisk: Akse,
  teknikk: Akse,
  taktikk: Akse,
  mental: Akse,
  motivasjon: Akse,
});

export type OppdaterState = { ok: boolean; error?: string };

export async function oppdaterRadar(
  _prev: OppdaterState,
  formData: FormData,
): Promise<OppdaterState> {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const parsed = Input.safeParse({
    playerId: formData.get("playerId"),
    fysisk: formData.get("fysisk"),
    teknikk: formData.get("teknikk"),
    taktikk: formData.get("taktikk"),
    mental: formData.get("mental"),
    motivasjon: formData.get("motivasjon"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Ugyldig input (1–10 per akse)",
    };
  }

  const { playerId, fysisk, teknikk, taktikk, mental, motivasjon } = parsed.data;

  const eksisterer = await prisma.talentTracking.findUnique({
    where: { userId: playerId },
  });
  if (!eksisterer) {
    return { ok: false, error: "Spilleren er ikke i talent-tracking." };
  }

  await prisma.talentTracking.update({
    where: { userId: playerId },
    data: { fysisk, teknikk, taktikk, mental, motivasjon },
  });

  revalidatePath(`/admin/talent/radar/${playerId}`);
  revalidatePath("/admin/talent");
  return { ok: true };
}
