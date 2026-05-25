/**
 * WellnessIndicators — viser energi, søvn, HRV og stress fra wearable.
 *
 * Bruk i Player Workbench (PlayerHQ Hjem). Henter data fra eksterne
 * integrasjoner (Garmin, Apple Watch, Whoop) når koblet — viser skjelett-
 * state og koble-CTA hvis ingen wearable.
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
      className="mt-1 flex gap-0.5"
      role="img"
      aria-label={`Energi ${clamped} av 10`}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i < clamped ? "bg-primary" : "bg-muted"
          )}
          aria-hidden="true"
        />
      ))}
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
          "rounded-lg border border-border bg-card p-4 sm:p-6",
          className
        )}
        aria-labelledby="wellness-heading"
      >
        <h2
          id="wellness-heading"
          className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
        >
          Velvære
        </h2>
        <div className="rounded-md border border-dashed border-border bg-secondary/40 p-6 text-center">
          <Watch
            className="mx-auto mb-3 h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            Koble til Garmin, Apple Watch eller Whoop for å se daglig HRV,
            søvn og energi.
          </p>
          <Link
            href={connectHref}
            className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Koble enhet
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  const now = new Date();

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-4 sm:p-6",
        className
      )}
      aria-labelledby="wellness-heading"
    >
      <h2
        id="wellness-heading"
        className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
      >
        Velvære
      </h2>

      {/* 4-kolonne grid: 2 på mobile, 4 på desktop */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Energi */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Energi
          </p>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums text-foreground">
            {data.energi !== undefined ? `${data.energi}/10` : "–"}
          </p>
          {data.energi !== undefined ? (
            <EnergyDots value={data.energi} />
          ) : null}
        </div>

        {/* Søvn */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Søvn
          </p>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums text-foreground">
            {data.sovn_timer !== undefined
              ? `${data.sovn_timer.toFixed(1)}t`
              : "–"}
          </p>
        </div>

        {/* HRV */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            HRV
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-xl font-semibold tabular-nums text-foreground">
              {data.hrv !== undefined ? data.hrv : "–"}
            </span>
            {data.hrv_trend !== undefined && data.hrv_trend !== 0 ? (
              <span
                className={cn(
                  "inline-flex items-center font-mono text-[10px] font-medium tabular-nums",
                  data.hrv_trend > 0 ? "text-primary" : "text-destructive"
                )}
                aria-label={`Trend ${data.hrv_trend > 0 ? "opp" : "ned"} ${Math.abs(data.hrv_trend)}`}
              >
                {data.hrv_trend > 0 ? (
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
                )}
                {data.hrv_trend > 0 ? "+" : ""}
                {data.hrv_trend}
              </span>
            ) : null}
          </div>
        </div>

        {/* Stress */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Stress
          </p>
          <p
            className={cn(
              "mt-1 font-display text-xl font-semibold",
              data.stress ? stressColor(data.stress) : "text-foreground"
            )}
          >
            {data.stress ? stressLabel(data.stress) : "–"}
          </p>
        </div>
      </div>

      {/* Footer: sync-info + manuell sync */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          {data.sist_sync
            ? `Sist sync: ${formatSyncRelative(data.sist_sync, now)}`
            : "Ingen sync-data"}
        </span>
        {syncHref ? (
          <Link
            href={syncHref}
            className="inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-primary transition hover:underline"
          >
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            Sync Garmin
          </Link>
        ) : null}
      </div>
    </section>
  );
}
