import "server-only";

import { prisma } from "@/lib/prisma";
import type { LPhase, PeriodeType } from "@/generated/prisma/client";
import {
  INVARIANTER,
  type Alvorlighet,
  type InvariantKontekst,
  type KanonOkt,
  type KanonPeriode,
  type Scope,
} from "./invarianter";

/**
 * Valideringslag — leser plandata fra DB (TrainingPlanSession + SeasonPlan/PeriodBlock
 * + spillerens alder), kjører CANON-invariantene og aggregerer en plan-kvalitetsscore.
 *
 * Score 0–100: harde brudd vekter tyngst.
 */

export type BruddRad = {
  invariantId: string;
  navn: string;
  alvorlighet: Alvorlighet;
  scope: Scope;
  melding: string;
  malt?: number;
  grense?: number;
  /** Øktene som bryter — UI kan hoppe hit. */
  sessionIds: string[];
};

export type PlanValidering = {
  /** Plan-kvalitet 0–100 (harde brudd −15, myke −5, klampet). */
  score: number;
  /** Ingen harde brudd. */
  ok: boolean;
  hardeBrudd: number;
  mykeBrudd: number;
  brudd: BruddRad[];
};

const HARD_VEKT = 15;
const MYK_VEKT = 5;

/** PeriodBlock.lPhase (GRUNN|SPESIAL|TURNERING) → PeriodeType for constraint-oppslag. */
function tilPeriodeType(l: LPhase): PeriodeType | null {
  switch (l) {
    case "GRUNN":
      return "GRUNN";
    case "SPESIAL":
      return "SPESIALISERING";
    case "TURNERING":
      return "TURNERING";
    default:
      return null;
  }
}

function alderFra(dateOfBirth: Date | null, naa: Date): number | null {
  if (!dateOfBirth) return null;
  let alder = naa.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const m = naa.getUTCMonth() - dateOfBirth.getUTCMonth();
  if (m < 0 || (m === 0 && naa.getUTCDate() < dateOfBirth.getUTCDate())) alder--;
  return alder >= 0 && alder < 120 ? alder : null;
}

/** Bygg invariant-kontekst for en spillers plan: alle planens økter + spillerens perioder + alder. */
async function byggKontekst(planId: string, naa: Date): Promise<InvariantKontekst | null> {
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: { userId: true },
  });
  if (!plan) return null;

  const [okter, user, seasonPlans] = await Promise.all([
    prisma.trainingPlanSession.findMany({
      where: { planId },
      select: { id: true, scheduledAt: true, durationMin: true, pyramidArea: true, lFase: true, csNivaa: true },
    }),
    prisma.user.findUnique({ where: { id: plan.userId }, select: { dateOfBirth: true } }),
    prisma.seasonPlan.findMany({
      where: { userId: plan.userId },
      select: { periodBlocks: { select: { lPhase: true, startDate: true, endDate: true } } },
    }),
  ]);

  const kanonOkter: KanonOkt[] = okter.map((o) => ({
    id: o.id,
    dato: o.scheduledAt,
    varighetMin: o.durationMin,
    pyramide: o.pyramidArea,
    lFase: o.lFase,
    csNivaa: o.csNivaa,
  }));

  const perioder: KanonPeriode[] = seasonPlans
    .flatMap((sp) => sp.periodBlocks)
    .map((pb) => {
      const type = tilPeriodeType(pb.lPhase);
      return type ? { type, startDato: pb.startDate, sluttDato: pb.endDate } : null;
    })
    .filter((p): p is KanonPeriode => p !== null);

  return { okter: kanonOkter, perioder, spillerAlder: alderFra(user?.dateOfBirth ?? null, naa) };
}

function aggreger(brudd: BruddRad[]): PlanValidering {
  const hardeBrudd = brudd.filter((b) => b.alvorlighet === "hard").length;
  const mykeBrudd = brudd.filter((b) => b.alvorlighet === "myk").length;
  const score = Math.max(0, Math.min(100, 100 - hardeBrudd * HARD_VEKT - mykeBrudd * MYK_VEKT));
  return { score, ok: hardeBrudd === 0, hardeBrudd, mykeBrudd, brudd };
}

function kjorOgMap(ctx: InvariantKontekst, scope?: Scope): BruddRad[] {
  return INVARIANTER.filter((inv) => !scope || inv.scope === scope)
    .map((inv) => ({ inv, res: inv.valider(ctx) }))
    .filter((x) => !x.res.ok)
    .map(({ inv, res }) => ({
      invariantId: inv.id,
      navn: inv.navn,
      alvorlighet: inv.alvorlighet,
      scope: inv.scope,
      melding: res.melding,
      malt: res.malt,
      grense: res.grense,
      sessionIds: res.sessionIds ?? [],
    }));
}

/** Valider en hel plan. Returnerer brudd + plan-kvalitetsscore. */
export async function validerPlan(planId: string, naa: Date = new Date()): Promise<PlanValidering> {
  const ctx = await byggKontekst(planId, naa);
  if (!ctx) return { score: 100, ok: true, hardeBrudd: 0, mykeBrudd: 0, brudd: [] };
  return aggreger(kjorOgMap(ctx));
}

/** Valider én økt (okt-scope-invarianter) i kontekst av spillerens perioder. */
export async function validerOkt(sessionId: string, naa: Date = new Date()): Promise<PlanValidering> {
  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { planId: true },
  });
  if (!session) return { score: 100, ok: true, hardeBrudd: 0, mykeBrudd: 0, brudd: [] };

  const full = await byggKontekst(session.planId, naa);
  if (!full) return { score: 100, ok: true, hardeBrudd: 0, mykeBrudd: 0, brudd: [] };

  // Kontekst avgrenset til den ene økta (men beholder perioder/alder for oppslag).
  const ctx: InvariantKontekst = {
    okter: full.okter.filter((o) => o.id === sessionId),
    perioder: full.perioder,
    spillerAlder: full.spillerAlder,
  };
  return aggreger(kjorOgMap(ctx, "okt"));
}
