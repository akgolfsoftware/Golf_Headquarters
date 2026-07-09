"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

export type SlotInput = {
  // Ett av weekday/date settes. weekday = ukentlig (0=man..6=søn), date = én-gangs.
  weekday?: number | null;
  date?: string | null; // ISO YYYY-MM-DD
  startTime: string; // "10:00"
  endTime: string; // "20:00"
  active: boolean;
  // Sted (anlegg) vinduet gjelder for. null = legacy «alle steder».
  locationId?: string | null;
  // Periode-gyldighet (års-perioder). null = alltid.
  validFrom?: string | null; // ISO YYYY-MM-DD
  validTo?: string | null;
  // Repetisjon: 1/null = hver uke, 2 = annenhver, 3 = hver tredje osv.
  recurrenceInterval?: number | null;
};

function tilMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/**
 * No-dobbeltsted-vern: en coach kan ALDRI være tilgjengelig på to steder
 * samtidig. Avvis hvis et eksisterende, aktivt vindu på et ANNET anlegg
 * overlapper i tid samme ukedag/dato.
 */
async function assertIkkeDobbeltSted(
  coachId: string,
  input: { locationId: string | null; weekday: number | null; date: Date | null; startTime: string; endTime: string },
  ignorerId?: string,
) {
  if (!input.locationId) return; // legacy «alle steder» — ingen sted-konflikt
  const andre = await prisma.coachAvailability.findMany({
    where: {
      coachId,
      active: true,
      locationId: { not: input.locationId },
      ...(ignorerId ? { id: { not: ignorerId } } : {}),
      ...(input.weekday !== null ? { weekday: input.weekday } : {}),
      ...(input.date !== null ? { date: input.date } : {}),
    },
    select: { startTime: true, endTime: true, location: { select: { name: true } } },
  });
  const nyStart = tilMin(input.startTime);
  const nySlutt = tilMin(input.endTime);
  for (const a of andre) {
    if (tilMin(a.startTime) < nySlutt && tilMin(a.endTime) > nyStart) {
      throw new Error(
        `Overlapper med tilgjengelighet på ${a.location?.name ?? "et annet sted"} — du kan ikke være to steder samtidig.`,
      );
    }
  }
}

function normaliser(input: SlotInput): {
  weekday: number | null;
  date: Date | null;
  locationId: string | null;
  validFrom: Date | null;
  validTo: Date | null;
  recurrenceInterval: number | null;
} {
  const weekday = input.weekday ?? null;
  const date = input.date ? new Date(input.date) : null;
  if (weekday === null && date === null) {
    throw new Error("Velg enten ukedag eller en spesifikk dato.");
  }
  if (tilMin(input.startTime) >= tilMin(input.endTime)) {
    throw new Error("Sluttid må være etter starttid.");
  }
  return {
    weekday,
    date,
    locationId: input.locationId ?? null,
    validFrom: input.validFrom ? new Date(input.validFrom) : null,
    validTo: input.validTo ? new Date(input.validTo) : null,
    // Repetisjon gjelder kun ukentlige vinduer.
    recurrenceInterval: weekday !== null ? (input.recurrenceInterval ?? null) : null,
  };
}

export async function addSlot(input: SlotInput) {
  const user = await krevCoach();
  const n = normaliser(input);
  await assertIkkeDobbeltSted(user.id, {
    locationId: n.locationId,
    weekday: n.weekday,
    date: n.date,
    startTime: input.startTime,
    endTime: input.endTime,
  });
  await prisma.coachAvailability.create({
    data: {
      coachId: user.id,
      weekday: n.weekday,
      date: n.date,
      locationId: n.locationId,
      validFrom: n.validFrom,
      validTo: n.validTo,
      recurrenceInterval: n.recurrenceInterval,
      startTime: input.startTime,
      endTime: input.endTime,
      active: input.active,
    },
  });
  revalidatePath("/admin/availability");
}

export async function updateSlot(id: string, input: SlotInput) {
  const user = await krevCoach();
  const slot = await prisma.coachAvailability.findUnique({ where: { id } });
  if (!slot) throw new Error("not-found");
  if (slot.coachId !== user.id && user.role !== "ADMIN") throw new Error("forbidden");
  const n = normaliser(input);
  await assertIkkeDobbeltSted(
    user.id,
    {
      locationId: n.locationId,
      weekday: n.weekday,
      date: n.date,
      startTime: input.startTime,
      endTime: input.endTime,
    },
    id,
  );
  await prisma.coachAvailability.update({
    where: { id },
    data: {
      weekday: n.weekday,
      date: n.date,
      locationId: n.locationId,
      validFrom: n.validFrom,
      validTo: n.validTo,
      recurrenceInterval: n.recurrenceInterval,
      startTime: input.startTime,
      endTime: input.endTime,
      active: input.active,
    },
  });
  revalidatePath("/admin/availability");
}

export async function deleteSlot(id: string) {
  const user = await krevCoach();
  const slot = await prisma.coachAvailability.findUnique({ where: { id } });
  if (!slot) throw new Error("not-found");
  if (slot.coachId !== user.id && user.role !== "ADMIN") throw new Error("forbidden");
  await prisma.coachAvailability.delete({ where: { id } });
  revalidatePath("/admin/availability");
}
