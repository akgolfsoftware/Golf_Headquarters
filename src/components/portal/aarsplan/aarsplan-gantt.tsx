"use client";

/**
 * Årsplan-Gantt — PlayerHQ · Trening · Årsplan (/portal/tren/aarsplan)
 *
 * Mobil-først (430px) editorial Gantt-port av
 * public/design-handover/playerhq/components-timeline.html.
 *
 * Hele kalenderåret jan–des: månedsskala med uke-merker, hovedperiode-spor med
 * faser farget per pyramide-akse (depth-gradient + rim-light som pyramiden),
 * NÅ-strek med lime-pin (kun inneværende år), turneringsmarkører under sporet.
 * Klikk en periode → /portal/tren/aarsplan/periode/[id]/rediger.
 *
 * Under Gantt-sporet: vertikal karriere-strøm (The Athletic-stil) med
 * periodene kronologisk — hver rad lenker til samme rediger-rute.
 *
 * Server-component-vennlig data inn; klient kun for hover/aktiv-markør og
 * NÅ-strek-posisjon. Ingen hardkodet hex — kun DS-tokens.
 */

import Link from "next/link";
import { useState } from "react";
import { Layers, Trophy, ChevronRight, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Typer ───────────────────────────────────────────────────────
export type GanttAxis = "fys" | "tek" | "turn";

export type GanttPeriod = {
  id: string;
  /** Pyramide-akse — styrer farge. GRUNN→fys, SPESIAL→tek, TURNERING→turn. */
  axis: GanttAxis;
  /** Fasenavn, f.eks. "Grunnperiode". */
  label: string;
  startDate: Date;
  endDate: Date;
  focus: string | null;
  weeklyVolMin: number | null;
  weeklyVolMax: number | null;
};

export type GanttTurnering = {
  id: string;
  navn: string;
  dato: Date;
  priority: "MAJOR" | "NORMAL" | "LOCAL";
};

type Props = {
  year: number;
  periods: GanttPeriod[];
  turneringer: GanttTurnering[];
  /** Minutter siden midnatt for "i dag" — kun brukt hvis year === inneværende år. */
  now: Date;
};

// ── Akse-styling (DS-tokens, depth-DNA fra pyramiden) ───────────
const AXIS_BAR: Record<GanttAxis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  turn: "bg-pyr-turn",
};

const AXIS_DOT: Record<GanttAxis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  turn: "bg-pyr-turn",
};

const AXIS_PILL: Record<GanttAxis, string> = {
  fys: "bg-[var(--color-pyr-fys-track)] text-[var(--pyr-fys)]",
  tek: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
  turn: "bg-[var(--color-pyr-turn-track)] text-destructive",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

// ── Hjelpere ────────────────────────────────────────────────────
function fmtKort(d: Date) {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

/** ISO-ukenummer (man–søn). */
function isoUke(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dag = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dag);
  const arStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - arStart.getTime()) / 86_400_000 + 1) / 7);
}

function ukeSpenn(a: Date, b: Date): number {
  return Math.max(1, isoUke(b) - isoUke(a) + 1);
}

