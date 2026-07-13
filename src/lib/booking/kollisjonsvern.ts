/**
 * Kollisjonsvern for bookinger (A-pakken, 2026-07-13).
 *
 * To lag:
 * 1. DATABASEN (siste skanse): EXCLUSION-constraintet booking_coach_no_overlap
 *    avviser to ikke-avlyste bookinger på samme coach i overlappende tidsrom —
 *    atomisk, immunt mot races. `erKollisjonsfeil()` oversetter bruddet til
 *    en pen norsk melding i alle veiene.
 * 2. KODEN (pen melding + fasilitets-kapasitet): `sjekkKollisjon()` kjøres i
 *    transaksjon MED advisory-lås per ressurs — coach-sjekk gir pen melding
 *    før insert, og fasilitets-sjekken teller belegg mot Facility.capacity
 *    (range tar flere samtidig, simulator tar én). Kapasitet kan ikke
 *    uttrykkes i et EXCLUSION-constraint, derfor lås + telling her.
 *
 * Brukes av ALLE veier som oppretter eller flytter en booking. Nye veier
 * skal alltid gjennom denne — aldri egen ad-hoc-sjekk.
 */

import { Prisma } from "@/generated/prisma/client";

/** Transaksjonsklient (prisma.$transaction-callback). */
type Tx = Prisma.TransactionClient;

export class BookingKollisjon extends Error {
  constructor(melding: string) {
    super(melding);
    this.name = "BookingKollisjon";
  }
}

export const KOLLISJON_MELDING =
  "Tidspunktet ble nettopp tatt — velg en annen tid.";
export const FULLT_MELDING =
  "Alle plassene på dette stedet er opptatt i tidsrommet — velg en annen tid.";

/**
 * Kjør INNE i en prisma.$transaction. Tar advisory-lås på coach og fasilitet
 * (serialiserer samtidige forsøk på samme ressurs i transaksjonens levetid),
 * og kaster BookingKollisjon med klarspråk-melding ved kollisjon.
 */
export async function sjekkKollisjon(
  tx: Tx,
  input: {
    coachId?: string | null;
    facilityId?: string | null;
    startAt: Date;
    endAt: Date;
    /** Ved flytting: bookingen som flyttes skal ikke telle mot seg selv. */
    ekskluderBookingId?: string;
  },
): Promise<void> {
  const { coachId, facilityId, startAt, endAt, ekskluderBookingId } = input;

  // Advisory-låser FØR telling — to samtidige transaksjoner på samme ressurs
  // kjører sjekken etter tur i stedet for parallelt (slippes ved commit/rollback).
  if (coachId) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"coach:" + coachId}))`;
  }
  if (facilityId) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"fasilitet:" + facilityId}))`;
  }

  if (coachId) {
    const kollisjon = await tx.booking.findFirst({
      where: {
        coachId,
        status: { not: "CANCELLED" },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        ...(ekskluderBookingId ? { id: { not: ekskluderBookingId } } : {}),
      },
      select: { id: true },
    });
    if (kollisjon) throw new BookingKollisjon(KOLLISJON_MELDING);
  }

  if (facilityId) {
    const fasilitet = await tx.facility.findUnique({
      where: { id: facilityId },
      select: { capacity: true },
    });
    const kapasitet = Math.max(1, fasilitet?.capacity ?? 1);
    const belegg = await tx.booking.count({
      where: {
        facilityId,
        status: { not: "CANCELLED" },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        ...(ekskluderBookingId ? { id: { not: ekskluderBookingId } } : {}),
      },
    });
    if (belegg >= kapasitet) throw new BookingKollisjon(FULLT_MELDING);
  }
}

/**
 * Fanger både vår egen pen-melding-feil og databasens siste skanse
 * (EXCLUSION-brudd 23P01 / gamle unique-brudd P2002).
 */
export function erKollisjonsfeil(err: unknown): boolean {
  if (err instanceof BookingKollisjon) return true;
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return true;
  }
  const melding = err instanceof Error ? err.message : String(err);
  return (
    melding.includes("booking_coach_no_overlap") || melding.includes("23P01")
  );
}

/** Norsk melding for en kollisjonsfeil (pen fallback for DB-nivå-brudd). */
export function kollisjonsmelding(err: unknown): string {
  return err instanceof BookingKollisjon ? err.message : KOLLISJON_MELDING;
}
