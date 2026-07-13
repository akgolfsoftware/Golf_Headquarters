"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sjekkKollisjon, erKollisjonsfeil } from "@/lib/booking/kollisjonsvern";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { kanBrukeCredits } from "@/lib/booking/credits-tilgang";
import { isSlotStillAvailable } from "@/lib/booking/availability";
import { audit } from "@/lib/audit";
import { pushBookingToCalendar } from "@/lib/google-calendar";
import { notify } from "@/lib/notifications";

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
  if (!kanBrukeCredits(subscription)) {
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
  const result = await prisma
    .$transaction(async (tx) => {
      // Kollisjonsvern (A-pakken): sjekk INNE i transaksjonen med
      // advisory-lås — atomisk sammen med credit-trekk og opprettelse.
      await sjekkKollisjon(tx, {
        coachId: service.coachUserId,
        startAt,
        endAt,
      });
      const updated = await tx.subscription.updateMany({
        where: { id: subscription.id, creditsRemaining: { gt: 0 } },
        data: { creditsRemaining: { decrement: 1 } },
      });

      if (updated.count === 0) {
        throw new Error(
          "Kunne ikke trekke fra credit — saldoen er allerede tom. Last siden på nytt.",
        );
      }

      // coachId settes med samme semantikk som drop-in (service.coachUserId) slik
      // at unique-constraintet [coachId, startAt, serviceTypeId] hindrer at to
      // abonnenter dobbeltbooker samme coach-slot. Gruppe-tjenester (coachUserId
      // = null) tillates fortsatt med flere deltakere.
      const booking = await tx.booking.create({
        data: {
          userId: user.id,
          serviceTypeId: service.id,
          coachId: service.coachUserId,
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
    })
    .catch((err: unknown) => {
      // Tap i et samtidighets-race fanges av unique-constraintet (P2002).
      // Transaksjonen rulles tilbake, så crediten blir IKKE trukket.
      if (erKollisjonsfeil(err)) {
        throw new Error(
          "Tiden ble nettopp tatt av noen andre. Velg en annen tid.",
        );
      }
      throw err;
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

  // Best-effort: send bekreftelses-e-post (samme mal som drop-in,
  // men priceFormatted/paymentRef varierer basert på subscriptionId)
  try {
    const { sendBookingConfirmation } = await import("@/lib/email/booking-emails");
    await sendBookingConfirmation(result.id);
  } catch (err) {
    console.error("[credit-booking] confirmation-email failed", err);
  }

  // In-app-varsel
  const tidStr = startAt.toLocaleString("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  await notify({
    userId: user.id,
    type: "booking",
    title: `Booking bekreftet — ${service.name}`,
    body: `${tidStr}. Trukket fra månedlig saldo (${subscription.creditsRemaining - 1} igjen).`,
    link: "/portal/meg/bookinger",
  });

  revalidatePath("/portal/meg/bookinger");
  revalidatePath("/portal");

  return { bookingId: result.id };
}
