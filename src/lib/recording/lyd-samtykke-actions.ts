"use server";

/**
 * Pilot: coach kan registrere/trekke lydsamtykke for en spiller.
 * Ekte foresatt-e-post kommer når DKIM/Fase 0 er på plass.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { audit } from "@/lib/audit";
import { LYD_SAMTYKKE_ORDLYD } from "./lyd-samtykke-ordlyd";

const GittSchema = z.object({
  playerId: z.string().min(1),
  gittAv: z.enum(["SELV", "FORESATT"]),
  foresattEpost: z.string().email().optional().nullable(),
});

const TrekkSchema = z.object({
  playerId: z.string().min(1),
});

export type LydSamtykkeActionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Registrer status GITT med låst ordlyd-kopi. Upsert på playerId.
 */
export async function registrerLydSamtykkeGitt(
  input: z.infer<typeof GittSchema>,
): Promise<LydSamtykkeActionResult> {
  const coach = await requireCoachActionUser();
  const parsed = GittSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig input" };
  }
  const { playerId, gittAv } = parsed.data;
  let foresattEpost = parsed.data.foresattEpost ?? null;

  if (gittAv === "FORESATT" && !foresattEpost) {
    return { ok: false, error: "Foresatt-e-post kreves når gittAv er FORESATT" };
  }
  if (gittAv === "SELV") {
    foresattEpost = null;
  }

  const player = await prisma.user.findUnique({
    where: { id: playerId },
    select: { id: true, role: true },
  });
  if (!player || player.role !== "PLAYER") {
    return { ok: false, error: "Spiller finnes ikke" };
  }

  const now = new Date();
  await prisma.lydSamtykke.upsert({
    where: { userId: playerId },
    create: {
      userId: playerId,
      status: "GITT",
      gittAv,
      foresattEpost,
      gittAt: now,
      trukketAt: null,
      ordlyd: LYD_SAMTYKKE_ORDLYD,
    },
    update: {
      status: "GITT",
      gittAv,
      foresattEpost,
      gittAt: now,
      trukketAt: null,
      ordlyd: LYD_SAMTYKKE_ORDLYD,
    },
  });

  await audit({
    actorId: coach.id,
    action: "lyd-samtykke.gitt",
    target: `User:${playerId}`,
    metadata: { gittAv, foresattEpost, ordlydVersjon: "2026-07-31-pilot" },
  });

  revalidatePath("/admin/recording");
  revalidatePath("/admin/spillere");
  return { ok: true };
}

/**
 * Trekk samtykke → TRUKKET. Nye opptak sperres umiddelbart.
 */
export async function trekkLydSamtykke(
  input: z.infer<typeof TrekkSchema>,
): Promise<LydSamtykkeActionResult> {
  const coach = await requireCoachActionUser();
  const parsed = TrekkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig input" };
  }
  const { playerId } = parsed.data;

  const existing = await prisma.lydSamtykke.findUnique({
    where: { userId: playerId },
  });
  if (!existing) {
    return { ok: false, error: "Ingen samtykke å trekke" };
  }

  await prisma.lydSamtykke.update({
    where: { userId: playerId },
    data: {
      status: "TRUKKET",
      trukketAt: new Date(),
    },
  });

  await audit({
    actorId: coach.id,
    action: "lyd-samtykke.trukket",
    target: `User:${playerId}`,
    metadata: {},
  });

  revalidatePath("/admin/recording");
  revalidatePath("/admin/spillere");
  return { ok: true };
}
