"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { pushGruppeTime } from "@/lib/google-calendar-kilder";

type ActionResult = { ok: true } | { ok: false; feil: string };

async function krevCoach() {
  try {
    return await requireCoachActionUser();
  } catch {
    return null;
  }
}

/**
 * Eierskapsporten for gruppe-actions: en COACH kan kun endre grupper hun selv
 * eier (Group.coachId), ADMIN kan endre alle. Alle actions i denne fila tar en
 * groupId fra klienten — uten porten kunne en coach endre en annen coachs
 * gruppe ved å bytte id-en.
 */
async function eierGruppen(
  coach: { id: string; role: string },
  groupId: string,
): Promise<boolean> {
  const treff = await prisma.group.findFirst({
    where: { id: groupId, ...(coach.role === "COACH" ? { coachId: coach.id } : {}) },
    select: { id: true },
  });
  return treff != null;
}

/**
 * Legger en eksisterende spiller (role PLAYER) inn i en treningsgruppe.
 * Dedup mot @@unique([groupId, userId]): fanges som P2002 → vennlig feil.
 */
export async function leggTilGruppemedlem(
  groupId: string,
  userId: string,
): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };

  if (!(await eierGruppen(coach, groupId))) return { ok: false, feil: "Fant ikke gruppen." };

  // Coach-scoping. Dette er IKKE bare en lesetilgangs-sjekk: gruppemedlemskap
  // er selv en av de to tingene som gjør en spiller «coachet» av deg
  // (coached.ts). Uten porten kunne en coach legge en annen coachs spiller inn
  // i egen gruppe og dermed skaffe seg full tilgang til spilleren — hele
  // scopingen omgått i ett kall.
  const spiller = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(coach), { id: userId }] },
    select: { id: true, role: true, deletedAt: true },
  });
  if (!spiller || spiller.deletedAt) return { ok: false, feil: "Fant ikke spilleren." };
  if (spiller.role !== "PLAYER") return { ok: false, feil: "Bare spillere kan legges til i en gruppe." };

  // Soft-end-modellen (plan G1): raden per (groupId, userId) er unik og
  // gjenbrukes — re-innmelding nuller endedAt og stempler nytt joinedAt.
  const eksisterende = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { id: true, endedAt: true },
  });
  if (eksisterende && eksisterende.endedAt === null) {
    return { ok: false, feil: "Spilleren er allerede medlem av gruppen." };
  }
  if (eksisterende) {
    await prisma.groupMember.update({
      where: { id: eksisterende.id },
      data: { endedAt: null, joinedAt: new Date() },
    });
  } else {
    try {
      await prisma.groupMember.create({
        data: { groupId, userId },
      });
    } catch (e) {
      // P2002: unique constraint — kappløp med et parallelt kall.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { ok: false, feil: "Spilleren er allerede medlem av gruppen." };
      }
      throw e;
    }
  }

  await audit({
    actorId: coach.id,
    action: "group_member.added",
    target: `Group:${groupId}/User:${userId}`,
  });

  revalidatePath(`/admin/grupper/${groupId}`);
  return { ok: true };
}

/**
 * Fjerner en spiller fra en gruppe. Idempotent: ukjent medlemskap → vennlig feil.
 */
export async function fjernGruppemedlem(
  groupId: string,
  userId: string,
): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };
  if (!(await eierGruppen(coach, groupId))) return { ok: false, feil: "Fant ikke gruppen." };

  // Soft-end (plan G1): raden beholdes for historikk, endedAt markerer
  // utmeldingen. Alle «medlem nå»-spørringer filtrerer på endedAt: null.
  const medlem = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { id: true, endedAt: true },
  });
  if (!medlem || medlem.endedAt !== null) {
    return { ok: false, feil: "Spilleren er ikke medlem av gruppen." };
  }
  await prisma.groupMember.update({
    where: { id: medlem.id },
    data: { endedAt: new Date() },
  });

  await audit({
    actorId: coach.id,
    action: "group_member.removed",
    target: `Group:${groupId}/User:${userId}`,
  });

  revalidatePath(`/admin/grupper/${groupId}`);
  return { ok: true };
}

