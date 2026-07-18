"use server";

/**
 * Server-actions for v2-booking:
 * - hentSlotVindu: re-henter slot-vindu når spilleren bytter tjeneste
 *   (varighet påvirker hvilke tider som får plass).
 * - opprettBooking: faktisk booking-opprettelse for «Book time»-knappen.
 *   Bruker credit-flyten (credit-booking.ts — CONFIRMED, atomisk trekk fra
 *   coaching-pakken) når brukeren har credits. Uten credits opprettes
 *   INGENTING — returnerer en ærlig KREVER_BETALING-grunn slik at UI kan
 *   vise «krever coaching-pakke eller betaling» og lenke til abonnement.
 *
 * Auth kreves på begge — samme tilgang som selve booking-flaten.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { beregnSlotVindu, type SlotVindu } from "@/lib/portal-booking/slot-vindu";
import { createCreditBooking } from "@/lib/booking/credit-booking";
import { kanBrukeCredits } from "@/lib/booking/credits-tilgang";
import { stripeKlient } from "@/lib/stripe";
import { sjekkKollisjon, erKollisjonsfeil, kollisjonsmelding } from "@/lib/booking/kollisjonsvern";
import { APP_URL } from "@/lib/app-url";

export async function hentSlotVindu(tjenesteId: string): Promise<SlotVindu> {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  return beregnSlotVindu(tjenesteId);
}

export type OpprettBookingInput = {
  serviceTypeId: string;
  coachId: string;
  /** Dag-ISO fra slot-vinduet (SlotDag.datoIso) — samme streng som ble vist som ledig. */
  datoIso: string;
  /** Klokkeslett "HH:MM", server-lokal (Oslo) tid — fra SlotTid.kl. */
  kl: string;
};

export type OpprettBookingResult =
  | { ok: true; bookingId: string; startIso: string; serviceNavn: string; coachNavn: string }
  | { ok: false; grunn: string };

export async function opprettBooking(input: OpprettBookingInput): Promise<OpprettBookingResult> {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const harCredits =
    !!subscription &&
    kanBrukeCredits(subscription) &&
    subscription.monthlyCredits > 0 &&
    subscription.creditsRemaining > 0;

  if (!harCredits) {
    return { ok: false, grunn: "KREVER_BETALING" };
  }

  const [t, m] = input.kl.split(":").map(Number);
  if (Number.isNaN(t) || Number.isNaN(m)) {
    return { ok: false, grunn: "Ugyldig klokkeslett." };
  }
  const dag = new Date(input.datoIso);
  if (Number.isNaN(dag.getTime())) {
    return { ok: false, grunn: "Ugyldig dato." };
  }
  // Gjenoppbygger presist starttidspunkt fra dag (server-lokal midnatt) + kl
  // (server-lokal HH:MM) — samme lokale referanse som availability-engine
  // brukte til å produsere begge verdiene i slot-vinduet.
  const startAt = new Date(dag.getFullYear(), dag.getMonth(), dag.getDate(), t, m, 0, 0);

  try {
    const result = await createCreditBooking({
      serviceTypeId: input.serviceTypeId,
      coachId: input.coachId,
      start: startAt.toISOString(),
    });

    const booking = await prisma.booking.findUnique({
      where: { id: result.bookingId },
      include: {
        serviceType: { select: { name: true } },
        coach: { select: { name: true } },
      },
    });
    if (!booking) {
      return {
        ok: false,
        grunn: "Booking ble opprettet, men kunne ikke leses tilbake. Sjekk «Mine bookinger».",
      };
    }

    return {
      ok: true,
      bookingId: booking.id,
      startIso: booking.startAt.toISOString(),
      serviceNavn: booking.serviceType.name,
      coachNavn: booking.coach?.name ?? "coach",
    };
  } catch (err) {
    return { ok: false, grunn: err instanceof Error ? err.message : "Booking feilet. Prøv igjen." };
  }
}


export type KortBetalingResult = { ok: true; url: string } | { ok: false; grunn: string };

/**
 * B7 (booking-trygging 2026-07-13): kortbetaling for spillere UTEN
 * coaching-pakke — samme kjede som den offentlige drop-in-flyten:
 * PENDING-booking (med kollisjonsvern i transaksjon) → Stripe Checkout →
 * webhooken (checkout.session.completed) bekrefter bookingen og fører
 * betalingen. Utløper Checkout (30 min) kanselleres bookingen av webhooken.
 */
export async function opprettBookingMedKort(
  input: OpprettBookingInput,
): Promise<KortBetalingResult> {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const [t, m] = input.kl.split(":").map(Number);
  if (Number.isNaN(t) || Number.isNaN(m)) return { ok: false, grunn: "Ugyldig klokkeslett." };
  const dag = new Date(input.datoIso);
  if (Number.isNaN(dag.getTime())) return { ok: false, grunn: "Ugyldig dato." };
  const startAt = new Date(dag.getFullYear(), dag.getMonth(), dag.getDate(), t, m, 0, 0);
  if (startAt.getTime() <= Date.now()) return { ok: false, grunn: "Tidspunktet er passert." };

  const service = await prisma.serviceType.findUnique({
    where: { id: input.serviceTypeId },
    select: { id: true, name: true, slug: true, priceOre: true, durationMin: true, coachUserId: true },
  });
  if (!service) return { ok: false, grunn: "Tjenesten finnes ikke." };
  if (service.priceOre < 300) return { ok: false, grunn: "Tjenesten mangler gyldig pris — kontakt oss." };
  const endAt = new Date(startAt.getTime() + service.durationMin * 60_000);

  const lokasjon = await prisma.location.findFirst({
    where: service.slug.includes("trackman")
      ? { name: { contains: "Mulligan" } }
      : { name: { contains: "Fredrikstad" } },
  }) ?? (await prisma.location.findFirst());
  if (!lokasjon) return { ok: false, grunn: "Ingen lokasjon registrert — kontakt oss." };

  let booking: { id: string };
  try {
    booking = await prisma.$transaction(async (tx) => {
      await sjekkKollisjon(tx, {
        coachId: service.coachUserId ?? input.coachId ?? null,
        startAt,
        endAt,
      });
      return tx.booking.create({
        data: {
          userId: user.id,
          serviceTypeId: service.id,
          locationId: lokasjon.id,
          coachId: service.coachUserId ?? input.coachId ?? null,
          startAt,
          endAt,
          status: "PENDING",
          priceOre: service.priceOre,
        },
        select: { id: true },
      });
    });
  } catch (e) {
    if (erKollisjonsfeil(e)) return { ok: false, grunn: kollisjonsmelding(e) };
    throw e;
  }

  const appUrl = APP_URL;
  const session = await stripeKlient().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "nok",
          product_data: {
            name: service.name,
            description: `${startAt.toLocaleString("nb-NO", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Oslo" })} hos ${lokasjon.name}`,
          },
          unit_amount: service.priceOre,
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: booking.id, kilde: "portal" },
    success_url: `${appUrl}/portal/booking?betalt=1`,
    cancel_url: `${appUrl}/portal/booking?avbrutt=1`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });
  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeCheckoutSessionId: session.id },
  });
  if (!session.url) return { ok: false, grunn: "Betalingssiden kunne ikke åpnes — prøv igjen." };
  return { ok: true, url: session.url };
}
