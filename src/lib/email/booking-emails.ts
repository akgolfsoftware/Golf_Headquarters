/**
 * Booking-relaterte transaksjons-e-poster (EP-01 til EP-04, Precision Athletics).
 *
 * Innhold og utseende bygges i `templates/booking-mal.ts` fra bookingens egne data.
 * EmailTemplate-raden (slug) er fortsatt bryteren: mangler eller er den deaktivert,
 * sendes ingenting. Sendes via Resend.
 */
import "server-only";

import { AVBESTILLING_FRIST_TIMER, cancellationDeadline, hoursUntil } from "@/lib/booking/policy";
import { prisma } from "@/lib/prisma";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import {
  byggBookingEpost,
  formaterKr,
  type BookingEpostType,
} from "@/lib/email/templates/booking-mal";
import { logError } from "@/lib/error-tracking";

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

async function hentTemplate(slug: string) {
  const tpl = await prisma.emailTemplate.findUnique({ where: { slug } });
  if (!tpl || !tpl.active) {
    throw new Error(`EmailTemplate '${slug}' mangler eller er deaktivert.`);
  }
  return tpl;
}

/** «Mandag 28. september 2026 kl. 09:14» i Oslo-tid, uavhengig av serverens sone. */
function osloNaa(now: Date = new Date()): string {
  const dato = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo", weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(now);
  const tid = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(now);
  return `${stor(dato)} kl. ${tid}`;
}

function stor(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Google Kalender-lenke fra bookingens Oslo-veggklokke (lagret som server-lokal tid). */
function kalenderLenke(tittel: string, start: Date, slutt: Date, sted: string): string {
  const p = (n: number) => String(n).padStart(2, "0");
  const f = (d: Date) =>
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: tittel,
    dates: `${f(start)}/${f(slutt)}`,
    ctz: "Europe/Oslo",
    location: sted,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

type SendExtra = {
  oldStartAt?: Date;
  refundIssued?: boolean;
  isCreditBooking?: boolean;
};

async function sendBooking(
  type: BookingEpostType,
  slug: string,
  bookingId: string,
  extra: SendExtra = {},
) {
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
  const navn = booking.user?.name ?? booking.guestName ?? "";
  if (!epost) {
    console.warn("[booking-email] Ingen e-post på booking", bookingId);
    return;
  }

  await hentTemplate(slug);

  // Credit-baserte bookinger (fra Academy-abonnement) viser ikke pris,
  // men at den er trukket fra abonnementet.
  const erCreditBooking = !!booking.subscriptionId;
  const erApp = !!booking.userId;
  const frist = cancellationDeadline(booking.startAt);
  const fristTekst = `${formatDato(frist)} kl. ${formatTid(frist)}`;
  const varighetMin = Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / 60_000);
  const tjeneste = varighetMin > 0 ? `${booking.serviceType.name} ${varighetMin} min` : booking.serviceType.name;
  const refusjon = extra.isCreditBooking
    ? "Klippet er lagt tilbake"
    : extra.refundIssued
      ? `${formaterKr(booking.priceOre)} til kortet du betalte med`
      : "Ingen refusjon, avbestilt etter fristen";

  const { subject, html } = byggBookingEpost({
    type,
    mottaker: erApp ? "app" : "gjest",
    fornavn: navn.trim().split(/\s+/)[0] || "der",
    tjeneste,
    dag: stor(formatDato(booking.startAt)),
    klokke: `${formatTid(booking.startAt)}–${formatTid(booking.endAt)}`,
    gammelTid: extra.oldStartAt
      ? { dag: stor(formatDato(extra.oldStartAt)), klokke: formatTid(extra.oldStartAt) }
      : undefined,
    sted: booking.location.name,
    coach: booking.coach?.name ?? null,
    pris: erCreditBooking ? "Inkludert i abonnement" : formaterKr(booking.priceOre),
    betaling: erCreditBooking
      ? { tekst: "Trukket fra månedlig saldo", mono: false }
      : { tekst: booking.stripePaymentIntentId, mono: true },
    referanse: booking.id,
    frist: fristTekst,
    fristPassert: hoursUntil(booking.startAt) <= AVBESTILLING_FRIST_TIMER,
    avbestiltTidspunkt: osloNaa(),
    refusjon,
    lenker: {
      kalender: kalenderLenke(
        `AK Golf: ${booking.serviceType.name}`,
        booking.startAt,
        booking.endAt,
        booking.location.name,
      ),
      bookingIApp: `${APP_URL}/portal/booking/${booking.id}`,
      endre: erApp
        ? `${APP_URL}/portal/meg/bookinger`
        : `${APP_URL}/booking/kvittering/${booking.id}`,
      veibeskrivelse: `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query: booking.location.name }).toString()}`,
      nyBooking: `${APP_URL}/booking`,
      playerhq: `${APP_URL}/portal`,
      opprettKonto: `${APP_URL}/auth/signup`,
    },
  });

  try {
    const klient = resendKlient();
    await klient.emails.send({
      from: FRA_EPOST,
      to: epost,
      subject,
      html,
    });
  } catch (error) {
    await logError({
      context: "email.booking.resend",
      error,
      meta: { bookingId },
    });
    throw error;
  }
}

export async function sendBookingConfirmation(bookingId: string) {
  await sendBooking("bekreftelse", "booking-bekreftelse", bookingId);
}

export async function sendBookingReminder(bookingId: string) {
  await sendBooking("paaminnelse", "oekt-paaminnelse", bookingId);
}

export async function sendBookingCancellation(
  bookingId: string,
  extra: { refundIssued?: boolean; isCreditBooking?: boolean } = {},
) {
  await sendBooking("avbestilt", "booking-avbestilt", bookingId, extra);
}

/**
 * Sendes når en booking flyttes til ny tid. `oldStartAt` er tidspunktet
 * booking-en hadde FØR flyttingen — booking-raden i DB er allerede
 * oppdatert til den nye tiden når denne kalles, så date/time i
 * standard-variablene fra sendBooking() viser automatisk den nye tiden.
 */
export async function sendBookingRescheduled(bookingId: string, oldStartAt: Date) {
  await sendBooking("endret", "booking-flyttet", bookingId, { oldStartAt });
}
