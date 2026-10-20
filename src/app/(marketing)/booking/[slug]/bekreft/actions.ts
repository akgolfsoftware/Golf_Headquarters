"use server";

import { z } from "zod";
import { sjekkKollisjon, erKollisjonsfeil, kollisjonsmelding } from "@/lib/booking/kollisjonsvern";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { startBookingPayment } from "@/lib/booking/payment-start";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { kanBrukeInnebygdBooking } from "@/lib/booking/offentlig-booking";
import { isSlotStillAvailable } from "@/lib/booking/availability";
import { finnStedForTjeneste } from "@/lib/booking/tjeneste-sted";
import { vurderDuoDeltaker } from "@/lib/booking/duo-deltaker";
import { acquireHold, releaseHold, DEFAULT_HOLD_TTL_MS } from "@/lib/booking/slot-hold";
import { recordBookingMetric } from "@/lib/booking/metrics";
import { audit } from "@/lib/audit";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { pushBooking } from "@/lib/google-calendar-kilder";
import { varsleNyBooking } from "@/lib/booking/varsle-ny-booking";
import {
  GavekortFeil,
  gavekortDekning,
  knyttGavekortTilBooking,
  losInnGavekort,
  slaaOppGavekort,
} from "@/lib/booking/gavekort";


import { nonEmpty, isoDate, email, phone } from "@/lib/validation/schemas";
import { APP_URL } from "@/lib/app-url";
import { logError } from "@/lib/error-tracking";

export type BookingFormInput = {
  slug: string;
  start: string; // ISO
  coachId: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  /** Duo: deltaker 2. Påkrevd når tjenesten er duo, ignorert ellers. */
  partnerName?: string;
  partnerEmail?: string;
  /** Gavekode (valgfri). Kortet dekker hele eller deler av prisen; resten betales med kort. */
  giftCode?: string;
};

export type BookingResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const BookingCheckoutSchema = z.object({
  slug: nonEmpty(100),
  start: isoDate,
  coachId: z.string().min(1, "Coach er påkrevd"),
  name: nonEmpty(200),
  email: email,
  phone: phone,
  notes: z.string().max(1000).optional(),
  partnerName: z.string().trim().max(200).optional(),
  partnerEmail: z.string().trim().max(254).optional(),
  giftCode: z.string().trim().max(40).optional(),
});

/** Forhåndsvisning av hva et gavekort dekker, før kunden betaler. Ingenting trekkes. */
export async function sjekkGavekode(
  kode: string,
  prisOre: number,
): Promise<{ ok: true; dekketOre: number; restOre: number } | { ok: false; error: string }> {
  const h = await headers();
  const ip = h.get("x-vercel-forwarded-for") ?? h.get("x-real-ip") ?? "unknown";
  const rl = await rateLimit({ key: `gavekort-sjekk:${ip}`, max: 10, windowMs: 60_000 });
  if (!rl.ok) return { ok: false, error: "For mange forsøk. Vent litt og prøv igjen." };
  try {
    const kort = await slaaOppGavekort(prisma, kode);
    const { dekketOre, restOre } = gavekortDekning(Math.max(0, Math.round(prisOre)), kort.saldoOre);
    if (dekketOre <= 0) return { ok: false, error: "Gavekortet kan ikke brukes på dette beløpet." };
    return { ok: true, dekketOre, restOre };
  } catch (e) {
    if (e instanceof GavekortFeil) return { ok: false, error: e.message };
    throw e;
  }
}

