"use client";

import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AthleticCard } from "@/components/athletic/card";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export type Trend = "OPP" | "FLAT" | "NED";
export type Benchmark = "PGA" | "A1" | "A2" | "B1" | "B2";

export type HcpPoint = { dato: Date; hcp: number };

export type StrokesGained = {
  ott: number | null;
  app: number | null;
  arg: number | null;
  putt: number | null;
  trend: Trend;
  benchmark: Benchmark;
};

export type PyramideFordeling = {
  fys: number;
  tek: number;
  slag: number;
  spill: number;
  turn: number;
};

export type SisteTest = {
  id: string;
  navn: string;
  verdi: string;
  enhet: string;
  dato: Date;
  trend?: Trend;
};

export type AnalysePanelProps = {
  spillerId: string;
  hcpUtvikling: HcpPoint[];
  sg: StrokesGained;
  pyramide: PyramideFordeling;
  sisteTester: SisteTest[];
};

function formatDato(dato: Date): string {
  return dato.toLocaleDateString("no-NO", {
    day: "numeric",
    month: "short",
  });
}

function formatMonth(dato: Date): string {
  return dato.toLocaleDateString("no-NO", {
    month: "short",
    year: "2-digit",
  });
}

function trendIcon(trend?: Trend) {
  if (trend === "OPP") {
    return (
      <TrendingUp
        size={14}
        strokeWidth={2}
        className="text-success"
        aria-label="Opp"
      />
    );
  }
  if (trend === "NED") {
    return (
      <TrendingDown
        size={14}
        strokeWidth={2}
        className="text-destructive"
        aria-label="Ned"
      />
    );
  }
  if (trend === "FLAT") {
    return (
      <Minus
        size={14}
        strokeWidth={2}
        className="text-muted-foreground"
        aria-label="Flat"
      />
    );
  }
  return null;
}

/**
 * AnalysePanel — analyse-view for Coach Workbench med HCP-utvikling,
 * Strokes Gained, pyramide-fordeling og siste tester.
 *
 * Pure presentational. Data-fetching gjøres i koordinator-komponent.
 */
export function AnalysePanel({
  hcpUtvikling,
  sg,
  pyramide,
  sisteTester,
}: AnalysePanelProps) {
  return (
    <div className="space-y-4">
      <HcpUtviklingKort points={hcpUtvikling} />
      <StrokesGainedKort sg={sg} />
      <PyramideKort pyramide={pyramide} />
      <SisteTesterKort tester={sisteTester} />
    </div>
  );
}

function HcpUtviklingKort({ points }: { points: HcpPoint[] }) {
  if (points.length === 0) {
    return (
      <AthleticCard label="HCP-utvikling (12 mnd)">
        <p className="py-4 text-center text-sm text-muted-foreground">
          Ingen HCP-data tilgjengelig.
        </p>
      </AthleticCard>
    );
  }

  const chartData = points.map((p) => ({
    label: formatMonth(p.dato),
    hcp: p.hcp,
  }));

  const first = points[0];
  const last = points[points.length - 1];
  const delta = last && first ? last.hcp - first.hcp : 0;

  return (
    <AthleticCard label="HCP-utvikling (12 mnd)">
      <div className="space-y-3">
        <div className="flex items-baseline gap-4 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {first && (
            <span className="tabular-nums">
              {formatMonth(first.dato)}{" "}
              <b className="text-base font-bold text-foreground">
                {first.hcp.toFixed(1)}
              </b>
            </span>
          )}
          <span aria-hidden>→</span>
          {last && (
            <span className="tabular-nums">
              {formatMonth(last.dato)}{" "}
              <b className="text-base font-bold text-primary">
                {last.hcp.toFixed(1)}
              </b>
            </span>
          )}
          <span
            className={cn(
              "tabular-nums",
              delta <= 0 ? "text-success" : "text-destructive",
            )}
          >
            Δ <b>{delta > 0 ? "+" : ""}{delta.toFixed(1)}</b>
          </span>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="hcpAnalyseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                reversed
                tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
                tickLine={false}
                axisLine={false}
                width={30}
                domain={["dataMin - 0.5", "dataMax + 0.5"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: "var(--font-jetbrains-mono)",
                }}
                formatter={(v) => (typeof v === "number" ? v.toFixed(1) : String(v))}
              />
              <Area
                type="monotone"
                dataKey="hcp"
                stroke="#005840"
                strokeWidth={2}
                fill="url(#hcpAnalyseFill)"
                dot={{ r: 3, fill: "hsl(var(--primary))" }}
                activeDot={{ r: 5, fill: "hsl(var(--accent))", stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AthleticCard>
  );
}

