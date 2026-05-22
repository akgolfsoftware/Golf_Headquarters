/**
 * Booking-flyttet — sendes når kunde eller admin flytter booking til ny tid.
 */

import {
  detailRow,
  emailLayout,
  formatDato,
  formatTid,
  primaryButton,
} from "./shared";

export type BookingRescheduledInput = {
  recipientName: string;
  serviceName: string;
  oldStartAt: Date;
  newStartAt: Date;
  coachName: string;
  facilityName: string;
  cancelUrl: string;
  bookingId: string;
};

export function bookingRescheduledEmail(input: BookingRescheduledInput): {
  subject: string;
  html: string;
} {
  const newCancelDeadline = new Date(
    input.newStartAt.getTime() - 24 * 60 * 60_000,
  );

  const body = `
    <p style="margin:0 0 16px 0;">Hei ${escape(input.recipientName)},</p>
    <p style="margin:0 0 16px 0;">Bookingen din er flyttet til en ny tid.</p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border-top:1px solid #E5E3DD;border-bottom:1px solid #E5E3DD;margin:0 0 24px 0;">
      ${detailRow("Tjeneste", input.serviceName)}
      ${detailRow("Tidligere tid", `${formatDato(input.oldStartAt)} kl ${formatTid(input.oldStartAt)}`)}
      ${detailRow("Ny tid", `${formatDato(input.newStartAt)} kl ${formatTid(input.newStartAt)}`)}
      ${detailRow("Coach", input.coachName)}
      ${detailRow("Anlegg", input.facilityName)}
    </table>

    <p style="margin:0 0 8px 0;font-size:13px;color:#5E5C57;">
      Du kan avbestille kostnadsfritt fram til ${formatDato(newCancelDeadline)} kl ${formatTid(newCancelDeadline)}.
    </p>
    <p style="margin:0 0 24px 0;">
      ${primaryButton("Avbestill eller endre tid", input.cancelUrl)}
    </p>

    <p style="margin:0;font-size:13px;color:#5E5C57;">Booking-ID: ${escape(input.bookingId)}</p>
  `;

  return {
    subject: `Ny tid: ${input.serviceName} ${formatDato(input.newStartAt)}`,
    html: emailLayout({
      preheader: `Ny tid: ${formatDato(input.newStartAt)} kl ${formatTid(input.newStartAt)}.`,
      heading: "Bookingen din er flyttet",
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
