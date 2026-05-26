/**
 * WellnessIndicators — viser energi, søvn, HRV og stress fra wearable.
 *
 * Bruk i Player Workbench (PlayerHQ Hjem). Henter data fra eksterne
 * integrasjoner (Garmin, Apple Watch, Whoop) når koblet — viser skjelett-
 * state og koble-CTA hvis ingen wearable.
 *
 * Athletic editorial: store display-tall, prominent stat-blokker,
 * skjelett-state med dramatisk hero-ikon.
 *
 * TODO: koble til faktisk wearable-integrasjon når WearableSync-modell er
 * på plass.
 *
 * Referanse: Spor C i Sprint 1 (Player Workbench v2).
 */
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Watch,
  RefreshCw,
  Activity,
  Moon,
  Heart,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Types ----------

export type WellnessStress = "LAV" | "MIDDELS" | "HOY";

export type WellnessData = {
  energi?: number; // 0-10
  sovn_timer?: number;
  hrv?: number;
  hrv_trend?: number; // +5, -3
  stress?: WellnessStress;
  sist_sync?: Date;
};

export type WellnessIndicatorsProps = {
  data: WellnessData | null;
  connectHref?: string;
  syncHref?: string;
  className?: string;
};

// ---------- Helpers ----------

function stressLabel(stress: WellnessStress): string {
  switch (stress) {
    case "LAV":
      return "Lav";
    case "MIDDELS":
      return "Middels";
    case "HOY":
      return "Høy";
  }
}

function stressColor(stress: WellnessStress): string {
  switch (stress) {
    case "LAV":
      return "text-primary";
    case "MIDDELS":
      return "text-warning";
    case "HOY":
      return "text-destructive";
  }
}

function formatSyncRelative(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const min = Math.floor(diffMs / (1000 * 60));
  if (min < 1) return "nettopp";
  if (min < 60) return `${min} min siden`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}t siden`;
  const days = Math.floor(hours / 24);
  return `${days}d siden`;
}

// ---------- Subkomponenter ----------

function EnergyDots({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(10, Math.round(value)));
  return (
    <div
      className="mt-2 flex gap-0.5"
      role="img"
      aria-label={`Energi ${clamped} av 10`}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full",
            i < clamped ? "bg-primary" : "bg-secondary",
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  unit,
  trend,
  trendColor,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  unit?: string;
  trend?: React.ReactNode;
  trendColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-background/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span className="text-muted-foreground" aria-hidden>
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-bold leading-none tabular-nums tracking-tight text-foreground">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-muted-foreground">{unit}</span>
        )}
        {trend && (
          <span className={cn("ml-auto inline-flex items-center font-mono text-[10px] font-bold tabular-nums", trendColor)}>
            {trend}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ---------- Komponent ----------

export function WellnessIndicators({
  data,
  connectHref = "/portal/meg/innstillinger/integrasjoner",
  syncHref,
  className,
}: WellnessIndicatorsProps) {
  // Skjelett-state — ingen wearable koblet
  if (!data) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-border bg-card p-6 sm:p-8",
          className,
        )}
        aria-labelledby="wellness-heading"
      >
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Velvære
        </p>
        <h2
          id="wellness-heading"
          className="mt-1 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
        >
          Koble enhet for daglig data
        </h2>

        <div className="mt-6 rounded-xl border border-dashed border-border bg-secondary/30 p-8 text-center">
          <span className="mx-auto mb-2 grid size-12 place-items-center rounded-full bg-foreground/5 text-foreground/60">
            <Watch className="size-6" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="mx-auto max-w-xs text-sm text-muted-foreground">
            Koble til Garmin, Apple Watch eller Whoop for å se daglig HRV,
            søvn, energi og stress.
          </p>
          <Link
            href={connectHref}
            className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-foreground px-6 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-background transition hover:bg-foreground/90"
          >
            Koble enhet
            <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  const now = new Date();

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-6 sm:p-8",
        className,
      )}
      aria-labelledby="wellness-heading"
    >
      {/* Header */}
      <div className="mb-5 flex items-end justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Velvære
          </p>
          <h2
            id="wellness-heading"
            className="mt-1 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            Dagens kropp
          </h2>
        </div>
        {data.sist_sync && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {formatSyncRelative(data.sist_sync, now)}
          </span>
        )}
      </div>

      {/* 2x2 grid med store stat-tiles */}
      <div className="grid grid-cols-2 gap-2">
        {/* Energi */}
        <StatTile
          icon={<Activity className="size-4" strokeWidth={1.5} />}
          label="Energi"
          value={data.energi !== undefined ? String(data.energi) : "–"}
          unit={data.energi !== undefined ? "/10" : undefined}
        >
          {data.energi !== undefined && <EnergyDots value={data.energi} />}
        </StatTile>

        {/* Søvn */}
        <StatTile
          icon={<Moon className="size-4" strokeWidth={1.5} />}
          label="Søvn"
          value={
            data.sovn_timer !== undefined
              ? data.sovn_timer.toFixed(1)
              : "–"
          }
          unit={data.sovn_timer !== undefined ? "timer" : undefined}
        />

        {/* HRV */}
        <StatTile
          icon={<Heart className="size-4" strokeWidth={1.5} />}
          label="HRV"
          value={data.hrv !== undefined ? String(data.hrv) : "–"}
          unit={data.hrv !== undefined ? "ms" : undefined}
          trend={
            data.hrv_trend !== undefined && data.hrv_trend !== 0 ? (
              <>
                {data.hrv_trend > 0 ? (
                  <ArrowUpRight className="size-3" strokeWidth={2.5} aria-hidden />
                ) : (
                  <ArrowDownRight className="size-3" strokeWidth={2.5} aria-hidden />
                )}
                {data.hrv_trend > 0 ? "+" : ""}
                {data.hrv_trend}
              </>
            ) : undefined
          }
          trendColor={
            data.hrv_trend !== undefined && data.hrv_trend > 0
              ? "text-primary"
              : "text-destructive"
          }
        />

        {/* Stress */}
        <StatTile
          icon={<Brain className="size-4" strokeWidth={1.5} />}
          label="Stress"
          value={
            data.stress ? (
              <span className={stressColor(data.stress)}>
                {stressLabel(data.stress)}
              </span>
            ) : (
              "–"
            )
          }
        />
      </div>

      {/* Footer */}
      {syncHref && (
        <div className="mt-4 flex justify-end">
          <Link
            href={syncHref}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground transition hover:text-primary"
          >
            <RefreshCw className="size-3" strokeWidth={2} aria-hidden="true" />
            Sync nå
          </Link>
        </div>
      )}
    </section>
  );
}
