"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import type { Prisma } from "@/generated/prisma/client";

export type SpillerStatus = "Ny" | "Aktiv" | "Fokus" | "Pause";

const GYLDIGE_STATUSER: readonly SpillerStatus[] = [
  "Ny",
  "Aktiv",
  "Fokus",
  "Pause",
] as const;

export type EndreSpillerStatusResult =
  | { ok: true }
  | { ok: false; error: string };

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

/**
 * Lagrer manuell coach-overstyring av en spillers board-status i
 * `preferences.boardStatus`. Auto-klassifisering i boardet bruker
 * denne hvis satt, ellers utleder den fra aktivitet.
 */
export async function endreSpillerStatus(
  userId: string,
  status: SpillerStatus,
): Promise<EndreSpillerStatusResult> {
  let aktor;
  try {
    aktor = await krevCoach();
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "forbidden",
    };
  }

  if (!userId || typeof userId !== "string") {
    return { ok: false, error: "Mangler userId" };
  }
  if (!GYLDIGE_STATUSER.includes(status)) {
    return { ok: false, error: `Ugyldig status: ${String(status)}` };
  }

  const spiller = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, preferences: true },
  });
  if (!spiller) return { ok: false, error: "Spiller finnes ikke" };
  if (spiller.role !== "PLAYER") {
    return { ok: false, error: "Valgt bruker er ikke en spiller" };
  }

  // Slå sammen eksisterende preferences med ny boardStatus-verdi.
  const eksisterende: Record<string, unknown> =
    spiller.preferences &&
    typeof spiller.preferences === "object" &&
    !Array.isArray(spiller.preferences)
      ? (spiller.preferences as Record<string, unknown>)
      : {};

  const oppdatert: Prisma.InputJsonValue = {
    ...eksisterende,
    boardStatus: status,
    boardStatusSattAv: aktor.id,
    boardStatusSattAt: new Date().toISOString(),
  };

  await prisma.user.update({
    where: { id: userId },
    data: { preferences: oppdatert },
  });

  await audit({
    actorId: aktor.id,
    action: "user.boardStatus.changed",
    target: `User:${userId}`,
    metadata: { status },
  });

  revalidatePath("/admin/board");
  revalidatePath(`/admin/spillere/${userId}`);

  return { ok: true };
}
