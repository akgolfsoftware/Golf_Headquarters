"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

export type ScheduleInput = {
  title: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  location?: string | null;
  recurring?: string | null;
};

function parseDato(verdi: string): Date {
  const d = new Date(verdi);
  if (Number.isNaN(d.getTime())) throw new Error("Ugyldig dato.");
  return d;
}

export async function opprettSchedule(groupId: string, input: ScheduleInput) {
  const user = await krevCoach();
  const tittel = input.title.trim();
  if (!tittel) throw new Error("Tittel er påkrevd.");
  const startAt = parseDato(input.startAt);
  const endAt = parseDato(input.endAt);
  if (endAt <= startAt) throw new Error("Sluttid må være etter starttid.");

  const ny = await prisma.groupSchedule.create({
    data: {
      groupId,
      title: tittel,
      description: input.description?.trim() || null,
      startAt,
      endAt,
      location: input.location?.trim() || null,
      recurring: input.recurring && input.recurring !== "NONE" ? input.recurring : null,
    },
  });

  await audit({
    actorId: user.id,
    action: "group_schedule.created",
    target: `GroupSchedule:${ny.id}`,
    metadata: { groupId, title: ny.title },
  });

  revalidatePath(`/admin/groups/${groupId}`);
}

export async function oppdaterSchedule(
  groupId: string,
  scheduleId: string,
  input: ScheduleInput,
) {
  const user = await krevCoach();
  const tittel = input.title.trim();
  if (!tittel) throw new Error("Tittel er påkrevd.");
  const startAt = parseDato(input.startAt);
  const endAt = parseDato(input.endAt);
  if (endAt <= startAt) throw new Error("Sluttid må være etter starttid.");

  await prisma.groupSchedule.update({
    where: { id: scheduleId },
    data: {
      title: tittel,
      description: input.description?.trim() || null,
      startAt,
      endAt,
      location: input.location?.trim() || null,
      recurring: input.recurring && input.recurring !== "NONE" ? input.recurring : null,
    },
  });

  await audit({
    actorId: user.id,
    action: "group_schedule.updated",
    target: `GroupSchedule:${scheduleId}`,
    metadata: { groupId },
  });

  revalidatePath(`/admin/groups/${groupId}`);
}

export async function slettSchedule(groupId: string, scheduleId: string) {
  const user = await krevCoach();
  await prisma.groupSchedule.delete({ where: { id: scheduleId } });

  await audit({
    actorId: user.id,
    action: "group_schedule.deleted",
    target: `GroupSchedule:${scheduleId}`,
    metadata: { groupId },
  });

  revalidatePath(`/admin/groups/${groupId}`);
}
