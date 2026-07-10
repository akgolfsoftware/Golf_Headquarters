/**
 * /stats/klubber/[slug] — Klubb-detalj (v2, retning C)
 * Swap av (mlegacy)/stats/klubber/[slug]/page.tsx → v2-utseende. Data
 * (SEED_KLUBBER + SPILLERE_PER_KLUBB + DB-turneringer) er 1:1 videreført.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SEED_KLUBBER } from "../page";
import { StatsKlubbDetaljV2 } from "@/components/marketing/v2/StatsKlubbDetaljV2";

export const revalidate = 3600;

export function generateStaticParams() {
  return SEED_KLUBBER.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const klubb = SEED_KLUBBER.find((k) => k.slug === slug);
  if (!klubb) return { title: "Klubb ikke funnet" };

  return {
    title: `${klubb.navn}: Klubbstatistikk | AK Golf Stats`,
    description: `${klubb.spillere} spillere, ${klubb.pro} pro, ${klubb.junior} junior. ${klubb.turneringer} turneringer arrangert av ${klubb.navn}.`,
    alternates: { canonical: `https://akgolf.no/stats/klubber/${slug}` },
    openGraph: {
      title: `${klubb.navn} | AK Golf Stats`,
      description: `${klubb.spillere} spillere · ${klubb.turneringer} turneringer`,
      url: `https://akgolf.no/stats/klubber/${slug}`,
    },
  };
}

// ---------------------------------------------------------------------------
// Seed spillere per klubb (1:1 videreført fra (mlegacy))
// ---------------------------------------------------------------------------

const SPILLERE_PER_KLUBB: Record<
  string,
  { navn: string; tier: string; snitt: number; antall: number }[]
> = {
  "oslo-gk": [
    { navn: "Anders Halvorsen", tier: "Amateur",  snitt: 68.5, antall: 28 },
    { navn: "Viggo Halvorsen",  tier: "Pro PGA",   snitt: 70.9, antall: 12 },
    { navn: "Sofie Næss",       tier: "Junior",    snitt: 73.4, antall: 32 },
    { navn: "Petter Hovland",   tier: "Junior",    snitt: 74.2, antall: 18 },
  ],
  "baerum-gk": [
    { navn: "Kristoffer Vangen",  tier: "Pro",     snitt: 70.4, antall: 22 },
    { navn: "Marius Larsen",      tier: "Junior",  snitt: 72.8, antall: 28 },
    { navn: "Maria Olsen",        tier: "Junior",  snitt: 72.4, antall: 24 },
    { navn: "Fredrik Hovland",    tier: "Amateur", snitt: 71.2, antall: 29 },
    { navn: "Kris Andersen",      tier: "Amateur", snitt: 72.1, antall: 31 },
  ],
  "gfgk": [
    { navn: "Petter Hagen",     tier: "Junior",  snitt: 74.1, antall: 24 },
    { navn: "Andreas Mæhlum",   tier: "College", snitt: 71.4, antall: 19 },
  ],
  "stavanger-gk": [
    { navn: "Selma Halland",    tier: "Pro",     snitt: 70.1, antall: 26 },
    { navn: "Petter Hovland",   tier: "Junior",  snitt: 73.5, antall: 22 },
  ],
};

export default async function KlubbDetaljPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const klubb = SEED_KLUBBER.find((k) => k.slug === slug);
  if (!klubb) notFound();

  const turneringer = await prisma.tournament.findMany({
    where: {
      location: { contains: klubb.kommune, mode: "insensitive" },
      mergedIntoId: null,
    },
    orderBy: { startDate: "desc" },
    take: 5,
    select: { id: true, name: true, startDate: true, status: true, norskeAntall: true },
  });

  const spillere = SPILLERE_PER_KLUBB[slug] ?? [];

  const fordeling = [
    { label: "Pro", n: klubb.pro },
    { label: "College", n: klubb.college },
    { label: "Junior", n: klubb.junior },
    { label: "Amatør", n: Math.max(0, klubb.spillere - klubb.pro - klubb.college - klubb.junior) },
  ].filter((f) => f.n > 0);

  const aktivitet = turneringer.map((t) => ({
    id: t.id,
    navn: t.name,
    dato: t.startDate.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" }),
  }));

  return (
    <StatsKlubbDetaljV2
      navn={klubb.navn}
      kommune={klubb.kommune}
      region={klubb.region}
      spillere={klubb.spillere}
      pro={klubb.pro}
      college={klubb.college}
      junior={klubb.junior}
      turneringer={klubb.turneringer}
      spillerRader={spillere}
      fordeling={fordeling}
      aktivitet={aktivitet}
    />
  );
}
