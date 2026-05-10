"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

export type GroupInput = {
  name: string;
  level?: string | null;
  coachId?: string | null;
};

export async function createGroup(input: GroupInput) {
  const user = await krevCoach();
  const ny = await prisma.group.create({
    data: {
      name: input.name.trim(),
      level: input.level || null,
      coachId: input.coachId || null,
    },
  });
  await audit({
    actorId: user.id,
    action: "group.created",
    target: `Group:${ny.id}`,
    metadata: { name: ny.name },
  });
  revalidatePath("/admin/groups");
  return ny.id;
}

export async function updateGroup(id: string, input: GroupInput) {
  const user = await krevCoach();
  await prisma.group.update({
    where: { id },
    data: {
      name: input.name.trim(),
      level: input.level || null,
      coachId: input.coachId || null,
    },
  });
  await audit({
    actorId: user.id,
    action: "group.updated",
    target: `Group:${id}`,
  });
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${id}`);
}

export async function deleteGroup(id: string) {
  const user = await krevCoach();
  await prisma.group.delete({ where: { id } });
  await audit({
    actorId: user.id,
    action: "group.deleted",
    target: `Group:${id}`,
  });
  revalidatePath("/admin/groups");
  redirect("/admin/groups");
}

export async function addMember(groupId: string, userId: string, role: string) {
  const user = await krevCoach();
  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId, userId } },
    create: { groupId, userId, role },
    update: { role },
  });
  await audit({
    actorId: user.id,
    action: "group_member.added",
    target: `Group:${groupId}`,
    metadata: { userId, role },
  });
  revalidatePath(`/admin/groups/${groupId}`);
}

export async function removeMember(groupId: string, memberId: string) {
  const user = await krevCoach();
  await prisma.groupMember.delete({ where: { id: memberId } });
  await audit({
    actorId: user.id,
    action: "group_member.removed",
    target: `Group:${groupId}`,
    metadata: { memberId },
  });
  revalidatePath(`/admin/groups/${groupId}`);
}
