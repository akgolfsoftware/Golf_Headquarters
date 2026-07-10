/**
 * /stats/sok — v2. Swap av (mlegacy)/stats/sok/page.tsx. Prisma-søket
 * (serverSok) videreført 1:1 — kun presentasjonen er byttet (SokV2).
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SokV2, type SokServerResultater } from "@/components/marketing/v2/MarkedStatsSokV2";

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

async function serverSok(q: string): Promise<SokServerResultater | null> {
  if (!q || q.length < 2) return null;

  const [norskeSpillere, pgaSpillere, turneringer] = await Promise.all([
    prisma.publicPlayer
      .findMany({
        where: { country: "NO", isActive: true, name: { contains: q, mode: "insensitive" } },
        take: 10,
        select: { slug: true, name: true, tier: true, bio: true },
      })
      .catch(() => []),
    prisma.pgaPlayerSeason
      .findMany({
        where: { playerName: { contains: q, mode: "insensitive" }, year: 2026 },
        take: 10,
        orderBy: { sgTotal: "desc" },
        select: { playerName: true, dgPlayerId: true, sgTotal: true },
      })
      .catch(() => []),
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
  const serverResultater = await serverSok(q);

  return <SokV2 initialQuery={q} initialType={type} serverResultater={serverResultater} />;
}
