"use server";

// Server actions for Kommando-oppgaver. Gated til ADMIN. Skriver til
// kommando_tasks og revaliderer dashboard + oppgave-siden.

import { revalidatePath } from "next/cache";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";

export async function createKommandoTask(input: { title: string; priority: "normal" | "haster" }) {
  const user = await canAccessMissionControl();
  if (!user) throw new Error("Ikke autorisert");

  const title = input.title.trim();
  if (!title) return;

  await prisma.kommandoTask.create({
    data: {
      userId: user.id,
      title,
      priority: input.priority === "haster" ? "haster" : "normal",
    },
  });
  revalidatePath("/kommando/oppgaver");
  revalidatePath("/kommando");
}

export async function toggleKommandoTask(id: string) {
  const user = await canAccessMissionControl();
  if (!user) throw new Error("Ikke autorisert");

  const task = await prisma.kommandoTask.findFirst({ where: { id, userId: user.id } });
  if (!task) return;

  await prisma.kommandoTask.update({
    where: { id: task.id },
    data: { status: task.status === "open" ? "done" : "open" },
  });
  revalidatePath("/kommando/oppgaver");
  revalidatePath("/kommando");
}

export async function deleteKommandoTask(id: string) {
  const user = await canAccessMissionControl();
  if (!user) throw new Error("Ikke autorisert");

  await prisma.kommandoTask.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/kommando/oppgaver");
  revalidatePath("/kommando");
}
