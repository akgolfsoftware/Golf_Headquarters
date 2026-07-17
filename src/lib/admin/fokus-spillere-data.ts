/**
 * Data-loader for «Fokus-spillere»-blokken i AgencyOS-cockpiten (D3, godkjent
 * 2026-07-17). To soner: «Pinnet av deg» (CoachFokusPin, maks 3) og «Foreslått
 * nå» (AI-forslag utledet av EKSISTERENDE signaler — plan-etterlevelse,
 * Strokes Gained og inaktivitet, se fokus-forslag.ts).
 *
 * Følger samme mønster som src/lib/admin/stallen-data.ts: alle tall er utledet
 * fra ekte data — ingen fabrikerte verdier.
 */

import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { erOktGjennomfort } from "@/lib/workbench/compliance";
import {
  utledForslag,
  fmtSg,
  MAKS_PINNEDE,
  type FokusForslag,
  type FokusRetning,
  type ForslagSignalInput,
} from "@/lib/admin/fokus-forslag";

export type FokusPinnet = {
  playerId: string;
  navn: string;
  /** Mono-metalinje, f.eks. "OSLO GK · HCP 4,2". */
  meta: string;
  /** SG-snitt siste 30 d m/ fortegn ("+0,8" / "−1,2"), null = ingen runder. */
  sg: string | null;
  sgRetning: FokusRetning;
};

export type FokusSpillereData = {
  pinnede: FokusPinnet[];
  forslag: FokusForslag[];
};

function fmtHcp(v: number | null): string {
  if (v == null) return "—";
  if (v <= 0) return `+${Math.abs(v).toFixed(1).replace(".", ",")}`;
  return v.toFixed(1).replace(".", ",");
}

export async function loadFokusSpillere(coach: {
  id: string;
  role: string;
}): Promise<FokusSpillereData> {
  const now = new Date();
  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);
  const fjorten = new Date(now);
  fjorten.setDate(fjorten.getDate() - 14);

  const [pins, spillere] = await Promise.all([
    prisma.coachFokusPin.findMany({
      where: { coachId: coach.id },
      orderBy: { createdAt: "asc" },
      select: { playerId: true },
    }),
    prisma.user.findMany({
      where: coachScopedPlayerWhere(coach),
      select: {
        id: true,
        name: true,
        homeClub: true,
        hcp: true,
        lastLoginAt: true,
        rounds: {
          where: { playedAt: { gte: tretti }, sgTotal: { not: null } },
          select: { sgTotal: true },
        },
        trainingPlans: {
          select: {
            sessions: {
              where: { scheduledAt: { gte: fjorten, lte: now } },
              select: { status: true },
            },
          },
        },
      },
      take: 400,
    }),
  ]);

  const perId = new Map(spillere.map((p) => [p.id, p]));

  const sgSnitt = (p: (typeof spillere)[number]): number | null => {
    if (p.rounds.length === 0) return null;
    const sum = p.rounds.reduce((acc, r) => acc + (r.sgTotal as number), 0);
    return sum / p.rounds.length;
  };

  // Sone 1: pinnede (kun spillere som fortsatt er i coachens scope).
  const pinnede: FokusPinnet[] = [];
  for (const pin of pins) {
    const p = perId.get(pin.playerId);
    if (!p) continue;
    const sg = sgSnitt(p);
    const metaDeler = [
      p.homeClub ? p.homeClub.toUpperCase() : null,
      `HCP ${fmtHcp(p.hcp)}`,
    ].filter(Boolean);
    pinnede.push({
      playerId: p.id,
      navn: p.name || "Spiller",
      meta: metaDeler.join(" · "),
      sg: sg == null ? null : fmtSg(sg),
      sgRetning: sg != null && sg < 0 ? "down" : "up",
    });
    if (pinnede.length >= MAKS_PINNEDE) break;
  }

  // Sone 2: forslag fra eksisterende signaler.
  const signaler: ForslagSignalInput[] = spillere.map((p) => {
    const okter = p.trainingPlans.flatMap((tp) => tp.sessions);
    return {
      playerId: p.id,
      navn: p.name || "Spiller",
      planlagt14d: okter.length,
      fullfort14d: okter.filter((s) => erOktGjennomfort(s.status)).length,
      sgSnitt30d: sgSnitt(p),
      dagerSidenInnlogging: p.lastLoginAt
        ? Math.floor((now.getTime() - p.lastLoginAt.getTime()) / 86_400_000)
        : null,
    };
  });
  const forslag = utledForslag(
    signaler,
    new Set(pinnede.map((p) => p.playerId)),
  );

  return { pinnede, forslag };
}
