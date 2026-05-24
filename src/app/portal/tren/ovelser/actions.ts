"use server";

import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { revalidatePath } from "next/cache";

export async function createCustomExercise(data: {
  navn: string;
  beskrivelse: string | null;
  defaultRepsSets: string | null;
  intensitet: number | null;
  muscleGroups: string[];
  fasilitetKrav: string[];
  videoUrl: string | null;
}) {
  const user = await requirePortalUser();

  await prisma.exerciseDefinition.create({
    data: {
      name: data.navn,
      description: data.beskrivelse ?? undefined,
      defaultRepsSets: data.defaultRepsSets ?? undefined,
      intensitet: data.intensitet ?? undefined,
      muscleGroups: data.muscleGroups,
      utstyr: data.fasilitetKrav,          // fri tekst-liste — passer bedre enn enum
      videoUrl: data.videoUrl ?? undefined,
      pyramidArea: "FYS",                  // egendefinerte øvelser er alltid FYS
      source: "PLAYER",
      visibility: "PRIVATE",
      createdBy: user.id,
    },
  });

  revalidatePath("/portal/tren/ovelser");
}
