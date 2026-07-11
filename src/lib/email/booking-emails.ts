/**
 * Booking-relaterte transaksjons-e-poster.
 *
 * Henter EmailTemplate via slug, substituerer placeholders, sender via Resend.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { resendKlient, FRA_EPOST } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no";

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Erstatt {{placeholder}} med faktiske verdier.
 */
function substituer(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

/**
 * Konverter markdown-aktig template-body til enkel HTML.
 * Støtter avsnitt (tomme linjer), fet (**tekst**), og linker.
 */
function tilHtml(body: string): string {
  const avsnitt = body.split(/\n\n+/).map((p) => {
    let html = p.trim();
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\n/g, "<br />");
    return `<p>${html}</p>`;
  });

  return `<!doctype html>
<html lang="nb">
<head><meta charset="UTF-8"></head>
<body style="font-family: system-ui, sans-serif; max-width: 580px; margin: 32px auto; padding: 0 16px; color: #0A1F17; line-height: 1.6;">
${avsnitt.join("\n")}
<hr style="margin-top: 32px; border: none; border-top: 1px solid #E5E3DD;" />
<p style="margin-top: 16px; color: #5E5C57; font-size: 12px;">
  AK Golf Academy · Bossumveien 6, 1605 Fredrikstad
</p>
</body>
</html>`;
}

async function hentTemplate(slug: string) {
  const tpl = await prisma.emailTemplate.findUnique({ where: { slug } });
  if (!tpl || !tpl.active) {
    throw new Error(`EmailTemplate '${slug}' mangler eller er deaktivert.`);
  }
  return tpl;
}

async function sendBooking(
  slug: string,
  bookingId: string,
  extraVars: Record<string, string> = {},
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { name: true, email: true } },
      serviceType: true,
      location: true,
    },
  });
  if (!booking) throw new Error("Booking not found");

  const epost = booking.user?.email ?? booking.guestEmail;
  const navn = booking.user?.name ?? booking.guestName ?? "der";
  if (!epost) {
    console.warn("[booking-email] Ingen e-post på booking", bookingId);
    return;
  }

  const tpl = await hentTemplate(slug);
  const cancelDeadline = new Date(booking.startAt.getTime() - 24 * 60 * 60_000);

  // Credit-baserte bookinger (fra Academy-abonnement) skal ikke vise pris,
  // men en melding om at den er trukket fra abonnementet.
  const erCreditBooking = !!booking.subscriptionId;
  const priceFormatted = erCreditBooking
    ? "Inkludert i abonnement"
    : `${booking.priceOre / 100} kr`;
  const paymentRef = erCreditBooking
    ? "Trukket fra månedlig saldo"
    : (booking.stripePaymentIntentId ?? "");

  const vars: Record<string, string> = {
    name: navn,
    serviceTypeName: booking.serviceType.name,
    date: formatDato(booking.startAt),
    time: formatTid(booking.startAt),
    location: booking.location.name,
    priceFormatted,
    paymentRef,
    cancelDeadline: `${formatDato(cancelDeadline)} kl ${formatTid(cancelDeadline)}`,
    bookingId: booking.id,
    appUrl: APP_URL,
    ...extraVars,
  };

  const subject = substituer(tpl.subject, vars);
  const body = substituer(tpl.body, vars);

  try {
    const klient = resendKlient();
    await klient.emails.send({
      from: FRA_EPOST,
      to: epost,
      subject,
      html: tilHtml(body),
    });
  } catch (err) {
    console.error("[booking-email] Resend feilet", err);
    throw err;
  }
}

export async function sendBookingConfirmation(bookingId: string) {
  await sendBooking("booking-bekreftelse", bookingId);
}

export async function sendBookingReminder(bookingId: string) {
  await sendBooking("oekt-paaminnelse", bookingId);
}

export async function sendBookingCancellation(
  bookingId: string,
  extra: { refundIssued?: boolean; isCreditBooking?: boolean } = {},
) {
  const refundLine = extra.isCreditBooking
    ? "Credit-en er ført tilbake til abonnementet ditt."
    : extra.refundIssued
      ? "Refusjon er behandlet og kommer på samme kort innen 3–10 virkedager."
      : "Avbestilt etter avbestillingsfristen — ingen refusjon.";
  await sendBooking("booking-avbestilt", bookingId, { refundLine });
}

/**
 * Sendes når en booking flyttes til ny tid. `oldStartAt` er tidspunktet
 * booking-en hadde FØR flyttingen — booking-raden i DB er allerede
 * oppdatert til den nye tiden når denne kalles, så date/time i
 * standard-variablene fra sendBooking() viser automatisk den nye tiden.
 */
export async function sendBookingRescheduled(bookingId: string, oldStartAt: Date) {
  await sendBooking("booking-flyttet", bookingId, {
    oldDate: formatDato(oldStartAt),
    oldTime: formatTid(oldStartAt),
  });
}
