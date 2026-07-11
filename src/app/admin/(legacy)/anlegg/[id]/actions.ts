"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    throw new Error("forbidden");
  }
  return user;
}

export type CreateFacilityBookingInput = {
  locationId: string;
  facilityId?: string;
  serviceTypeId: string;
  userId?: string;
  startAt: string; // ISO
  endAt: string; // ISO
  notes?: string;
};

/**
 * Oppretter en booking koblet til en spesifikk fasilitet.
 *
 * Spesialregel: hvis coach er Anders og ingen facilityId er gitt, defaulter
 * vi til Performance Studio på GFGK (per spec i README).
 */
export async function createFacilityBooking(input: CreateFacilityBookingInput) {
  const user = await krevCoach();

  let facilityId = input.facilityId;

  // Anders-default: Performance Studio på GFGK når ingen fasilitet er valgt
  if (!facilityId && user.email === "anders@akgolf.no") {
    const studio = await prisma.facility.findFirst({
      where: {
        type: "STUDIO",
        location: { name: { contains: "Gamle Fredrikstad", mode: "insensitive" } },
      },
    });
    facilityId = studio?.id;
  }

  const startAt = new Date(input.startAt);
  const endAt = new Date(input.endAt);

  if (endAt <= startAt) {
    throw new Error("endAt må være etter startAt");
  }

  // Hent coachId fra serviceType — brukes i unik-indeks for dobbel-booking-vern.
  const serviceType = await prisma.serviceType.findUnique({
    where: { id: input.serviceTypeId },
    select: { coachUserId: true },
  });

  // Konflikt-sjekk: er fasiliteten booket i samme tidsrom?
  if (facilityId) {
    const konflikt = await prisma.booking.findFirst({
      where: {
        facilityId,
        status: { in: ["PENDING", "CONFIRMED"] },
        AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
      },
      select: { id: true, startAt: true, endAt: true },
    });
    if (konflikt) {
      throw new Error(
        `Fasiliteten er allerede booket i dette tidsrommet (booking ${konflikt.id})`,
      );
    }
  }

  let booking: { id: string };
  try {
    booking = await prisma.booking.create({
      data: {
        locationId: input.locationId,
        facilityId,
        serviceTypeId: input.serviceTypeId,
        userId: input.userId,
        startAt,
        endAt,
        notes: input.notes,
        status: "CONFIRMED",
        priceOre: 0,
        coachId: serviceType?.coachUserId ?? null,
      },
      select: { id: true },
    });
  } catch (e) {
    // P2002: unique constraint — coachen er allerede booket på dette tidspunktet
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("Denne timen er allerede booket for denne coachen. Velg et annet tidspunkt.");
    }
    throw e;
  }

  await audit({
    actorId: user.id,
    action: "facility_booking.created",
    target: `Booking:${booking.id}`,
  });

  revalidatePath(`/admin/anlegg/${input.locationId}`);
  return { id: booking.id };
}

export async function moveFacilityBooking(input: {
  bookingId: string;
  newStartAt: string;
  newEndAt: string;
  newFacilityId?: string;
}) {
  const user = await krevCoach();
  const newStart = new Date(input.newStartAt);
  const newEnd = new Date(input.newEndAt);
  if (newEnd <= newStart) throw new Error("endAt må være etter startAt");

  const eksisterende = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    select: { locationId: true, facilityId: true },
  });
  if (!eksisterende) throw new Error("Booking ikke funnet");

  const targetFacilityId = input.newFacilityId ?? eksisterende.facilityId;

  // Konflikt-sjekk (eksluder selve bookingen)
  if (targetFacilityId) {
    const konflikt = await prisma.booking.findFirst({
      where: {
        facilityId: targetFacilityId,
        id: { not: input.bookingId },
        status: { in: ["PENDING", "CONFIRMED"] },
        AND: [{ startAt: { lt: newEnd } }, { endAt: { gt: newStart } }],
      },
      select: { id: true },
    });
    if (konflikt) {
      throw new Error("Konflikt: fasilitet er allerede booket i målperioden");
    }
  }

  await prisma.booking.update({
    where: { id: input.bookingId },
    data: {
      startAt: newStart,
      endAt: newEnd,
      facilityId: targetFacilityId,
    },
  });

  await audit({
    actorId: user.id,
    action: "facility_booking.moved",
    target: `Booking:${input.bookingId}`,
  });

  revalidatePath(`/admin/anlegg/${eksisterende.locationId}`);
}

export async function cancelFacilityBooking(bookingId: string) {
  const user = await krevCoach();
  const eksisterende = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { locationId: true },
  });
  if (!eksisterende) throw new Error("Booking ikke funnet");

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  await audit({
    actorId: user.id,
    action: "facility_booking.cancelled",
    target: `Booking:${bookingId}`,
  });

  revalidatePath(`/admin/anlegg/${eksisterende.locationId}`);
}

export type FacilityStats = {
  facilityId: string;
  name: string;
  bookedHours: number;
  uniqueAttendees: number;
  bookingsCount: number;
  utilizationPct: number; // mot 10 timer/dag som baseline
};

/**
 * Returnerer utnyttelsesstatistikk per fasilitet for en lokasjon i en
 * angitt periode (default siste 30 dager).
 *
 * Brukes av daglig leder for å se belegg per fasilitet.
 */
export async function getFacilityStats(input: {
  locationId: string;
  fra?: string;
  til?: string;
}): Promise<FacilityStats[]> {
  await krevCoach();
  const til = input.til ? new Date(input.til) : new Date();
  const fra = input.fra
    ? new Date(input.fra)
    : new Date(til.getTime() - 30 * 24 * 60 * 60 * 1000);

  const facilities = await prisma.facility.findMany({
    where: { locationId: input.locationId, active: true },
    select: {
      id: true,
      name: true,
      bookings: {
        where: {
          startAt: { gte: fra, lte: til },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        select: { startAt: true, endAt: true, userId: true },
      },
    },
  });

  const dager = Math.max(
    1,
    Math.round((til.getTime() - fra.getTime()) / (24 * 60 * 60 * 1000)),
  );
  const baselineHours = dager * 10; // 10 t/dag som "full kapasitet"

  return facilities.map((f) => {
    const bookedMinutes = f.bookings.reduce((sum, b) => {
      return sum + (b.endAt.getTime() - b.startAt.getTime()) / 60000;
    }, 0);
    const bookedHours = bookedMinutes / 60;
    const attendees = new Set(f.bookings.map((b) => b.userId).filter(Boolean));
    return {
      facilityId: f.id,
      name: f.name,
      bookedHours: Math.round(bookedHours * 10) / 10,
      uniqueAttendees: attendees.size,
      bookingsCount: f.bookings.length,
      utilizationPct: Math.min(
        100,
        Math.round((bookedHours / Math.max(1, baselineHours)) * 100),
      ),
    };
  });
}
