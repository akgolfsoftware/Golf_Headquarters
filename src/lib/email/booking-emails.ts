/**
 * Booking-relaterte transaksjons-e-poster.
 *
 * Kontrollerer aktiv EmailTemplate og bygger de fire bookingmeldingene i felles e-postramme.
 */
import "server-only";

import { AVBESTILLING_FRIST_TIMER, cancellationDeadlineFromUtcWallClock } from "@/lib/booking/policy";
import { naivOsloTilTidspunkt, tilNaivVeggklokke } from "@/lib/google-calendar-tid";
import { prisma } from "@/lib/prisma";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import { byggEndretTimeEpost } from "@/lib/email/booking-endret-time";
import { logError } from "@/lib/error-tracking";
import { byggPaaminnelse, formaterKr } from "@/lib/email/templates/paaminnelse-mal";
import { byggBekreftelse, googleKalenderUrl, datoTekst, klokkeTekst } from "./booking-bekreftelse";

import { byggAvbestilling, formaterKr as avbestillingKr, osloDagOgTid, type Refusjon } from "./templates/avbestilling-mal";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no";

async function hentTemplate(slug: string) {
  const tpl = await prisma.emailTemplate.findUnique({ where: { slug } });
  if (!tpl || !tpl.active) {
    throw new Error(`EmailTemplate '${slug}' mangler eller er deaktivert.`);
  }
  return tpl;
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
    varighetMin: Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / 60_000),
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

