/**
 * Wrapper for å sende transactional booking-e-poster via Resend
 * basert på maler i `src/lib/email/templates/`.
 *
 * Henter booking + relasjoner fra DB, bygger templaten, og sender.
 * Returnerer void; logger og throw-er ved feil slik at kaller kan håndtere.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { FRA_EPOST, resendKlient } from "@/lib/email";
import {
  bookingConfirmationEmail,
  type BookingConfirmationInput,
} from "./templates/booking-confirmation";
import {
  bookingCancelledEmail,
  type BookingCancelledInput,
} from "./templates/booking-cancelled";
import {
  bookingRescheduledEmail,
  type BookingRescheduledInput,
} from "./templates/booking-rescheduled";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no";

type BookingWithRelations = NonNullable<
  Awaited<ReturnType<typeof hentBooking>>
>;

async function hentBooking(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { name: true, email: true } },
      serviceType: { select: { name: true } },
      location: { select: { name: true } },
      facility: { select: { name: true } },
    },
  });
}

function hentMottaker(b: BookingWithRelations): {
  epost: string | null;
  navn: string;
} {
  const epost = b.user?.email ?? b.guestEmail ?? null;
  const navn = b.user?.name ?? b.guestName ?? "der";
  return { epost, navn };
}

function cancelUrl(bookingId: string): string {
  return `${APP_URL}/booking/kvittering/${bookingId}`;
}

function facilityLabel(b: BookingWithRelations): string {
  if (b.facility?.name && b.location?.name) {
    return `${b.location.name} · ${b.facility.name}`;
  }
  return b.location?.name ?? "AK Golf";
}

async function sendHtml(input: {
  to: string;
  subject: string;
  html: string;
  context: string;
}): Promise<void> {
  try {
    const klient = resendKlient();
    await klient.emails.send({
      from: FRA_EPOST,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
  } catch (err) {
    console.error(`[send-booking-email] ${input.context} feilet`, err);
    throw err;
  }
}

export async function sendBookingConfirmationV2(
  bookingId: string,
): Promise<void> {
  const booking = await hentBooking(bookingId);
  if (!booking) throw new Error(`Booking ${bookingId} not found`);

  const { epost, navn } = hentMottaker(booking);
  if (!epost) {
    console.warn(
      "[send-booking-email] Ingen e-post på booking, hopper over",
      bookingId,
    );
    return;
  }

  const input: BookingConfirmationInput = {
    recipientName: navn,
    serviceName: booking.serviceType.name,
    startAt: booking.startAt,
    coachName: "AK Golf-coach",
    facilityName: facilityLabel(booking),
    priceOre: booking.priceOre,
    isCreditBooking: !!booking.subscriptionId,
    cancelUrl: cancelUrl(bookingId),
    bookingId,
  };

  const { subject, html } = bookingConfirmationEmail(input);
  await sendHtml({ to: epost, subject, html, context: "confirmation" });
}

export async function sendBookingCancelledV2(
  bookingId: string,
  options: { refundIssued: boolean },
): Promise<void> {
  const booking = await hentBooking(bookingId);
  if (!booking) throw new Error(`Booking ${bookingId} not found`);

  const { epost, navn } = hentMottaker(booking);
  if (!epost) return;

  const input: BookingCancelledInput = {
    recipientName: navn,
    serviceName: booking.serviceType.name,
    startAt: booking.startAt,
    facilityName: facilityLabel(booking),
    priceOre: booking.priceOre,
    isCreditBooking: !!booking.subscriptionId,
    refundIssued: options.refundIssued,
    bookingId,
  };

  const { subject, html } = bookingCancelledEmail(input);
  await sendHtml({ to: epost, subject, html, context: "cancellation" });
}

export async function sendBookingRescheduledV2(
  bookingId: string,
  oldStartAt: Date,
): Promise<void> {
  const booking = await hentBooking(bookingId);
  if (!booking) throw new Error(`Booking ${bookingId} not found`);

  const { epost, navn } = hentMottaker(booking);
  if (!epost) return;

  const input: BookingRescheduledInput = {
    recipientName: navn,
    serviceName: booking.serviceType.name,
    oldStartAt,
    newStartAt: booking.startAt,
    coachName: "AK Golf-coach",
    facilityName: facilityLabel(booking),
    cancelUrl: cancelUrl(bookingId),
    bookingId,
  };

  const { subject, html } = bookingRescheduledEmail(input);
  await sendHtml({ to: epost, subject, html, context: "rescheduled" });
}
