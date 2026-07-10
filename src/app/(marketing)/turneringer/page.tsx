/**
 * /turneringer — v2. Datalogikk gjenbrukt 1:1 fra (mlegacy)/turneringer/page.tsx
 * (hentTurneringer/hentNorskeDenneUka/hentCounts). ISR 30 min — DB oppdateres
 * av cron, vi rendrer cachet.
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  MarkedTurneringerListeV2,
  type Tab,
  type TurneringKortData,
  type NorskeEntry,
  type Counts,
} from "@/components/marketing/v2/MarkedTurneringerListeV2";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Turneringer: alle norske spillere ett sted | AK Golf",
  description:
    "Følg norske golfspillere på PGA, DP World, LPGA, amatør og junior, automatisk oppdatert hver dag. Gratis oversikt fra AK Golf.",
  alternates: { canonical: "https://akgolf.no/turneringer" },
};

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function TurneringerPageV2({ searchParams }: Props) {
  const params = await searchParams;
  const tab: Tab = ["alle", "norge", "pro", "norske"].includes(params.tab as Tab)
    ? (params.tab as Tab)
    : "alle";

  const tournaments = await hentTurneringer(tab);
  const norskeDenneUka = await hentNorskeDenneUka();
  const counts = await hentCounts();

  return (
    <MarkedTurneringerListeV2 tab={tab} tournaments={tournaments} norskeDenneUka={norskeDenneUka} counts={counts} />
  );
}

async function hentTurneringer(tab: Tab): Promise<TurneringKortData[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in60 = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

  const baseWhere = {
    startDate: { gte: today, lte: in60 },
    status: { in: ["UPCOMING", "IN_PROGRESS"] },
    mergedIntoId: null,
  };

  type TurneringWhere =
    | typeof baseWhere
    | (typeof baseWhere & { tour: { in: string[] } })
    | (typeof baseWhere & { publicEntries: { some: { player: { country: string } } } });

  let where: TurneringWhere = baseWhere;

  if (tab === "norge") {
    where = { ...baseWhere, tour: { in: ["amateur-no", "junior-no"] } };
  } else if (tab === "pro") {
    where = { ...baseWhere, tour: { in: ["pga", "euro", "kft", "alt", "champ", "lpga", "let"] } };
  } else if (tab === "norske") {
    where = { ...baseWhere, publicEntries: { some: { player: { country: "NO" } } } };
  }

  const rows = await prisma.tournament.findMany({
    where,
    orderBy: { startDate: "asc" },
    take: 48,
    include: {
      _count: { select: { publicEntries: { where: { player: { country: "NO" } } } } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    startDate: r.startDate,
    endDate: r.endDate,
    location: r.location,
    tour: r.tour,
    status: r.status,
    norskeCount: r._count.publicEntries,
  }));
}

async function hentNorskeDenneUka(): Promise<NorskeEntry[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  return prisma.publicPlayerEntry.findMany({
    where: {
      player: { country: "NO" },
      tournament: {
        startDate: { gte: today, lte: in7 },
        status: { in: ["UPCOMING", "IN_PROGRESS"] },
        mergedIntoId: null,
      },
    },
    include: {
      player: { select: { id: true, name: true, slug: true, tier: true, photoUrl: true } },
      tournament: { select: { id: true, name: true, slug: true, startDate: true, tour: true, status: true, location: true } },
    },
    orderBy: [{ position: "asc" }, { tournament: { startDate: "asc" } }],
    take: 30,
  });
}

async function hentCounts(): Promise<Counts> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in60 = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

  const base = {
    startDate: { gte: today, lte: in60 },
    status: { in: ["UPCOMING", "IN_PROGRESS"] },
    mergedIntoId: null,
  };

  const [alle, norge, pro, norske] = await Promise.all([
    prisma.tournament.count({ where: base }),
    prisma.tournament.count({ where: { ...base, tour: { in: ["amateur-no", "junior-no"] } } }),
    prisma.tournament.count({ where: { ...base, tour: { in: ["pga", "euro", "kft", "alt", "champ", "lpga", "let"] } } }),
    prisma.tournament.count({ where: { ...base, publicEntries: { some: { player: { country: "NO" } } } } }),
  ]);

  return { alle, norge, pro, norske };
}
