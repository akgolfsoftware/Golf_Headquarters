"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";


export type ServiceInput = {
  name: string;
  description?: string;
  priceOre: number;
  durationMin: number;
  active: boolean;
};

function lagSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ø/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createService(input: ServiceInput) {
  const user = await requireCoachActionUser();
  let slug = lagSlug(input.name);
  if (!slug) throw new Error("invalid-slug");

  // Sørg for unik slug
  let counter = 1;
  let kandidat = slug;
  while (await prisma.serviceType.findUnique({ where: { slug: kandidat } })) {
    counter++;
    kandidat = `${slug}-${counter}`;
  }
  slug = kandidat;

  const ny = await prisma.serviceType.create({
    data: {
      slug,
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
  const user = await requireCoachActionUser();
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
  const user = await requireCoachActionUser();
  await prisma.serviceType.delete({ where: { id } });
  await audit({
    actorId: user.id,
    action: "service.deleted",
    target: `ServiceType:${id}`,
  });
  revalidatePath("/admin/services");
  redirect("/admin/services");
}
