"use server";

/**
 * Fokus-spiller pin (D3) — server actions for cockpiten.
 *
 * pinnSpiller / avpinnSpiller: coach fester/løsner en spiller øverst i
 * cockpiten. Krever COACH/ADMIN, og pin er alltid scoped til coachId = egen
 * bruker (en coach kan verken feste eller løsne på tvers av kontoer). Skriving
 * er defensiv: coach_pinned_players finnes ikke i alle miljøer ennå, så DB-feil
 * gir en klarspråk-melding i stedet for en krasj.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { MAKS_PINN } from "@/lib/agencyos/fokus-spillere";

const Schema = z.object({ playerId: z.string().min(1) });

export type FokusResultat = { ok: boolean; error?: string };

export async function pinnSpiller(playerId: string): Promise<FokusResultat> {
  const parsed = Schema.safeParse({ playerId });
  if (!parsed.success) return { ok: false, error: "Ugyldig spiller." };

  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!(await harCoachTilgangTilSpiller(user, parsed.data.playerId))) {
    return { ok: false, error: "Du har ikke tilgang til denne spilleren." };
  }

  try {
    const eksisterende = await prisma.coachPinnedPlayer.findUnique({
      where: { coachId_playerId: { coachId: user.id, playerId: parsed.data.playerId } },
      select: { id: true },
    });
    // Idempotent: allerede festet → OK uten endring.
    if (!eksisterende) {
      const antall = await prisma.coachPinnedPlayer.count({ where: { coachId: user.id } });
      if (antall >= MAKS_PINN) {
        return { ok: false, error: `Du kan feste opptil ${MAKS_PINN} spillere. Løsne én først.` };
      }
      await prisma.coachPinnedPlayer.create({
        data: { coachId: user.id, playerId: parsed.data.playerId },
      });
    }
  } catch (err) {
    console.error("[fokus] pinn feilet", err);
    return { ok: false, error: "Kunne ikke feste spilleren nå. Prøv igjen." };
  }

  await audit({ actorId: user.id, action: "coach.pin_spiller", target: parsed.data.playerId });
  revalidatePath("/admin/agencyos");
  return { ok: true };
}

export async function avpinnSpiller(playerId: string): Promise<FokusResultat> {
  const parsed = Schema.safeParse({ playerId });
  if (!parsed.success) return { ok: false, error: "Ugyldig spiller." };

  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  try {
    // deleteMany scoped til egen coachId — løsner bare dine egne pin.
    await prisma.coachPinnedPlayer.deleteMany({
      where: { coachId: user.id, playerId: parsed.data.playerId },
    });
  } catch (err) {
    console.error("[fokus] avpinn feilet", err);
    return { ok: false, error: "Kunne ikke løsne spilleren nå. Prøv igjen." };
  }

  await audit({ actorId: user.id, action: "coach.avpin_spiller", target: parsed.data.playerId });
  revalidatePath("/admin/agencyos");
  return { ok: true };
}