export async function createBookingCheckout(
  input: BookingFormInput,
): Promise<BookingResult> {
  try {
    // Pauset for publikum: server-actionen er siste forsvarslinje — UI-sperrene
    // over kan omgås med direkte kall.
    if (!(await kanBrukeInnebygdBooking())) {
      return {
        ok: false,
        error: "Online booking er ikke åpnet ennå. Book via akgolfgroup.as.me.",
      };
    }

    const parsed = BookingCheckoutSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
    }

    const data = parsed.data;

    const service = await prisma.serviceType.findUnique({
      where: { slug: data.slug },
    });
    if (!service || !service.active) {
      return { ok: false, error: "Tjeneste ikke tilgjengelig." };
    }

    const duo = vurderDuoDeltaker(service, data);
    if (!duo.ok) return duo;

    const giftCode = data.giftCode || null;
    if (giftCode) {
      try {
        await slaaOppGavekort(prisma, giftCode);
      } catch (e) {
        if (e instanceof GavekortFeil) return { ok: false, error: e.message };
        throw e;
      }
    }

    const startAt = new Date(data.start);
    const user = await getCurrentUser();
    // Soft hold holder: logged-in user or guest email
    const holderId = user?.id ?? `guest:${data.email.trim().toLowerCase()}`;
    // Align hold key with the coach that ends up on the booking
    const coachId = service.coachUserId ?? data.coachId;


    const ok = await isSlotStillAvailable(service.id, startAt, coachId, holderId);
    if (!ok) {
      await recordBookingMetric("book_slot_miss");
      return {
        ok: false,
        error: "Denne tiden ble dessverre booket av noen andre. Velg en annen tid.",
      };
    }

    const hold = await acquireHold(
      {
        serviceTypeId: service.id,
        coachId,
        startIso: startAt.toISOString(),
      },
      holderId,
      DEFAULT_HOLD_TTL_MS,
    );
    if (!hold.ok) {
      await recordBookingMetric("book_hold_blocked");
      return {
        ok: false,
        error: "Noen andre holder på denne tiden akkurat nå. Vent litt eller velg en annen tid.",
      };
    }
    await recordBookingMetric("book_checkout_start");

    // Stripe NOK minimum er 300 øre (kr 3,00)
    if (service.priceOre < 300) {
      return { ok: false, error: "Tjenesten har ugyldig pris. Kontakt oss på post@akgolf.no." };
    }

    const endAt = new Date(startAt.getTime() + service.durationMin * 60_000);

    // Stedet leses fra tjenesten (locationId); navnegjetning bare som fallback
    // når det ikke er satt (src/lib/booking/tjeneste-sted.ts).
    const lokasjon = await finnStedForTjeneste(service);

    if (!lokasjon) {
      return {
        ok: false,
        error: "Ingen lokasjon er registrert i systemet. Kontakt oss på post@akgolf.no.",
      };
    }

    // userId er nullable — gjester booker uten konto.
    // guestName/guestEmail/guestPhone brukes for kontakt og kvittering.
    const bookingData = {
      userId: user?.id ?? null,
      serviceTypeId: service.id,
      locationId: lokasjon.id,
      startAt,
      endAt,
      status: "PENDING" as const,
      priceOre: service.priceOre,
      coachId,
      guestName: user ? null : data.name.trim(),
      guestEmail: user ? null : data.email.trim().toLowerCase(),
      guestPhone: data.phone.trim() || null,
      notes: data.notes?.trim() || null,
      partnerName: duo.partner?.name ?? null,
      partnerEmail: duo.partner?.email ?? null,
    };

    let booking;
    try {
      booking = await prisma.$transaction(async (tx) => {
        const vern = await sjekkKollisjon(tx, {
          coachId: bookingData.coachId,
          serviceTypeId: bookingData.serviceTypeId,
          startAt,
          endAt,
          romKrav: service.facilityType ? { locationId: lokasjon.id, facilityType: service.facilityType } : null,
        });
        // Gavekortet trekkes i samme transaksjon som bookingen: feiler noe, står kortet urørt.
        const gave = giftCode ? await losInnGavekort(tx, giftCode, service.priceOre) : null;
        const dekket = gave?.dekketOre ?? 0;
        const heltDekket = dekket >= service.priceOre;
        const lagret = await tx.booking.create({
          data: {
            ...bookingData,
            plassNr: vern.plassNr,
            facilityId: vern.facilityId ?? null,
            priceOre: service.priceOre - dekket,
            giftCardOre: dekket,
            ...(heltDekket ? { status: "CONFIRMED" as const, paymentMethod: "GAVEKORT" as const } : {}),
          },
        });
        if (gave) await knyttGavekortTilBooking(tx, gave.transaksjonId, lagret.id);
        return lagret;
      });
    } catch (e) {
      if (erKollisjonsfeil(e)) {
        return { ok: false, error: kollisjonsmelding(e) };
      }
      if (e instanceof GavekortFeil) return { ok: false, error: e.message };
      throw e;
    }

    // Gavekortet dekker alt: ingen Stripe-betaling. Bekreft som webhooken ville gjort.
    if (booking.status === "CONFIRMED") {
      await audit({
        actorId: user?.id ?? null,
        action: "booking.created.gift-card",
        target: `Booking:${booking.id}`,
        metadata: { serviceSlug: service.slug, giftCardOre: booking.giftCardOre },
      }).catch((error) => logError({ context: "booking.gavekort-audit", error }).catch(() => undefined));
      try {
        const { sendBookingConfirmation } = await import("@/lib/email/booking-emails");
        await sendBookingConfirmation(booking.id);
      } catch (error) {
        await logError({ context: "booking.gavekort.epost", error, meta: { bookingId: booking.id }, severity: "warn" });
      }
      try {
        await pushBooking(booking.id);
      } catch (error) {
        await logError({ context: "booking.gavekort.kalender", error, meta: { bookingId: booking.id }, severity: "warn" });
      }
      await varsleNyBooking(booking.id, "gavekort").catch(() => undefined);
      return { ok: true, url: `${APP_URL}/booking/kvittering/${booking.id}` };
    }

    const appUrl = APP_URL;

    const payment = await startBookingPayment(booking.id, {
      mode: "payment",
      // Bare kort (Apple Pay vises som kortlommebok), ikke det dashbordet ellers slår på (beslutninger §INNLOGGING BARE MED GOOGLE OG PASSORD).
      payment_method_types: ["card"],
      customer_email: user?.email ?? data.email.trim().toLowerCase(),
      line_items: [
        {
          price_data: {
            currency: "nok",
            product_data: {
              name: service.name,
              description: `${startAt.toLocaleString("nb-NO", { dateStyle: "full", timeStyle: "short" })} hos ${lokasjon.name}`,
            },
            unit_amount: booking.priceOre,
          },
          quantity: 1,
        },
      ],
      metadata: {
        ...(booking.giftCardOre > 0 ? { giftCardOre: String(booking.giftCardOre) } : {}),
        bookingId: booking.id,
        coachId,
        serviceSlug: service.slug,
      },
      success_url: `${appUrl}/booking/kvittering/${booking.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/booking/${service.slug}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    if (!payment.ok) {
      if (payment.releaseHold) await releaseHold({ serviceTypeId: service.id, coachId, startIso: startAt.toISOString() }, holderId);
      return { ok: false, error: payment.error };
    }

    await audit({
      actorId: user?.id ?? null,
      action: "booking.checkout_started",
      target: `Booking:${booking.id}`,
      metadata: { serviceSlug: service.slug, priceOre: service.priceOre },
    }).catch((error) => logError({ context: "booking.checkout-audit", error }).catch(() => undefined));

    return { ok: true, url: payment.url };
  } catch (err) {
    await logError({ context: "booking.createBookingCheckout", error: err });
    // S-12: Fang Prisma unique constraint violation (P2002) fra bookings_slot_unique.
    // Dette skjer når to klienter sender booking-request for samme slot i samme ms
    // (race condition som ikke fanges av isSlotStillAvailable-sjekken over).
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return {
        ok: false,
        error: "Denne tiden ble dessverre booket av noen andre akkurat nå. Velg en annen tid.",
      };
    }
    // Ikke leak interne feilmeldinger til klienten i produksjon
    return {
      ok: false,
      error: "Bestillingen kunne ikke fullføres. Prøv igjen eller kontakt oss.",
    };
  }
}
