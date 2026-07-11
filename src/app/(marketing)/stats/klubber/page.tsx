/**
 * /stats/klubber — Klubbdatabase (v2, retning C)
 * Swap av (mlegacy)/stats/klubber/page.tsx → v2-utseende. Data-lag
 * (SEED_KLUBBER + hentKlubbStats) er 1:1 videreført fra legacy-siden; kun
 * presentasjonen er byttet til StatsRamme + StatsKlubberV2.
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatsKlubberV2 } from "@/components/marketing/v2/StatsKlubberV2";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Klubbdatabase: alle norske golfklubber | AK Golf Stats",
  description:
    "Spillere, pro-talent, juniorprogram og turneringshistorikk for alle norske golfklubber. Finn din klubb og se hvem som dominerer.",
  alternates: { canonical: "https://akgolf.no/stats/klubber" },
  openGraph: {
    title: "Klubbdatabase: alle norske golfklubber | AK Golf Stats",
    description: "Pro-talent, college-commits og turneringsdata per klubb.",
    url: "https://akgolf.no/stats/klubber",
  },
};

// ---------------------------------------------------------------------------
// Seed-data (1:1 videreført fra (mlegacy)/stats/klubber/page.tsx)
// ---------------------------------------------------------------------------

export const SEED_KLUBBER = [
  { slug: "oslo-gk",      navn: "Oslo Golfklubb",       kommune: "Oslo",       region: "Øst",  spillere: 112, pro: 3, college: 4, junior: 32, turneringer: 42 },
  { slug: "baerum-gk",    navn: "Bærum Golfklubb",      kommune: "Bærum",      region: "Øst",  spillere: 89,  pro: 1, college: 2, junior: 32, turneringer: 47 },
  { slug: "gfgk",         navn: "Gamle Fredrikstad GK",  kommune: "Fredrikstad",region: "Øst",  spillere: 73,  pro: 0, college: 1, junior: 21, turneringer: 38 },
  { slug: "stavanger-gk", navn: "Stavanger Golfklubb",   kommune: "Stavanger",  region: "Vest", spillere: 58,  pro: 1, college: 2, junior: 18, turneringer: 28 },
  { slug: "kongsberg-gk", navn: "Kongsberg Golfklubb",   kommune: "Kongsberg",  region: "Øst",  spillere: 42,  pro: 0, college: 0, junior: 14, turneringer: 21 },
  { slug: "trondheim-gk", navn: "Trondheim Golfklubb",   kommune: "Trondheim",  region: "Midt", spillere: 39,  pro: 0, college: 1, junior: 11, turneringer: 19 },
  { slug: "bergen-gk",    navn: "Bergen Golfklubb",       kommune: "Bergen",     region: "Vest", spillere: 34,  pro: 0, college: 0, junior: 9,  turneringer: 16 },
  { slug: "larvik-gk",    navn: "Larvik Golfklubb",       kommune: "Larvik",     region: "Sør",  spillere: 28,  pro: 0, college: 0, junior: 7,  turneringer: 14 },
  { slug: "hamar-gk",     navn: "Hamar Golfklubb",        kommune: "Hamar",      region: "Øst",  spillere: 22,  pro: 0, college: 0, junior: 6,  turneringer: 11 },
  { slug: "tonsberg-gk",  navn: "Tønsberg Golfklubb",     kommune: "Tønsberg",   region: "Sør",  spillere: 18,  pro: 0, college: 0, junior: 4,  turneringer: 9  },
];

// ---------------------------------------------------------------------------
// Data-henting
// ---------------------------------------------------------------------------

async function hentKlubbStats() {
  const [totalSpillere, totalTurneringer] = await Promise.all([
    prisma.publicPlayer.count({ where: { isActive: true } }),
    prisma.tournament.count({ where: { mergedIntoId: null } }),
  ]);

  return { totalSpillere, totalTurneringer };
}

// ---------------------------------------------------------------------------

export default async function KlubbdatabasePage() {
  const stats = await hentKlubbStats();

  return (
    <StatsKlubberV2
      klubber={SEED_KLUBBER}
      totalSpillere={stats.totalSpillere}
      totalTurneringer={stats.totalTurneringer}
    />
  );
}
