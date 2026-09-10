"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sjekkKollisjon, erKollisjonsfeil } from "@/lib/booking/kollisjonsvern";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnHvisTilhoerer } from "@/lib/forelder";
import { kanBrukeCredits } from "@/lib/booking/credits-tilgang";
import { isSlotStillAvailable } from "@/lib/booking/availability";
import { audit } from "@/lib/audit";
import { pushBooking } from "@/lib/google-calendar-kilder";
import { varsleNyBooking } from "@/lib/booking/varsle-ny-booking";
import { notify } from "@/lib/notifications";
import { logError } from "@/lib/error-tracking";

export type CreditBookingInput = {
  serviceTypeId: string;
  coachId: string;
  start: string; // ISO datetime
  notes?: string;
  /** STEG 9.8: forelder booker for barnet — barnets id, verifisert på nytt her (aldri stolt på fra klienten). */
  barnId?: string;
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

  // STEG 9.8: eierId er PERSONEN bookingen gjelder for — barnet ved
  // forelder-booking, ellers den innloggede selv. Koblingen verifiseres her,
  // uavhengig av hva klienten allerede har sjekket.
  let eierId = user.id;
  if (input.barnId) {
    const barn = await hentBarnHvisTilhoerer(user.id, input.barnId);
    if (!barn) throw new Error("Barnet er ikke koblet til kontoen din.");
    eierId = barn.id;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId_kind: { userId: eierId, kind: "COACHING" } },
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
      "Du har brukt opp denne månedens coaching-timer. Saldoen fornyes ved neste fakturering.",
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

  // Fast coach vinner; ellers beholdes valgt coach gjennom kontroll og lagring.
  const coachForSlot = service.coachUserId ?? input.coachId;
  const ok = await isSlotStillAvailable(service.id, startAt, coachForSlot);
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
    throw new Error("Stedet for timen er ikke satt opp. Kontakt oss for å bestille.");
  }

  // Atomisk: dekrementer credits + opprett booking i samme transaksjon.
  // updateMany med where.creditsRemaining > 0 sikrer at vi ikke får negativ saldo
  // ved race condition (count = 0 betyr at noen andre tok siste credit).
  const result = await prisma
    .$transaction(async (tx) => {
      // Kollisjonsvern (A-pakken): sjekk INNE i transaksjonen med
      // advisory-lås — atomisk sammen med credit-trekk og opprettelse.
      const vern = await sjekkKollisjon(tx, {
        coachId: coachForSlot,
        serviceTypeId: service.id,
        startAt,
        endAt,
      });
      const updated = await tx.subscription.updateMany({
        where: { id: subscription.id, creditsRemaining: { gt: 0 } },
        data: { creditsRemaining: { decrement: 1 } },
      });

      if (updated.count === 0) {
        throw new Error(
          "Ingen coaching-timer igjen i pakken. Last siden på nytt for å se oppdatert saldo.",
        );
      }

      // Samme coach og plass i tilgjengelighet, kollisjonsvern og lagret booking.
      const booking = await tx.booking.create({
        data: {
          plassNr: vern.plassNr,
          userId: eierId,
          serviceTypeId: service.id,
          coachId: coachForSlot,
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
      coachId: coachForSlot,
      startAt: startAt.toISOString(),
      ...(input.barnId ? { paaVegneAv: eierId } : {}),
    },
  }).catch(error => logError({ context: "booking.creditBooking.audit", error, meta: { bookingId: result.id } }).catch(() => undefined));

  // Best-effort: push til coachens Google Calendar (oppdaterer Booking.googleEventId)
  try {
    await pushBooking(result.id);
  } catch (error) {
    await logError({
      context: "booking.creditBooking.calendarPush",
      error,
      meta: { bookingId: result.id },
      severity: "warn",
    }).catch(() => undefined);
  }

  // Best-effort: send bekreftelses-e-post (samme mal som drop-in,
  // men priceFormatted/paymentRef varierer basert på subscriptionId)
  try {
    const { sendBookingConfirmation } = await import("@/lib/email/booking-emails");
    await sendBookingConfirmation(result.id);
  } catch (error) {
    await logError({
      context: "booking.creditBooking.confirmationEmail",
      error,
      meta: { bookingId: result.id },
      severity: "warn",
    }).catch(() => undefined);
  }

  // In-app-varsel
  const tidStr = startAt.toLocaleString("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  await notify({
    userId: eierId,
    type: "booking",
    title: `Booking bekreftet — ${service.name}`,
    body: `${tidStr}. Trukket fra månedlig saldo (${subscription.creditsRemaining - 1} igjen).`,
    link: "/portal/meg/bookinger",
  }).catch(error => logError({ context: "booking.creditBooking.notification", error, meta: { bookingId: result.id } }).catch(() => undefined));

  // Coach/admin skal også vite om abonnements-bookinger — de gikk tidligere
  // helt stille forbi (kun spilleren ble varslet).
  await varsleNyBooking(result.id, "abonnement").catch(error => logError({ context: "booking.creditBooking.coachNotification", error, meta: { bookingId: result.id } }).catch(() => undefined));

  revalidatePath("/portal/meg/bookinger");
  revalidatePath("/portal");
  if (input.barnId) revalidatePath("/forelder/bookinger");

  return { bookingId: result.id };
}
