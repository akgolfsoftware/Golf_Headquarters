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
import { hentBarnHvisTilhoerer } from "@/lib/forelder";
import { beregnSlotVindu, type SlotVindu } from "@/lib/portal-booking/slot-vindu";
import { createCreditBooking } from "@/lib/booking/credit-booking";
import { kanBrukeCredits } from "@/lib/booking/credits-tilgang";
import { stripeKlient } from "@/lib/stripe";
import { sjekkKollisjon, erKollisjonsfeil, kollisjonsmelding } from "@/lib/booking/kollisjonsvern";
import { acquireHold, DEFAULT_HOLD_TTL_MS } from "@/lib/booking/slot-hold";
import { recordBookingMetric } from "@/lib/booking/metrics";
import { APP_URL } from "@/lib/app-url";


export async function hentSlotVindu(tjenesteId: string): Promise<SlotVindu> {
  await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
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
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });

  const subscription = await prisma.subscription.findUnique({
    where: { userId_kind: { userId: user.id, kind: "COACHING" } },
  });
  const harCredits =
    !!subscription &&
    kanBrukeCredits(subscription) &&
    subscription.monthlyCredits > 0 &&
    subscription.creditsRemaining > 0;

  if (!harCredits) {
    await recordBookingMetric("book_credit_fail");
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

    await recordBookingMetric("book_success");
    return {
      ok: true,
      bookingId: booking.id,
      startIso: booking.startAt.toISOString(),
      serviceNavn: booking.serviceType.name,
      coachNavn: booking.coach?.name ?? "coach",
    };
  } catch (err) {
    await recordBookingMetric("book_slot_miss");
    return { ok: false, grunn: err instanceof Error ? err.message : "Booking feilet. Prøv igjen." };
  }
}


export type KortBetalingResult = { ok: true; url: string } | { ok: false; grunn: string };

export type KortBetalingInput = {
  serviceTypeId: string;
  coachId: string;
  /** Eksakt starttidspunkt fra availability-engine (slot.start.toISOString()). */
  startIso: string;
  notes?: string;
  /** STEG 9.8: forelder booker for barnet — barnets id, verifisert på nytt her. */
  barnId?: string;
  /** Hvor Stripe sender brukeren tilbake etter betaling — default «/portal/booking». */
  retururlBase?: string;
};

/**
 * B7 (booking-trygging 2026-07-13): kortbetaling for spillere UTEN
 * coaching-pakke — samme kjede som den offentlige drop-in-flyten:
 * PENDING-booking (med kollisjonsvern i transaksjon) → Stripe Checkout →
 * webhooken (checkout.session.completed) bekrefter bookingen og fører
 * betalingen. Utløper Checkout (30 min) kanselleres bookingen av webhooken.
 */
export async function opprettBookingMedKort(
  input: KortBetalingInput,
): Promise<KortBetalingResult> {
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });

  // STEG 9.8: eierId er PERSONEN bookingen gjelder for — barnet ved
  // forelder-booking, ellers den innloggede selv. Koblingen verifiseres her.
  let eierId = user.id;
  if (input.barnId) {
    const barn = await hentBarnHvisTilhoerer(user.id, input.barnId);
    if (!barn) return { ok: false, grunn: "Barnet er ikke koblet til kontoen din." };
    eierId = barn.id;
  }

  const startAt = new Date(input.startIso);
  if (Number.isNaN(startAt.getTime())) return { ok: false, grunn: "Ugyldig tidspunkt." };
  if (startAt.getTime() <= Date.now()) return { ok: false, grunn: "Tidspunktet er passert." };

  const service = await prisma.serviceType.findUnique({
    where: { id: input.serviceTypeId },
    select: { id: true, name: true, slug: true, priceOre: true, durationMin: true, coachUserId: true },
  });
  if (!service) return { ok: false, grunn: "Tjenesten finnes ikke." };
  if (service.priceOre < 300) return { ok: false, grunn: "Tjenesten mangler gyldig pris — kontakt oss." };
  const endAt = new Date(startAt.getTime() + service.durationMin * 60_000);
  const coachId = service.coachUserId ?? input.coachId;

  const hold = await acquireHold(
    {
      serviceTypeId: service.id,
      coachId,
      startIso: startAt.toISOString(),
    },
    user.id,
    DEFAULT_HOLD_TTL_MS,
  );
  if (!hold.ok) {
    await recordBookingMetric("book_hold_blocked");
    return {
      ok: false,
      grunn: "Noen andre holder på denne tiden akkurat nå. Velg en annen tid.",
    };
  }
  await recordBookingMetric("book_checkout_start");

  const lokasjon = await prisma.location.findFirst({
    where: service.slug.includes("trackman")
      ? { name: { contains: "Mulligan" } }
      : { name: { contains: "Fredrikstad" } },
  }) ?? (await prisma.location.findFirst());
  if (!lokasjon) return { ok: false, grunn: "Ingen lokasjon registrert — kontakt oss." };

  let booking: { id: string };
  try {
    booking = await prisma.$transaction(async (tx) => {
      const vern = await sjekkKollisjon(tx, {
        coachId,
        serviceTypeId: service.id,
        startAt,
        endAt,
      });
      return tx.booking.create({
        data: {
          plassNr: vern.plassNr,
          userId: eierId,
          serviceTypeId: service.id,
          locationId: lokasjon.id,
          coachId,
          startAt,
          endAt,
          status: "PENDING",
          priceOre: service.priceOre,
          notes: input.notes?.trim() || undefined,
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
    metadata: { bookingId: booking.id, kilde: "portal", ...(input.barnId ? { paaVegneAv: eierId } : {}) },
    success_url: `${appUrl}${input.retururlBase ?? "/portal/booking"}?betalt=1`,
    cancel_url: `${appUrl}${input.retururlBase ?? "/portal/booking"}?avbrutt=1`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });
  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeCheckoutSessionId: session.id },
  });
  if (!session.url) return { ok: false, grunn: "Betalingssiden kunne ikke åpnes — prøv igjen." };
  return { ok: true, url: session.url };
}
