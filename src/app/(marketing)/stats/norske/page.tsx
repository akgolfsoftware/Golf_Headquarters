/**
 * /stats/norske — Norske i aksjon (v2, retning C)
 * Swap av (mlegacy)/stats/norske/page.tsx → v2-utseende. Data-lag
 * (hentNorskeEntries, parseRounds) er 1:1 videreført fra legacy-siden; kun
 * presentasjonen er byttet til StatsRamme/StatsDetalj + StatsNorskeV2.
 * Datoer serialiseres til ISO-strenger over server/klient-grensen.
 */
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatsNorskeV2, type NorskeTurnGruppe } from "@/components/marketing/v2/StatsNorskeV2";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Norske i aksjon | AK Golf Stats",
  description: "Alle norske golfspillere i aksjon denne uken: live-posisjoner, resultater og turneringsoversikt.",
  alternates: { canonical: "https://akgolf.no/stats/norske" },
};

function parseRounds(rounds: unknown): number[] {
  if (!rounds) return [];
  if (Array.isArray(rounds)) return rounds.filter((r): r is number => typeof r === "number");
  if (typeof rounds === "string") {
    try {
      const parsed: unknown = JSON.parse(rounds);
      if (Array.isArray(parsed)) return parsed.filter((r): r is number => typeof r === "number");
    } catch {
      // ugyldig JSON — returner tom array
    }
  }
  return [];
}

async function hentNorskeEntries(): Promise<NorskeTurnGruppe[]> {
  const iDag = new Date();
  iDag.setHours(0, 0, 0, 0);
  const om7dager = new Date(iDag.getTime() + 7 * 24 * 60 * 60 * 1000);

  try {
    const entries = await prisma.publicPlayerEntry.findMany({
      where: {
        player: { country: "NO" },
        tournament: {
          OR: [{ status: "IN_PROGRESS" }, { startDate: { gte: iDag, lte: om7dager }, status: "UPCOMING" }],
        },
      },
      include: {
        player: { select: { id: true, name: true, slug: true, tier: true } },
        tournament: {
          select: { id: true, name: true, slug: true, tour: true, status: true, startDate: true, endDate: true, location: true, officialUrl: true },
        },
      },
      orderBy: [{ position: "asc" }],
      take: 200,
    });

    const gruppeMap = new Map<string, NorskeTurnGruppe>();

    for (const entry of entries) {
      const tId = entry.tournament.id;
      if (!gruppeMap.has(tId)) {
        gruppeMap.set(tId, {
          turnering: {
            id: entry.tournament.id,
            name: entry.tournament.name,
            slug: entry.tournament.slug,
            tour: entry.tournament.tour,
            status: entry.tournament.status,
            startDate: entry.tournament.startDate.toISOString(),
            endDate: entry.tournament.endDate ? entry.tournament.endDate.toISOString() : null,
            location: entry.tournament.location,
            officialUrl: entry.tournament.officialUrl,
          },
          spillere: [],
        });
      }
      gruppeMap.get(tId)!.spillere.push({
        id: entry.id,
        name: entry.player.name,
        slug: entry.player.slug,
        position: entry.position,
        scoreToPar: entry.scoreToPar,
        status: entry.status,
        rounds: parseRounds(entry.rounds),
      });
    }

    const grupper = Array.from(gruppeMap.values());

    grupper.sort((a, b) => {
      const aLive = a.turnering.status === "IN_PROGRESS";
      const bLive = b.turnering.status === "IN_PROGRESS";
      if (aLive && !bLive) return -1;
      if (!aLive && bLive) return 1;
      return new Date(a.turnering.startDate).getTime() - new Date(b.turnering.startDate).getTime();
    });

    return grupper;
  } catch {
    return [];
  }
}

export default async function NorskePage() {
  const grupper = await hentNorskeEntries();
  return <StatsNorskeV2 grupper={grupper} />;
}