type SgKolonne = {
  label: string;
  verdi: number | null;
};

function StrokesGainedKort({ sg }: { sg: StrokesGained }) {
  const kolonner: SgKolonne[] = [
    { label: "SG-OTT", verdi: sg.ott },
    { label: "SG-APP", verdi: sg.app },
    { label: "SG-ARG", verdi: sg.arg },
    { label: "SG-PUTT", verdi: sg.putt },
  ];

  return (
    <AthleticCard label="Strokes Gained (siste 5 runder)">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {kolonner.map((kol) => (
            <SgKolonneKort
              key={kol.label}
              label={kol.label}
              verdi={kol.verdi}
              benchmark={sg.benchmark}
            />
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          Benchmark: {sg.benchmark} · Trend: {sg.trend}
        </p>
      </div>
    </AthleticCard>
  );
}

function SgKolonneKort({
  label,
  verdi,
  benchmark,
}: {
  label: string;
  verdi: number | null;
  benchmark: Benchmark;
}) {
  const isPositive = verdi != null && verdi > 0;
  const isNegative = verdi != null && verdi < 0;

  return (
    <div className="rounded-md border border-border bg-background/50 p-3 text-center">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-xl font-bold tabular-nums",
          isPositive && "text-success",
          isNegative && "text-destructive",
          verdi == null && "text-muted-foreground",
        )}
      >
        {verdi == null
          ? "—"
          : `${verdi > 0 ? "+" : ""}${verdi.toFixed(1)}`}
        {isPositive && (
          <TrendingUp
            size={14}
            strokeWidth={2}
            className="ml-1 inline-block align-baseline"
            aria-hidden
          />
        )}
        {isNegative && (
          <TrendingDown
            size={14}
            strokeWidth={2}
            className="ml-1 inline-block align-baseline"
            aria-hidden
          />
        )}
      </p>
      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
        vs {benchmark}
      </p>
    </div>
  );
}

type PyramideRow = {
  label: string;
  key: keyof PyramideFordeling;
  tone: "primary" | "accent" | "neutral";
};

const PYRAMIDE_ROWS: PyramideRow[] = [
  { label: "FYS", key: "fys", tone: "primary" },
  { label: "TEK", key: "tek", tone: "primary" },
  { label: "SLAG", key: "slag", tone: "accent" },
  { label: "SPILL", key: "spill", tone: "accent" },
  { label: "TURN", key: "turn", tone: "neutral" },
];

const PYRAMIDE_TONE: Record<PyramideRow["tone"], string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  neutral: "bg-muted-foreground",
};

function PyramideKort({ pyramide }: { pyramide: PyramideFordeling }) {
  return (
    <AthleticCard label="Pyramide-fordeling (siste 30 dager)">
      <div className="space-y-2">
        {PYRAMIDE_ROWS.map((row) => {
          const pct = pyramide[row.key];
          return (
            <div key={row.key} className="flex items-center gap-3 text-xs">
              <span className="w-12 shrink-0 font-mono font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {row.label}
              </span>
              <span className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn("h-full rounded-full", PYRAMIDE_TONE[row.tone])}
                  style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                />
              </span>
              <span className="w-12 shrink-0 text-right font-mono font-semibold tabular-nums">
                {Math.round(pct)}%
              </span>
            </div>
          );
        })}
      </div>
    </AthleticCard>
  );
}

function SisteTesterKort({ tester }: { tester: SisteTest[] }) {
  if (tester.length === 0) {
    return (
      <AthleticCard label="Siste tester">
        <EmptyState
          icon={TrendingUp}
          title="Ingen tester registrert"
          description="Spilleren har ingen registrerte tester ennå."
        />
      </AthleticCard>
    );
  }

  return (
    <AthleticCard label="Siste tester">
      <ul className="divide-y divide-border">
        {tester.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {t.navn}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground tabular-nums">
                {formatDato(t.dato)}
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-base font-bold tabular-nums text-foreground">
                {t.verdi}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {t.enhet}
              </span>
              {t.trend && <AthleticEyebrow>{trendIcon(t.trend)}</AthleticEyebrow>}
            </div>
          </li>
        ))}
      </ul>
    </AthleticCard>
  );
}
