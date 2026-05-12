"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import { audit } from "@/lib/audit";

export async function cancelBooking(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });
  if (!booking) throw new Error("not-found");

  const erStaff = user.role === "ADMIN" || user.role === "COACH";
  if (booking.userId !== user.id && !erStaff) {
    throw new Error("forbidden");
  }
  if (booking.status === "CANCELLED") return;

  const tidTilStart = booking.startAt.getTime() - Date.now();
  // Spillere: 24t-regel. Staff (COACH/ADMIN) kan refundere uansett tid.
  const kanRefunderes = erStaff || tidTilStart > 24 * 60 * 60 * 1000;

  // Refunder via Stripe hvis berettiget og PaymentIntent finnes.
  if (kanRefunderes && booking.stripePaymentIntentId) {
    try {
      const stripe = stripeKlient();
      await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
        reason: "requested_by_customer",
        metadata: { bookingId: booking.id },
      });
    } catch (err) {
      console.error("[cancel-booking] Stripe refund failed", err);
      // Fortsetter — vi avbestiller uansett, refusjon kan tas manuelt.
    }
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  await audit({
    actorId: user.id,
    action: "booking.cancelled",
    target: `Booking:${bookingId}`,
    metadata: { refunded: kanRefunderes },
  });

  // Send avbestillings-e-post (best-effort)
  try {
    const { sendBookingCancellation } = await import("@/lib/email/booking-emails");
    await sendBookingCancellation(bookingId);
  } catch (err) {
    console.error("[cancel-booking] e-post-feil", err);
  }

  revalidatePath("/portal/meg/bookinger");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
}
