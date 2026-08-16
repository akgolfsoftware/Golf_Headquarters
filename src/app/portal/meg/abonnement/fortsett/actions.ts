"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const tilbudIdSchema = z.string().min(1);

/**
 * «Nei takk» på vinn-tilbake-tilbudet (plan A4): stopper påminnelsen.
 * Eierskap håndheves i where-klausulen (userId) — aldri kun på id.
 */
export async function avslaaWinback(tilbudIdRaa: string): Promise<void> {
  const user = await requireConsentingUser();
  const tilbudId = tilbudIdSchema.parse(tilbudIdRaa);

  await prisma.winbackTilbud.updateMany({
    where: { id: tilbudId, userId: user.id, status: "TILBUDT" },
    data: { status: "AVSLAATT", besvartAt: new Date() },
  });

  await audit({
    actorId: user.id,
    action: "winback.declined",
    target: tilbudId,
  });

  redirect("/portal/meg/abonnement?avbestilt=1");
}
