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

export type LocationInput = {
  name: string;
  address: string;
  active: boolean;
};

export async function createLocation(input: LocationInput) {
  const user = await krevCoach();
  const ny = await prisma.location.create({
    data: {
      name: input.name.trim(),
      address: input.address.trim(),
      active: input.active,
    },
  });
  await audit({
    actorId: user.id,
    action: "location.created",
    target: `Location:${ny.id}`,
  });
  revalidatePath("/admin/locations");
}

export async function updateLocation(id: string, input: LocationInput) {
  const user = await krevCoach();
  await prisma.location.update({
    where: { id },
    data: {
      name: input.name.trim(),
      address: input.address.trim(),
      active: input.active,
    },
  });
  await audit({ actorId: user.id, action: "location.updated", target: `Location:${id}` });
  revalidatePath("/admin/locations");
}

export async function deleteLocation(id: string) {
  const user = await krevCoach();
  await prisma.location.delete({ where: { id } });
  await audit({ actorId: user.id, action: "location.deleted", target: `Location:${id}` });
  revalidatePath("/admin/locations");
  redirect("/admin/locations");
}

export type FacilityInput = {
  locationId: string;
  name: string;
  capacity: number;
  active: boolean;
};

export async function createFacility(input: FacilityInput) {
  const user = await krevCoach();
  const ny = await prisma.facility.create({
    data: {
      locationId: input.locationId,
      name: input.name.trim(),
      capacity: input.capacity,
      active: input.active,
    },
  });
  await audit({
    actorId: user.id,
    action: "facility.created",
    target: `Facility:${ny.id}`,
  });
  revalidatePath("/admin/locations");
  revalidatePath("/admin/facilities");
}

export async function updateFacility(id: string, input: Omit<FacilityInput, "locationId">) {
  const user = await krevCoach();
  await prisma.facility.update({
    where: { id },
    data: {
      name: input.name.trim(),
      capacity: input.capacity,
      active: input.active,
    },
  });
  await audit({ actorId: user.id, action: "facility.updated", target: `Facility:${id}` });
  revalidatePath("/admin/locations");
  revalidatePath("/admin/facilities");
}

export async function deleteFacility(id: string) {
  const user = await krevCoach();
  await prisma.facility.delete({ where: { id } });
  await audit({ actorId: user.id, action: "facility.deleted", target: `Facility:${id}` });
  revalidatePath("/admin/locations");
  revalidatePath("/admin/facilities");
}
