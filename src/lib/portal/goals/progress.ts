// Delt fremdriftsberegning for PlayerHQ-målsetninger (Goal-modellen).
//
// Én kilde til sannhet — brukes av mål-hub, mål-detalj, AI mål-bygger og
// spillerprofil-visningene (portal + admin). Dikter ALDRI opp et prosenttall:
// hvis ingenting relevant er logget ennå, returneres hasData=false og
// visningslaget skal vise "ingen data ennå", ikke en fabrikkert 0 %.

import { prisma } from "@/lib/prisma";
import type { Goal } from "@/generated/prisma/client";
import { PYR_LABEL } from "@/lib/pyramide";
import { lesSgMaal, SG_OMRADE_NAVN } from "@/lib/domain/maal-fremdrift";
import { hentSgSnittPerOmrade } from "@/lib/portal/sg-omrade-snitt";
import { unikFullforteFrekvensOkter } from "./frekvens-okter";

export type GoalProgressStatus = "on-track" | "behind" | "achieved" | "no-data";

export type GoalProgress = {
  /** 0–100. Kun meningsfullt når hasData=true. */
  pct: number;
  status: GoalProgressStatus;
  /** false = ingenting relevant logget ennå — vis "ingen data ennå", ikke 0 %. */
  hasData: boolean;
  /** Rå nå-verdi til visning (HCP, antall runder/økter, poengsum). Null uten data. */
  value: number | null;
  /** Kort norsk forklaring til fremdriftskortet. */
  detail: string;
};

export type GoalForProgress = Pick<
  Goal,
  "userId" | "type" | "targetValue" | "linkedPyramidArea" | "linkedTestId" | "payload"
>;

export type GoalProgressContext = {
  hcp: number | null;
  /** Kun for tester — injiseres for deterministiske enhetstester. */
  now?: Date;
};

const ROLLING_WINDOW_DAYS = 7;
const ROUNDS_WINDOW_DAYS = 30;

/**
 * Spillerens HCP da målet ble satt, lest fra `Goal.payload.hcpStart`.
 *
 * Fram til 21.09.2026 antok fremdriften at alle startet på HCP 54 (den gamle
 * maks-grensen ved onboarding). For en spiller på vei fra 20 til 10 ga det
 * «89 % i mål» ved HCP 15, mens hen reelt var halvveis. Antakelsen ble dermed
 * lest som spillerens faktiske utgangspunkt, som den aldri var.
 *
 * Uten en lagret startverdi finnes ingen ærlig nevner, og da vises ingen
 * prosent — samme regel som SG-mål allerede følger (`sgStart`).
 */
function lesHcpStart(payload: unknown): number | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const v = (payload as Record<string, unknown>).hcpStart;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function statusFromPct(pct: number): GoalProgressStatus {
  if (pct >= 100) return "achieved";
  if (pct >= 50) return "on-track";
  return "behind";
}