/**
 * Opprett gruppe trening på tidspunkt.
 * Støtter antall deltagere (maxParticipants), dato, tid, varighet.
 * recurring = "NONE" for engang.
 */
export async function opprettGruppeTrening(
  groupId: string,
  data: {
    title: string;
    description?: string;
    startAt: Date | string;
    endAt: Date | string;
    location?: string;
    recurring?: string;
    maxParticipants?: number;
  },
): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };

  if (!(await eierGruppen(coach, groupId))) return { ok: false, feil: "Fant ikke gruppen." };

  const startAt = data.startAt instanceof Date ? data.startAt : new Date(data.startAt);
  const endAt = data.endAt instanceof Date ? data.endAt : new Date(data.endAt);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return { ok: false, feil: "Ugyldig dato/tid." };
  }

  let opprettetId: string;
  try {
    const opprettet = await prisma.groupSchedule.create({
      data: {
        groupId,
        title: data.title,
        description: data.description || null,
        startAt,
        endAt,
        location: data.location || null,
        recurring: data.recurring || "NONE",
        maxParticipants: data.maxParticipants || null,
      },
    });
    opprettetId = opprettet.id;
  } catch (_e) {
    return { ok: false, feil: "Kunne ikke opprette gruppe trening." };
  }

  // Steg 3: gruppetimer skal også synes i Google-kalenderen.
  await pushGruppeTime(opprettetId);

  await audit({
    actorId: coach.id,
    action: "group_schedule.created",
    target: `Group:${groupId}`,
  });

  revalidatePath(`/admin/grupper/${groupId}`);
  revalidatePath(`/admin/grupper/${groupId}/timeplan`);
  return { ok: true };
}

/**
 * Dupliser gruppe time.
 * Kopier alle felter, sett ny startAt (dato, tid). Varighet beholdes.
 * Inkluder antall deltagere.
 */
export async function dupliserGruppeTime(
  groupId: string,
  originalId: string,
  newStartAt: Date | string,
): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };
  if (!(await eierGruppen(coach, groupId))) return { ok: false, feil: "Fant ikke gruppen." };

  // Originalen må tilhøre SAMME gruppe — ellers kunne en time kopieres ut av
  // en annen coachs gruppe og inn i sin egen.
  const original = await prisma.groupSchedule.findFirst({
    where: { id: originalId, groupId },
    select: { title: true, description: true, startAt: true, endAt: true, location: true, recurring: true, maxParticipants: true },
  });
  if (!original) return { ok: false, feil: "Fant ikke original tid." };

  const startAt = newStartAt instanceof Date ? newStartAt : new Date(newStartAt);
  if (Number.isNaN(startAt.getTime())) {
    return { ok: false, feil: "Ugyldig ny tidspunkt." };
  }

  const duration = original.endAt.getTime() - original.startAt.getTime();
  const endAt = new Date(startAt.getTime() + duration);

  let duplikatId: string;
  try {
    const duplikat = await prisma.groupSchedule.create({
      data: {
        groupId,
        title: original.title,
        description: original.description,
        startAt,
        endAt,
        location: original.location,
        recurring: original.recurring,
        maxParticipants: original.maxParticipants,
      },
    });
    duplikatId = duplikat.id;
  } catch (_e) {
    return { ok: false, feil: "Kunne ikke duplisere." };
  }

  await pushGruppeTime(duplikatId);

  await audit({
    actorId: coach.id,
    action: "group_schedule.duplicated",
    target: `Group:${groupId}/Schedule:${originalId}`,
  });

  revalidatePath(`/admin/grupper/${groupId}`);
  revalidatePath(`/admin/grupper/${groupId}/timeplan`);
  return { ok: true };
}