// ── Hovedkomponent ──────────────────────────────────────────────
export function AarsplanGantt({ year, periods, turneringer, now }: Props) {
  const [aktivPin, setAktivPin] = useState<string | null>(null);

  const yearStart = new Date(year, 0, 1).getTime();
  const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime();
  const totalMs = yearEnd - yearStart;

  const pct = (d: Date) => {
    const ms = Math.max(0, Math.min(totalMs, d.getTime() - yearStart));
    return (ms / totalMs) * 100;
  };

  const erInnevarende = now.getFullYear() === year;
  const naPct = erInnevarende ? pct(now) : null;

  const sortert = [...periods].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const majorAntall = turneringer.filter((t) => t.priority === "MAJOR").length;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* HEADER */}
      <header className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />
            </span>
            Sesong {year} · {periods.length === 1 ? "1 periode" : `${periods.length} perioder`}
          </span>
          <h2 className="mt-1 font-display text-xl font-bold leading-tight tracking-[-0.02em] sm:text-[22px]">
            Periodisering{" "}
            <em
              className="not-italic font-normal text-muted-foreground"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontStyle: "italic" }}
            >
              · jan → des
            </em>
          </h2>
        </div>
        {/* stille telleverk — faktiske antall, ikke falske piller */}
        <div className="inline-flex items-center gap-3 self-start rounded-full border border-border bg-background px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          <span className="inline-flex items-baseline gap-1.5">
            <b className="text-[12px] font-extrabold tabular-nums text-foreground">{periods.length}</b>
            faser
          </span>
          <span className="h-3 w-px bg-border" aria-hidden />
          <span className="inline-flex items-baseline gap-1.5">
            <b className="text-[12px] font-extrabold tabular-nums text-foreground">{turneringer.length}</b>
            turn.
          </span>
          {majorAntall > 0 && (
            <>
              <span className="h-3 w-px bg-border" aria-hidden />
              <span className="inline-flex items-baseline gap-1.5">
                <b className="text-[12px] font-extrabold tabular-nums text-foreground">{majorAntall}</b>
                major
              </span>
            </>
          )}
        </div>
      </header>

      {/* GANTT-SPOR — horisontalt scrollbart på mobil */}
      <div className="overflow-x-auto px-4 py-5 sm:px-6">
        <div className="min-w-[560px]">
          {/* Månedsskala med uke-merker */}
          <div className="mb-2 flex border-b border-border">
            {MONTHS.map((m, i) => {
              const uke = isoUke(new Date(year, i, 1));
              const erKvartal = i % 3 === 0;
              return (
                <div
                  key={m}
                  className={cn(
                    "flex flex-1 flex-col justify-end px-1.5 pb-1.5",
                    i > 0 && (erKvartal ? "border-l border-border" : "border-l border-border/40"),
                  )}
                >
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-foreground">
                    {m}
                  </span>
                  <span className="mt-px font-mono text-[9px] font-medium tracking-[0.05em] text-muted-foreground/70 tabular-nums">
                    u{uke}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Hovedperiode-spor */}
          <div
            className="relative h-16 rounded-lg bg-secondary"
            style={{
              backgroundImage:
                "linear-gradient(to right, hsl(var(--border)/0.5) 1px, transparent 1px)",
              backgroundSize: `${100 / 12}% 100%`,
            }}
          >
            {sortert.length === 0 && (
              <div className="flex h-full items-center justify-center font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                Ingen perioder lagt til ennå
              </div>
            )}

            {sortert.map((p, idx) => {
              const left = pct(p.startDate);
              const right = pct(p.endDate);
              const width = Math.max(2, right - left);
              const uker = ukeSpenn(p.startDate, p.endDate);
              return (
                <Link
                  key={p.id}
                  href={`/portal/tren/aarsplan/periode/${p.id}/rediger`}
                  title={`${p.label} — uke ${isoUke(p.startDate)} → ${isoUke(p.endDate)}`}
                  className={cn(
                    "group absolute inset-y-1 overflow-hidden rounded-lg",
                    "transition-[filter,box-shadow] duration-150 hover:brightness-[1.04]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    AXIS_BAR[p.axis],
                  )}
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  {/* depth-overlay + rim-light (samme DNA som pyramiden) */}
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 14%, rgba(255,255,255,0) 36%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.08) 86%, rgba(0,0,0,0.18) 100%)",
                    }}
                    aria-hidden
                  />
                  <span
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
                    }}
                    aria-hidden
                  />
                  <span className="relative flex h-full items-center gap-2.5 px-3 text-background">
                    <span
                      className="font-display text-[22px] font-normal italic leading-none tabular-nums text-background/70"
                      aria-hidden
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-display text-[13px] font-semibold leading-tight tracking-[-0.01em] text-background [text-shadow:0_1px_2px_rgba(0,0,0,0.12)]">
                        {p.label}
                      </span>
                      <span className="truncate font-mono text-[9.5px] font-medium tracking-[0.02em] text-background/85 tabular-nums">
                        Uke {isoUke(p.startDate)} → {isoUke(p.endDate)} · {uker} uker
                      </span>
                    </span>
                  </span>
                </Link>
              );
            })}

            {/* NÅ-strek */}
            {naPct !== null && (
              <div
                className="pointer-events-none absolute -inset-y-2 z-10 w-0.5 -translate-x-1/2 bg-accent"
                style={{ left: `${naPct}%` }}
                aria-hidden
              >
                <span className="absolute -top-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.7)]" />
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-primary">
                  Uke {isoUke(now)} · i dag
                </span>
              </div>
            )}
          </div>

          {/* Turneringsmarkører */}
          {turneringer.length > 0 && (
            <div className="relative mt-7 h-9">
              <div className="absolute -top-5 left-0 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                Turneringer
              </div>
              {turneringer.map((t) => {
                const left = pct(t.dato);
                const aktiv = aktivPin === t.id;
                const erMajor = t.priority === "MAJOR";
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAktivPin(aktiv ? null : t.id)}
                    className="absolute top-0 flex -translate-x-1/2 flex-col items-center focus-visible:outline-none"
                    style={{ left: `${left}%` }}
                    aria-label={`Turnering ${t.navn}, ${fmtKort(t.dato)}`}
                    aria-expanded={aktiv}
                  >
                    <span
                      className={cn(
                        "rounded-full border-2 border-card transition-transform hover:scale-125",
                        erMajor
                          ? "h-3 w-3 bg-accent shadow-[0_0_0_2px_hsl(var(--destructive)),0_0_0_4px_var(--color-pyr-turn-track)]"
                          : "h-2.5 w-2.5 bg-pyr-turn shadow-[0_0_0_1px_var(--color-pyr-turn-track)]",
                      )}
                    />
                    <span
                      className={cn(
                        "absolute top-4 whitespace-nowrap rounded border border-border bg-card px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-[0.05em] text-foreground transition-opacity",
                        aktiv || erMajor ? "opacity-100" : "opacity-0",
                      )}
                    >
                      {t.navn}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Akse-forklaring */}
      {sortert.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border bg-background px-4 py-3 sm:px-6">
          {(["fys", "tek", "turn"] as GanttAxis[])
            .filter((a) => sortert.some((p) => p.axis === a))
            .map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
              >
                <span className={cn("h-2.5 w-2.5 rounded-sm", AXIS_DOT[a])} aria-hidden />
                {a === "fys" ? "Grunnperiode" : a === "tek" ? "Spesialisering" : "Turneringsperiode"}
              </span>
            ))}
          <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
            Major
          </span>
        </div>
      )}

      {/* VERTIKAL KARRIERE-STRØM — periodene kronologisk */}
      <div className="border-t border-border px-4 py-4 sm:px-6">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
          <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          Periodestrøm
          <span className="ml-1 font-bold text-muted-foreground">{sortert.length}</span>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>

        {sortert.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">
            Ingen perioder ennå — legg til en under for å fylle årshjulet.
          </p>
        ) : (
          <ol className="relative">
            {/* vertikal akse-linje */}
            <span className="pointer-events-none absolute bottom-3 left-[15px] top-3 w-px bg-border" aria-hidden />
            {sortert.map((p, idx) => (
              <li key={p.id}>
                <Link
                  href={`/portal/tren/aarsplan/periode/${p.id}/rediger`}
                  className="group grid grid-cols-[32px_1fr] items-start gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                >
                  {/* markør */}
                  <span className="relative z-10 mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-card shadow-[0_0_0_1px_hsl(var(--border))]">
                    <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-full text-background", AXIS_BAR[p.axis])}>
                      <span className="font-display text-[11px] font-bold tabular-nums">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </span>
                  </span>

                  {/* tekst */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-display text-[15px] font-bold leading-tight tracking-[-0.015em] text-foreground">
                        {p.label}
                      </span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-px font-mono text-[8.5px] font-extrabold uppercase tracking-[0.08em]",
                          AXIS_PILL[p.axis],
                        )}
                      >
                        {p.axis === "fys" ? "Grunn" : p.axis === "tek" ? "Spesial" : "Turnering"}
                      </span>
                      <ChevronRight
                        className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </div>
                    {p.focus && (
                      <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{p.focus}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 font-mono text-[10px] font-semibold tracking-[0.02em] text-muted-foreground tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Layers className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden />
                        {fmtKort(p.startDate)} – {fmtKort(p.endDate)}
                      </span>
                      <span className="text-border" aria-hidden>·</span>
                      <span>{ukeSpenn(p.startDate, p.endDate)} uker</span>
                      {p.weeklyVolMin != null && (
                        <>
                          <span className="text-border" aria-hidden>·</span>
                          <span>
                            {p.weeklyVolMin}
                            {p.weeklyVolMax != null ? `–${p.weeklyVolMax}` : ""} min/uke
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Turneringsmarkør-detalj (når valgt) — lenke til turneringsplan */}
      {aktivPin && (
        <div className="border-t border-border bg-secondary/40 px-4 py-3 sm:px-6">
          {turneringer
            .filter((t) => t.id === aktivPin)
            .map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <Trophy className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{t.navn}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground tabular-nums">
                    {t.dato.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <Link
                  href="/portal/tren/turneringer"
                  className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-primary hover:underline"
                >
                  Se plan
                </Link>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
