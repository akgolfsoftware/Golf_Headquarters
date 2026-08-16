"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { assertCapability } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { gruppemedlemRolleSchema, type GruppemedlemRolle } from "@/lib/domain/grupper";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { pushGruppeTime } from "@/lib/google-calendar-kilder";

type ActionResult = { ok: true } | { ok: false; feil: string };

async function krevCoach() {
  try {
    const user = await requireCoachActionUser();
    // G6: alle actions her endrer grupper/medlemmer → MANAGE_GROUPS
    // (i COACH-defaulten; kan trekkes per trener via REVOKE).
    await assertCapability(user, Capability.MANAGE_GROUPS);
    return user;
  } catch {
    return null;
  }
}

/**
 * Eierskapsporten for gruppe-actions: en COACH har redigeringstilgang når hun
 * er hovedtrener (Group.coachId) ELLER selv er aktivt COACH-medlem i gruppen
 * (GroupMember.role "COACH", endedAt null — plan G5). ASSISTANT-medlemskap gir
 * IKKE redigering, kun innsyn via scoping-grenen i coached.ts. ADMIN kan endre
 * alle. Alle actions i denne fila tar en groupId fra klienten — uten porten
 * kunne en coach endre en annen coachs gruppe ved å bytte id-en.
 */
async function eierGruppen(
  coach: { id: string; role: string },
  groupId: string,
): Promise<boolean> {
  const treff = await prisma.group.findFirst({
    where: {
      id: groupId,
      ...(coach.role === "COACH"
        ? {
            OR: [
              { coachId: coach.id },
              { members: { some: { userId: coach.id, role: "COACH", endedAt: null } } },
            ],
          }
        : {}),
    },
    select: { id: true },
  });
  return treff != null;
}

/**
 * Legger en eksisterende bruker inn i en treningsgruppe.
 * Rolle (plan G5): PLAYER (default, uendret spiller-flyt), ASSISTANT
 * (hjelpetrener) eller COACH (trener). Trenerrollene krever at målbrukeren
 * selv har User.role COACH eller ADMIN — og porten `eierGruppen` over sikrer
 * at kun gruppeeier, aktivt COACH-medlem eller ADMIN gjør innmeldingen.
 * Dedup mot @@unique([groupId, userId]): fanges som P2002 → vennlig feil.
 */
export async function leggTilGruppemedlem(
  groupId: string,
  userId: string,
  rolle: GruppemedlemRolle = "PLAYER",
): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };

  // Aldri stol på klient-verdien: role skrives rett i GroupMember.role og
  // styrer både innsyn (coached.ts) og redigering (eierGruppen). Zod ved
  // grensen (invariant 6).
  const rolleParse = gruppemedlemRolleSchema.safeParse(rolle);
  if (!rolleParse.success) return { ok: false, feil: "Ugyldig rolle." };
  const valgtRolle = rolleParse.data;

  if (!(await eierGruppen(coach, groupId))) return { ok: false, feil: "Fant ikke gruppen." };

  if (valgtRolle === "PLAYER") {
    // Coach-scoping. Dette er IKKE bare en lesetilgangs-sjekk: gruppemedlemskap
    // er selv en av tingene som gjør en spiller «coachet» av deg
    // (coached.ts). Uten porten kunne en coach legge en annen coachs spiller inn
    // i egen gruppe og dermed skaffe seg full tilgang til spilleren — hele
    // scopingen omgått i ett kall.
    const spiller = await prisma.user.findFirst({
      where: { AND: [coachScopedPlayerWhere(coach), { id: userId }] },
      select: { id: true, role: true, deletedAt: true },
    });
    if (!spiller || spiller.deletedAt) return { ok: false, feil: "Fant ikke spilleren." };
    if (spiller.role !== "PLAYER") return { ok: false, feil: "Bare spillere kan legges til i en gruppe." };
  } else {
    // Trenerroller (COACH/ASSISTANT): målbrukeren må selv være trener i
    // systemet — en spiller kan aldri gis trenerinnsyn i andre spillere via
    // et gruppemedlemskap. Ærlig feil fremfor stille nedgradering.
    const trener = await prisma.user.findFirst({
      where: { id: userId, role: { in: ["COACH", "ADMIN"] } },
      select: { id: true, deletedAt: true },
    });
    if (!trener || trener.deletedAt) {
      return { ok: false, feil: "Bare brukere med trenerrolle (COACH eller ADMIN) kan legges til som trener." };
    }
  }

  const hvem = valgtRolle === "PLAYER" ? "Spilleren" : "Treneren";

  // Soft-end-modellen (plan G1, gjelder alle roller): raden per
  // (groupId, userId) er unik og gjenbrukes — re-innmelding nuller endedAt og
  // stempler nytt joinedAt.
  const eksisterende = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { id: true, endedAt: true },
  });
  if (eksisterende && eksisterende.endedAt === null) {
    return { ok: false, feil: `${hvem} er allerede medlem av gruppen.` };
  }
  if (eksisterende) {
    // Reaktivering: rollen følger valget i DETTE kallet — beholdes når den er
    // lik, oppdateres når innmeldingen nå gjelder en annen rolle (G5).
    await prisma.groupMember.update({
      where: { id: eksisterende.id },
      data: { endedAt: null, joinedAt: new Date(), role: valgtRolle },
    });
  } else {
    try {
      await prisma.groupMember.create({
        data: { groupId, userId, role: valgtRolle },
      });
    } catch (e) {
      // P2002: unique constraint — kappløp med et parallelt kall.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { ok: false, feil: `${hvem} er allerede medlem av gruppen.` };
      }
      throw e;
    }
  }

  await audit({
    actorId: coach.id,
    action: "group_member.added",
    target: `Group:${groupId}/User:${userId}`,
    metadata: { role: valgtRolle },
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
