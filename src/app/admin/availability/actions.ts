"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

export type SlotInput = {
  weekday: number;
  startTime: string;
  endTime: string;
  active: boolean;
};

export async function addSlot(input: SlotInput) {
  const user = await krevCoach();
  await prisma.coachAvailability.create({
    data: {
      coachId: user.id,
      weekday: input.weekday,
      startTime: input.startTime,
      endTime: input.endTime,
      active: input.active,
    },
  });
  revalidatePath("/admin/availability");
}

export async function updateSlot(id: string, input: SlotInput) {
  const user = await krevCoach();
  const slot = await prisma.coachAvailability.findUnique({ where: { id } });
  if (!slot) throw new Error("not-found");
  if (slot.coachId !== user.id && user.role !== "ADMIN") throw new Error("forbidden");
  await prisma.coachAvailability.update({
    where: { id },
    data: {
      weekday: input.weekday,
      startTime: input.startTime,
      endTime: input.endTime,
      active: input.active,
    },
  });
  revalidatePath("/admin/availability");
}

export async function deleteSlot(id: string) {
  const user = await krevCoach();
  const slot = await prisma.coachAvailability.findUnique({ where: { id } });
  if (!slot) throw new Error("not-found");
  if (slot.coachId !== user.id && user.role !== "ADMIN") throw new Error("forbidden");
  await prisma.coachAvailability.delete({ where: { id } });
  revalidatePath("/admin/availability");
}
