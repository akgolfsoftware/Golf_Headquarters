/**
 * Booking-relaterte transaksjons-e-poster.
 *
 * Henter EmailTemplate via slug, substituerer placeholders, sender via Resend.
 */
import "server-only";

import { cancellationDeadline, cancellationDeadlineFromUtcWallClock } from "@/lib/booking/policy";
import { prisma } from "@/lib/prisma";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import { byggEndretTimeEpost } from "@/lib/email/booking-endret-time";
import { logError } from "@/lib/error-tracking";
import { byggBekreftelse, googleKalenderUrl } from "./booking-bekreftelse";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no";

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    timeZone: "UTC", // Booking lagres som Oslo-veggklokke.
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    timeZone: "UTC",
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
    let html = p.trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
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
  const cancelDeadline = cancellationDeadline(booking.startAt);

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
    const result = await klient.emails.send({
      from: FRA_EPOST,
      to: epost,
      subject,
      html: tilHtml(body),
    });
    if (result.error) throw new Error("E-postleverandøren avviste bookingmeldingen.");
  } catch (error) {
    await logError({
      context: "email.booking.resend",
      error,
      meta: { bookingId },
    });
    throw error;
  }
}

/**
 * EP-01. Bygger bekreftelsen fra bookingdata (Precision Athletics-malen), ikke fra
 * EmailTemplate-raden i databasen. Gjest = booking uten bruker.
 */
export async function sendBookingConfirmation(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { name: true, email: true } },
      coach: { select: { name: true } },
      serviceType: true,
      location: true,
    },
  });
  if (!booking) throw new Error("Booking not found");

  const epost = booking.user?.email ?? booking.guestEmail;
  if (!epost) {
    console.warn("[booking-email] Ingen e-post på booking", bookingId);
    return;
  }
  await hentTemplate("booking-bekreftelse");
  const erGjest = !booking.user;
  const navn = booking.user?.name ?? booking.guestName ?? null;
  const referanse = `#${booking.id.slice(-8)}`;
  const sted = booking.location.name;

  const { subject, html } = byggBekreftelse({
    type: erGjest ? "gjest" : "app",
    fornavn: navn ? navn.split(" ")[0] : null,
    tjeneste: booking.serviceType.name,
    varighetMin: booking.serviceType.durationMin,
    start: booking.startAt,
    slutt: booking.endAt,
    sted,
    coach: booking.coach?.name ?? null,
    frist: cancellationDeadlineFromUtcWallClock(booking.startAt),
    prisOre: booking.subscriptionId ? null : booking.priceOre,
    betalingsref: booking.stripePaymentIntentId,
    referanse,
    kalenderUrl: googleKalenderUrl({ tjeneste: booking.serviceType.name, start: booking.startAt, slutt: booking.endAt, sted, referanse }),
    bookingUrl: `${APP_URL}/portal/meg/bookinger`,
    endreUrl: erGjest
      ? `mailto:post@akgolf.no?subject=${encodeURIComponent(`Booking ${referanse}`)}`
      : `${APP_URL}/portal/meg/bookinger`,
    opprettKontoUrl: erGjest ? `${APP_URL}/auth/signup` : null,
    spillerhqTilbud: erGjest
      ? { tekst: "plan fra coachen, økter, tester og analyse av rundene dine", manedNok: null, arNok: null }
      : null,
  });

  try {
    const result = await resendKlient().emails.send({ from: FRA_EPOST, to: epost, subject, html });
    if (result.error) throw new Error("E-postleverandøren avviste bookingmeldingen.");
  } catch (error) {
    await logError({ context: "email.booking.resend", error, meta: { bookingId } });
    throw error;
  }
}

export async function sendBookingReminder(bookingId: string) {
  await sendBooking("oekt-paaminnelse", bookingId);
}

export async function sendBookingCancellation(
  bookingId: string,
  extra: { refundIssued?: boolean; isCreditBooking?: boolean; refundPending?: boolean; lateCancelNoRefund?: boolean } = {},
) {
  const refundLine = extra.isCreditBooking
    ? "Credit-en er ført tilbake til abonnementet ditt."
    : extra.refundIssued
      ? "Refusjon er behandlet og kommer på samme kort innen 3–10 virkedager."
      : extra.refundPending
        ? "Refusjonen venter på behandling. Vi følger opp betalingen."
        : extra.lateCancelNoRefund
          ? "Avbestilt etter avbestillingsfristen — ingen refusjon."
          : "Bookingen er avbestilt.";
  await sendBooking("booking-avbestilt", bookingId, { refundLine });
}

/**
 * Sendes når en booking flyttes til ny tid (EP-02 i Precision Athletics).
 * `oldStartAt` er tidspunktet booking-en hadde FØR flyttingen — booking-raden
 * i DB er allerede oppdatert til den nye tiden når denne kalles.
 * Bygges av `byggEndretTimeEpost`, ikke av DB-malen «booking-flyttet».
 */
export async function sendBookingRescheduled(bookingId: string, oldStartAt: Date) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { name: true, email: true } },
      coach: { select: { name: true } },
      serviceType: true,
      location: true,
    },
  });
  if (!booking) throw new Error("Booking not found");

  const epost = booking.user?.email ?? booking.guestEmail;
  if (!epost) {
    console.warn("[booking-email] Ingen e-post på booking", bookingId);
    return;
  }

  // Behold administrasjonens av/på-kontroll selv om innholdet har ny utforming.
  await hentTemplate("booking-flyttet");

  const fullNavn = booking.user?.name ?? booking.guestName ?? null;
  const { subject, html } = byggEndretTimeEpost({
    appUrl: APP_URL,
    bookingId: booking.id,
    startAt: booking.startAt,
    endAt: booking.endAt,
    oldStartAt,
    epost,
    fornavn: fullNavn?.trim().split(/\s+/)[0] || null,
    tjenesteNavn: booking.serviceType.name,
    varighetMin: booking.serviceType.durationMin,
    stedNavn: booking.location.name,
    stedAdresse: booking.location.address || null,
    coachNavn: booking.coach?.name ?? null,
    priceOre: booking.priceOre,
    erKlipp: !!booking.subscriptionId,
    stripePaymentIntentId: booking.stripePaymentIntentId,
    harKonto: !!booking.userId,
  });

  try {
    const result = await resendKlient().emails.send({ from: FRA_EPOST, to: epost, subject, html });
    if (result.error) throw new Error("E-postleverandøren avviste bookingmeldingen.");
  } catch (error) {
    await logError({
      context: "email.booking.resend",
      error,
      meta: { bookingId },
    });
    throw error;
  }
}
