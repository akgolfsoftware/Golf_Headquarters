"use server";

// AgencyOS — Gruppe-CRUD server actions (opprett/slett selve gruppen).
// Medlemskap (leggTilGruppemedlem/fjernGruppemedlem) bor i [id]/actions.ts —
// rør ikke det, det fungerer allerede. Husstil fra (legacy)/drills/actions.ts:
// requirePortalUser + zod + audit() + revalidatePath.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { error: string };

const CreateGroupSchema = z.object({
  name: z.string().trim().min(1, "Navn er påkrevd").max(200),
  level: z.string().trim().max(20).optional().nullable(),
  coachId: z.string().min(1).optional().nullable(),
  maxParticipants: z.number().int().min(1).max(500).optional().nullable(),
});

export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;

/* ─── createGroup ───────────────────────────────────────────────────── */

export async function createGroup(
  input: CreateGroupInput,
): Promise<ActionResult<{ groupId: string }>> {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const parsed = CreateGroupSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  if (parsed.data.coachId) {
    const coach = await prisma.user.findUnique({
      where: { id: parsed.data.coachId },
      select: { id: true, role: true, deletedAt: true },
    });
    if (!coach || coach.deletedAt || (coach.role !== "COACH" && coach.role !== "ADMIN")) {
      return { error: "Fant ikke coachen." };
    }
  }

  try {
    const gruppe = await prisma.group.create({
      data: {
        name: parsed.data.name,
        level: parsed.data.level || null,
        coachId: parsed.data.coachId || null,
        maxParticipants: parsed.data.maxParticipants ?? null,
      },
    });
    await audit({
      actorId: user.id,
      action: "group.created",
      target: `Group:${gruppe.id}`,
    });
    revalidatePath("/admin/grupper");
    return { success: true, data: { groupId: gruppe.id } };
  } catch (err) {
    console.error("createGroup failed", err);
    return { error: "Kunne ikke opprette gruppe" };
  }
}

/* ─── deleteGroup ───────────────────────────────────────────────────── */

/**
 * Sletter en gruppe. GroupMember/GroupSchedule kaskade-slettes av databasen
 * (ingen soft-delete på Group). UI-laget (SlettGruppeButton) MÅ vise antall
 * medlemmer/samlinger og be om eksplisitt bekreftelse før dette kalles —
 * denne actionen sletter ubetinget når den kalles.
 */
export async function deleteGroup(
  groupId: string,
): Promise<ActionResult<{ groupId: string }>> {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const gruppe = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, name: true },
  });
  if (!gruppe) return { error: "Fant ikke gruppen." };

  try {
    await prisma.group.delete({ where: { id: groupId } });
  } catch (err) {
    console.error("deleteGroup failed", err);
    return { error: "Kunne ikke slette gruppen" };
  }

  await audit({
    actorId: user.id,
    action: "group.deleted",
    target: `Group:${groupId}`,
    metadata: { name: gruppe.name },
  });

  revalidatePath("/admin/grupper");
  return { success: true, data: { groupId } };
}
