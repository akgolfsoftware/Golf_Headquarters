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

export type ServiceInput = {
  name: string;
  description?: string;
  priceOre: number;
  durationMin: number;
  active: boolean;
};

export async function createService(input: ServiceInput) {
  const user = await krevCoach();
  const ny = await prisma.serviceType.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      priceOre: input.priceOre,
      durationMin: input.durationMin,
      active: input.active,
    },
  });
  await audit({
    actorId: user.id,
    action: "service.created",
    target: `ServiceType:${ny.id}`,
    metadata: { name: input.name },
  });
  revalidatePath("/admin/services");
}

export async function updateService(id: string, input: ServiceInput) {
  const user = await krevCoach();
  await prisma.serviceType.update({
    where: { id },
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      priceOre: input.priceOre,
      durationMin: input.durationMin,
      active: input.active,
    },
  });
  await audit({
    actorId: user.id,
    action: "service.updated",
    target: `ServiceType:${id}`,
  });
  revalidatePath("/admin/services");
}

export async function deleteService(id: string) {
  const user = await krevCoach();
  await prisma.serviceType.delete({ where: { id } });
  await audit({
    actorId: user.id,
    action: "service.deleted",
    target: `ServiceType:${id}`,
  });
  revalidatePath("/admin/services");
  redirect("/admin/services");
}
