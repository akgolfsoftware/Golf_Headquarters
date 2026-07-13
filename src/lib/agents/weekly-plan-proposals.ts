/**
 * C1 (Bølge 2) — automatisk ukesyklus: hver søndag genereres et ukeforslag
 * for NESTE uke per coachet spiller med aktiv plan, og legges som
 * PlanAction WEEKLY_PROPOSAL i godkjenningskøen (A1). ALDRI auto-lagring —
 * øktene opprettes først når coachen godkjenner (plan-action-executor).
 *
 * W2.2b (periode-rulling): forslaget tar hensyn til aktiv PeriodBlock —
 * generateWeekSuggestions leser periodekonteksten, og har spilleren et
 * øktbudsjett (weeklySessionBudget fra 8c.1) velges varianten som ligger
 * nærmest budsjettets øktantall (budsjettet ER oppskriften).
 *
 * Idempotens: finnes det alt en PENDING WEEKLY_PROPOSAL for spilleren
 * (opprettet siste 6 dager) hoppes spilleren over. try/catch per spiller.
 */

import { prisma } from "@/lib/prisma";
import { coachedPlayerWhere } from "@/lib/auth/coached";
import { generateWeekSuggestions } from "@/lib/ai-plan/week-suggest";
import { parseSessionBudget, budsjettSum } from "@/lib/workbench/perioder";

function nesteMandag(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  return d;
}

export async function runWeeklyPlanProposals(): Promise<{
  spillere: number;
  forslag: number;
  hoppet: number;
  feilet: number;
}> {
  const weekStart = nesteMandag();
  const seksDagerSiden = new Date(Date.now() - 6 * 86_400_000);

  // Kun coachede spillere med aktiv plan (I0 + planen som ankerpunkt).
  // Bevisst coachedPlayerWhere (ikke coach-scopet): batch-agent uten viewer.
  const spillere = await prisma.user.findMany({
    where: {
      AND: [
        coachedPlayerWhere(),
        { deletedAt: null },
        { trainingPlans: { some: { isActive: true } } },
      ],
    },
    select: {
      id: true,
      seasonPlans: {
        orderBy: { year: "desc" },
        take: 1,
        select: { periodBlocks: { select: { id: true, lPhase: true, startDate: true, endDate: true, weeklySessionBudget: true } } },
      },
    },
    take: 200,
  });

  let forslag = 0;
  let hoppet = 0;
  let feilet = 0;

  for (const spiller of spillere) {
    try {
      // Idempotens: ett PENDING ukeforslag om gangen per spiller.
      const finnes = await prisma.planAction.findFirst({
        where: {
          userId: spiller.id,
          actionType: "WEEKLY_PROPOSAL",
          status: "PENDING",
          createdAt: { gte: seksDagerSiden },
        },
        select: { id: true },
      });
      if (finnes) {
        hoppet++;
        continue;
      }

      const { suggestions } = await generateWeekSuggestions(spiller.id, weekStart);
      if (suggestions.length === 0) {
        hoppet++;
        continue;
      }

      // W2.2b: budsjett-styrt variantvalg — nærmest øktbudsjettet vinner;
      // uten budsjett velges standard-varianten.
      const aktivPeriode = (spiller.seasonPlans[0]?.periodBlocks ?? []).find(
        (b) => b.startDate <= weekStart && weekStart <= b.endDate,
      ) ?? null;
      const budsjett = parseSessionBudget(aktivPeriode?.weeklySessionBudget ?? null);
      const maalOkter = budsjettSum(budsjett);
      const valgt =
        maalOkter > 0
          ? [...suggestions].sort(
              (a, b) => Math.abs(a.totalSessions - maalOkter) - Math.abs(b.totalSessions - maalOkter),
            )[0]
          : suggestions.find((s) => s.variant === "standard") ?? suggestions[0];

      // Ukepakke → executor-format (scheduledAt per økt, kl. 16:00 default —
      // coachen justerer i Workbench etter godkjenning).
      const sessions = valgt.sessions.map((o) => {
        const dato = new Date(weekStart);
        dato.setDate(dato.getDate() + o.day);
        dato.setHours(16, 0, 0, 0);
        return {
          title: o.title,
          pyramidArea: o.pyramidArea,
          durationMin: o.durationMin,
          scheduledAt: dato.toISOString(),
        };
      });

      await prisma.planAction.create({
        data: {
          userId: spiller.id,
          agentName: "weekly-plan-proposals",
          actionType: "WEEKLY_PROPOSAL",
          status: "PENDING",
          suggestion: {
            tittel: `Ukeforslag uke ${isoUke(weekStart)} · ${valgt.variant}`,
            forklaring: `${valgt.focusBlend}${aktivPeriode ? ` · periode: ${aktivPeriode.lPhase}` : ""}${maalOkter > 0 ? ` · budsjett ${maalOkter} økter/uke` : ""}`,
            sessions,
          },
        },
      });
      forslag++;
    } catch {
      feilet++;
    }
  }

  return { spillere: spillere.length, forslag, hoppet, feilet };
}

function isoUke(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
}
