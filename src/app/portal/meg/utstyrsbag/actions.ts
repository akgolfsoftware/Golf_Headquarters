"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export type UtstyrsbagInput = {
  driver?: string;
  fairwayWoods?: string;
  hybrids?: string;
  irons?: string;
  wedges?: string;
  putter?: string;
  ball?: string;
  bag?: string;
  notes?: string;
};

const FELT_MAX = 200;

function rens(v: string | undefined): string | null {
  if (v == null) return null;
  const trimmet = v.trim();
  if (trimmet.length === 0) return null;
  return trimmet.slice(0, FELT_MAX);
}

export async function lagreUtstyrsbag(data: UtstyrsbagInput): Promise<void> {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN"],
  });

  const payload = {
    driver: rens(data.driver),
    fairwayWoods: rens(data.fairwayWoods),
    hybrids: rens(data.hybrids),
    irons: rens(data.irons),
    wedges: rens(data.wedges),
    putter: rens(data.putter),
    ball: rens(data.ball),
    bag: rens(data.bag),
    notes: rens(data.notes),
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

  revalidatePath("/portal/meg/utstyrsbag");
}
