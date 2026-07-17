"use server";

/**
 * D3 · Fokus-spillere i cockpit: pin/unpin av spillere (CoachFokusPin).
 * Maks 3 pinnede per coach — håndheves her (og speiles i UI-teksten).
 * Avvis av AI-forslag lagres IKKE (bevisst førsteversjon): forslaget skjules
 * for dagen på klienten — se FokusSpillereV2.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { MAKS_PINNEDE } from "@/lib/admin/fokus-forslag";

const IdSchema = z.string().min(1);

export async function pinFokusSpiller(
  playerId: string,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = IdSchema.safeParse(playerId);
  if (!parsed.success) return { ok: false, error: "Ugyldig spiller." };
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Coach-scope-porten: en coach kan kun pinne sine egne spillere.
  const harTilgang = await harCoachTilgangTilSpiller(
    { id: user.id, role: user.role },
    parsed.data,
  );
  if (!harTilgang) return { ok: false, error: "Du har ikke tilgang til denne spilleren." };

  const antall = await prisma.coachFokusPin.count({ where: { coachId: user.id } });
  const finnes = await prisma.coachFokusPin.findUnique({
    where: { coachId_playerId: { coachId: user.id, playerId: parsed.data } },
    select: { id: true },
  });
  if (!finnes && antall >= MAKS_PINNEDE) {
    return { ok: false, error: "Maks 3 pinnet — fjern en først." };
  }

  await prisma.coachFokusPin.upsert({
    where: { coachId_playerId: { coachId: user.id, playerId: parsed.data } },
    update: {},
    create: { coachId: user.id, playerId: parsed.data },
  });

  revalidatePath("/admin/agencyos");
  return { ok: true };
}

export async function fjernFokusPin(
  playerId: string,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = IdSchema.safeParse(playerId);
  if (!parsed.success) return { ok: false, error: "Ugyldig spiller." };
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  await prisma.coachFokusPin.deleteMany({
    where: { coachId: user.id, playerId: parsed.data },
  });

  revalidatePath("/admin/agencyos");
  return { ok: true };
}
