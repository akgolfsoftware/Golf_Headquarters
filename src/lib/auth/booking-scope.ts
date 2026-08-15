import type { Prisma, User } from "@/generated/prisma/client";

/**
 * Booking-scope og betalingsregel for AgencyOS Bookinger.
 *
 * Trukket ut av `admin/(legacy)/bookinger/actions.ts` 2026-08-15 (steg 4 i
 * `docs/plan-testdekning.md`). Actions-filen er `"use server"` og kan derfor
 * kun eksportere async-funksjoner — disse to er synkrone og rene, så de kunne
 * ikke testes der de sto. Testen speilet dem i stedet, og speilet drev fra
 * originalen: det testet et `serviceCoachId`-felt som ikke finnes noe sted i
 * skjemaet, og ga spilleren tilgang via `booking.userId` som den ekte koden
 * aldri har gitt.
 *
 * Regelen er uendret fra originalen — dette er ren flytting, ikke ny logikk.
 */

/**
 * Prisma-filter for hvilke bookinger en staff-bruker får røre.
 * ADMIN = alt, COACH = kun egne (direkte tildelt, eller via egen tjenestetype).
 *
 * NB: filteret gir IKKE tilgang via `booking.userId` — at du er spilleren på
 * bookingen er ikke det samme som å ha staff-tilgang til den. Kalles kun bak
 * `requireCoachActionUser()`, som allerede har avvist alt annet enn COACH/ADMIN.
 */
export function coachBookingScope(user: User): Prisma.BookingWhereInput {
  if (user.role === "ADMIN") return {};
  return {
    OR: [{ coachId: user.id }, { serviceType: { coachUserId: user.id } }],
  };
}

/**
 * Kan manuell bekreftelse tillates uten å gi bort en betalt time?
 * Gratis (priceOre <= 0), betalt via Stripe, eller dekket av credit-abonnement.
 */
export function kanBekrefteUtenStripeLeak(b: {
  priceOre: number;
  stripePaymentIntentId: string | null;
  subscriptionId: string | null;
}): boolean {
  if (b.priceOre <= 0) return true;
  if (b.stripePaymentIntentId) return true;
  if (b.subscriptionId) return true;
  return false;
}
