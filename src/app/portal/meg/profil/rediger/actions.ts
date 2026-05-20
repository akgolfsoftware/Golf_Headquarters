"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

type UpdateProfileInput = {
  name?: string;
  phone?: string | null;
  homeClub?: string | null;
  ambition?: string | null;
};

export async function updateProfile(input: UpdateProfileInput): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: input.name?.trim() || user.name,
      phone: input.phone === "" ? null : input.phone ?? user.phone,
      homeClub:
        input.homeClub === "" ? null : input.homeClub ?? user.homeClub,
      ambition:
        input.ambition === "" ? null : input.ambition ?? user.ambition,
    },
  });

  revalidatePath("/portal/meg");
  revalidatePath("/portal/meg/profil/rediger");
}
