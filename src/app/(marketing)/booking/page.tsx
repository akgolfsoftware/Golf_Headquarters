/**
 * /booking — Paper-port (PP-1.7, 10.08.2026). Fasit:
 * `designsystem/paper/fase1/booking.html` — én side med fire steg
 * (tjeneste → tid → deg → bekreft), i stedet for den gamle tre-siders flyten
 * via `/booking/[slug]`. Presentasjonen bor i MarkedBookingPaperV2.
 *
 * Acuity-pausen (kanBrukeInnebygdBooking) og Prisma-spørringen er beholdt fra
 * v2-porten 16. juli 2026. Undersidene `/booking/[slug]` består uendret —
 * de er fortsatt Stripe-flytens landingspunkt ved avbrutt betaling.
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BOOKING_ACUITY_URL, kanBrukeInnebygdBooking } from "@/lib/booking/offentlig-booking";
import { finnNesteLedige } from "./ledige-tider";
import { MarkedBookingV2 } from "@/components/marketing/v2/MarkedBookingV2";
import {
  MarkedBookingPaperV2,
  type PaperAbonnement,
  type PaperTjeneste,
} from "@/components/marketing/v2/MarkedBookingPaperV2";

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
 */
function sorterSomFasit<T extends { coachNavn: string | null; pris: number }>(a: T, b: T): number {
  if ((a.coachNavn === null) !== (b.coachNavn === null)) return a.coachNavn === null ? 1 : -1;
  if (a.coachNavn && b.coachNavn && a.coachNavn !== b.coachNavn) {
    return a.coachNavn.localeCompare(b.coachNavn, "nb");
  }
  return a.pris - b.pris;
}

// Fasiten låser flaten til én lokasjon ved lansering. Navnet leses fra samme
// rad som checkout faktisk bruker, slik at skjermen ikke lover et annet sted
// enn bookingen havner på.
const LOKASJON_FALLBACK = "Gamle Fredrikstad GK";

export default async function BookingLanding() {
  // Pauset for publikum: alle domener sendes til Acuity. Kun ADMIN ser flyten
  // (til BOOKING_PUBLIC=true) — se src/lib/booking/offentlig-booking.ts.
  if (!(await kanBrukeInnebygdBooking())) {
    return <MarkedBookingV2 paused acuityUrl={BOOKING_ACUITY_URL} />;
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

  const tjenester: PaperTjeneste[] = services
    .filter((s) => !erAbonnement(s.name))
    .map((s) => ({
      slug: s.slug,
      navn: s.name,
      coachNavn: coachEtikett(s.name, fornavn(s.coach?.name)),
      pris: Math.round(s.priceOre / 100),
      // ServiceType har ingen kolonne for prisenhet, så flaten sier «kr» og lar
      // beskrivelsen fra basen bære nyansen (delt økt, per spiller osv.).
      enhet: "kr",
      varighetMin: s.durationMin,
      beskrivelse: s.description,
    }))
    .sort(sorterSomFasit);

  const abonnement: PaperAbonnement[] = services
    .filter((s) => erAbonnement(s.name))
    .map((s) => ({
      slug: s.slug,
      navn: s.name,
      coachNavn: coachEtikett(s.name, fornavn(s.coach?.name)),
      pris: Math.round(s.priceOre / 100),
      beskrivelse: s.description,
    }))
    .sort(sorterSomFasit);

  // Heroens «Neste ledige» skal vise et ekte tidspunkt med en gang. Vi spør for
  // den billigste økta — den er også fra-prisen heroen viser, så tallene hører
  // sammen. Oppslaget bryter på første ledige dag.
  const nesteLedig = tjenester.length ? await finnNesteLedige(tjenester[0].slug) : null;

  return (
    <MarkedBookingPaperV2
      tjenester={tjenester}
      abonnement={abonnement}
      lokasjon={lokasjonRad?.name ?? LOKASJON_FALLBACK}
      nesteLedigInit={nesteLedig?.tekst ?? null}
    />
  );
}
