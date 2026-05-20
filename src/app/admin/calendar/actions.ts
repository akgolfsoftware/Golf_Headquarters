"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

export type OpprettOktInput = {
  spillerId: string;
  serviceTypeId: string;
  locationId: string;
  facilityId?: string;
  startAt: Date | string;
  varighetMin: number;
  notater?: string;
};

export type OpprettOktResult = {
  ok: true;
  bookingId: string;
};

export async function opprettOktPaaTid(
  data: OpprettOktInput,
): Promise<OpprettOktResult> {
  const aktor = await krevCoach();

  if (!data.spillerId) throw new Error("spillerId mangler");
  if (!data.serviceTypeId) throw new Error("serviceTypeId mangler");
  if (!data.locationId) throw new Error("locationId mangler");
  if (!data.varighetMin || data.varighetMin <= 0) {
    throw new Error("varighetMin må være > 0");
  }

  const startAt = data.startAt instanceof Date ? data.startAt : new Date(data.startAt);
  if (Number.isNaN(startAt.getTime())) throw new Error("Ugyldig startAt");
  const endAt = new Date(startAt.getTime() + data.varighetMin * 60_000);

  // Verifiser at relaterte poster finnes — gir klarere feilmeldinger enn FK-feil.
  const [spiller, serviceType, location] = await Promise.all([
    prisma.user.findUnique({
      where: { id: data.spillerId },
      select: { id: true, role: true },
    }),
    prisma.serviceType.findUnique({
      where: { id: data.serviceTypeId },
      select: { id: true, priceOre: true },
    }),
    prisma.location.findUnique({
      where: { id: data.locationId },
      select: { id: true },
    }),
  ]);

  if (!spiller) throw new Error("Spiller finnes ikke");
  if (spiller.role !== "PLAYER") throw new Error("Valgt bruker er ikke en spiller");
  if (!serviceType) throw new Error("Tjeneste finnes ikke");
  if (!location) throw new Error("Lokasjon finnes ikke");

  // Verifiser facility hvis sendt (må tilhøre samme lokasjon)
  let facilityId: string | null = null;
  if (data.facilityId) {
    const facility = await prisma.facility.findUnique({
      where: { id: data.facilityId },
      select: { id: true, locationId: true, active: true },
    });
    if (!facility) throw new Error("Fasilitet finnes ikke");
    if (facility.locationId !== location.id) {
      throw new Error("Fasilitet hører ikke til valgt lokasjon");
    }
    if (!facility.active) throw new Error("Fasilitet er inaktiv");
    facilityId = facility.id;
  }

  const booking = await prisma.booking.create({
    data: {
      userId: spiller.id,
      serviceTypeId: serviceType.id,
      locationId: location.id,
      facilityId,
      startAt,
      endAt,
      status: "CONFIRMED",
      priceOre: serviceType.priceOre,
      notes: data.notater?.trim() || null,
    },
    select: { id: true },
  });

  await audit({
    actorId: aktor.id,
    action: "booking.created",
    target: `Booking:${booking.id}`,
    metadata: {
      via: "calendar.quick-add",
      spillerId: spiller.id,
      serviceTypeId: serviceType.id,
      locationId: location.id,
      startAt: startAt.toISOString(),
      varighetMin: data.varighetMin,
    },
  });

  revalidatePath("/admin/calendar");
  revalidatePath("/admin/bookings");

  return { ok: true, bookingId: booking.id };
}

/**
 * Flytt en eksisterende booking til et nytt tidspunkt. Brukes av drag-drop
 * i kalender-grid. Beholder varighet (endAt = nytt startAt + opprinnelig
 * varighet).
 */
export async function moveSession(
  bookingId: string,
  newStartAt: Date | string,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const aktor = await krevCoach();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, startAt: true, endAt: true, status: true },
  });
  if (!booking) return { ok: false, feil: "Booking ikke funnet" };
  if (booking.status === "CANCELLED") {
    return { ok: false, feil: "Booking er allerede kansellert" };
  }

  const start =
    newStartAt instanceof Date ? newStartAt : new Date(newStartAt);
  if (Number.isNaN(start.getTime())) {
    return { ok: false, feil: "Ugyldig start-tidspunkt" };
  }
  const varighetMs = booking.endAt.getTime() - booking.startAt.getTime();
  const end = new Date(start.getTime() + varighetMs);

  await prisma.booking.update({
    where: { id: bookingId },
    data: { startAt: start, endAt: end },
  });

  await audit({
    actorId: aktor.id,
    action: "booking.moved",
    target: `Booking:${bookingId}`,
    metadata: {
      from: booking.startAt.toISOString(),
      to: start.toISOString(),
    },
  });

  revalidatePath("/admin/calendar");
  revalidatePath("/admin/bookings");
  return { ok: true };
}

/**
 * Opprett en ny økt fra et ledig slot i kalenderen. Tynt wrapper rundt
 * opprettOktPaaTid for å gi mer idiomatisk navn fra UI.
 */
export async function createSessionFromCalendar(data: OpprettOktInput) {
  return opprettOktPaaTid(data);
}

/**
 * Kanseller en booking (myk-sletting via status=CANCELLED). Beholder
 * historikk og audit-log.
 */
export async function cancelSession(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const aktor = await krevCoach();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, status: true, userId: true, startAt: true },
  });
  if (!booking) return { ok: false, feil: "Booking ikke funnet" };
  if (booking.status === "CANCELLED") {
    return { ok: false, feil: "Booking er allerede kansellert" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  await audit({
    actorId: aktor.id,
    action: "booking.cancelled",
    target: `Booking:${bookingId}`,
    metadata: {
      via: "calendar.cancel",
      userId: booking.userId,
      startAt: booking.startAt.toISOString(),
    },
  });

  revalidatePath("/admin/calendar");
  revalidatePath("/admin/bookings");
  return { ok: true };
}