function daysAgo(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function ingenData(detail: string): GoalProgress {
  return { pct: 0, status: "no-data", hasData: false, value: null, detail };
}

/**
 * Et mål uten målverdi har ingen nevner, og da finnes ingen ærlig prosent.
 *
 * Fram til 21.09.2026 ble nevneren antatt: runder og økter falt tilbake på 1
 * (to runder ble «2 av 1 · Mål nådd»), og testmål falt tilbake på spillerens
 * EGEN siste score, slik at ethvert resultat ble rapportert som oppnådd mot
 * et mål spilleren aldri satte. Målverdi er valgfritt når målet opprettes, så
 * dette traff helt vanlige mål.
 *
 * Det målte tallet vises fortsatt — det er en faktisk observasjon.
 */
function utenMaalverdi(value: number, detail: string): GoalProgress {
  return { ...ingenData(detail), value };
}

function progressHcp(goal: GoalForProgress, hcp: number | null): GoalProgress {
  if (hcp == null || goal.targetValue == null) {
    return ingenData("Ingen HCP registrert ennå");
  }
  const delta = +(hcp - goal.targetValue).toFixed(1);

  // Målet er nådd — det krever ingen nevner å slå fast.
  if (delta <= 0) {
    return {
      pct: 100,
      status: "achieved",
      hasData: true,
      value: hcp,
      detail: `Mål nådd! HCP ${hcp.toFixed(1)}`,
    };
  }

  const start = lesHcpStart(goal.payload);
  // Startverdien må ligge på riktig side av målet, ellers er reisen ikke en reise.
  if (start == null || start <= goal.targetValue) {
    return {
      ...ingenData(
        `${hcp.toFixed(1)} nå · ${delta.toFixed(1)} til målet · utgangspunkt ikke registrert`,
      ),
      value: hcp,
    };
  }

  const pct = clampPct(((start - hcp) / (start - goal.targetValue)) * 100);
  return {
    pct,
    status: statusFromPct(pct),
    hasData: true,
    value: hcp,
    detail: `${hcp.toFixed(1)} nå · trenger ${delta.toFixed(1)} til · fra ${start.toFixed(1)}`,
  };
}

async function progressRoundsPerMonth(goal: GoalForProgress, now: Date): Promise<GoalProgress> {
  const target = goal.targetValue;
  const windowStart = daysAgo(now, ROUNDS_WINDOW_DAYS);
  const count = await prisma.round.count({
    where: { userId: goal.userId, playedAt: { gte: windowStart } },
  });
  if (count === 0) {
    const noenGang = await prisma.round.findFirst({
      where: { userId: goal.userId },
      select: { id: true },
    });
    if (!noenGang) return ingenData("Ingen runder registrert ennå");
  }
  if (target == null || target <= 0) {
    return utenMaalverdi(
      count,
      `${count} runder siste ${ROUNDS_WINDOW_DAYS} dager · ingen målverdi satt`,
    );
  }
  const pct = clampPct((count / target) * 100);
  return {
    pct,
    status: statusFromPct(pct),
    hasData: true,
    value: count,
    detail: `${count} av ${target} runder siste ${ROUNDS_WINDOW_DAYS} dager`,
  };
}

async function progressSessionFrequency(goal: GoalForProgress, now: Date): Promise<GoalProgress> {
  if (!goal.linkedPyramidArea) return ingenData("Ingen treningskategori valgt");

  const target = goal.targetValue;
  const windowStart = daysAgo(now, ROLLING_WINDOW_DAYS);
  const omrade = goal.linkedPyramidArea;
  const sessionFilter = {
    pyramidArea: omrade,
    plan: { userId: goal.userId },
  };

  const [v2, wb, planLogger] = await Promise.all([
    prisma.trainingSessionV2.findMany({
      where: {
        studentId: goal.userId,
        status: "COMPLETED",
        startTime: { gte: windowStart },
        drills: { some: { pyramide: omrade } },
      },
      select: { id: true, generertFraId: true },
    }),
    prisma.workbenchSession.findMany({
      where: {
        playerId: goal.userId,
        status: "COMPLETED",
        date: { gte: windowStart },
        pyramid: omrade,
      },
      select: { id: true },
    }),
    prisma.trainingPlanSessionLog.findMany({
      where: { completedAt: { gte: windowStart }, session: sessionFilter },
      select: { sessionId: true },
    }),
  ]);

  const count = unikFullforteFrekvensOkter([
    ...v2.map((s) => ({
      id: s.id,
      modell: "v2" as const,
      fullfort: true,
      speilAvPlanId: s.generertFraId,
    })),
    ...wb.map((s) => ({ id: s.id, modell: "wb" as const, fullfort: true })),
    ...planLogger.map((s) => ({ id: s.sessionId, modell: "plan" as const, fullfort: true })),
  ]);

  if (count === 0) {
    const noenGang = await prisma.trainingPlanSessionLog.findFirst({
      where: { completedAt: { not: null }, session: sessionFilter },
      select: { id: true },
    });
    if (!noenGang) {
      return ingenData(`Ingen ${PYR_LABEL[omrade].toLowerCase()}-økter logget ennå`);
    }
  }

  if (target == null || target <= 0) {
    return utenMaalverdi(
      count,
      `${count} ${PYR_LABEL[omrade].toLowerCase()}-økter siste ${ROLLING_WINDOW_DAYS} dager · ingen målverdi satt`,
    );
  }
  const pct = clampPct((count / target) * 100);
  return {
    pct,
    status: statusFromPct(pct),
    hasData: true,
    value: count,
    detail: `${count} av ${target} økter siste ${ROLLING_WINDOW_DAYS} dager`,
  };
}

/** SG med fortegn og norsk desimalkomma — «+0,35» / «−0,4». */
function fmtSg(v: number): string {
  return `${v < 0 ? "−" : "+"}${Math.abs(v).toFixed(2).replace(".", ",")}`;
}

async function progressSgArea(goal: GoalForProgress): Promise<GoalProgress> {
  const sgMaal = lesSgMaal(goal.payload);
  if (!sgMaal) return ingenData("Velg SG-område for å måle fremdrift");

  const navn = SG_OMRADE_NAVN[sgMaal.omrade];
  if (sgMaal.start == null) {
    return ingenData(`${navn} · trenger flere registrerte runder for å sette utgangspunkt`);
  }

  const snitt = await hentSgSnittPerOmrade(goal.userId);
  const naaVerdi = snitt[sgMaal.omrade];
  if (naaVerdi == null) {
    return ingenData(`${navn} · trenger flere registrerte runder`);
  }

  const target = goal.targetValue;
  if (target == null || target === sgMaal.start) {
    return ingenData(`${navn}: ${fmtSg(naaVerdi)} nå`);
  }

  // SG har ikke noe naturlig nullpunkt (et mål kan gå fra −1,5 til −0,5) —
  // reisen måles derfor fra baseline (SG da målet/området ble satt) til målverdi.
  const pct = clampPct(((naaVerdi - sgMaal.start) / (target - sgMaal.start)) * 100);
  return {
    pct,
    status: statusFromPct(pct),
    hasData: true,
    value: naaVerdi,
    detail: `${navn}: ${fmtSg(naaVerdi)} nå · mål ${fmtSg(target)}`,
  };
}

async function progressTestScore(goal: GoalForProgress): Promise<GoalProgress> {
  if (!goal.linkedTestId) return ingenData("Ingen test valgt");

  // Goal stores a bare numeric target; its editor still labels it as points.
  // TN v3 uses signed/lower-is-better scores and variable counts. Until the
  // goal carries that contract, never award progress with the legacy formula.
  if (goal.linkedTestId.startsWith("tn-v3-")) {
    return ingenData("Følg resultatet i testhistorikken. Automatisk målfremdrift for denne testen er ikke avklart.");
  }

  const latest = await prisma.testResult.findFirst({
    where: { userId: goal.userId, testId: goal.linkedTestId },
    orderBy: { takenAt: "desc" },
    select: { score: true },
  });
  if (!latest) return ingenData("Ingen testresultat registrert ennå");

  const target = goal.targetValue;
  if (target == null || target <= 0) {
    return utenMaalverdi(latest.score, `${latest.score} poeng · ingen målverdi satt`);
  }
  const pct = clampPct((latest.score / target) * 100);
  const status: GoalProgressStatus = latest.score >= target ? "achieved" : statusFromPct(pct);
  return {
    pct,
    status,
    hasData: true,
    value: latest.score,
    detail: `${latest.score} poeng · mål ${target}`,
  };
}

/**
 * Beregn fremdrift for ett mål. FREE_TEXT har ingen automatisk beregning
 * bygget (spilleren følger selv opp) — returnerer ærlig "ingen data", aldri
 * en oppdiktet prosent.
 */
export async function beregnGoalProgress(
  goal: GoalForProgress,
  ctx: GoalProgressContext,
): Promise<GoalProgress> {
  const now = ctx.now ?? new Date();
  switch (goal.type) {
    case "HCP_TARGET":
      return progressHcp(goal, ctx.hcp);
    case "ROUNDS_PER_MONTH":
      return progressRoundsPerMonth(goal, now);
    case "SESSION_FREQUENCY":
      return progressSessionFrequency(goal, now);
    case "TEST_SCORE":
      return progressTestScore(goal);
    case "SG_AREA":
      return progressSgArea(goal);
    default:
      return ingenData("Følges opp manuelt");
  }
}
