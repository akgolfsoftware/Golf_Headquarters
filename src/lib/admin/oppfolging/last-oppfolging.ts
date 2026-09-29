/**
 * Oppfølgingskøen — datalasting (flyttet ORDRETT fra src/app/admin/queue/page.tsx
 * da køen ble slått inn i Innboks › Oppfølging, AG-04-OPP, 29.09.2026).
 *
 * All klassifiserings-logikk er uendret (aktiv plan, inaktivitet, SG-fall),
 * og coachens manuelle overstyringer leses fra FollowUpCase — én rad per
 * spiller, ingen tidsbegrensning (beslutning 23.09.2026, AG-03b).
 * Handlingen som flytter en sak er uendret: settOppfolgingsstatus i
 * src/app/admin/queue/actions.ts.
 */
import "server-only";

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import type { QueueStatus } from "@/app/admin/queue/status";

export type OppfolgingKort = {
  id: string;
  navn: string;
  epost: string;
  signalTekst: string;
  stats: { k: string; v: string }[];
  tags: string[];
  siden: string;
  /** Dager siden siste innlogging. null = aldri innlogget. */
  dagerSidenInnlogging: number | null;
  status: QueueStatus;
};

export type OppfolgingData = {
  kort: OppfolgingKort[];
  /** Antall coachede spillere som ble vurdert («Av N spillere totalt»). */
  spillereTotalt: number;
};

function dagerSiden(d: Date | null): number | null {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export async function lastOppfolging(coach: { id: string; role: string }): Promise<OppfolgingData> {
  const players = await prisma.user.findMany({
    // I0: kun coachede spillere — selvbetjente (PLATFORM_ONLY) er usynlige i AgencyOS.
    where: coachScopedPlayerWhere(coach),
    include: {
      trainingPlans: { where: { isActive: true }, select: { id: true } },
      signals: { where: { kind: "SG_TOTAL" }, orderBy: { computedAt: "desc" }, take: 1 },
    },
  });

  const kort: OppfolgingKort[] = [];

  for (const p of players) {
    const grunner: string[] = [];
    const tags: string[] = [];
    const stats: OppfolgingKort["stats"] = [];

    if (p.trainingPlans.length === 0) {
      grunner.push("Ingen aktiv plan");
      tags.push("uten plan");
    }
    const dager = dagerSiden(p.lastLoginAt);
    if (!p.lastLoginAt || (dager !== null && dager > 14)) {
      grunner.push(`Ikke aktiv ${dager ?? "∞"}d`);
      tags.push("stille");
    }
    const sg = p.signals[0]?.value;
    if (sg != null) {
      stats.push({ k: "SG · siste", v: `${sg >= 0 ? "+" : ""}${sg.toFixed(1).replace(".", ",")}` });
    }
    if (sg != null && sg < -0.5) tags.push("score-fall");
    if (dager != null) stats.push({ k: "Siste innlogg", v: `${dager}d` });

    if (grunner.length === 0) continue;

    kort.push({
      id: p.id,
      navn: p.name,
      epost: p.email,
      signalTekst: grunner.join(" · "),
      stats,
      tags,
      siden: p.lastLoginAt ? `sist innlogget ${dagerSiden(p.lastLoginAt) ?? 0} dager siden` : "aldri innlogget",
      dagerSidenInnlogging: dager,
      status: grunner.length >= 3 ? "risk" : grunner.length === 2 ? "watch" : "check",
    });
  }

  // I5: coachens manuelle overstyringer (FollowUpCase — én rad per spiller,
  // ingen tidsbegrensning; beslutning 23.09.2026, AG-03b).
  const overstyringer = await prisma.followUpCase.findMany({
    where: { userId: { in: players.map((p) => p.id) } },
    select: { userId: true, status: true },
  });
  const overstyrt = new Map<string, QueueStatus>();
  for (const o of overstyringer) {
    if (o.status === "risk" || o.status === "watch" || o.status === "check" || o.status === "ok") {
      overstyrt.set(o.userId, o.status);
    }
  }

  // Flytt overstyrte kort dit coachen la dem.
  for (const k of kort) {
    const maal = overstyrt.get(k.id);
    if (!maal) continue;
    k.tags = [...k.tags, maal === "ok" ? "kvittert" : "manuelt plassert"];
    k.status = maal;
  }

  return { kort, spillereTotalt: players.length };
}
