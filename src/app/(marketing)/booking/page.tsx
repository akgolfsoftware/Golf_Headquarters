/**
 * /booking — BK-01 i Precision Athletics (Claude Design 7d7c2994, ui_kits/booking/
 * screens/BK.jsx): én side med fire steg (tjeneste, tid, deg, bekreft og betal).
 * Presentasjonen bor i BK01Booking. Den gamle Paper-presentasjonen
 * (MarkedBookingV2) er ikke lenger i bruk.
 *
 * Acuity-pausen (kanBrukeInnebygdBooking) og Prisma-spørringen er beholdt fra
 * v2-porten 16. juli 2026. Undersidene `/booking/[slug]` består uendret —
 * de er fortsatt Stripe-flytens landingspunkt ved avbrutt betaling.
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BOOKING_ACUITY_URL, kanBrukeInnebygdBooking } from "@/lib/booking/offentlig-booking";
import { erAbonnementTjeneste, erDuoTjeneste } from "@/lib/booking/tjeneste-kategori";
import { MarkedBookingPauset } from "@/components/marketing/landing/MarkedBookingPauset";
import {
  BK01Booking,
  type BookingAbonnement,
  type BookingTjeneste,
} from "@/components/booking/precision/BK01Booking";

export const metadata: Metadata = {
  title: "Book en time · AK Golf Academy",
  description:
    "Personlig coaching med Anders Kristiansen. Velg tjeneste og ledig tid, og book online.",
};

/** «Anders Kristiansen» → «Anders». Fasiten viser fornavn på tjenestekortene. */
function fornavn(navn: string | null | undefined): string | null {
  if (!navn) return null;
  return navn.trim().split(/\s+/)[0] || null;
}

/**
 * Flere tjenestenavn i basen bærer allerede coachen («Flex 20 min — Markus»).
 * Da skal den ikke settes på én gang til — ellers står det «… — Markus · Markus».
 */
function coachEtikett(tjenestenavn: string, coach: string | null): string | null {
  if (!coach) return null;
  return tjenestenavn.toLowerCase().includes(coach.toLowerCase()) ? null : coach;
}

/**
 * Fasitens rekkefølge: én coach av gangen (Anders før Markus), billigste først
 * innenfor hver, og gruppe-økter uten coach til slutt. Ren pris-sortering
 * blandet coachene om hverandre.
 *
 * Sorterer på coachen fra basen (`sorterPaa`), ikke på etiketten kortet viser —
 * den er ofte tom fordi tjenestenavnet allerede bærer coachen.
 */
function sorterSomFasit<T extends { sorterPaa: string | null; pris: number }>(a: T, b: T): number {
  if ((a.sorterPaa === null) !== (b.sorterPaa === null)) return a.sorterPaa === null ? 1 : -1;
  if (a.sorterPaa && b.sorterPaa && a.sorterPaa !== b.sorterPaa) {
    return a.sorterPaa.localeCompare(b.sorterPaa, "nb");
  }
  return a.pris - b.pris;
}

// Standardstedet når tjenesten ikke har eget sted satt. Navnet leses fra samme
// rad som checkout-fallbacket bruker (tjeneste-sted.ts), slik at skjermen ikke
// lover et annet sted enn bookingen havner på. Tjenester med `locationId`
// viser sitt eget sted.
const LOKASJON_FALLBACK = "Gamle Fredrikstad GK";

export default async function BookingLanding() {
  // Pauset for publikum: alle domener sendes til Acuity. Kun ADMIN ser flyten
  // (til BOOKING_PUBLIC=true) — se src/lib/booking/offentlig-booking.ts.
  if (!(await kanBrukeInnebygdBooking())) {
    return <MarkedBookingPauset acuityUrl={BOOKING_ACUITY_URL} />;
  }

  const [services, lokasjonRad] = await Promise.all([
    prisma.serviceType.findMany({
      where: { active: true, priceOre: { gt: 0 } },
      orderBy: { priceOre: "asc" },
      include: { coach: { select: { name: true } }, location: { select: { name: true } } },
    }),
    prisma.location.findFirst({
      where: {
        OR: [
          { name: { contains: "Fredrikstad" } },
          { name: { contains: "GFGK" } },
          { name: { contains: "Golfklubb" } },
        ],
      },
      select: { name: true },
    }),
  ]);

  const tjenester: BookingTjeneste[] = services
    .filter((s) => !erAbonnementTjeneste(s))
    .map((s) => ({
      slug: s.slug,
      navn: s.name,
      coachNavn: coachEtikett(s.name, fornavn(s.coach?.name)),
      sorterPaa: fornavn(s.coach?.name),
      pris: Math.round(s.priceOre / 100),
      varighetMin: s.durationMin,
      beskrivelse: s.description,
      sted: s.location?.name ?? null,
      duo: erDuoTjeneste(s),
    }))
    .sort(sorterSomFasit)
    .map(({ sorterPaa: _sorterPaa, ...t }) => t);

  const abonnement: BookingAbonnement[] = services
    .filter((s) => erAbonnementTjeneste(s))
    .map((s) => ({
      slug: s.slug,
      navn: s.name,
      coachNavn: coachEtikett(s.name, fornavn(s.coach?.name)),
      sorterPaa: fornavn(s.coach?.name),
      pris: Math.round(s.priceOre / 100),
      beskrivelse: s.description,
    }))
    .sort(sorterSomFasit)
    .map(({ sorterPaa: _sorterPaa, ...a }) => a);

  return (
    <BK01Booking
      tjenester={tjenester}
      abonnement={abonnement}
      lokasjon={lokasjonRad?.name ?? LOKASJON_FALLBACK}
    />
  );
}
