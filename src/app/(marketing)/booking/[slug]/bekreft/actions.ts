"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { isSlotStillAvailable } from "@/lib/booking/availability";
import { audit } from "@/lib/audit";

export type BookingFormInput = {
  slug: string;
  start: string; // ISO
  coachId: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

export async function createBookingCheckout(input: BookingFormInput) {
  const service = await prisma.serviceType.findUnique({
    where: { slug: input.slug },
  });
  if (!service || !service.active) {
    throw new Error("Tjeneste ikke tilgjengelig.");
  }

  const startAt = new Date(input.start);
  if (isNaN(startAt.getTime())) throw new Error("Ugyldig dato.");

  // Verifiser at slot fortsatt er ledig.
  const ok = await isSlotStillAvailable(service.id, startAt, input.coachId);
  if (!ok) throw new Error("Tiden ble dessverre booket av noen andre. Velg en annen tid.");

  const endAt = new Date(startAt.getTime() + service.durationMin * 60_000);

  // Default-location: Mulligan for Trackman, GFGK for andre.
  const lokasjon = await prisma.location.findFirst({
    where: {
      name: service.slug.includes("trackman")
        ? "Mulligan Indoor Golf"
        : "Gamle Fredrikstad GK",
    },
  });
  if (!lokasjon) throw new Error("Mangler lokasjon i seed-data.");

  const user = await getCurrentUser();

  // Opprett booking med PENDING-status.
  const booking = await prisma.booking.create({
    data: {
      userId: user?.id ?? "guest",
      serviceTypeId: service.id,
      locationId: lokasjon.id,
      startAt,
      endAt,
      status: "PENDING",
      priceOre: service.priceOre,
      guestName: user ? null : input.name.trim(),
      guestEmail: user ? null : input.email.trim().toLowerCase(),
      guestPhone: user ? null : input.phone.trim() || null,
      notes: input.notes.trim() || null,
    },
  });

  // Stripe Checkout Session
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = stripeKlient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user?.email ?? input.email.trim().toLowerCase(),
    line_items: [
      {
        price_data: {
          currency: "nok",
          product_data: {
            name: service.name,
            description: `${startAt.toLocaleString("nb-NO", { dateStyle: "full", timeStyle: "short" })} hos ${lokasjon.name}`,
          },
          unit_amount: service.priceOre,
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id,
      coachId: input.coachId,
      serviceSlug: service.slug,
    },
    success_url: `${appUrl}/booking/kvittering/${booking.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/booking/${service.slug}`,
    // Hold slot i 30 min (Stripe-minimum for expires_at)
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

  if (!session.url) throw new Error("Stripe checkout URL mangler.");
  redirect(session.url);
}
