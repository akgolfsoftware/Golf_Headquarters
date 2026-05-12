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

  const booking = await prisma.booking.create({
    data: {
      userId: spiller.id,
      serviceTypeId: serviceType.id,
      locationId: location.id,
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
