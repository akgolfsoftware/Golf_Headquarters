"use server";

// Server actions for Kommando-prosjekter. Gated til ADMIN.

import { revalidatePath } from "next/cache";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";

export async function createKommandoProject(input: { name: string }) {
  const user = await canAccessMissionControl();
  if (!user) throw new Error("Ikke autorisert");

  const name = input.name.trim();
  if (!name) return;

  await prisma.kommandoProject.create({
    data: { userId: user.id, name },
  });
  revalidatePath("/kommando/prosjekter");
  revalidatePath("/admin/prosjekter");
  revalidatePath("/kommando");
}

export async function archiveKommandoProject(id: string) {
  const user = await canAccessMissionControl();
  if (!user) throw new Error("Ikke autorisert");

  const project = await prisma.kommandoProject.findFirst({ where: { id, userId: user.id } });
  if (!project) return;

  await prisma.kommandoProject.update({
    where: { id: project.id },
    data: { status: project.status === "archived" ? "active" : "archived" },
  });
  revalidatePath("/kommando/prosjekter");
  revalidatePath("/admin/prosjekter");
}

export async function deleteKommandoProject(id: string) {
  const user = await canAccessMissionControl();
  if (!user) throw new Error("Ikke autorisert");

  // Løsne oppgavene fra prosjektet (behold dem), slett så prosjektet.
  await prisma.kommandoTask.updateMany({
    where: { userId: user.id, projectId: id },
    data: { projectId: null },
  });
  await prisma.kommandoProject.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/kommando/prosjekter");
  revalidatePath("/admin/prosjekter");
  revalidatePath("/kommando/oppgaver");
  revalidatePath("/kommando");
}
