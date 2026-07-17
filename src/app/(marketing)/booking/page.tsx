/**
 * /booking — v2-port 16. juli 2026. Datalogikk gjenbrukt 1:1 fra
 * (mlegacy)/booking/page.tsx: BOOKING_ACTIVE-flagget (Acuity-pause),
 * Prisma-spørringen (aktive tjenester med pris > 0), lokasjon-mapping
 * (Trackman → Mulligan, ellers GFGK), coach-bios og abonnement-grupperingen
 * («performance» i navnet). Presentasjonen bor i MarkedBookingV2 (v2, MRamme
 * — flyttet ut av (mlegacy)-chromen som resten av markedssidene).
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  MarkedBookingV2,
  type BookingLokasjon,
  type BookingTjeneste,
  type BookingTrener,
} from "@/components/marketing/v2/MarkedBookingV2";

export const metadata: Metadata = {
  title: "Book økt | AK Golf",
  description: "Book Pro-time, Trackman-analyse eller gruppe-økt online.",
};

type SearchParams = Promise<{ lokasjon?: string; trener?: string }>;

// Lokasjon-mapping. Trackman-tjenester foregår på Mulligan, alt annet på GFGK.
// Når ServiceType får locationId-FK (V1.5+), leses dette fra DB.
function getLocationForService(slug: string): string {
  if (slug.includes("trackman") || slug.includes("mulligan")) return "mulligan";
  return "gfgk";
}

function erAbonnement(name: string): boolean {
  return name.toLowerCase().includes("performance");
}

// Coach-display-info per User-ID. Brukes for tittel/beskrivelse i UI.
// Navn hentes fra DB via ServiceType.coach.
const COACH_BIOS: Record<string, { tittel: string }> = {
  "anders@akgolf.no": {
    tittel: "Head Coach · 15+ år erfaring · WANG Toppidrett",
  },
  "markus@akgolf.no": {
    tittel: "Assistent-coach · spillerutvikling",
  },
};

const LOCATIONS: Record<string, { id: string; navn: string; sted: string }> = {
  gfgk: {
    id: "gfgk",
    navn: "Gamle Fredrikstad Golfklubb",
    sted: "Torsnesveien 16, 1630 Gamle Fredrikstad",
  },
  mulligan: {
    id: "mulligan",
    navn: "Mulligan Indoor Golf Fredrikstad",
    sted: "Produksjonsveien 21, 1618 Fredrikstad",
  },
};

// Feature-flag: skru av offentlig booking inntil Google Calendar 2-way sync
// er på plass. Forhindrer dobbel-booking mot Anders sin private kalender.
// Sett BOOKING_ACTIVE=true i Vercel når sync er live.
const BOOKING_ACTIVE = process.env.BOOKING_ACTIVE === "true";

// Frem til AK Golf HQ-bookingen lanseres bookes alt via Acuity (akgolfgroup.as.me).
// Når BOOKING_ACTIVE=true settes i Vercel, overtar den innebygde flyten automatisk.
const BOOKING_ACUITY_URL = process.env.NEXT_PUBLIC_ACUITY_URL ?? "https://akgolfgroup.as.me";

export default async function BookingLanding({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { lokasjon, trener } = await searchParams;

  if (!BOOKING_ACTIVE) {
    return <MarkedBookingV2 paused acuityUrl={BOOKING_ACUITY_URL} />;
  }

  const services = await prisma.serviceType.findMany({
    where: { active: true, priceOre: { gt: 0 } },
    orderBy: { priceOre: "asc" },
    include: {
      coach: { select: { id: true, name: true, email: true } },
    },
  });

  // Hvilke lokasjoner finnes representert?
  const aktiveLokasjoner = Array.from(
    new Set(services.map((s) => getLocationForService(s.slug))),
  );
  const lokasjonValg: BookingLokasjon[] = aktiveLokasjoner
    .map((id) => LOCATIONS[id])
    .filter(Boolean);

  // Hvilke trenere har minst én aktiv tjeneste? (deduplisert)
  const treneresMap = new Map<string, BookingTrener>();
  for (const s of services) {
    if (s.coach && !treneresMap.has(s.coach.id)) {
      treneresMap.set(s.coach.id, {
        id: s.coach.id,
        navn: s.coach.name,
        tittel: COACH_BIOS[s.coach.email]?.tittel ?? "Coach",
      });
    }
  }
  const trenere = Array.from(treneresMap.values()).sort((a, b) =>
    a.navn.localeCompare(b.navn),
  );

  const tjenester: BookingTjeneste[] = services.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    description: s.description,
    priceOre: s.priceOre,
    durationMin: s.durationMin,
    coachId: s.coach?.id ?? null,
    lokasjonId: getLocationForService(s.slug),
    abonnement: erAbonnement(s.name),
  }));

  return (
    <MarkedBookingV2
      lokasjonValg={lokasjonValg}
      trenere={trenere}
      tjenester={tjenester}
      valgtLokasjon={lokasjon ?? null}
      valgtTrener={trener ?? null}
    />
  );
}
