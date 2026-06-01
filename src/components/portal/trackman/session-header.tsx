/**
 * TrackMan sesjonsanalyse — header (server).
 * Eyebrow + tittel + visnings-tabs (Bag/Stabilitet/Trend/Sammenlign) +
 * upload-status + AI-analyse-panel.
 *
 * Bag er den aktive (live) visningen. Stabilitet/Trend/Sammenlign er egne
 * skjermer (markert "Kommer") — bygges ikke her. AI-funn kommer ferdig-utledet
 * fra serveren; tomt funn-sett → panelet skjules.
 */

import { Activity, CheckCircle2, Grid3x3, LineChart, Sparkles, UploadCloud, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionFinding } from "@/lib/portal-trackman/session-analysis";

const findingTone = {
  warn: "hsl(var(--warning))",
  good: "hsl(var(--success))",
  act: "hsl(var(--primary))",
} as const;

const findingMetaClass = {
  warn: "text-warning",
  good: "text-success",
  act: "text-primary",
} as const;

export function SessionHeader({
  eyebrowDate,
  shotCount,
  durationMin,
  sessionStability,
  findings,
  sourceLabel,
}: {
  eyebrowDate: string;
  shotCount: number;
  durationMin: number | null;
  sessionStability: number | null;
  findings: SessionFinding[];
  sourceLabel: string;
}) {
  return (
    <div className="space-y-4">
      {/* HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />
            TrackMan · sesjonsanalyse · {eyebrowDate}
          </span>
          <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground md:text-[32px]">
            Range-analyse{" "}
            <em className="font-normal italic text-muted-foreground">
              · {shotCount.toLocaleString("nb-NO")} slag
              {durationMin != null && ` · ${durationMin} min`}
            </em>
          </h1>
        </div>

        {/* Visnings-tabs */}
        <nav role="tablist" aria-label="TrackMan-visning" className="flex flex-wrap gap-1.5">
          <ViewTab icon={Grid3x3} label="Bag" active />
          <ViewTab icon={Activity} label="Stabilitet" soon />
          <ViewTab icon={LineChart} label="Trend" soon />
          <ViewTab icon={Users} label="Sammenlign" soon />
        </nav>
      </header>

      {/* UPLOAD + AI */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
        {/* Upload-status */}
        <div className="flex items-center gap-3 rounded-[14px] border border-border bg-card px-4 py-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <UploadCloud className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 flex-1 leading-snug">
            <strong className="block text-[13px] font-semibold text-foreground">TrackMan-data</strong>
            <span className="block truncate font-mono text-[11px] text-muted-foreground">{sourceLabel}</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-success">
            <CheckCircle2 className="h-3 w-3" strokeWidth={2} aria-hidden />
            Lest inn
          </span>
        </div>

        {/* AI-analyse */}
        {findings.length > 0 ? (
          <div className="rounded-[14px] border border-border bg-card px-4 py-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                <Sparkles className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                AI-analyse
              </span>
              {sessionStability != null && (
                <span className="font-mono text-[18px] font-bold leading-none tabular-nums tracking-[-0.02em] text-foreground">
                  {sessionStability.toFixed(1).replace(".", ",")}
                  <small className="ml-1 text-[10px] font-medium text-muted-foreground">/ 10 stabilitet</small>
                </span>
              )}
            </div>
            <ul className="space-y-1.5">
              {findings.map((f, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[8px_1fr_auto] items-start gap-2.5 rounded-lg bg-secondary px-3 py-2"
                >
                  <span
                    className="mt-1.5 h-2 w-2 rounded-full"
                    style={{ background: findingTone[f.tone] }}
                    aria-hidden
                  />
                  <span className="text-[12px] leading-relaxed text-foreground">
                    <b className="font-semibold">{f.lead}</b> {f.body}
                  </span>
                  <span
                    className={cn(
                      "mt-px shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.1em]",
                      findingMetaClass[f.tone],
                    )}
                  >
                    {f.metaLabel}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex items-center rounded-[14px] border border-dashed border-border bg-card px-4 py-3.5">
            <span className="font-mono text-[11px] text-muted-foreground">
              For lite data til AI-analyse — trenger minst 5 slag per kølle.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ViewTab({
  icon: Icon,
  label,
  active,
  soon,
}: {
  icon: typeof Grid3x3;
  label: string;
  active?: boolean;
  soon?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={!!active}
      aria-disabled={soon || undefined}
      disabled={soon}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition",
        active
          ? "border-2 border-[var(--color-accent-deep)] bg-[var(--color-tab-active-bg)] px-[11px] py-[7px] text-[var(--color-tab-active-text)]"
          : soon
            ? "cursor-not-allowed border-border bg-card text-muted-foreground/60"
            : "border-border bg-card text-foreground hover:bg-secondary",
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      {label}
      {soon && (
        <span className="rounded-full bg-secondary px-1.5 py-px font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Kommer
        </span>
      )}
    </button>
  );
}
