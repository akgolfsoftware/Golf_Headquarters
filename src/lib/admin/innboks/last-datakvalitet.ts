/**
 * Innboks › Datakvalitet (AG-A05 og AG-RD-02) — det appen faktisk kan si om
 * datakvaliteten i dag, uten nye felt i basen:
 *
 *   - Runder siste 28 dager der Strokes Gained ikke kan beregnes. Status
 *     avledes med avledRundeRegistrering fra sgSource, hullscore og slag —
 *     de nye metadatafeltene på Round (source, dataQuality, status) leses
 *     bevisst ikke, fordi de ikke er bekreftet lagt inn i den hostede basen.
 *   - Antall manuelle turneringer som kan være dubletter (samme telling som
 *     Kø-fanen «Dubletter», der sammenslåingen skjer).
 *
 * Importlogg (TrackMan, GolfBox) finnes ikke i appen og vises som «—».
 */
import "server-only";

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { avledRundeRegistrering, RUNDE_DATAQUALITY_META } from "@/lib/runde-logg/kontrakt";
import { osloDagDato } from "./bygg-innboks";

export type ManglendeSgRunde = {
  id: string;
  spillerId: string;
  spiller: string;
  /** «Lør 26.09 · Borregaard GK · 78 slag» */
  runde: string;
  /** Hva runden har, i vanlig språk. */
  hvorfor: string;
  /** Hva som trengs for beregnet SG. */
  trengs: string;
  spiltIso: string;
};

export type DatakvalitetData = {
  runder: ManglendeSgRunde[];
  /** Runder i perioden som ble sjekket. */
  sjekket: number;
  /** Manuelle turneringer som ikke er slått sammen. null = kunne ikke telles. */
  muligeDubletter: number | null;
};

const DAG = 86_400_000;

function rundeLinje(spilt: Date, bane: string, score: number): string {
  return `${osloDagDato(spilt)} · ${bane} · ${score} slag`;
}

function trengsTekst(mangler: string[]): string {
  if (mangler.length === 0) return "Slag-for-slag med avstand på hvert hull.";
  if (mangler.includes("scorekort")) return "Scorekort og slag-for-slag med avstand.";
  if (mangler.includes("slag-for-slag")) return "Slag-for-slag med avstand på hvert hull.";
  const vis = mangler.slice(0, 3).join(", ");
  return `Mangler ${vis}${mangler.length > 3 ? ` og ${mangler.length - 3} til` : ""}.`;
}

export async function lastDatakvalitet(user: { id: string; role: string }): Promise<DatakvalitetData> {
  const fra = new Date(Date.now() - 28 * DAG);
  const [rader, muligeDubletter] = await Promise.all([
    prisma.round.findMany({
      where: { playedAt: { gte: fra }, user: coachScopedPlayerWhere(user) },
      orderBy: { playedAt: "desc" },
      take: 60,
      select: {
        id: true,
        userId: true,
        playedAt: true,
        score: true,
        sgSource: true,
        user: { select: { name: true } },
        course: { select: { name: true } },
        holeScores: { select: { holeNumber: true, strokes: true, putts: true, fairway: true, gir: true } },
        shots: { select: { holeNumber: true, distanceToPin: true, isPenalty: true } },
      },
    }),
    prisma.tournament
      .count({ where: { sourceOrigin: "MANUAL", mergedIntoId: null } })
      .catch(() => null),
  ]);

  const runder: ManglendeSgRunde[] = [];
  for (const r of rader) {
    const s = avledRundeRegistrering({ sgSource: r.sgSource, holeScores: r.holeScores, shots: r.shots });
    if (s.kanBeregneSg || s.sgKilde === "manual") continue;
    const meta = RUNDE_DATAQUALITY_META[s.dataQuality];
    runder.push({
      id: r.id,
      spillerId: r.userId,
      spiller: r.user.name ?? "Spiller",
      runde: rundeLinje(r.playedAt, r.course.name, r.score),
      hvorfor: `${meta.label}. ${meta.forklaring}${s.sgKilde === "estimert" ? " SG som vises er et estimat." : ""}`,
      trengs: trengsTekst(s.manglerForBeregnetSg),
      spiltIso: r.playedAt.toISOString(),
    });
  }

  return { runder, sjekket: rader.length, muligeDubletter };
}
