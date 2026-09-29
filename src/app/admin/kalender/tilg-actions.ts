"use server";

/**
 * AG-05s Tilgjengelighet-fane: slå ett eksisterende ukentlig vindu av eller på.
 * Går gjennom den uendrede `updateSlot` (guard og eierskap der), og sender med
 * alle vinduets felt, så sted, periode og repetisjon ikke nullstilles.
 * Oppretter aldri et nytt vindu — det gjøres på /admin/availability.
 */

import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { updateSlot } from "@/app/admin/(legacy)/availability/actions";

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

export async function settUkedagAktiv(input: { slotId: string; paa: boolean }) {
  const user = await requireCoachActionUser();
  const slot = await prisma.coachAvailability.findUnique({ where: { id: input.slotId } });
  if (!slot || (slot.coachId !== user.id && user.role !== "ADMIN")) throw new Error("Fant ikke tidsvinduet.");
  await updateSlot(slot.id, {
    weekday: slot.weekday,
    date: iso(slot.date),
    startTime: slot.startTime,
    endTime: slot.endTime,
    active: input.paa,
    locationId: slot.locationId,
    validFrom: iso(slot.validFrom),
    validTo: iso(slot.validTo),
    recurrenceInterval: slot.recurrenceInterval,
  });
  revalidatePath("/admin/kalender");
}
