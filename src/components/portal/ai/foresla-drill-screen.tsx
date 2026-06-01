/**
 * PlayerHQ · AI foreslår drills (mobile-first, 430px)
 *
 * Forslag bygget på ekte data: spillerens svakeste pyramide-akser (fra tester
 * uten baseline) matches mot system-drills i samme område. Match-prosenten er
 * en ærlig overlapp-score (akse-treff), ikke et oppdiktet SG-tall. Mangler det
 * drills eller signaler, viser vi tomstate i stedet for falske kort.
 *
 * Re-bruker liste-mønsteret fra drill-bibliotek + tester-list (DS-tokens,
 * akse-farge-kant, mono-eyebrow). Kun lucide, ingen hardkodet hex.
 */

import Link from "next/link";
import { ArrowRight, Plus, Sparkles, Target } from "lucide-react";
import { PlayerHero } from "@/components/portal/player-hero";
import { cn } from "@/lib/utils";
import type { AxisKind } from "@/lib/portal-ai/ai-data";

const AXIS_BORDER: Record<AxisKind, string> = {
  fys: "border-l-pyr-fys",
  tek: "border-l-pyr-tek",
  slag: "border-l-pyr-slag",
  spill: "border-l-pyr-spill",
  turn: "border-l-pyr-turn",
};

const AXIS_PILL: Record<AxisKind, string> = {
  fys: "bg-[var(--color-pyr-fys-track)] text-[var(--pyr-fys)]",
  tek: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
  slag: "bg-[var(--color-pyr-slag-track)] text-[var(--pyr-slag)]",
  spill: "bg-[var(--color-pyr-spill-track)] text-primary",
  turn: "bg-[var(--color-pyr-turn-track)] text-destructive",
};

export type DrillSuggestion = {
  id: string;
  rank: number;
  axis: AxisKind;
  axisLabel: string;
  title: string;
  meta: string[];
  matchPct: number;
  why: string;
};

export type ForeslaDrillScreenProps = {
  playerFirstName: string;
  analysedTestCount: number;
  suggestions: DrillSuggestion[];
};

function MatchGauge({ pct }: { pct: number }) {
  const high = pct >= 80;
  return (
    <div className="flex shrink-0 flex-col items-end">
      <span
        className={cn(
          "font-mono text-[20px] font-bold leading-none tabular-nums",
          high ? "text-primary" : "text-foreground",
        )}
      >
        {pct}
        <span className="ml-0.5 text-[11px] text-muted-foreground">%</span>
      </span>
      <span className="mt-0.5 font-mono text-[8px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        Match
      </span>
    </div>
  );
}

function SuggestionCard({ drill }: { drill: DrillSuggestion }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-l-[3px] border-border bg-card p-3.5",
        AXIS_BORDER[drill.axis],
      )}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[11px] font-bold text-accent">
          {drill.rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[8px] font-extrabold uppercase tracking-[0.10em]",
                AXIS_PILL[drill.axis],
              )}
            >
              {drill.axisLabel}
            </span>
          </div>
          <h3 className="mt-1 text-[15px] font-bold leading-tight tracking-[-0.015em] text-foreground">
            {drill.title}
          </h3>
        </div>
        <MatchGauge pct={drill.matchPct} />
      </div>

      {drill.meta.length > 0 && (
        <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.02em] text-muted-foreground">
          {drill.meta.join(" · ")}
        </p>
      )}

      <div className="mt-2.5 rounded-lg bg-secondary/50 px-3 py-2.5">
        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">
          Hvorfor denne
        </span>
        <p className="mt-1 text-[12px] leading-snug tracking-[-0.005em] text-foreground">
          {drill.why}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Link
          href={`/portal/drills/${drill.id}`}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          Åpne drill
        </Link>
      </div>
    </div>
  );
}

export function ForeslaDrillScreen({
  playerFirstName,
  analysedTestCount,
  suggestions,
}: ForeslaDrillScreenProps) {
  return (
    <div className="mx-auto max-w-[430px] space-y-5 px-4 pb-20 md:pb-8">
      <PlayerHero
        eyebrow="PlayerHQ · AI · Drill-anbefaling"
        titleLead="Drills tilpasset"
        titleItalic={playerFirstName}
        sub="Forslag matchet mot dine svakeste områder fra testdataene dine."
      />

      {/* Kilde-stripe */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-3">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </span>
        <p className="font-mono text-[10px] leading-snug tracking-[0.02em] text-muted-foreground">
          {analysedTestCount > 0 ? (
            <>
              Analysert <span className="font-bold text-foreground">{analysedTestCount} tester</span> i
              biblioteket for å finne hvor du mangler ferske målinger.
            </>
          ) : (
            "Ingen testdata å analysere ennå."
          )}
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div
          role="status"
          className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center"
        >
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Target size={22} strokeWidth={1.5} aria-hidden />
          </span>
          <h3 className="font-display text-base font-semibold tracking-tight">
            <em className="font-normal italic text-primary">Ingen forslag</em> ennå
          </h3>
          <p className="mt-2 max-w-xs text-[13px] text-muted-foreground">
            Ta noen tester så AI-en kan se hvor du står og foreslå drills som treffer
            der du har mest å hente.
          </p>
          <Link
            href="/portal/tren/tester"
            className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent transition-opacity hover:opacity-90"
          >
            Gå til tester
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2.5">
            {suggestions.map((d) => (
              <SuggestionCard key={d.id} drill={d} />
            ))}
          </div>
          <Link
            href="/portal/drills"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary transition-colors hover:bg-secondary"
          >
            Se hele drill-biblioteket
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </Link>
        </>
      )}
    </div>
  );
}
