/**
 * /turneringer/[slug] — v2. Datalogikk gjenbrukt 1:1 fra
 * (mlegacy)/turneringer/[slug]/page.tsx (KPI-beregning, tied-posisjoner,
 * JSON-LD). ISR 2 min, LiveRefresher når turneringen er live.
 */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { LiveRefresher } from "@/components/turneringer/live-refresher";
import {
  MarkedTurneringDetaljV2,
  type TurneringDetalj,
  type TurneringEntry,
} from "@/components/marketing/v2/MarkedTurneringDetaljV2";

export const revalidate = 120;

const RoundsSchema = z
  .object({
    thru: z.number().nullable().optional(),
    round: z.number().nullable().optional(),
  })
  .nullable();

function parseRounds(raw: unknown): { thru: number | null; round: number | null } {
  const parsed = RoundsSchema.safeParse(raw);
  if (!parsed.success || !parsed.data) return { thru: null, round: null };
  return { thru: parsed.data.thru ?? null, round: parsed.data.round ?? null };
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await prisma.tournament.findUnique({ where: { slug } });
  if (!t) return { title: "Turnering ikke funnet | AK Golf" };
  return {
    title: `${t.name}: turneringsoversikt | AK Golf`,
    description: `Følg ${t.name} live. Norske spillere, leaderboard, info og resultater. Oppdatert automatisk.`,
    alternates: { canonical: `https://akgolf.no/turneringer/${slug}` },
    openGraph: {
      title: `${t.name} | AK Golf`,
      description: `Live oversikt over norske spillere i ${t.name}`,
      url: `https://akgolf.no/turneringer/${slug}`,
      type: "website",
    },
  };
}

export default async function TurneringDetaljSideV2({ params }: Props) {
  const { slug } = await params;

  const t = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      publicEntries: {
        include: {
          player: { select: { id: true, name: true, slug: true, country: true, tier: true, photoUrl: true } },
        },
        orderBy: [{ position: "asc" }, { player: { name: "asc" } }],
      },
      leaderboardSnap: { select: { fetchedAt: true } },
      mergedInto: { select: { slug: true } },
    },
  });

  if (!t) notFound();
  if (t.mergedIntoId && t.mergedInto?.slug) {
    redirect(`/turneringer/${t.mergedInto.slug}`);
  }

  // Delte posisjoner (T-prefix brukes kun ved delt posisjon)
  const positionCounts: Record<number, number> = {};
  for (const e of t.publicEntries) {
    if (e.position !== null) positionCounts[e.position] = (positionCounts[e.position] ?? 0) + 1;
  }
  const tiedPositions = new Set(
    Object.entries(positionCounts)
      .filter(([, count]) => count > 1)
      .map(([pos]) => Number(pos)),
  );

  const entries: TurneringEntry[] = t.publicEntries.map((e) => {
    const rounds = parseRounds(e.rounds);
    return {
      id: e.id,
      position: e.position,
      scoreToPar: e.scoreToPar,
      status: e.status,
      thru: rounds.thru,
      round: rounds.round,
      tied: e.position !== null && tiedPositions.has(e.position),
      player: {
        id: e.player.id,
        name: e.player.name,
        slug: e.player.slug,
        country: e.player.country,
        tier: e.player.tier,
        photoUrl: e.player.photoUrl,
      },
    };
  });

  const turnering: TurneringDetalj = {
    name: t.name,
    tour: t.tour,
    status: t.status,
    startDate: t.startDate,
    endDate: t.endDate,
    location: t.location,
    officialUrl: t.officialUrl,
    winnerName: t.winnerName,
    leaderboardSnapAt: t.leaderboardSnap?.fetchedAt ?? null,
    entries,
  };

  const erLive = t.status === "IN_PROGRESS";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: tilJsonLd(t) }} />
      {erLive && <LiveRefresher />}
      <MarkedTurneringDetaljV2 t={turnering} />
    </>
  );
}

type LdTournament = {
  name: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  officialUrl: string | null;
};

function tilJsonLd(t: LdTournament): string {
  // Escape <,>,& slik at DB-sourcede felt (navn/sted) ikke kan bryte ut av
  // <script>-taggen (JSON-LD XSS). \u-escaping er gyldig JSON.
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: t.name,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate?.toISOString(),
    location: t.location ? { "@type": "Place", name: t.location } : undefined,
    url: t.officialUrl ?? undefined,
    sport: "Golf",
  })
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
