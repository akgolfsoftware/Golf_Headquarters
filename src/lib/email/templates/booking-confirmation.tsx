/**
 * Booking-bekreftelse — sendes når Stripe webhook bekrefter betaling
 * (status: PENDING → CONFIRMED).
 */

import {
  detailRow,
  emailLayout,
  formatDato,
  formatPris,
  formatTid,
  primaryButton,
} from "./shared";

export type BookingConfirmationInput = {
  recipientName: string;
  serviceName: string;
  startAt: Date;
  coachName: string;
  facilityName: string;
  priceOre: number;
  isCreditBooking: boolean;
  cancelUrl: string;
  bookingId: string;
};

export function bookingConfirmationEmail(input: BookingConfirmationInput): {
  subject: string;
  html: string;
} {
  const cancelDeadline = new Date(input.startAt.getTime() - 24 * 60 * 60_000);

  const priceLabel = input.isCreditBooking
    ? "Inkludert i abonnement"
    : formatPris(input.priceOre);

  const body = `
    <p style="margin:0 0 16px 0;">Hei ${escape(input.recipientName)},</p>
    <p style="margin:0 0 24px 0;">Bookingen din er bekreftet. Vi gleder oss til å se deg.</p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border-top:1px solid #E5E3DD;border-bottom:1px solid #E5E3DD;margin:0 0 24px 0;">
      ${detailRow("Tjeneste", input.serviceName)}
      ${detailRow("Dato", formatDato(input.startAt))}
      ${detailRow("Klokkeslett", formatTid(input.startAt))}
      ${detailRow("Coach", input.coachName)}
      ${detailRow("Anlegg", input.facilityName)}
      ${detailRow("Pris", priceLabel)}
    </table>

    <p style="margin:0 0 8px 0;font-size:13px;color:#5E5C57;">
      Du kan avbestille kostnadsfritt fram til ${formatDato(cancelDeadline)} kl ${formatTid(cancelDeadline)}.
    </p>
    <p style="margin:0 0 24px 0;">
      ${primaryButton("Avbestill eller endre tid", input.cancelUrl)}
    </p>

    <p style="margin:0;font-size:13px;color:#5E5C57;">Booking-ID: ${escape(input.bookingId)}</p>
  `;

  return {
    subject: `Bekreftet: ${input.serviceName} ${formatDato(input.startAt)}`,
    html: emailLayout({
      preheader: `Din booking ${formatDato(input.startAt)} kl ${formatTid(input.startAt)} er bekreftet.`,
      heading: "Bookingen din er bekreftet",
      body,
    }),
  };
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
