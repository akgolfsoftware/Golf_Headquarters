/**
 * Booking-avbestilt — sendes når kunde eller admin avbestiller booking.
 * Refusjon er allerede igangsatt mot Stripe på dette tidspunktet.
 */

import {
  detailRow,
  emailLayout,
  formatDato,
  formatPris,
  formatTid,
} from "./shared";

export type BookingCancelledInput = {
  recipientName: string;
  serviceName: string;
  startAt: Date;
  facilityName: string;
  priceOre: number;
  isCreditBooking: boolean;
  refundIssued: boolean;
  bookingId: string;
};

export function bookingCancelledEmail(input: BookingCancelledInput): {
  subject: string;
  html: string;
} {
  const refundLine = input.isCreditBooking
    ? "<p style=\"margin:0 0 16px 0;\">Credit-en er ført tilbake til abonnementet ditt.</p>"
    : input.refundIssued
      ? "<p style=\"margin:0 0 16px 0;\">Refusjon på <strong>" +
        formatPris(input.priceOre) +
        "</strong> er behandlet og kommer på samme kort innen 3–10 virkedager.</p>"
      : "<p style=\"margin:0 0 16px 0;\">Avbestilt etter avbestillingsfristen — ingen refusjon.</p>";

  const body = `
    <p style="margin:0 0 16px 0;">Hei ${escape(input.recipientName)},</p>
    <p style="margin:0 0 16px 0;">Vi bekrefter at bookingen din er avbestilt.</p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border-top:1px solid #E5E3DD;border-bottom:1px solid #E5E3DD;margin:0 0 24px 0;">
      ${detailRow("Tjeneste", input.serviceName)}
      ${detailRow("Var bestilt", `${formatDato(input.startAt)} kl ${formatTid(input.startAt)}`)}
      ${detailRow("Anlegg", input.facilityName)}
    </table>

    ${refundLine}

    <p style="margin:0 0 16px 0;">Vil du booke en ny tid? Ta gjerne kontakt eller besøk <a href="https://akgolf.no/booking" style="color:#005840;">akgolf.no/booking</a>.</p>

    <p style="margin:0;font-size:13px;color:#5E5C57;">Booking-ID: ${escape(input.bookingId)}</p>
  `;

  return {
    subject: `Avbestilt: ${input.serviceName}`,
    html: emailLayout({
      preheader: `Avbestilling bekreftet for ${formatDato(input.startAt)}.`,
      heading: "Bookingen din er avbestilt",
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
