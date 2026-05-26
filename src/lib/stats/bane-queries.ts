/**
 * src/lib/stats/bane-queries.ts
 *
 * Helper-queries for banedatabasen. Brukes av /stats/baner og /stats/baner/[slug].
 */

import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export interface BaneListItem {
  id: string;
  slug: string;
  navn: string;
  kortNavn: string | null;
  region: string;
  kommune: string | null;
  antallHull: number;
  oppstartsaar: number | null;
  lengdeMeter: number | null;
  slope: number | null;
  courseRating: number | null;
  par: number;
  totaltAntallTurneringer: number;
  spillereSomHarSpilt: number;
}

export interface BaneDetalj extends BaneListItem {
  klubb: string;
  fylke: string | null;
  latitude: number | null;
  longitude: number | null;
  hjemmeside: string | null;
  bio: string | null;
  lavesteRundeRegistrert: number | null;
}

export interface BaneStats {
  antallTurneringer: number;
  antallSpillere: number;
  lavesteRunde: number | null;
}

// ---------------------------------------------------------------------------
// hentAlleBaner
// ---------------------------------------------------------------------------

export async function hentAlleBaner(filter?: {
  region?: string;
  q?: string;
}): Promise<BaneListItem[]> {
  const baner = await prisma.bane.findMany({
    where: {
      AND: [
        filter?.region ? { region: filter.region } : {},
        filter?.q
          ? {
              OR: [
                { navn: { contains: filter.q, mode: "insensitive" } },
                { kommune: { contains: filter.q, mode: "insensitive" } },
                { kortNavn: { contains: filter.q, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    },
    orderBy: [{ region: "asc" }, { navn: "asc" }],
    select: {
      id: true,
      slug: true,
      navn: true,
      kortNavn: true,
      region: true,
      kommune: true,
      antallHull: true,
      oppstartsaar: true,
      lengdeMeter: true,
      slope: true,
      courseRating: true,
      par: true,
      totaltAntallTurneringer: true,
      spillereSomHarSpilt: true,
    },
  });

  return baner;
}

// ---------------------------------------------------------------------------
// hentBaneBySlug
// ---------------------------------------------------------------------------

export async function hentBaneBySlug(
  slug: string
): Promise<BaneDetalj | null> {
  const bane = await prisma.bane.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      navn: true,
      kortNavn: true,
      klubb: true,
      region: true,
      kommune: true,
      fylke: true,
      latitude: true,
      longitude: true,
      antallHull: true,
      oppstartsaar: true,
      hjemmeside: true,
      lengdeMeter: true,
      slope: true,
      courseRating: true,
      par: true,
      bio: true,
      lavesteRundeRegistrert: true,
      totaltAntallTurneringer: true,
      spillereSomHarSpilt: true,
    },
  });

  return bane;
}

// ---------------------------------------------------------------------------
// hentBaneStats
// ---------------------------------------------------------------------------

export async function hentBaneStats(slug: string): Promise<BaneStats> {
  const bane = await prisma.bane.findUnique({
    where: { slug },
    select: { navn: true },
  });

  if (!bane) {
    return { antallTurneringer: 0, antallSpillere: 0, lavesteRunde: null };
  }

  // Søk i Tournament.location (fritekst-match på første ord av banenavnet)
  const firstWord = bane.navn.split(" ")[0];

  const [turneringCount, spillerCount] = await Promise.all([
    prisma.tournament.count({
      where: {
        location: { contains: firstWord, mode: "insensitive" },
        mergedIntoId: null,
      },
    }),
    prisma.publicPlayer.count({ where: { isActive: true } }),
  ]);

  // Hent laveste runde fra denormalisert felt på Bane
  const baneRec = await prisma.bane.findUnique({
    where: { slug },
    select: { lavesteRundeRegistrert: true },
  });

  return {
    antallTurneringer: turneringCount,
    antallSpillere: spillerCount,
    lavesteRunde: baneRec?.lavesteRundeRegistrert ?? null,
  };
}

// ---------------------------------------------------------------------------
// hentAlleStatistikk — brukes på /stats/baner for KPI-strip
// ---------------------------------------------------------------------------

export async function hentBanedatabaseStats(): Promise<{
  totalBaner: number;
  totalTurneringer: number;
  totalSpillere: number;
}> {
  const [totalBaner, totalTurneringer, totalSpillere] = await Promise.all([
    prisma.bane.count(),
    prisma.tournament.count({ where: { mergedIntoId: null } }),
    prisma.publicPlayer.count({ where: { isActive: true } }),
  ]);

  return { totalBaner, totalTurneringer, totalSpillere };
}
