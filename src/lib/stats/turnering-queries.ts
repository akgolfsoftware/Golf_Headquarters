/**
 * src/lib/stats/turnering-queries.ts
 *
 * Query-helpers for /stats/turneringer og tilhørende sider.
 * Brukes av /stats/turneringer/page.tsx og /stats/turneringer/[slug]/page.tsx.
 */

import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type TurneringListeRad = {
  id: string;
  slug: string | null;
  name: string;
  shortName: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  country: string | null;
  tour: string | null;
  status: string | null;
  purseUsd: number | null;
  tier: number | null;
  norskeAntall: number;
};

export type TurneringsDetalj = TurneringListeRad & {
  course: { id: string; name: string; slope: number | null; cr: number | null } | null;
  officialUrl: string | null;
  winnerName: string | null;
  norskeDeltakere: Array<{
    id: string;
    slug: string;
    name: string;
    country: string | null;
    position: number | null;
    scoreToPar: number | null;
    rounds: unknown;
    status: string | null;
  }>;
  alleDeltakere: Array<{
    id: string;
    name: string;
    country: string | null;
    position: number | null;
    scoreToPar: number | null;
    rounds: unknown;
    status: string | null;
    playerSlug: string | null;
  }>;
};

export type TourFilter =
  | "alle"
  | "pga"
  | "euro"
  | "kft"
  | "lpga"
  | "let"
  | "challenge"
  | "norge"
  | "junior"
  | "college";

export type TidFilter = "uke" | "kommende" | "avsluttede";

// ---------------------------------------------------------------------------
// Intern hjelp: ukevindu
// ---------------------------------------------------------------------------

function getUkeVindu(): { mandag: Date; sondag: Date } {
  const now = new Date();
  const dag = now.getDay() === 0 ? 7 : now.getDay(); // mandag=1, søndag=7
  const mandag = new Date(now);
  mandag.setDate(now.getDate() - dag + 1);
  mandag.setHours(0, 0, 0, 0);
  const sondag = new Date(mandag);
  sondag.setDate(mandag.getDate() + 6);
  sondag.setHours(23, 59, 59, 999);
  return { mandag, sondag };
}

// ---------------------------------------------------------------------------
// Tour-filter → Prisma-where
// ---------------------------------------------------------------------------

const TOUR_MAP: Record<TourFilter, string[] | null> = {
  alle: null,
  pga: ["pga"],
  euro: ["dp", "dp-world"],
  kft: ["korn-ferry"],
  lpga: ["lpga"],
  let: ["let"],
  challenge: ["challenge"],
  norge: ["amateur-no", "junior-no"],
  junior: ["junior-no"],
  college: ["college"],
};

function tourWhereClause(
  tour: TourFilter
): { tour?: { in: string[] } } {
  const values = TOUR_MAP[tour];
  if (!values) return {};
  return { tour: { in: values } };
}

// ---------------------------------------------------------------------------
// hentTurneringerForListe
// ---------------------------------------------------------------------------

export async function hentTurneringerForListe(
  tour: TourFilter,
  tid: TidFilter,
  take = 60
): Promise<TurneringListeRad[]> {
  const now = new Date();
  const { mandag, sondag } = getUkeVindu();

  const tidWhere =
    tid === "uke"
      ? {
          OR: [
            {
              startDate: { gte: mandag, lte: sondag },
            },
            {
              status: "IN_PROGRESS" as string,
            },
          ],
        }
      : tid === "kommende"
      ? {
          startDate: { gt: now },
          status: { in: ["UPCOMING"] },
        }
      : // avsluttede
        {
          status: "COMPLETED",
        };

  const tourWhere = tourWhereClause(tour);

  const rows = await prisma.tournament.findMany({
    where: {
      mergedIntoId: null,
      ...tidWhere,
      ...tourWhere,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      shortName: true,
      startDate: true,
      endDate: true,
      location: true,
      country: true,
      tour: true,
      status: true,
      purseUsd: true,
      tier: true,
      norskeAntall: true,
      _count: {
        select: {
          publicEntries: {
            where: { player: { country: "NO" } },
          },
        },
      },
    },
    orderBy:
      tid === "avsluttede"
        ? { startDate: "desc" }
        : { startDate: "asc" },
    take,
  });

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    shortName: r.shortName,
    startDate: r.startDate,
    endDate: r.endDate,
    location: r.location,
    country: r.country,
    tour: r.tour,
    status: r.status,
    purseUsd: r.purseUsd,
    tier: r.tier,
    // norskeAntall: bruk denormalisert felt dersom det finnes, ellers teller vi live
    norskeAntall: r.norskeAntall ?? r._count.publicEntries,
  }));
}

// ---------------------------------------------------------------------------
// hentTurneringCounts
// ---------------------------------------------------------------------------

