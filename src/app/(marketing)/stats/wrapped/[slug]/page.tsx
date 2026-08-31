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
import { kanVisesOffentlig } from "@/lib/stats/offentlig-spiller";

export const revalidate = 86400;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayer(slug);
  if (!player || !kanVisesOffentlig(player)) return { title: "Spiller ikke funnet" };
  const aar = new Date().getFullYear();
  return {
    title: `${player.name}s golfsesong ${aar} | AK Golf Stats`,
    description: `Se ${player.name}s sesong ${aar} i tall: runder, snittscore, beste runde og mer.`,
    openGraph: {
      title: `${player.name}s golfsesong ${aar}`,
      description: `Runder, snittscore og beste resultater for ${player.name}.`,
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
  if (!player || !kanVisesOffentlig(player)) notFound();

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

  // Estimert HCP (forenklet WHS-formel) — merkes eksplisitt som estimat i sliden (TruthLayer).
  const estimertHcp = snittScore > 0 ? Math.max(0, ((snittScore - 70) * 0.93)).toFixed(1) : "N/A";

  // Build slides — kun slides med ekte datagrunnlag tas med (TruthLayer, 0.12):
  // ranking-, sammenlignings- og streak-slidene viste hardkodede tall og er fjernet;
  // kohort-persentil på åpen flate står dessuten på «Ikke bygg»-lista (STEG 16).
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
      // Ekte fjorårstall fra DB; null når fjorårsdata mangler → setningen utelates.
      fjoraarsAntall: harFjoraar ? fjoraarsAntall : null,
    },
  ];

  if (antallRunder > 0) {
    slides.push({
      type: "snitt",
      bgVariant: "lime",
      snittScore: parseFloat(snittScore.toFixed(1)),
      estimertHcp,
    });
  }

  if (besteEntry) {
    slides.push({
      type: "beste",
      bgVariant: "forest",
      score: besteScore,
      // Til-par leses fra scoreToPar (banenormalisert), aldri utledet fra par 72
      // (datakartleggingen 30.08). null → linjen utelates.
      toPar: besteEntry.scoreToPar,
      turnering: besteEntry.tournament.name,
      dato: new Date(besteEntry.tournament.startDate)
        .toLocaleDateString("nb-NO", { day: "numeric", month: "long" })
        .toUpperCase(),
    });
  }

  if (unikeKlubber.length > 0 && mestSpilte) {
    slides.push({
      type: "klubber",
      bgVariant: "offwhite",
      antallKlubber: unikeKlubber.length,
      klubbListe: unikeKlubber.slice(0, 8),
      mestSpilteKlubb: mestSpilte[0],
      mestSpilteAntall: mestSpilte[1],
    });
  }

  if (harFjoraar) {
    slides.push({
      type: "utvikling",
      bgVariant: "forest",
      forbedring,
      data: [
        { aar: aar - 1, snitt: parseFloat(fjoraarsSnitt.toFixed(1)) },
        { aar, snitt: parseFloat(snittScore.toFixed(1)) },
      ],
    });
  }

  slides.push({
    type: "avslutning",
    bgVariant: "lime",
    navn: player.name.split(" ")[0],
    aar,
    delLenke,
  });

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