/** EP-03. Malraden styrer om sending er aktiv. Returnerer true bare ved mottatt leverandørbekreftelse. */
export async function sendBookingReminder(bookingId: string, now = new Date(), expectedStartAt?: Date): Promise<boolean> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { name: true, email: true } },
      coach: { select: { name: true } },
      serviceType: true,
      location: true,
      subscription: { select: { plan: true } },
    },
  });
  if (!booking) throw new Error("Booking not found");
  const epost = booking.user?.email ?? booking.guestEmail;
  // Booking kan være avbestilt siden bakgrunnsjobben valgte kandidatene.
  if (booking.status !== "CONFIRMED" || !epost) return false;
  if (expectedStartAt && booking.startAt.getTime() !== expectedStartAt.getTime()) return false;
  await hentTemplate("oekt-paaminnelse");
  const navn = booking.user?.name ?? booking.guestName ?? "";
  const erKlipp = Boolean(booking.subscriptionId);
  const erApp = Boolean(booking.userId);
  const frist = cancellationDeadlineFromUtcWallClock(booking.startAt);
  const start = klokkeTekst(booking.startAt);
  const iMorgen = tilNaivVeggklokke(now, "utc");
  iMorgen.setUTCDate(iMorgen.getUTCDate() + 1);
  const plan = booking.subscription?.plan;
  const klipp = plan === "PERFORMANCE_PRO" ? "1 klipp · Performance Pro" : plan === "PERFORMANCE" ? "1 klipp · Performance" : "1 klipp";
  const { subject, html } = byggPaaminnelse({
    mottaker: erApp ? "app" : "gjest",
    fornavn: navn.split(" ")[0] ?? "",
    tjeneste: booking.serviceType.name,
    varighetMin: Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / 60_000),
    dag: datoTekst(booking.startAt), start,
    klokke: `${start}–${klokkeTekst(booking.endAt)}`,
    sted: booking.location.name,
    coach: booking.coach?.name ?? null,
    pris: erKlipp ? "Inkludert i abonnement" : formaterKr(booking.priceOre),
    betaling: { tekst: erKlipp ? klipp : booking.stripePaymentIntentId, mono: !erKlipp },
    betalingstype: erKlipp ? "klipp" : booking.priceOre === 0 ? "gratis" : "betalt",
    referanse: booking.id,
    frist: `${datoTekst(frist).toLowerCase()} kl. ${klokkeTekst(frist)}`,
    fristPassert: naivOsloTilTidspunkt(booking.startAt, "utc").getTime() - now.getTime() <= AVBESTILLING_FRIST_TIMER * 3_600_000,
    iMorgen: booking.startAt.toISOString().slice(0, 10) === iMorgen.toISOString().slice(0, 10),
    lenker: {
      veibeskrivelse: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.location.address || booking.location.name)}`,
      bookingIApp: `${APP_URL}/portal/booking/${encodeURIComponent(booking.id)}`,
      endre: `mailto:post@akgolf.no?subject=${encodeURIComponent(`Booking #${booking.id.slice(-8)}`)}`,
    },
  });
  try {
    const result = await resendKlient().emails.send({ from: FRA_EPOST, to: epost, subject, html }, {
      idempotencyKey: `booking-reminder/${booking.id}/${booking.startAt.toISOString()}`,
    });
    if (result.error) throw new Error("E-postleverandøren avviste bookingmeldingen.");
    return true;
  } catch (error) {
    await logError({ context: "email.booking.resend", error, meta: { bookingId } });
    throw error;
  }
}

/** EP-04: resultatet av avbestillingen vises, uten å utføre nye tilbakeføringer. */
export async function sendBookingCancellation(
  bookingId: string,
  extra: {
    refundIssued?: boolean; isCreditBooking?: boolean; refundPending?: boolean; lateCancelNoRefund?: boolean;
    refundFailed?: boolean; creditFailed?: boolean; etterFristen?: boolean; refundId?: string;
  } = {},
) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: {
    user: { select: { name: true, email: true } }, serviceType: true,
    subscription: { select: { creditsRemaining: true, monthlyCredits: true } },
  } });
  if (!booking) throw new Error("Booking not found");
  const epost = booking.user?.email ?? booking.guestEmail;
  if (!epost || booking.status !== "CANCELLED") return;
  await hentTemplate("booking-avbestilt");
  const cancellation = await prisma.auditLog.findFirst({
    where: { target: `Booking:${bookingId}`, action: { in: ["booking.cancelled", "booking.cancelled.refund-failed", "booking.cancelled.credit-refunded"] } },
    orderBy: { createdAt: "desc" }, select: { createdAt: true },
  });
  const navn = booking.user?.name ?? booking.guestName ?? "";
  const refusjon: Refusjon = extra.isCreditBooking
    ? { type: "klipp", igjen: booking.subscription?.creditsRemaining ?? null, av: booking.subscription?.monthlyCredits ?? null }
    : extra.refundIssued ? { type: "penger", belop: avbestillingKr(booking.priceOre) }
    : extra.refundPending ? { type: "venter" }
    : extra.refundFailed || extra.creditFailed ? { type: "feilet" }
    : (extra.lateCancelNoRefund || extra.etterFristen) && (booking.priceOre > 0 || booking.subscriptionId || booking.stripePaymentIntentId) ? { type: "ingen" }
    : booking.priceOre === 0 && !booking.subscriptionId ? { type: "gratis" } : { type: "ukjent" };
  const { subject, html } = byggAvbestilling({
    mottaker: booking.user ? "app" : "gjest", fornavn: navn.split(" ")[0] ?? "",
    tjeneste: `${booking.serviceType.name} ${Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / 60_000)} min`,
    dag: datoTekst(booking.startAt), klokke: `${klokkeTekst(booking.startAt)}–${klokkeTekst(booking.endAt)}`,
    avbestiltTidspunkt: cancellation ? osloDagOgTid(cancellation.createdAt) : null,
    refusjon, referanse: !booking.user && refusjon.type === "penger" ? extra.refundId ?? booking.id : booking.id,
    lenker: { bookNy: `${APP_URL}/booking`, playerhq: `${APP_URL}/portal` },
  });
  try {
    const result = await resendKlient().emails.send({ from: FRA_EPOST, to: epost, subject, html });
    if (result.error) throw new Error("E-postleverandøren avviste bookingmeldingen.");
  } catch (error) {
    await logError({ context: "email.booking.resend", error, meta: { bookingId } });
    throw error;
  }
}

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
    varighetMin: Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / 60_000),
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
