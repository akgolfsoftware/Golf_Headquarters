"use server";

// AgencyOS — Grupper server actions (opprett/slett). Følger husstilen fra
// admin/(legacy)/drills/actions.ts: requirePortalUser({allow:[...]}), zod-
// validert input, audit()-loggført, revalidatePath på alle mutasjoner. IKKE
// den lokale krevCoach()-varianten i grupper/[id]/actions.ts (medlemskap).

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { error: string };

const GroupInputSchema = z.object({
  name: z.string().trim().min(1, "Navn er påkrevd").max(200),
  level: z.string().trim().max(20).optional().nullable(),
  coachId: z.string().trim().min(1).optional().nullable(),
  maxParticipants: z.number().int().min(1).max(500).optional().nullable(),
});

export type GroupInput = z.infer<typeof GroupInputSchema>;

/* ─── createGroup ───────────────────────────────────────────────────── */

export async function createGroup(
  input: GroupInput,
): Promise<ActionResult<{ groupId: string }>> {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const parsed = GroupInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }
  const data = parsed.data;

  if (data.coachId) {
    const coach = await prisma.user.findUnique({
      where: { id: data.coachId },
      select: { id: true, role: true, deletedAt: true },
    });
    if (!coach || coach.deletedAt) return { error: "Fant ikke coachen." };
    if (coach.role !== "COACH" && coach.role !== "ADMIN") {
      return { error: "Valgt bruker er ikke coach." };
    }
  }

  try {
    const gruppe = await prisma.group.create({
      data: {
        name: data.name,
        level: data.level?.trim() || null,
        coachId: data.coachId || null,
        maxParticipants: data.maxParticipants ?? null,
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

export async function deleteGroup(
  groupId: string,
): Promise<ActionResult<{ groupId: string }>> {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  if (!groupId) return { error: "Mangler gruppe-ID" };

  try {
    const gruppe = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        _count: { select: { members: true, schedules: true } },
      },
    });
    if (!gruppe) return { error: "Gruppen finnes ikke" };

    // GroupMember/GroupSchedule har onDelete:Cascade i schema — sletter
    // gruppen tar dem med. UI-et krever eksplisitt bekreftelse med antall
    // FØR denne kalles (se SlettGruppeButton) — ingen stille kaskade her.
    await prisma.group.delete({ where: { id: groupId } });

    await audit({
      actorId: user.id,
      action: "group.deleted",
      target: `Group:${groupId}`,
      metadata: {
        name: gruppe.name,
        memberCount: gruppe._count.members,
        scheduleCount: gruppe._count.schedules,
      },
    });
    revalidatePath("/admin/grupper");
    return { success: true, data: { groupId } };
  } catch (err) {
    console.error("deleteGroup failed", err);
    return { error: "Kunne ikke slette gruppen" };
  }
}
