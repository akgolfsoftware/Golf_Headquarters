/**
 * /stats — AK Golf Stats hub-landingsside (v2, retning C)
 * Swap av (mlegacy)/stats/page.tsx → v2-utseende. Data-lag (hentLiveSnapshot,
 * formaterDatoKort) er 1:1 videreført fra legacy-siden; kun presentasjonen
 * er byttet til StatsRamme/MarkedStatsHubV2. Banetallet hentes fra samme
 * lib-loader som (mlegacy)/stats/baner bruker.
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { hentBanedatabaseStats } from "@/lib/stats/bane-queries";
import { MarkedStatsHubV2 } from "@/components/marketing/v2/MarkedStatsHubV2";

export const revalidate = 3600; // 1 time

export const metadata: Metadata = {
  title: "AK Golf Stats: gratis statistikk for norsk golf",
  description:
    "Følg norske golfspillere live, utforsk PGA Tour-statistikk og sammenlign din egen Strokes Gained med proffene. Gratis verktøy fra AK Golf, bygget for spillere, foreldre og trenere.",
  alternates: { canonical: "https://akgolf.no/stats" },
  openGraph: {
    title: "AK Golf Stats: gratis statistikk for norsk golf",
    description:
      "Norske spillere i aksjon, PGA Tour-tall, og din egen SG sammenlignet med Rory. Gratis fra AK Golf.",
    url: "https://akgolf.no/stats",
    type: "website",
  },
};

// ---------------------------------------------------------------------------
// Data layer (1:1 videreført fra (mlegacy)/stats/page.tsx)
// ---------------------------------------------------------------------------

async function hentLiveSnapshot() {
  const now = new Date();
  const ukeStart = new Date(now);
  const dayOfWeek = now.getDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  ukeStart.setDate(ukeStart.getDate() - daysSinceMonday);
  ukeStart.setHours(0, 0, 0, 0);

  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const [norskeIAksjon, kommendeTurneringer, sisteDataGolfSync] =
    await Promise.all([
      prisma.publicPlayerEntry.count({
        where: {
          player: { country: "NO" },
          tournament: {
            startDate: { lte: ukeSlutt },
            endDate: { gte: now },
          },
        },
      }),
      prisma.tournament.count({
        where: {
          startDate: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
          mergedIntoId: null,
        },
      }),
      prisma.tournament.findFirst({
        where: { sourceOrigin: "DATAGOLF", lastSyncAt: { not: null } },
        orderBy: { lastSyncAt: "desc" },
        select: { lastSyncAt: true },
      }),
    ]);

  return {
    norskeIAksjon,
    kommendeTurneringer,
    sisteSyncDato: sisteDataGolfSync?.lastSyncAt ?? null,
  };
}

function formaterDatoKort(d: Date | null): string {
  if (!d) return "—";
  const diff = Date.now() - d.getTime();
  const timer = Math.floor(diff / (60 * 60 * 1000));
  if (timer < 1) return "nå nettopp";
  if (timer < 24) return `for ${timer} time${timer === 1 ? "" : "r"} siden`;
  const dager = Math.floor(timer / 24);
  return `for ${dager} dag${dager === 1 ? "" : "er"} siden`;
}

// ---------------------------------------------------------------------------

export default async function StatsLandingPage() {
  const [snapshot, baneStats] = await Promise.all([
    hentLiveSnapshot(),
    hentBanedatabaseStats().catch(() => ({
      totalBaner: 0,
      totalTurneringer: 0,
      totalSpillere: 0,
    })),
  ]);
  const sisteSync = formaterDatoKort(snapshot.sisteSyncDato);

  return (
    <MarkedStatsHubV2
      norskeIAksjon={snapshot.norskeIAksjon}
      kommendeTurneringer={snapshot.kommendeTurneringer}
      sisteSync={sisteSync}
      totalBaner={baneStats.totalBaner}
    />
  );
}
