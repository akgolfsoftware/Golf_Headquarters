/**
 * /stats/baner — Banedatabase (v2, retning C)
 * Swap av (mlegacy)/stats/baner/page.tsx → v2-utseende. Data-lag
 * (hentAlleBaner, hentBanedatabaseStats) er 1:1 videreført fra legacy-siden.
 */
import type { Metadata } from "next";
import { StatsBanerV2 } from "@/components/marketing/v2/StatsBanerV2";
import { hentAlleBaner, hentBanedatabaseStats } from "@/lib/stats/bane-queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Banedatabase: alle norske golfbaner | AK Golf Stats",
  description:
    "Vanskelighetsgrad, slope, course rating og ekte turneringsstatistikk fra 50+ norske golfbaner. Finn din bane og se hvem som dominerer.",
  alternates: { canonical: "https://akgolf.no/stats/baner" },
  openGraph: {
    title: "Banedatabase: alle norske golfbaner | AK Golf Stats",
    description: "Slope, CR, turneringsdata og score-distribusjon for norske golfbaner.",
    url: "https://akgolf.no/stats/baner",
  },
};

export default async function BanedatabasePage() {
  // Tabell eksisterer ikke før migrasjonen er deployet — fallback til tomme arrays
  const [stats, baner] = await Promise.all([
    hentBanedatabaseStats().catch(() => ({
      totalBaner: 0,
      totalTurneringer: 0,
      totalSpillere: 0,
    })),
    hentAlleBaner().catch(() => []),
  ]);

  return (
    <StatsBanerV2 baner={baner} totalTurneringer={stats.totalTurneringer} totalSpillere={stats.totalSpillere} />
  );
}
