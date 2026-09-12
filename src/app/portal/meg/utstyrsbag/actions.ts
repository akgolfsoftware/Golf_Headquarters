"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const FELT_MAX = 200;

const Felt = z.string().max(FELT_MAX).optional();
const InputSchema = z.object({
  driver: Felt,
  fairwayWoods: Felt,
  hybrids: Felt,
  irons: Felt,
  wedges: Felt,
  putter: Felt,
  ball: Felt,
  bag: Felt,
  notes: Felt,
});

export type UtstyrsbagInput = z.infer<typeof InputSchema>;

function rens(v: string | undefined): string | null {
  if (v == null) return null;
  const trimmet = v.trim();
  if (trimmet.length === 0) return null;
  return trimmet.slice(0, FELT_MAX);
}

export async function lagreUtstyrsbag(data: UtstyrsbagInput): Promise<void> {
  const user = await requirePortalUser({ kreverTilgang: "INGEN",
    allow: ["PLAYER", "COACH", "ADMIN"],
  });

  const parsed = InputSchema.parse(data);

  const payload = {
    driver: rens(parsed.driver),
    fairwayWoods: rens(parsed.fairwayWoods),
    hybrids: rens(parsed.hybrids),
    irons: rens(parsed.irons),
    wedges: rens(parsed.wedges),
    putter: rens(parsed.putter),
    ball: rens(parsed.ball),
    bag: rens(parsed.bag),
    notes: rens(parsed.notes),
  };

  await prisma.equipmentBag.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...payload,
    },
    update: payload,
  });

  await audit({
    actorId: user.id,
    action: "equipment.updated",
    target: user.id,
  });

  revalidatePath("/portal/meg/utstyr");
}
