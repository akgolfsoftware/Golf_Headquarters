// Read-only barn-profil for forelder — v2-port 16. juli 2026.
// V2Shell (FORELDER_NAV) + ForelderBarnDetaljV2 erstatter den rå
// Tailwind-presentasjonen; auth (kun PARENT), assertBarnTilhorerForelder,
// alle Prisma-queries, aggregeringene og ?tab=-navigasjonen (server-rendret
// via lenker) er 100 % uendret. Fremdrift beregnes fortsatt KUN for
// HCP_TARGET (ekte reise HCP 54 → mål) — aldri oppdiktede prosenter.

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { assertBarnTilhorerForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { V2Shell, FORELDER_NAV } from "@/components/v2/shell";
import {
  ForelderBarnDetaljV2,
  type BarnDetaljTab,
  type ForelderBarnDetaljData,
} from "@/components/portal/v2/ForelderBarnDetaljV2";
import type { PyramidArea } from "@/generated/prisma/client";

// Apex→base: TURN øverst, FYS fundament (pyramide-kanon, som ForelderBarnV2).
const AKSE_APEX: PyramidArea[] = ["TURN", "SPILL", "SLAG", "TEK", "FYS"];

/**
 * Ekte fremdrift kun for HCP_TARGET (reise fra HCP 54 → målverdi, samme
 * beregning som portal/mal/page.tsx sin beregnFremdrift). Andre goal-typer
 * har ingen currentValue i modellen — DROPP baren for dem heller enn å
 * hardkode en falsk prosent.
 */
function hcpFremdriftPct(
  goal: { type: string; targetValue: number | null },
  hcp: number | null,
): number | null {
  if (goal.type !== "HCP_TARGET" || goal.targetValue == null || hcp == null)
    return null;
  const start = 54;
  const range = Math.max(0.1, start - goal.targetValue);
  const reise = Math.max(0, start - hcp);
  return Math.min(100, Math.round((reise / range) * 100));
}

export default async function BarnProfil({
  params,
  searchParams,
}: {
  params: Promise<{ childId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const { childId } = await params;
  const sp = await searchParams;
  const tab: BarnDetaljTab = ["oversikt", "uke", "mal", "okonomi"].includes(
    sp.tab ?? "",
  )
    ? (sp.tab as BarnDetaljTab)
    : "oversikt";

  const tilhorer = await assertBarnTilhorerForelder(user.id, childId);
  if (!tilhorer) notFound();

  const barn = await prisma.user.findUnique({
    where: { id: childId },
    include: {
      trainingPlans: {
        where: { isActive: true },
        include: {
          sessions: {
            orderBy: { scheduledAt: "desc" },
            take: 10,
            include: { log: { select: { rating: true, completedAt: true } } },
          },
        },
      },
      goals: {
        where: { status: "ACTIVE" },
        take: 10,
        orderBy: { createdAt: "desc" },
      },
      rounds: { orderBy: { playedAt: "desc" }, take: 10 },
      payments: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!barn || barn.role !== "PLAYER") notFound();

  const aktivPlan = barn.trainingPlans[0] ?? null;

  // Aggregert uke-data (4 siste uker)
  const fireUkerSiden = new Date();
  fireUkerSiden.setDate(fireUkerSiden.getDate() - 28);
  const ukeLogger = await prisma.trainingPlanSessionLog.findMany({
    where: {
      completedAt: { gte: fireUkerSiden, not: null },
      session: { plan: { userId: childId } },
    },
    select: { completedAt: true, startedAt: true, rating: true },
    orderBy: { completedAt: "desc" },
  });

  const totalMinutter = ukeLogger.reduce((s, l) => {
    if (!l.completedAt || !l.startedAt) return s;
    return (
      s +
      Math.max(
        0,
        Math.round((l.completedAt.getTime() - l.startedAt.getTime()) / 60000),
      )
    );
  }, 0);

  const snittRating = (() => {
    const ratings = ukeLogger
      .map((l) => l.rating)
      .filter((r): r is number => r != null);
    if (ratings.length === 0) return null;
    return (
      Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) /
      10
    );
  })();

  // Antall runder
  const antallRunder = barn.rounds.length;

  // Gjennomsnitt SG (kun runder med sgTotal — ellers null → «—»)
  const sgRunder = barn.rounds.filter((r) => r.sgTotal != null);
  const avgSg =
    sgRunder.length > 0
      ? sgRunder.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / sgRunder.length
      : null;

  // Pyramide-data (% av øktene i aktiv plan)
  const sessionsPerArea = new Map<string, number>();
  for (const s of aktivPlan?.sessions ?? []) {
    sessionsPerArea.set(
      s.pyramidArea,
      (sessionsPerArea.get(s.pyramidArea) ?? 0) + 1,
    );
  }
  const totSessions = Math.max(aktivPlan?.sessions.length ?? 0, 1);

  const pyramide = AKSE_APEX.map((akse) => ({
    akse,
    pct: Math.round(((sessionsPerArea.get(akse) ?? 0) / totSessions) * 100),
  }));

  const data: ForelderBarnDetaljData = {
    barn: {
      id: barn.id,
      navn: barn.name,
      avatarUrl: barn.avatarUrl,
      hcp: barn.hcp,
      homeClub: barn.homeClub,
    },
    tab,
    antallRunder,
    avgSg,
    pyramide,
    aktivPlan: aktivPlan
      ? {
          name: aktivPlan.name,
          sessions: aktivPlan.sessions.map((s) => ({
            id: s.id,
            title: s.title,
            scheduledAt: s.scheduledAt,
            pyramidArea: s.pyramidArea,
            status: s.status,
            rating: s.log?.rating ?? null,
          })),
        }
      : null,
    goals: barn.goals.map((g) => ({
      id: g.id,
      title: g.title,
      type: g.type,
      targetValue: g.targetValue,
      targetDate: g.targetDate,
      fremdriftPct: hcpFremdriftPct(g, barn.hcp),
    })),
    rounds: barn.rounds.map((r) => ({
      id: r.id,
      playedAt: r.playedAt,
      score: r.score,
      sgTotal: r.sgTotal,
    })),
    uke: {
      antall: ukeLogger.length,
      totalMinutter,
      snittRating,
      logg: ukeLogger.map((l) => ({
        dato: l.completedAt,
        minutter:
          l.completedAt && l.startedAt
            ? Math.max(
                0,
                Math.round(
                  (l.completedAt.getTime() - l.startedAt.getTime()) / 60000,
                ),
              )
            : 0,
        rating: l.rating,
      })),
    },
    payments: barn.payments.map((p) => ({
      id: p.id,
      tekst: p.description ?? p.type,
      amountOre: p.amountOre,
      status: p.status,
      createdAt: p.createdAt,
    })),
  };

  return (
    <V2Shell
      aktiv="barn"
      nav={FORELDER_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <ForelderBarnDetaljV2 data={data} />
    </V2Shell>
  );
}
