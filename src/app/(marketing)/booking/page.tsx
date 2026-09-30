/**
 * /booking — BK-01 og BK-02 i Precision Athletics (tegning: Claude Design
 * 7d7c2994, ui_kits/booking/screens/BK.jsx). Én side med fire steg
 * (tjeneste → tid → deg → bekreft og betal). Presentasjonen bor i
 * `BookingFlyt` (src/components/booking/precision).
 *
 * Acuity-pausen (kanBrukeInnebygdBooking) og Prisma-spørringen er beholdt.
 * `/booking/[slug]` og `/booking/[slug]/bekreft` sender hit med
 * `?tjeneste=<slug>`: Stripes cancel_url peker fortsatt til `/booking/<slug>`.
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BOOKING_ACUITY_URL, kanBrukeInnebygdBooking } from "@/lib/booking/offentlig-booking";
import { MarkedBookingPauset } from "@/components/marketing/landing/MarkedBookingPauset";
import {
  BookingFlyt,
  type BkAbonnement,
  type BkTjeneste,
} from "@/components/booking/precision/BookingFlyt";

export const metadata: Metadata = {
  title: "Book en time · AK Golf Academy",
  description:
    "Personlig coaching med Anders Kristiansen. Velg tjeneste og ledig tid, og book online.",
};

function erAbonnement(name: string): boolean {
  return name.toLowerCase().includes("performance");
}

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

// Fasiten låser flaten til én lokasjon ved lansering. Navnet leses fra samme
// rad som checkout faktisk bruker, slik at skjermen ikke lover et annet sted
// enn bookingen havner på.
const LOKASJON_FALLBACK = "Gamle Fredrikstad GK";

export default async function BookingLanding({
  searchParams,
}: {
  searchParams: Promise<{ tjeneste?: string }>;
}) {
  const { tjeneste: startSlug } = await searchParams;
  // Pauset for publikum: alle domener sendes til Acuity. Kun ADMIN ser flyten
  // (til BOOKING_PUBLIC=true) — se src/lib/booking/offentlig-booking.ts.
  if (!(await kanBrukeInnebygdBooking())) {
    return <MarkedBookingPauset acuityUrl={BOOKING_ACUITY_URL} />;
  }

  const [services, lokasjonRad] = await Promise.all([
    prisma.serviceType.findMany({
      where: { active: true, priceOre: { gt: 0 } },
      orderBy: { priceOre: "asc" },
      include: { coach: { select: { name: true } } },
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

  const tjenester: BkTjeneste[] = services
    .filter((s) => !erAbonnement(s.name))
    .map((s) => ({
      slug: s.slug,
      navn: s.name,
      coach: coachEtikett(s.name, fornavn(s.coach?.name)),
      sorterPaa: fornavn(s.coach?.name),
      // ServiceType har ingen kolonne for prisenhet, så flaten sier «kr» og lar
      // beskrivelsen fra basen bære nyansen (delt økt, per spiller osv.).
      pris: Math.round(s.priceOre / 100),
      varighetMin: s.durationMin,
      beskrivelse: s.description,
    }))
    .sort(sorterSomFasit)
    .map(({ sorterPaa: _sorterPaa, ...t }) => t);

  const abonnement: BkAbonnement[] = services
    .filter((s) => erAbonnement(s.name))
    .map((s) => ({
      slug: s.slug,
      navn: [s.name, coachEtikett(s.name, fornavn(s.coach?.name))].filter(Boolean).join(" · "),
      sorterPaa: fornavn(s.coach?.name),
      pris: Math.round(s.priceOre / 100),
      beskrivelse: s.description,
    }))
    .sort(sorterSomFasit)
    .map(({ sorterPaa: _sorterPaa, ...a }) => a);

  return (
    <BookingFlyt
      tjenester={tjenester}
      abonnement={abonnement}
      lokasjon={lokasjonRad?.name ?? LOKASJON_FALLBACK}
      startSlug={startSlug ?? null}
    />
  );
}
