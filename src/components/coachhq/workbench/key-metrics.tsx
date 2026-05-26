/**
 * CoachKeyMetrics — 4-kort KPI-rad i Coach Workbench.
 *
 * Viser viktigste metrics for valgt spiller:
 *  1. SG-Total (siste 5 runder) — med trend
 *  2. Plan-adherence (% siste 4 uker)
 *  3. Tester (antall overdue)
 *  4. Aktive mål (X av Y)
 *
 * Hvert kort er klikkbart og navigerer til relatert detalj-side.
 *
 * Pure presentational — koordinator henter data og sender props.
 */

import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Target,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Types ----------

export type SgTrend = "OPP" | "FLAT" | "NED";

export type CoachKeyMetricsProps = {
  spillerId: string;
  sgTotal: number | null;
  sgTotalTrend?: SgTrend;
  planAdherence: number | null; // 0-100 prosent
  testerOverdue: number;
  mal: { aktive: number; total: number };
  className?: string;
};

// ---------- Helpers ----------

function formatSg(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}`;
}

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${Math.round(value)}%`;
}

function adherenceTone(value: number | null): "good" | "mid" | "bad" {
  if (value === null) return "mid";
  if (value >= 80) return "good";
  if (value >= 60) return "mid";
  return "bad";
}

function sgTone(value: number | null): "good" | "mid" | "bad" {
  if (value === null) return "mid";
  if (value > 0) return "good";
  if (value > -1) return "mid";
  return "bad";
}

function malTone(aktive: number, total: number): "good" | "mid" | "bad" {
  if (total === 0) return "mid";
  const ratio = aktive / total;
  if (ratio >= 0.75) return "good";
  if (ratio >= 0.5) return "mid";
  return "bad";
}

function testerTone(overdue: number): "good" | "mid" | "bad" {
  if (overdue === 0) return "good";
  if (overdue <= 1) return "mid";
  return "bad";
}

// ---------- Komponent ----------

export function CoachKeyMetrics({
  spillerId,
  sgTotal,
  sgTotalTrend,
  planAdherence,
  testerOverdue,
  mal,
  className,
}: CoachKeyMetricsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4",
        className,
      )}
    >
      <MetricCard
        href={`/admin/agencyos?modus=individuelt&spiller=${spillerId}&tab=analyse`}
        eyebrow="SG-Total"
        value={formatSg(sgTotal)}
        trend={sgTotalTrend}
        footnote="siste 5 runder"
        tone={sgTone(sgTotal)}
        icon={<Activity className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />}
      />

      <MetricCard
        href={`/admin/agencyos?modus=individuelt&spiller=${spillerId}&tab=plan`}
        eyebrow="Plan-adherence"
        value={formatPercent(planAdherence)}
        footnote="siste 4 uker"
        tone={adherenceTone(planAdherence)}
        icon={
          <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        }
      />

      <MetricCard
        href={`/admin/spillere/${spillerId}/tester`}
        eyebrow="Tester (overdue)"
        value={testerOverdue.toString()}
        footnote={
          testerOverdue === 0 ? "alle ferske" : testerOverdue === 1 ? "overdue" : "overdue"
        }
        tone={testerTone(testerOverdue)}
        icon={
          <AlertTriangle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        }
      />

      <MetricCard
        href={`/admin/spillere/${spillerId}/mal`}
        eyebrow="Aktive mål"
        value={
          <span>
            <span>{mal.aktive}</span>
            <span className="text-base text-muted-foreground"> av {mal.total}</span>
          </span>
        }
        footnote={
          mal.total > 0 ? (
            <ProgressDots aktive={mal.aktive} total={mal.total} />
          ) : (
            "ingen mål satt"
          )
        }
        tone={malTone(mal.aktive, mal.total)}
        icon={<Target className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />}
      />
    </div>
  );
}

// ---------- Sub: MetricCard ----------

type Tone = "good" | "mid" | "bad";

type MetricCardProps = {
  href: string;
  eyebrow: string;
  value: React.ReactNode;
  trend?: SgTrend;
  footnote: React.ReactNode;
  tone: Tone;
  icon: React.ReactNode;
};

function MetricCard({
  href,
  eyebrow,
  value,
  trend,
  footnote,
  tone,
  icon,
}: MetricCardProps) {
  const toneColor =
    tone === "good"
      ? "text-success"
      : tone === "bad"
        ? "text-destructive"
        : "text-warning";

  return (
    <Link
      href={href}
      className={cn(
        "group rounded-2xl border border-border bg-card p-4 transition-all md:p-6",
        "hover:border-foreground/20 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {eyebrow}
        </span>
        <span className={cn("shrink-0", toneColor)}>{icon}</span>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className={cn("font-mono text-3xl font-bold tabular-nums", toneColor)}>
          {value}
        </span>
        {trend ? <TrendIcon trend={trend} /> : null}
      </div>

      <div className="mt-2 text-xs text-muted-foreground">{footnote}</div>
    </Link>
  );
}

// ---------- Sub: TrendIcon ----------

function TrendIcon({ trend }: { trend: SgTrend }) {
  if (trend === "OPP") {
    return (
      <ChevronUp
        className="h-5 w-5 text-success"
        strokeWidth={2}
        aria-label="trend opp"
      />
    );
  }
  if (trend === "NED") {
    return (
      <ChevronDown
        className="h-5 w-5 text-destructive"
        strokeWidth={2}
        aria-label="trend ned"
      />
    );
  }
  return (
    <Minus
      className="h-5 w-5 text-muted-foreground"
      strokeWidth={2}
      aria-label="trend flat"
    />
  );
}

// ---------- Sub: ProgressDots ----------

function ProgressDots({ aktive, total }: { aktive: number; total: number }) {
  const dots: Array<"on" | "off"> = [];
  for (let i = 0; i < total; i++) {
    dots.push(i < aktive ? "on" : "off");
  }
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {dots.map((state, idx) => (
        <span
          key={idx}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            state === "on" ? "bg-success" : "bg-border",
          )}
        />
      ))}
    </span>
  );
}
