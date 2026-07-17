"use server";

import { z } from "zod";
import { sjekkKollisjon, erKollisjonsfeil, kollisjonsmelding } from "@/lib/booking/kollisjonsvern";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { isSlotStillAvailable } from "@/lib/booking/availability";
import { audit } from "@/lib/audit";
import { nonEmpty, isoDate, email, phone } from "@/lib/validation/schemas";

export type BookingFormInput = {
  slug: string;
  start: string; // ISO
  coachId: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
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
});

export async function createBookingCheckout(
  input: BookingFormInput,
): Promise<BookingResult> {
  try {
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

    const startAt = new Date(data.start);

    const ok = await isSlotStillAvailable(service.id, startAt, data.coachId);
    if (!ok) {
      return {
        ok: false,
        error: "Denne tiden ble dessverre booket av noen andre. Velg en annen tid.",
      };
    }

    // Stripe NOK minimum er 300 øre (kr 3,00)
    if (service.priceOre < 300) {
      return { ok: false, error: "Tjenesten har ugyldig pris. Kontakt oss på post@akgolf.no." };
    }

    const endAt = new Date(startAt.getTime() + service.durationMin * 60_000);

    // Finn lokasjon — prøv med kjente navn-varianter, fall tilbake til første tilgjengelige.
    const wantMulligan = service.slug.includes("trackman");
    const lokasjon = await prisma.location.findFirst({
      where: wantMulligan
        ? { OR: [{ name: { contains: "Mulligan" } }, { name: { contains: "mulligan" } }] }
        : {
            OR: [
              { name: { contains: "Fredrikstad" } },
              { name: { contains: "GFGK" } },
              { name: { contains: "Bossum" } },
              { name: { contains: "Golfklubb" } },
            ],
          },
    }) ?? (await prisma.location.findFirst());

    if (!lokasjon) {
      return {
        ok: false,
        error: "Ingen lokasjon er registrert i systemet. Kontakt oss på post@akgolf.no.",
      };
    }

    const user = await getCurrentUser();

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
      coachId: service.coachUserId ?? null,
      guestName: user ? null : data.name.trim(),
      guestEmail: user ? null : data.email.trim().toLowerCase(),
      guestPhone: data.phone.trim() || null,
      notes: data.notes?.trim() || null,
    };

    let booking;
    try {
      booking = await prisma.$transaction(async (tx) => {
        await sjekkKollisjon(tx, {
          coachId: bookingData.coachId,
          startAt,
          endAt,
        });
        return tx.booking.create({ data: bookingData });
      });
    } catch (e) {
      if (erKollisjonsfeil(e)) {
        return { ok: false, error: kollisjonsmelding(e) };
      }
      throw e;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf-hq.vercel.app";
    const stripe = stripeKlient();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user?.email ?? data.email.trim().toLowerCase(),
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
      metadata: {
        bookingId: booking.id,
        coachId: data.coachId,
        serviceSlug: service.slug,
      },
      success_url: `${appUrl}/booking/kvittering/${booking.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/booking/${service.slug}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    await audit({
      actorId: user?.id ?? null,
      action: "booking.checkout_started",
      target: `Booking:${booking.id}`,
      metadata: { serviceSlug: service.slug, priceOre: service.priceOre },
    });

    if (!session.url) {
      return { ok: false, error: "Stripe checkout URL mangler. Prøv igjen." };
    }

    return { ok: true, url: session.url };
  } catch (err) {
    console.error("[createBookingCheckout]", err);
    // S-12: Fang Prisma unique constraint violation (P2002) fra bookings_slot_unique.
    // Dette skjer når to klienter sender booking-request for samme slot i samme ms
    // (race condition som ikke fanges av isSlotStillAvailable-sjekken over).
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return {
        ok: false,
        error: "Denne tiden ble dessverre booket av noen andre akkurat nå. Velg en annen tid.",
      };
    }
    const msg = err instanceof Error ? err.message : "Ukjent feil";
    // Ikke leak interne feilmeldinger til klienten i produksjon
    return {
      ok: false,
      error: msg.startsWith("STRIPE")
        ? "Betalingsfeil. Prøv igjen eller kontakt oss."
        : msg,
    };
  }
}
