/**
 * /stats/spillere — Norsk spillerdatabase (v2, retning C)
 * Swap av (mlegacy)/stats/spillere/page.tsx → v2-utseende. Data-lag
 * (hentSideData, hentAarganger) er 1:1 videreført fra legacy-siden; kun
 * presentasjonen er byttet til StatsRamme/StatsListe + StatsSpillereV2.
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatsSpillereV2, type Spiller } from "@/components/marketing/v2/StatsSpillereV2";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Norsk spillerdatabase: AK Golf Stats",
  description:
    "Søk opp norske golfspillere og se komplette turneringsresultater fra Srixon Tour, OLYO, Norges Cup og Østlandstour 2016–2026. 1 500+ spillere på ett sted.",
  alternates: { canonical: "https://akgolf.no/stats/spillere" },
  openGraph: {
    title: "Norsk spillerdatabase: AK Golf Stats",
    description: "1 500+ norske golfspillere. Komplett resultathistorikk fra 10 år med norsk golf.",
    url: "https://akgolf.no/stats/spillere",
    type: "website",
  },
};

const TIER_MAP: Record<string, string[]> = {
  pro: ["pro-pga", "pro-dp", "pro-lpga", "pro"],
  college: ["college"],
  amateur: ["amateur"],
  junior: ["junior"],
};

async function hentSideData(q: string | undefined, aar: string | undefined, tier: string | undefined, side: number) {
  const PAGE_SIZE = 50;

  const [totalSpillere, totalTurneringer, totalResultater] = await Promise.all([
    prisma.publicPlayer.count({ where: { country: "NO", isActive: true } }),
    prisma.tournament.count({ where: { mergedIntoId: null } }),
    prisma.publicPlayerEntry.count(),
  ]);

  const navnFilter = q && q.trim().length > 0 ? { name: { contains: q.trim(), mode: "insensitive" as const } } : {};
  const birthYearFilter = aar && /^\d{4}$/.test(aar) ? { birthYear: parseInt(aar, 10) } : {};
  const tierFilter = tier && tier !== "alle" ? { tier: { in: TIER_MAP[tier] ?? [tier] } } : {};

  const spillere = await prisma.publicPlayer.findMany({
    where: { country: "NO", isActive: true, ...navnFilter, ...birthYearFilter, ...tierFilter },
    orderBy: { name: "asc" },
    take: PAGE_SIZE,
    skip: (side - 1) * PAGE_SIZE,
    select: { id: true, slug: true, name: true, birthYear: true, tier: true, bio: true, _count: { select: { entries: true } } },
  });

  const harFilter = Boolean(q || aar || (tier && tier !== "alle"));
  let topp20: Spiller[] = [];
  if (!harFilter) {
    topp20 = await prisma.publicPlayer.findMany({
      where: { country: "NO", isActive: true },
      orderBy: [{ tier: "asc" }, { name: "asc" }],
      take: 20,
      select: { id: true, slug: true, name: true, birthYear: true, tier: true, bio: true, _count: { select: { entries: true } } },
    });
  }

  return { totalSpillere, totalTurneringer, totalResultater, spillere, topp20, harFilter, PAGE_SIZE };
}

async function hentAarganger(): Promise<number[]> {
  const rows = await prisma.publicPlayer.findMany({
    where: { country: "NO", isActive: true, birthYear: { not: null } },
    select: { birthYear: true },
    distinct: ["birthYear"],
    orderBy: { birthYear: "desc" },
    take: 10,
  });
  return rows.map((r) => r.birthYear).filter((y): y is number => y !== null);
}

export default async function SpillerdatabasePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const aar = typeof params.aar === "string" ? params.aar : undefined;
  const tier = typeof params.tier === "string" ? params.tier : undefined;
  const view = typeof params.view === "string" ? params.view : "grid";
  const sideRaw = typeof params.side === "string" ? parseInt(params.side, 10) : 1;
  const side = isNaN(sideRaw) || sideRaw < 1 ? 1 : sideRaw;

  const [{ totalSpillere, totalTurneringer, totalResultater, spillere, topp20, harFilter, PAGE_SIZE }, aarganger] = await Promise.all([
    hentSideData(q, aar, tier, side),
    hentAarganger(),
  ]);

  return (
    <StatsSpillereV2
      q={q}
      aar={aar}
      tier={tier}
      view={view}
      side={side}
      totalSpillere={totalSpillere}
      totalTurneringer={totalTurneringer}
      totalResultater={totalResultater}
      spillere={spillere}
      topp20={topp20}
      harFilter={harFilter}
      PAGE_SIZE={PAGE_SIZE}
      aarganger={aarganger}
    />
  );
}
