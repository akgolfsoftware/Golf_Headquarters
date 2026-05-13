"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { isSlotStillAvailable } from "@/lib/booking/availability";
import { audit } from "@/lib/audit";
import { pushBookingToCalendar } from "@/lib/google-calendar";

export type CreditBookingInput = {
  serviceTypeId: string;
  coachId: string;
  start: string; // ISO datetime
  notes?: string;
};

export type CreditBookingResult = {
  bookingId: string;
};

/**
 * Oppretter en booking som trekkes fra Academy-abonnementets credits.
 *
 * Atomisk: dekrementer credits og oppretter booking i samme transaksjon.
 * Defensiv mot race condition via `where: { creditsRemaining: { gt: 0 } }`.
 * Returnerer 0 oppdaterte rader hvis to forespørsler kjemper om siste credit
 * — den som taper får feilmelding.
 *
 * Tilgangsregler:
 * - Bruker må være innlogget (PLAYER/PARENT)
 * - Bruker må ha aktivt abonnement med credits igjen
 * - Slot må fortsatt være ledig
 */
export async function createCreditBooking(
  input: CreditBookingInput,
): Promise<CreditBookingResult> {
  const user = await requirePortalUser();

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  if (!subscription) {
    throw new Error("Du har ikke et aktivt abonnement.");
  }
  if (subscription.status !== "ACTIVE") {
    throw new Error("Abonnementet ditt er ikke aktivt.");
  }
  if (subscription.monthlyCredits === 0) {
    throw new Error(
      "Abonnementet ditt gir ikke coaching-timer. Oppgrader til Performance for å booke.",
    );
  }
  if (subscription.creditsRemaining <= 0) {
    throw new Error(
      "Du har brukt opp denne månedens coaching-timer. Saldoen resettes ved neste fakturering.",
    );
  }

  const service = await prisma.serviceType.findUnique({
    where: { id: input.serviceTypeId },
  });
  if (!service || !service.active) {
    throw new Error("Tjeneste ikke tilgjengelig.");
  }

  const startAt = new Date(input.start);
  if (isNaN(startAt.getTime())) {
    throw new Error("Ugyldig dato.");
  }

  const ok = await isSlotStillAvailable(service.id, startAt, input.coachId);
  if (!ok) {
    throw new Error(
      "Tiden ble dessverre booket av noen andre. Velg en annen tid.",
    );
  }

  const endAt = new Date(startAt.getTime() + service.durationMin * 60_000);

  // Default-location: samme regel som drop-in. Mulligan for Trackman, GFGK ellers.
  const lokasjon = await prisma.location.findFirst({
    where: {
      name: service.slug.includes("trackman")
        ? "Mulligan Indoor Golf"
        : "Gamle Fredrikstad GK",
    },
  });
  if (!lokasjon) {
    throw new Error("Mangler lokasjon i seed-data.");
  }

  // Atomisk: dekrementer credits + opprett booking i samme transaksjon.
  // updateMany med where.creditsRemaining > 0 sikrer at vi ikke får negativ saldo
  // ved race condition (count = 0 betyr at noen andre tok siste credit).
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.subscription.updateMany({
      where: { id: subscription.id, creditsRemaining: { gt: 0 } },
      data: { creditsRemaining: { decrement: 1 } },
    });

    if (updated.count === 0) {
      throw new Error(
        "Kunne ikke trekke fra credit — saldoen er allerede tom. Last siden på nytt.",
      );
    }

    const booking = await tx.booking.create({
      data: {
        userId: user.id,
        serviceTypeId: service.id,
        locationId: lokasjon.id,
        startAt,
        endAt,
        status: "CONFIRMED",
        priceOre: 0,
        notes: input.notes?.trim() || null,
        subscriptionId: subscription.id,
      },
    });

    return booking;
  });

  await audit({
    actorId: user.id,
    action: "booking.credit.create",
    target: result.id,
    metadata: {
      subscriptionId: subscription.id,
      serviceSlug: service.slug,
      coachId: input.coachId,
      startAt: startAt.toISOString(),
    },
  });

  // Best-effort: push til coachens Google Calendar (oppdaterer Booking.googleEventId)
  try {
    await pushBookingToCalendar(result.id);
  } catch (err) {
    console.error("[credit-booking] calendar push failed", err);
  }

  revalidatePath("/portal/meg/bookinger");
  revalidatePath("/portal");

  return { bookingId: result.id };
}