export async function hentTurneringCounts(): Promise<
  Record<TourFilter, number>
> {
  const now = new Date();

  // Hent tellere for alle tour-filters parallelt.
  // "alle" er summen, resten er filtrert.
  const tourKeys: TourFilter[] = [
    "alle",
    "pga",
    "euro",
    "kft",
    "lpga",
    "let",
    "challenge",
    "norge",
    "junior",
    "college",
  ];

  const counts = await Promise.all(
    tourKeys.map(async (key) => {
      const tourWhere = tourWhereClause(key);
      const count = await prisma.tournament.count({
        where: {
          mergedIntoId: null,
          startDate: { lte: new Date(now.getTime() + 90 * 86400 * 1000) },
          ...tourWhere,
        },
      });
      return [key, count] as [TourFilter, number];
    })
  );

  return Object.fromEntries(counts) as Record<TourFilter, number>;
}

// ---------------------------------------------------------------------------
// hentTurneringBySlug
// ---------------------------------------------------------------------------

export async function hentTurneringBySlug(
  slug: string
): Promise<TurneringsDetalj | null> {
  const row = await prisma.tournament.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      shortName: true,
      startDate: true,
      endDate: true,
      location: true,
      country: true,
      tour: true,
      status: true,
      purseUsd: true,
      tier: true,
      norskeAntall: true,
      officialUrl: true,
      winnerName: true,
      course: {
        select: {
          id: true,
          name: true,
          slope: true,
          rating: true,
        },
      },
      publicEntries: {
        select: {
          id: true,
          status: true,
          position: true,
          scoreToPar: true,
          rounds: true,
          player: {
            select: {
              id: true,
              slug: true,
              name: true,
              country: true,
            },
          },
        },
        orderBy: { position: "asc" },
        take: 200,
      },
      _count: {
        select: {
          publicEntries: {
            where: { player: { country: "NO" } },
          },
        },
      },
    },
  });

  if (!row) return null;

  const norskeDeltakere = row.publicEntries
    .filter((e) => e.player.country === "NO")
    .map((e) => ({
      id: e.player.id,
      slug: e.player.slug,
      name: e.player.name,
      country: e.player.country,
      position: e.position,
      scoreToPar: e.scoreToPar,
      rounds: e.rounds,
      status: e.status,
    }));

  const alleDeltakere = row.publicEntries.map((e) => ({
    id: e.id,
    name: e.player.name,
    country: e.player.country,
    position: e.position,
    scoreToPar: e.scoreToPar,
    rounds: e.rounds,
    status: e.status,
    playerSlug: e.player.slug,
  }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.shortName,
    startDate: row.startDate,
    endDate: row.endDate,
    location: row.location,
    country: row.country,
    tour: row.tour,
    status: row.status,
    purseUsd: row.purseUsd,
    tier: row.tier,
    norskeAntall: row.norskeAntall ?? row._count.publicEntries,
    officialUrl: row.officialUrl,
    winnerName: row.winnerName,
    course: row.course
      ? {
          id: row.course.id,
          name: row.course.name,
          slope: row.course.slope,
          cr: row.course.rating,
        }
      : null,
    norskeDeltakere,
    alleDeltakere,
  };
}

// ---------------------------------------------------------------------------
// hentNorskeDenneUka
// ---------------------------------------------------------------------------

export async function hentNorskeDenneUka(): Promise<
  Array<{
    tournamentId: string;
    tournamentName: string;
    tournamentSlug: string | null;
    tour: string | null;
    status: string | null;
    location: string | null;
    startDate: Date;
    spillere: Array<{
      id: string;
      slug: string;
      name: string;
      position: number | null;
      scoreToPar: number | null;
      status: string | null;
    }>;
  }>
> {
  const { mandag, sondag } = getUkeVindu();

  const turneringer = await prisma.tournament.findMany({
    where: {
      mergedIntoId: null,
      OR: [
        { startDate: { gte: mandag, lte: sondag } },
        { status: "IN_PROGRESS" },
      ],
      publicEntries: {
        some: { player: { country: "NO" } },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      tour: true,
      status: true,
      location: true,
      startDate: true,
      publicEntries: {
        where: { player: { country: "NO" } },
        select: {
          status: true,
          position: true,
          scoreToPar: true,
          player: {
            select: { id: true, slug: true, name: true },
          },
        },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { startDate: "asc" },
    take: 20,
  });

  return turneringer.map((t) => ({
    tournamentId: t.id,
    tournamentName: t.name,
    tournamentSlug: t.slug,
    tour: t.tour,
    status: t.status,
    location: t.location,
    startDate: t.startDate,
    spillere: t.publicEntries.map((e) => ({
      id: e.player.id,
      slug: e.player.slug,
      name: e.player.name,
      position: e.position,
      scoreToPar: e.scoreToPar,
      status: e.status,
    })),
  }));
}
