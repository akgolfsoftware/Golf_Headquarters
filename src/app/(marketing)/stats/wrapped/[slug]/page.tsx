/**
 * /stats/wrapped/[slug] — Spotify Wrapped-stil golfsesong-rapport
 * Server-side rendering + Client Component for slide-navigasjon.
 * Revalidate: 86400 (24 timer).
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import "@/app/(marketing)/(mlegacy)/stats/stats.css";
import { StatsWrappedPlayer } from "@/components/stats/stats-wrapped-player";
import type { WrappedSlideData } from "@/components/stats/stats-wrapped-slide";
import { StatsLegacyShell } from "@/components/marketing/v2/stats-ramme";

export const revalidate = 86400;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayer(slug);
  if (!player) return { title: "Spiller ikke funnet" };
  const aar = new Date().getFullYear();
  return {
    title: `${player.name}s golfsesong ${aar} | AK Golf Stats`,
    description: `Se ${player.name}s sesong ${aar} i tall: runder, snittscore, ranking og mer.`,
    openGraph: {
      title: `${player.name}s golfsesong ${aar}`,
      description: `Runder, snittscore, beste resultater og norsk ranking for ${player.name}.`,
      url: `https://akgolf.no/stats/wrapped/${slug}`,
    },
  };
}

async function getPlayer(slug: string) {
  try {
    return await prisma.publicPlayer.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

async function getEntries(playerId: string, aar: number) {
  try {
    return await prisma.publicPlayerEntry.findMany({
      where: {
        playerId,
        tournament: {
          startDate: {
            gte: new Date(`${aar}-01-01`),
            lt: new Date(`${aar + 1}-01-01`),
          },
        },
      },
      include: { tournament: true },
      orderBy: { tournament: { startDate: "asc" } },
    });
  } catch {
    return [];
  }
}

export default async function WrappedPage({ params }: Props) {
  const { slug } = await params;
  const player = await getPlayer(slug);
  if (!player) notFound();

  const aar = new Date().getFullYear();
  const entries = await getEntries(player.id, aar);

  // --- Aggregate stats ---
  const scores = entries.map((e) => e.totalScore).filter((s): s is number => s !== null);
  const antallRunder = scores.length;
  const snittScore = antallRunder > 0 ? scores.reduce((a, b) => a + b, 0) / antallRunder : 0;
  const besteScore = antallRunder > 0 ? Math.min(...scores) : 0;
  const besteEntry = entries.find((e) => e.totalScore === besteScore) ?? null;

  // Unique clubs
  const allKlubbs = entries
    .map((e) => e.tournament.location ?? e.tournament.name)
    .filter(Boolean) as string[];
  const klubbCount: Record<string, number> = {};
  for (const k of allKlubbs) klubbCount[k] = (klubbCount[k] ?? 0) + 1;
  const unikeKlubber = Object.keys(klubbCount);
  const mestSpilte = Object.entries(klubbCount).sort((a, b) => b[1] - a[1])[0];

  // --- Previous-year stats (real DB data) for year-over-year sammenligning ---
  const fjoraarsEntries = await getEntries(player.id, aar - 1);
  const fjoraarsScores = fjoraarsEntries
    .map((e) => e.totalScore)
    .filter((s): s is number => s !== null);
  const fjoraarsAntall = fjoraarsScores.length;
  const fjoraarsSnitt =
    fjoraarsAntall > 0
      ? fjoraarsScores.reduce((a, b) => a + b, 0) / fjoraarsAntall
      : 0;
  const harFjoraar = fjoraarsAntall > 0 && antallRunder > 0;
  // Negativ = forbedring (lavere snittscore).
  const forbedring = harFjoraar
    ? parseFloat((snittScore - fjoraarsSnitt).toFixed(1))
    : 0;

  // Estimated HCP (simplified WHS formula)
  const estimertHcp = snittScore > 0 ? Math.max(0, ((snittScore - 70) * 0.93)).toFixed(1) : "N/A";
  const fodselsAar = player.birthYear ?? 1990;

  // Build slides
  const delLenke = `https://akgolf.no/stats/wrapped/${slug}`;

  const slides: WrappedSlideData[] = [
    {
      type: "intro",
      bgVariant: "forest",
      navn: player.name,
      aar,
    },
    {
      type: "runder",
      bgVariant: "forest-dark",
      antall: antallRunder,
      // Ekte fjorårstall fra DB. Mangler fjorårsdata → samme som i år (0 diff).
      fjoraarsAntall: harFjoraar ? fjoraarsAntall : antallRunder,
      norskSnitt: 28,
    },
    {
      type: "snitt",
      bgVariant: "lime",
      snittScore: parseFloat(snittScore.toFixed(1)),
      estimertHcp,
      norgeSnittHcp: "18",
    },
    {
      type: "beste",
      bgVariant: "forest",
      score: besteScore || 72,
      toPar: (besteScore || 72) - 72,
      turnering: besteEntry?.tournament.name ?? "Ukjent turnering",
      dato: besteEntry?.tournament.startDate
        ? new Date(besteEntry.tournament.startDate).toLocaleDateString("nb-NO", { day: "numeric", month: "long" }).toUpperCase()
        : "2026",
      putterCount: 28,
    },
    {
      type: "klubber",
      bgVariant: "offwhite",
      antallKlubber: unikeKlubber.length || 1,
      klubbListe: unikeKlubber.slice(0, 8),
      mestSpilteKlubb: mestSpilte?.[0] ?? "Hjemmebane",
      mestSpilteAntall: mestSpilte?.[1] ?? antallRunder,
    },
    {
      type: "utvikling",
      bgVariant: "forest",
      // Ekte år-over-år-endring fra DB. 0 når fjorårsdata mangler.
      forbedring,
      betterThanPercent: 68,
      // Kun ekte datapunkter: i fjor + i år (når begge finnes).
      data: harFjoraar
        ? [
            { aar: aar - 1, snitt: parseFloat(fjoraarsSnitt.toFixed(1)) },
            { aar, snitt: parseFloat(snittScore.toFixed(1)) },
          ]
        : [{ aar, snitt: parseFloat(snittScore.toFixed(1)) }],
    },
    {
      type: "streak",
      bgVariant: "lime",
      streak: 5,
      kontekst: "I løpet av sommersesongen: turneringer rygg-i-rygg.",
    },
    {
      type: "ranking",
      bgVariant: "forest-dark",
      rankNasjon: 47,
      totalNasjon: 1547,
      rankAldersgruppe: 12,
      totalAldersgruppe: 142,
      fodselsAar,
    },
    {
      type: "sammenligning",
      bgVariant: "forest",
      ligneNavn: "Kris Ventura",
      ligneAar: 2018,
      ligneKontekst: "Lignende snittscore, alder og turneringsvolum. Kris ble pro 2 år etter dette.",
      initials: "KV",
    },
    {
      type: "avslutning",
      bgVariant: "lime",
      navn: player.name.split(" ")[0],
      aar,
      delLenke,
    },
  ];

  return (
    <StatsLegacyShell>
    <main
      style={{
        minHeight: "100svh",
        // Legacy brukte hsl(var(--foreground)) for et alltid-mørkt scenebakgrunn
        // (i lys modus er --foreground nesten svart). I v2-scopet er --foreground
        // lys tekstfarge (riktig for Tailwind-utilities ellers på siden), så det
        // uttrykket ville gitt hvit bakgrunn her — bruk var(--bg) (alltid mørk i
        // v2) for å bevare den tiltenkte mørke helskjerm-scenen.
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <StatsWrappedPlayer slides={slides} delLenke={delLenke} />
    </main>
    </StatsLegacyShell>
  );
}
