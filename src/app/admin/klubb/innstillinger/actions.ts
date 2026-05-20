"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

async function krevAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

// ----------------- Schemas -----------------

const clubInputSchema = z.object({
  name: z.string().trim().min(2, "Navn må være minst 2 tegn"),
  address: z.string().trim().min(2, "Adresse er påkrevd"),
  active: z.boolean(),
});

const clubSettingsSchema = z.object({
  name: z.string().trim().min(2),
  address: z.string().trim().min(2),
  active: z.boolean(),
  defaultFacilityId: z.string().nullable().optional(),
  daglig_leder_email: z.string().trim().email().optional().or(z.literal("")),
  apningstider: z
    .object({
      hverdag: z.string(),
      helg: z.string(),
    })
    .optional(),
});

export type ClubInput = z.infer<typeof clubInputSchema>;
export type ClubSettingsInput = z.infer<typeof clubSettingsSchema>;

// ----------------- Actions -----------------

export async function addClub(raw: unknown) {
  const user = await krevAdmin();
  const parsed = clubInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ugyldig input");
  }
  const ny = await prisma.location.create({
    data: {
      name: parsed.data.name,
      address: parsed.data.address,
      active: parsed.data.active,
    },
  });
  await audit({
    actorId: user.id,
    action: "club.created",
    target: `Location:${ny.id}`,
  });
  revalidatePath("/admin/klubb/innstillinger");
}

export async function updateClubSettings(id: string, raw: unknown) {
  const user = await krevAdmin();
  const parsed = clubSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ugyldig input");
  }
  await prisma.location.update({
    where: { id },
    data: {
      name: parsed.data.name,
      address: parsed.data.address,
      active: parsed.data.active,
    },
  });
  await audit({
    actorId: user.id,
    action: "club.settings.updated",
    target: `Location:${id}`,
    metadata: {
      defaultFacilityId: parsed.data.defaultFacilityId ?? null,
      daglig_leder_email: parsed.data.daglig_leder_email ?? null,
      apningstider: parsed.data.apningstider ?? null,
    },
  });
  revalidatePath("/admin/klubb/innstillinger");
}

export async function removeClub(id: string) {
  const user = await krevAdmin();
  // Soft-delete via active=false. Hard-delete er destruktivt for booking-historikk.
  await prisma.location.update({
    where: { id },
    data: { active: false },
  });
  await audit({
    actorId: user.id,
    action: "club.deactivated",
    target: `Location:${id}`,
  });
  revalidatePath("/admin/klubb/innstillinger");
}
