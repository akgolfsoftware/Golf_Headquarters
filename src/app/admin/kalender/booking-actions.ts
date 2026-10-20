"use server";

/**
 * Steg 5 (2026-07-28): book en kunde rett i kalenderluka — uten å bytte visning.
 *
 * Selve opprettelsen gjenbruker opprettOktPaaTid, som allerede har
 * kollisjonsvern i transaksjon og Google-push. Her henter vi bare valgene
 * skjemaet trenger, og pakker resultatet i noe UI-et kan vise.
 */

import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere, coachedPlayerWhere } from "@/lib/auth/coached";
import { opprettOktPaaTid } from "@/app/admin/(legacy)/calendar/actions";
import { coachBookingScope } from "@/lib/auth/booking-scope";
import { lagBetalingslenke } from "@/lib/booking/coach-betalingslenke";
import { logError } from "@/lib/error-tracking";

export interface BookingValg {
  tjenester: Array<{
    id: string;
    navn: string;
    varighetMin: number;
    prisOre: number;
    maxDeltakere: number;
  }>;
  steder: Array<{ id: string; navn: string }>;
  spillere: Array<{ id: string; navn: string }>;
}

/**
 * Valgene til hurtigbooking. Tjenester filtreres til coachens egne + felles
 * (coachUserId = null), så listen er kort nok til ett nedtrekk.
 */
export async function hentBookingValg(): Promise<BookingValg> {
  const aktor = await requireCoachActionUser();

  const [tjenester, steder, spillere] = await Promise.all([
    prisma.serviceType.findMany({
      where: {
        active: true,
        OR: [{ coachUserId: aktor.id }, { coachUserId: null }],
      },
      select: {
        id: true,
        name: true,
        durationMin: true,
        priceOre: true,
        maxDeltakere: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      // Ikke-coachede (leads) kan bookes av alle; coachede bare av egen coach (head coach: alle).
      where: { role: "PLAYER", OR: [{ NOT: coachedPlayerWhere() }, coachScopedPlayerWhere(aktor)] },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
      take: 500,
    }),
  ]);

  return {
    tjenester: tjenester.map((t) => ({
      id: t.id,
      navn: t.name,
      varighetMin: t.durationMin,
      prisOre: t.priceOre,
      maxDeltakere: t.maxDeltakere,
    })),
    steder: steder.map((s) => ({ id: s.id, navn: s.name })),
    spillere: spillere.map((s) => ({
      id: s.id,
      navn: s.name ?? s.email ?? "Uten navn",
    })),
  };
}

export type BookResultat =
  | {
      ok: true;
      bookingId: string;
      /** Stripe-betalingslenke (kort og Apple Pay) når betaling = Stripe. */
      betalingsUrl?: string | null;
      /** Satt når bookingen ble lagret, men lenken ikke kunne lages. */
      betalingsFeil?: string;
    }
  | { ok: false; feil: string };

export async function bookIKalender(input: {
  spillerId: string;
  serviceTypeId: string;
  locationId: string;
  /** «YYYY-MM-DDTHH:mm» — lokal veggklokke fra kalenderluka. */
  start: string;
  notater?: string;
  /** Utelatt = pris fra tjenesten, som før. */
  betaling?: "STRIPE" | "KLIPP" | "FAKTURA" | "GRATIS";
}): Promise<BookResultat> {
  // Auth gjøres også i opprettOktPaaTid; her for tidlig og tydelig avvisning.
  await requireCoachActionUser();

  const tjeneste = await prisma.serviceType.findUnique({
    where: { id: input.serviceTypeId },
    select: { durationMin: true },
  });
  if (!tjeneste) return { ok: false, feil: "Tjenesten finnes ikke" };

  // «YYYY-MM-DDTHH:mm» tolkes som lokal veggklokke — samme konvensjon som
  // resten av kalenderen (se google-calendar-tid.ts).
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(input.start);
  if (!m) return { ok: false, feil: "Ugyldig tidspunkt" };
  const startAt = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
  );

  try {
    const res = await opprettOktPaaTid({
      spillerId: input.spillerId,
      serviceTypeId: input.serviceTypeId,
      locationId: input.locationId,
      startAt,
      varighetMin: tjeneste.durationMin,
      notater: input.notater,
      betaling: input.betaling,
    });
    if (input.betaling !== "STRIPE") return { ok: true, bookingId: res.bookingId };

    // Stripe: lag lenken og send den til kunden i bekreftelsen. Feiler det, er bookingen lagret;
    // coachen kan lage lenken på nytt fra bookingen.
    const lenke = await lagBetalingslenke(res.bookingId);
    if (!lenke.ok) return { ok: true, bookingId: res.bookingId, betalingsUrl: null, betalingsFeil: lenke.feil };
    try {
      const { sendBookingConfirmation } = await import("@/lib/email/booking-emails");
      await sendBookingConfirmation(res.bookingId, { betalingsUrl: lenke.url });
    } catch (error) {
      await logError({ context: "admin.kalender.betalingslenke.epost", error, meta: { bookingId: res.bookingId }, severity: "warn" });
    }
    return { ok: true, bookingId: res.bookingId, betalingsUrl: lenke.url };
  } catch (err) {
    // opprettOktPaaTid kaster med ferdig norsk melding ved kollisjon.
    const melding =
      err instanceof Error ? err.message : "Kunne ikke opprette bookingen";
    return { ok: false, feil: melding };
  }
}

/** Ny Stripe-betalingslenke for en booking coachen har tilgang til. Den forrige lenken utløper. */
export async function lagBetalingslenkeForBooking(
  bookingId: string,
): Promise<{ ok: true; url: string } | { ok: false; feil: string }> {
  const aktor = await requireCoachActionUser();
  const finnes = await prisma.booking.findFirst({
    where: { id: bookingId, ...coachBookingScope(aktor) },
    select: { id: true },
  });
  if (!finnes) return { ok: false, feil: "Booking ikke funnet" };
  return lagBetalingslenke(bookingId);
}
