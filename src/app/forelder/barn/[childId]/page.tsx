// Read-only barn-profil for forelder — v2-port 16. juli 2026.
// V2Shell (FORELDER_NAV) + ForelderBarnDetaljV2 erstatter den rå
// Tailwind-presentasjonen; auth (kun PARENT), assertBarnTilhorerForelder,
// alle Prisma-queries, aggregeringene og ?tab=-navigasjonen (server-rendret
// via lenker) er 100 % uendret. Fremdrift beregnes fortsatt KUN for
// HCP_TARGET (ekte reise HCP 54 → mål) — aldri oppdiktede prosenter.

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { assertBarnTilhorerForelder, alderFraFodselsdato } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "@/lib/uke-helpers";
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
  const alder = alderFraFodselsdato(barn.dateOfBirth);
  const samtykkeGitt = barn.guardianConsentGivenAt != null;

  // Denne uka (Ma–Sø, Oslo-korrekt) — samme kilde som resten av siden
  // (TrainingPlanSession), kun avgrenset til inneværende uke for gridet.
  const naa = new Date();
  const ukeStart = startOfWeek(naa);
  const ukeSlutt = endOfWeek(naa);
  const [ukeSesjoner, nesteOkt, coachMelding, katalogTurneringer, manuelleTurneringer] =
    await Promise.all([
      prisma.trainingPlanSession.findMany({
        where: {
          plan: { userId: childId },
          scheduledAt: { gte: ukeStart, lt: ukeSlutt },
          status: { not: "CANCELLED" },
        },
        select: { scheduledAt: true },
        orderBy: { scheduledAt: "asc" },
      }),
      // Neste planlagte/aktive økt (kan ligge etter denne uka).
      prisma.trainingPlanSession.findFirst({
        where: {
          plan: { userId: childId },
          status: { in: ["PLANNED", "ACTIVE"] },
          scheduledAt: { gte: naa },
        },
        orderBy: { scheduledAt: "asc" },
        select: { title: true, scheduledAt: true, durationMin: true, location: true },
      }),
      // Siste coach-melding (samme kilde som hentForelderUkerapport/ForelderCoachV2).
      prisma.notification.findFirst({
        where: { userId: childId, type: "melding" },
        orderBy: { createdAt: "desc" },
        select: { title: true, body: true, createdAt: true },
      }),
      // Neste turnering barnet er meldt på, ikke trukket. To kilder (katalog vs.
      // manuell) hentes hver for seg og slås sammen, siden Prisma ikke kan
      // sortere pålitelig på tvers av en nullable relasjon + et eget felt.
      prisma.tournamentEntry.findFirst({
        where: {
          userId: childId,
          withdrawnAt: null,
          tournament: { startDate: { gte: naa } },
        },
        orderBy: { tournament: { startDate: "asc" } },
        select: { entryStatus: true, tournament: { select: { name: true, startDate: true } } },
      }),
      prisma.tournamentEntry.findFirst({
        where: { userId: childId, withdrawnAt: null, tournamentId: null, manualDate: { gte: naa } },
        orderBy: { manualDate: "asc" },
        select: { entryStatus: true, manualName: true, manualDate: true },
      }),
    ]);

  const turneringEntry = (() => {
    const a = katalogTurneringer
      ? { navn: katalogTurneringer.tournament!.name, dato: katalogTurneringer.tournament!.startDate, status: katalogTurneringer.entryStatus }
      : null;
    const b = manuelleTurneringer
      ? { navn: manuelleTurneringer.manualName ?? "Turnering", dato: manuelleTurneringer.manualDate!, status: manuelleTurneringer.entryStatus }
      : null;
    if (a && b) return a.dato <= b.dato ? a : b;
    return a ?? b;
  })();

  const ukeGrid = Array.from({ length: 7 }, (_, i) => {
    const dag = new Date(ukeStart);
    dag.setDate(dag.getDate() + i);
    const okt = ukeSesjoner.find(
      (s) =>
        s.scheduledAt.getFullYear() === dag.getFullYear() &&
        s.scheduledAt.getMonth() === dag.getMonth() &&
        s.scheduledAt.getDate() === dag.getDate(),
    );
    return { dato: dag, time: okt ? okt.scheduledAt : null };
  });

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
      alder,
    },
    samtykkeGitt,
    ukeGrid,
    nesteOkt,
    coachMelding: coachMelding
      ? { forfatter: coachMelding.title, tekst: coachMelding.body ?? "", sendtAt: coachMelding.createdAt }
      : null,
    nesteTurnering: turneringEntry,
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
      bredde="kolonne"
      aktiv="barn"
      nav={FORELDER_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <ForelderBarnDetaljV2 data={data} />
    </V2Shell>
  );
}
