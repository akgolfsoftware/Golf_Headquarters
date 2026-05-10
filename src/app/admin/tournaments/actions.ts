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

export type TournamentInput = {
  name: string;
  startDate: string;
  endDate?: string | null;
  courseId?: string | null;
  format: string;
  notes?: string | null;
};

export async function createTournament(input: TournamentInput) {
  const user = await krevCoach();
  const ny = await prisma.tournament.create({
    data: {
      name: input.name.trim(),
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      courseId: input.courseId || null,
      format: input.format,
      notes: input.notes?.trim() || null,
    },
  });
  await audit({
    actorId: user.id,
    action: "tournament.created",
    target: `Tournament:${ny.id}`,
    metadata: { name: ny.name },
  });
  revalidatePath("/admin/tournaments");
  return ny.id;
}

export async function updateTournament(id: string, input: TournamentInput) {
  const user = await krevCoach();
  await prisma.tournament.update({
    where: { id },
    data: {
      name: input.name.trim(),
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      courseId: input.courseId || null,
      format: input.format,
      notes: input.notes?.trim() || null,
    },
  });
  await audit({
    actorId: user.id,
    action: "tournament.updated",
    target: `Tournament:${id}`,
  });
  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${id}`);
}

export async function deleteTournament(id: string) {
  const user = await krevCoach();
  await prisma.tournament.delete({ where: { id } });
  await audit({
    actorId: user.id,
    action: "tournament.deleted",
    target: `Tournament:${id}`,
  });
  revalidatePath("/admin/tournaments");
  redirect("/admin/tournaments");
}

export type ResultInput = {
  userId: string;
  position?: number | null;
  score?: number | null;
  notes?: string | null;
};

export async function addResult(tournamentId: string, input: ResultInput) {
  const user = await krevCoach();
  await prisma.tournamentResult.upsert({
    where: {
      tournamentId_userId: { tournamentId, userId: input.userId },
    },
    create: {
      tournamentId,
      userId: input.userId,
      position: input.position ?? null,
      score: input.score ?? null,
      notes: input.notes?.trim() || null,
    },
    update: {
      position: input.position ?? null,
      score: input.score ?? null,
      notes: input.notes?.trim() || null,
    },
  });
  await audit({
    actorId: user.id,
    action: "tournament_result.saved",
    target: `Tournament:${tournamentId}`,
    metadata: { userId: input.userId },
  });
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

export async function deleteResult(tournamentId: string, resultId: string) {
  const user = await krevCoach();
  await prisma.tournamentResult.delete({ where: { id: resultId } });
  await audit({
    actorId: user.id,
    action: "tournament_result.deleted",
    target: `TournamentResult:${resultId}`,
  });
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}
