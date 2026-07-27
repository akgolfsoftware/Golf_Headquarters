/**
 * Widget-pakke — dataloader for MaalWidget (PlayerHQ).
 *
 * Mønster (widget-pakken, 2026-07-27): én server-loader per widget som
 * returnerer ett ferdig, typet dataobjekt — presentasjonskomponenten i
 * src/components/widgets/ tar objektet som eneste data-prop og gjør ingen
 * egen henting. Fremdrift regnes ALLTID via beregnMaalFremdrift
 * (src/lib/domain/maal-fremdrift.ts) — aldri lokale prosentformler.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { startOfMonth } from "@/lib/uke-helpers";
import {
  beregnMaalFremdrift,
  SG_OMRADE_NAVN,
  type MaalFremdriftStatus,
} from "@/lib/domain/maal-fremdrift";
import { hentSgSnittPerOmrade } from "@/lib/portal/sg-omrade-snitt";

const TYPE_LABELS: Record<string, string> = {
  HCP_TARGET: "HCP",
  ROUNDS_PER_MONTH: "RUNDER",
  SG_AREA: "SG",
  FREE_TEXT: "MÅL",
};

export type MaalWidgetMaal = {
  id: string;
  tittel: string;
  /** Kort type-etikett: HCP / RUNDER / SG / MÅL */
  typeLabel: string;
  pct: number;
  status: MaalFremdriftStatus;
  statusLabel: string;
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

/** SG med fortegn og norsk desimalkomma — «+0,35» / «−0,4» / «–» når ukjent. */
function fmtSg(v: number | null | undefined): string {
  if (v == null) return "–";
  const tall = Math.abs(v).toFixed(2).replace(".", ",");
  return `${v < 0 ? "−" : "+"}${tall}`;
}

export async function getMaalWidgetData(userId: string, limit = 3): Promise<MaalWidgetData> {
  const [goals, antallAktive, bruker, runderDenneMnd, sgSnitt] = await Promise.all([
    prisma.goal.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: [{ targetDate: "asc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true, type: true, title: true, status: true,
        targetValue: true, targetDate: true, createdAt: true, payload: true,
      },
    }),
    prisma.goal.count({ where: { userId, status: "ACTIVE" } }),
    prisma.user.findUnique({ where: { id: userId }, select: { hcp: true } }),
    prisma.round.count({
      where: { userId, playedAt: { gte: startOfMonth(new Date()) } },
    }),
    hentSgSnittPerOmrade(userId),
  ]);

  const hcp = bruker?.hcp ?? null;

  const maal = goals.map((g): MaalWidgetMaal => {
    const f = beregnMaalFremdrift(g, { hcp, runderDenneMnd, sgSnitt });

    let sub: string;
    if (f.kilde === "hcp" && g.targetValue !== null && hcp !== null) {
      const delta = +(hcp - g.targetValue).toFixed(1);
      sub = delta > 0 ? `${hcp.toFixed(1)} nå · trenger ${delta.toFixed(1)} til` : `HCP ${hcp.toFixed(1)}`;
    } else if (f.kilde === "runder" && g.targetValue !== null) {
      sub = `${runderDenneMnd} av ${g.targetValue} runder denne måneden`;
    } else if (f.kilde === "sg" && f.sgOmrade && g.targetValue !== null) {
      const naa = sgSnitt[f.sgOmrade];
      sub = `${SG_OMRADE_NAVN[f.sgOmrade]}: ${fmtSg(naa)} nå · mål ${fmtSg(g.targetValue)}`;
    } else if (f.trengerOmrade) {
      sub = "Velg SG-område for å måle fremdrift";
    } else if (f.sgOmrade) {
      sub = `${SG_OMRADE_NAVN[f.sgOmrade]} · trenger flere runder`;
    } else if (g.targetDate) {
      sub = `Frist: ${fmtKortDato(g.targetDate)}`;
    } else {
      sub = "Ingen frist";
    }

    const statusLabel =
      f.status === "achieved" ? "Oppnådd"
      : f.status === "behind" ? "Bak plan"
      : f.pct >= 80 ? "Nær mål" : "På sporet";

    return {
      id: g.id,
      tittel: g.title,
      typeLabel: TYPE_LABELS[g.type] ?? "MÅL",
      pct: f.pct,
      status: f.status,
      statusLabel,
      sub,
      href: `/portal/mal/goal/${g.id}`,
    };
  });

  return { antallAktive, maal };
}
