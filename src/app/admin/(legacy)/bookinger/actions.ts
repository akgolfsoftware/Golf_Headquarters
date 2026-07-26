"use server";

/**
 * Server-actions for booking-svar i AgencyOS Bookinger-tabellen
 * (fasit BookingsScreen: «bekreft eller avvis i raden»).
 *
 * Sikkerhet (2026-07-25):
 * - COACH kan kun røre egne bookinger (coachId / serviceType.coachUserId)
 * - ADMIN ser/rører alt
 * - Bekreft krever betaling: gratis (priceOre=0), Stripe PI, eller credit-abonnement
 * - Bulk treffer kun coachens scope — aldri hele systemet for COACH
 */

import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import type { Prisma, User } from "@/generated/prisma/client";

function revalidateBookingFlater() {
  revalidatePath("/admin/bookinger");
  revalidatePath("/admin/kalender");
}

/** Prisma-filter: ADMIN = alt, COACH = bare egne. */
function coachBookingScope(user: User): Prisma.BookingWhereInput {
  if (user.role === "ADMIN") return {};
  return {
    OR: [{ coachId: user.id }, { serviceType: { coachUserId: user.id } }],
  };
}

/** Kan manuell bekreftelse tillates uten å gi gratis betalte timer? */
function kanBekrefteUtenStripeLeak(b: {
  priceOre: number;
  stripePaymentIntentId: string | null;
  subscriptionId: string | null;
}): boolean {
  if (b.priceOre <= 0) return true;
  if (b.stripePaymentIntentId) return true;
  if (b.subscriptionId) return true;
  return false;
}

export async function bekreftBooking(id: string) {
  const user = await requireCoachActionUser();
  const booking = await prisma.booking.findFirst({
    where: { id, status: "PENDING", ...coachBookingScope(user) },
    select: {
      id: true,
      priceOre: true,
      stripePaymentIntentId: true,
      subscriptionId: true,
    },
  });
  if (!booking) return;
  if (!kanBekrefteUtenStripeLeak(booking)) {
    throw new Error(
      "Kan ikke bekrefte: mangler betaling. Vent på Stripe eller bruk credit-booking.",
    );
  }
  await prisma.booking.updateMany({
    where: { id: booking.id, status: "PENDING" },
    data: { status: "CONFIRMED" },
  });
  revalidateBookingFlater();
}

export async function avvisBooking(id: string) {
  const user = await requireCoachActionUser();
  await prisma.booking.updateMany({
    where: { id, status: "PENDING", ...coachBookingScope(user) },
    data: { status: "CANCELLED" },
  });
  revalidateBookingFlater();
}

export async function bekreftAllePending() {
  const user = await requireCoachActionUser();
  // Kun gratis / allerede betalte / credit — aldri ubetalte betalings-bookinger.
  // AND: coach-scope (OR) + betalingsregel (OR) må ikke overskrive hverandre.
  await prisma.booking.updateMany({
    where: {
      status: "PENDING",
      AND: [
        coachBookingScope(user),
        {
          OR: [
            { priceOre: { lte: 0 } },
            { stripePaymentIntentId: { not: null } },
            { subscriptionId: { not: null } },
          ],
        },
      ],
    },
    data: { status: "CONFIRMED" },
  });
  revalidateBookingFlater();
}

export async function avvisAllePending() {
  const user = await requireCoachActionUser();
  await prisma.booking.updateMany({
    where: { status: "PENDING", ...coachBookingScope(user) },
    data: { status: "CANCELLED" },
  });
  revalidateBookingFlater();
}

export async function markerAlleConfirmedSomCompleted() {
  const user = await requireCoachActionUser();
  await prisma.booking.updateMany({
    where: { status: "CONFIRMED", ...coachBookingScope(user) },
    data: { status: "COMPLETED" },
  });
  revalidateBookingFlater();
}
