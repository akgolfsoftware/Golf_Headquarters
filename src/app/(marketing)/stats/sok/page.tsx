/**
 * /stats/sok — v2. Swap av (mlegacy)/stats/sok/page.tsx. Prisma-søket
 * (serverSok) videreført 1:1 — kun presentasjonen er byttet (SokV2).
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SokV2, type SokServerResultater } from "@/components/marketing/v2/MarkedStatsSokV2";
import { offentligSpillerFilter } from "@/lib/stats/offentlig-spiller";
import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";

export const revalidate = 0; // Aldri caches — søk er alltid live

export const metadata: Metadata = {
  title: "Søk: AK Golf Stats",
  description:
    "Søk i hele AK Golf Stats. Finn norske spillere, PGA Tour-spillere, klubber, turneringer og artikler på ett sted.",
  alternates: { canonical: "https://akgolf.no/stats/sok" },
  openGraph: {
    title: "Søk: AK Golf Stats",
    url: "https://akgolf.no/stats/sok",
  },
  robots: { index: false }, // Søkesider skal ikke indekseres
};

async function serverSok(q: string, visDataGolf: boolean): Promise<SokServerResultater | null> {
  if (!q || q.length < 2) return null;

  const [norskeSpillere, pgaSpillere, turneringer] = await Promise.all([
    prisma.publicPlayer
      .findMany({
        where: { country: "NO", isActive: true, ...offentligSpillerFilter(), name: { contains: q, mode: "insensitive" } },
        take: 10,
        select: { slug: true, name: true, tier: true, bio: true },
      })
      .catch(() => []),
    // PGA-spillerne og SG-tallet kommer fra Data Golf: bare coach og admin
    // (Anders 09.10.2026). Andre får tom liste.
    visDataGolf
      ? prisma.pgaPlayerSeason
          .findMany({
            where: { playerName: { contains: q, mode: "insensitive" }, year: 2026 },
            take: 10,
            orderBy: { sgTotal: "desc" },
            select: { playerName: true, dgPlayerId: true, sgTotal: true },
          })
          .catch(() => [])
      : Promise.resolve([]),
    prisma.tournament
      .findMany({
        where: { name: { contains: q, mode: "insensitive" }, mergedIntoId: null },
        orderBy: { startDate: "desc" },
        take: 10,
        select: { slug: true, name: true, startDate: true, tour: true },
      })
      .catch(() => []),
  ]);

  return { norskeSpillere, pgaSpillere, turneringer };
}

export default async function SokPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; year?: string }>;
}) {
  const { q = "", type = "alle" } = await searchParams;
  const serverResultater = await serverSok(q, await innloggetKanSeDataGolf());

  return <SokV2 initialQuery={q} initialType={type} serverResultater={serverResultater} />;
}
