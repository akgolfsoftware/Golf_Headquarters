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
import { vurderDeling, velgPlassNr } from "@/lib/booking/deling";

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
export const DELT_FULLT_MELDING =
  "Økta er full — alle plassene er tatt.";

export interface KollisjonsResultat {
  /**
   * Plassen bookingen skal opprettes/flyttes til. MÅ skrives til
   * Booking.plassNr — det er den databasens EXCLUSION-constraint bruker for å
   * gjøre dobbeltbooking fysisk umulig.
   */
  plassNr: number;
}

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
    /**
     * Tjenesten som bookes. Nødvendig for delte økter (2-til-1): kapasiteten
     * ligger på ServiceType.maxDeltakere. Uten denne behandles alt som
     * kapasitet 1 — samme oppførsel som før steg 5.
     */
    serviceTypeId?: string | null;
  },
): Promise<KollisjonsResultat> {
  const {
    coachId,
    facilityId,
    startAt,
    endAt,
    ekskluderBookingId,
    serviceTypeId,
  } = input;

  // Plass 1 med mindre en delt økt sier noe annet (se velgPlassNr).
  let plassNr = 1;

  // Advisory-låser FØR telling — to samtidige transaksjoner på samme ressurs
  // kjører sjekken etter tur i stedet for parallelt (slippes ved commit/rollback).
  if (coachId) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"coach:" + coachId}))`;
  }
  if (facilityId) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"fasilitet:" + facilityId}))`;
  }

  if (coachId) {
    // Kapasitet fra tjenesten: 1 = vanlig time, >1 = delt økt (f.eks. 2-til-1).
    let kapasitet = 1;
    if (serviceTypeId) {
      const tjeneste = await tx.serviceType.findUnique({
        where: { id: serviceTypeId },
        select: { maxDeltakere: true },
      });
      kapasitet = tjeneste?.maxDeltakere ?? 1;
    }

    const overlappende = await tx.booking.findMany({
      where: {
        coachId,
        status: { not: "CANCELLED" },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        ...(ekskluderBookingId ? { id: { not: ekskluderBookingId } } : {}),
      },
      select: {
        serviceTypeId: true,
        startAt: true,
        endAt: true,
        plassNr: true,
      },
    });

    const vurdering = vurderDeling(
      overlappende,
      { serviceTypeId: serviceTypeId ?? "", startAt, endAt },
      kapasitet,
    );
    if (vurdering.utfall === "kollisjon") {
      throw new BookingKollisjon(KOLLISJON_MELDING);
    }
    if (vurdering.utfall === "fullt") {
      throw new BookingKollisjon(DELT_FULLT_MELDING);
    }

    const plass = velgPlassNr(
      overlappende.map((b) => b.plassNr),
      kapasitet,
    );
    if (plass === null) throw new BookingKollisjon(DELT_FULLT_MELDING);
    plassNr = plass;
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

  return { plassNr };
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
