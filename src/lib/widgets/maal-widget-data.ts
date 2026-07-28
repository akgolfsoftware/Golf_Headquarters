/**
 * Widget-pakke — dataloader for MaalWidget (PlayerHQ).
 *
 * Mønster (widget-pakken, 2026-07-27): én server-loader per widget som
 * returnerer ett ferdig, typet dataobjekt — presentasjonskomponenten i
 * src/components/widgets/ tar objektet som eneste data-prop og gjør ingen
 * egen henting. Fremdrift regnes ALLTID via beregnGoalProgress
 * (src/lib/portal/goals/progress.ts) — samme funksjon som mål-hub og
 * mål-detalj, så prosenten aldri spriker mellom skjermer.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { beregnGoalProgress, type GoalProgressStatus } from "@/lib/portal/goals/progress";

const TYPE_LABELS: Record<string, string> = {
  HCP_TARGET: "HCP",
  ROUNDS_PER_MONTH: "RUNDER",
  SG_AREA: "SG",
  SESSION_FREQUENCY: "ØKTER",
  TEST_SCORE: "TEST",
  FREE_TEXT: "MÅL",
};

export type MaalWidgetMaal = {
  id: string;
  tittel: string;
  /** Kort type-etikett: HCP / RUNDER / SG / ØKTER / TEST / MÅL */
  typeLabel: string;
  pct: number;
  status: GoalProgressStatus;
  statusLabel: string;
  /** false = ingenting relevant logget ennå — vis "ingen data ennå", ikke en bar. */
  hasData: boolean;
  /** Én kompakt kontekstlinje — f.eks. «12,4 nå · trenger 2,4 til». */
  sub: string;
  href: string;
};

export type MaalWidgetData = {
  /** Totalt antall aktive mål (kan være flere enn listen viser). */
  antallAktive: number;
  maal: MaalWidgetMaal[];
};

function fmtKortDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "Europe/Oslo" });
}

const STATUS_LABEL: Record<GoalProgressStatus, string> = {
  achieved: "Oppnådd",
  behind: "Bak plan",
  "on-track": "På sporet",
  "no-data": "Ingen data ennå",
};

export async function getMaalWidgetData(userId: string, limit = 3): Promise<MaalWidgetData> {
  const [goals, antallAktive, bruker] = await Promise.all([
    prisma.goal.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: [{ targetDate: "asc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true, userId: true, type: true, title: true, status: true,
        targetValue: true, targetDate: true, createdAt: true, payload: true,
        linkedPyramidArea: true, linkedTestId: true,
      },
    }),
    prisma.goal.count({ where: { userId, status: "ACTIVE" } }),
    prisma.user.findUnique({ where: { id: userId }, select: { hcp: true } }),
  ]);

  const hcp = bruker?.hcp ?? null;

  const maal = await Promise.all(
    goals.map(async (g): Promise<MaalWidgetMaal> => {
      const progress = await beregnGoalProgress(g, { hcp });
      const fristStr = g.targetDate ? `Frist: ${fmtKortDato(g.targetDate)}` : "Ingen frist";
      const statusLabel =
        progress.status === "on-track" && progress.pct >= 80 ? "Nær mål" : STATUS_LABEL[progress.status];

      return {
        id: g.id,
        tittel: g.title,
        typeLabel: TYPE_LABELS[g.type] ?? "MÅL",
        pct: progress.pct,
        status: progress.status,
        statusLabel,
        hasData: progress.hasData,
        sub: progress.hasData ? progress.detail : fristStr,
        href: `/portal/mal/goal/${g.id}`,
      };
    }),
  );

  return { antallAktive, maal };
}
