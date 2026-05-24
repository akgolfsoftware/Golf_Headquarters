"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { nonEmpty, phone, optStr } from "@/lib/validation/schemas";

const UpdateProfileSchema = z.object({
  targetUserId: z.string().min(1).optional(),
  name: nonEmpty(200).optional(),
  phone: phone.nullable().optional(),
  homeClub: optStr(200),
  ambition: optStr(1000),
});

type UpdateProfileInput = {
  /**
   * Når satt: coach/admin redigerer en annen bruker. Krever rolle COACH eller
   * ADMIN. Hvis usatt: brukeren redigerer sin egen profil.
   */
  targetUserId?: string;
  name?: string;
  phone?: string | null;
  homeClub?: string | null;
  ambition?: string | null;
};

export async function updateProfile(input: UpdateProfileInput): Promise<void> {
  UpdateProfileSchema.parse(input);
  const me = await getCurrentUser();
  if (!me) throw new Error("unauthenticated");

  const targetId = input.targetUserId ?? me.id;
  const editingOther = targetId !== me.id;

  if (editingOther && me.role !== "COACH" && me.role !== "ADMIN") {
    throw new Error("forbidden");
  }

  const target = editingOther
    ? await prisma.user.findUnique({
        where: { id: targetId },
        select: {
          id: true,
          name: true,
          phone: true,
          homeClub: true,
          ambition: true,
        },
      })
    : me;
  if (!target) throw new Error("target-not-found");

  await prisma.user.update({
    where: { id: target.id },
    data: {
      name: input.name?.trim() || target.name,
      phone: input.phone === "" ? null : input.phone ?? target.phone,
      homeClub:
        input.homeClub === "" ? null : input.homeClub ?? target.homeClub,
      ambition:
        input.ambition === "" ? null : input.ambition ?? target.ambition,
    },
  });

  if (editingOther) {
    revalidatePath(`/admin/spillere/${target.id}`);
    revalidatePath(`/admin/elever/${target.id}`);
  } else {
    revalidatePath("/portal/meg");
    revalidatePath("/portal/meg/profil/rediger");
    revalidatePath("/portal");
  }
}
