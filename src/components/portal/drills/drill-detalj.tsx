"use client";

/**
 * PlayerHQ · Drill-detalj — presentasjonskomponent (props-drevet).
 *
 * Pixel-port av public/design-handover/_screens/pl-drill.png, mobile-first
 * (≤640px = primær-fasit). Hele drillen på én flate:
 *   topbar (← Bibliotek + DRILL) · hero (akse-farge venstrekant + eyebrow med
 *   farget dot + tittel italic + CS-badge) · Beskrivelse · Media (tom-ramme
 *   med diagonal-hatch + «Media kommer»-pille) · Parametere (nøkkel/verdi-tabell)
 *   · CS-score-input (valgfri) · Kommentar-textarea (valgfri) · Registrer-knapp
 *   · feedback-chips («Hva synes du om denne drillen?») · sticky bunn-bar
 *   (Start økt med denne drill · Legg til kalender · Del).
 *
 * Lokal state KUN for skjema/chips (ingen DB/Prisma). DS-tokens kun — ingen
 * hardkodet hex (akse-farge via bg-pyr-*), ingen emoji.
 */

import { useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  Play,
  PlayCircle,
  Share2,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DrillAxis = "fys" | "tek" | "slag" | "spill" | "turn";

export type DrillParam = { key: string; value: string };

export type DrillDetaljData = {
  /** Tag øverst til høyre i topbar, f.eks. "DRILL". */
  topbarTag: string;
  axis: DrillAxis;
  /** Eyebrow-tekst ved farget dot, f.eks. "SLAG". */
  eyebrow: string;
  /** Drill-navn (rendres italic i primary). */
  name: string;
  /** CS-badge i hero, f.eks. "CS 45". null = skjul. */
  csBadge: string | null;
  description: string | null;
  /** Media-URL hvis lastet opp. null/undefined = tom-tilstand med «Media kommer». */
  mediaUrl?: string | null;
  params: DrillParam[];
  /** Valgbare feedback-etiketter (chips). Første = forhåndsvalgt i demo. */
  feedbackOptions: string[];
  hrefs: {
    bibliotek: string;
    startOkt: string;
  };
};

/* Akse-farge → venstrekant + dot (token-basert, ingen hex). */
const AXIS_BAR: Record<DrillAxis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </h2>
  );
}

export function DrillDetalj({ data }: { data: DrillDetaljData }) {
  const [csScore, setCsScore] = useState("");
  const [kommentar, setKommentar] = useState("");
  const [valgtFeedback, setValgtFeedback] = useState<string | null>(
    data.feedbackOptions[0] ?? null,
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card pb-[84px] sm:pb-0">
      {/* Topbar */}
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <Link
          href={data.hrefs.bibliotek}
          className="inline-flex items-center gap-1.5 rounded-md font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Bibliotek
        </Link>
        <span className="ml-auto font-mono text-[11px] font-bold uppercase tracking-[0.02em] text-foreground">
          {data.topbarTag}
        </span>
      </div>

      {/* Hero — akse-farge venstrekant */}
      <header className="relative border-b border-border px-[18px] pb-4 pt-[18px]">
        <span
          className={cn("absolute bottom-0 left-0 top-0 w-[3px]", AXIS_BAR[data.axis])}
          aria-hidden
        />
        <span className="inline-flex items-center gap-[7px] font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
          <span className={cn("h-2 w-2 rounded-full", AXIS_BAR[data.axis])} aria-hidden />
          {data.eyebrow}
        </span>
        <h1 className="font-display mt-2 text-[22px] font-bold leading-[1.15] tracking-[-0.02em] text-foreground">
          <em className="font-normal italic text-primary">{data.name}</em>
        </h1>
        {data.csBadge && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 font-mono text-[9.5px] font-bold tracking-[0.04em] text-foreground">
              <Target className="h-[11px] w-[11px] text-muted-foreground" strokeWidth={1.75} aria-hidden />
              {data.csBadge}
            </span>
          </div>
        )}
      </header>

      {/* Beskrivelse */}
      {data.description && (
        <section className="border-b border-border px-[18px] py-4">
          <SectionLabel>Beskrivelse</SectionLabel>
          <p className="text-sm leading-relaxed tracking-[-0.005em] text-foreground">
            {data.description}
          </p>
        </section>
      )}

      {/* Media — tom-ramme (diagonal-hatch) med «Media kommer»-pille */}
      <section className="border-b border-border px-[18px] py-4">
        <SectionLabel>Media</SectionLabel>
        <div
          className="relative flex h-[188px] items-center justify-center overflow-hidden rounded-xl border border-border"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, hsl(var(--foreground) / 0.05) 0 12px, hsl(var(--foreground) / 0.02) 12px 24px)",
            backgroundColor: "hsl(var(--secondary) / 0.4)",
          }}
        >
          {data.mediaUrl ? (
            <video src={data.mediaUrl} controls className="h-full w-full object-cover" />
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              <PlayCircle className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} aria-hidden />
              Media kommer · coach laster opp
            </span>
          )}
        </div>
      </section>

      {/* Parametere */}
      {data.params.length > 0 && (
        <section className="border-b border-border px-[18px] py-4">
          <SectionLabel>Parametere</SectionLabel>
          <dl className="overflow-hidden rounded-xl border border-border">
            {data.params.map((p, i) => (
              <div
                key={p.key}
                className={cn(
                  "grid grid-cols-[96px_1fr]",
                  i < data.params.length - 1 && "border-b border-border",
                )}
              >
                <dt className="flex items-center border-r border-border bg-secondary/40 px-3 py-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
                  {p.key}
                </dt>
                <dd className="px-3 py-2.5 font-mono text-[13px] font-bold tabular-nums tracking-[-0.005em] text-foreground">
                  {p.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* CS-score (valgfri) */}
      <section className="border-b border-border px-[18px] py-4">
        <SectionLabel>CS-score (valgfri)</SectionLabel>
        <input
          type="text"
          inputMode="decimal"
          value={csScore}
          onChange={(e) => setCsScore(e.target.value)}
          placeholder="f.eks. 8'"
          className="flex h-11 w-full rounded-md border border-input bg-secondary/40 px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        />
      </section>

      {/* Kommentar (valgfri) */}
      <section className="border-b border-border px-[18px] py-4">
        <SectionLabel>Kommentar (valgfri)</SectionLabel>
        <textarea
          value={kommentar}
          onChange={(e) => setKommentar(e.target.value)}
          placeholder="Hva gikk bra? Hva kan bli bedre?"
          rows={3}
          className="flex w-full resize-none rounded-md border border-input bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        />
      </section>

      {/* Registrer */}
      <section className="border-b border-border px-[18px] py-4">
        <button
          type="button"
          className="font-display inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-bold text-accent transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <CheckCircle2 className="h-4 w-4" strokeWidth={2} aria-hidden />
          Registrer
        </button>
      </section>

      {/* Feedback */}
      <section className="px-[18px] py-4">
        <SectionLabel>Hva synes du om denne drillen?</SectionLabel>
        <p className="mb-3 text-[13px] leading-relaxed text-muted-foreground">
          Din tilbakemelding hjelper Anders å velge riktige drills for deg.
        </p>
        <div className="flex flex-wrap gap-2">
          {data.feedbackOptions.map((opt) => {
            const active = valgtFeedback === opt;
            return (
              <button
                key={opt}
                type="button"
                aria-pressed={active}
                onClick={() => setValgtFeedback(active ? null : opt)}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/70",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </section>

      {/* Sticky bunn-bar */}
      <div className="sticky bottom-0 left-0 right-0 flex items-center gap-2.5 border-t border-border bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <Link
          href={data.hrefs.startOkt}
          className="font-display inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-4 text-[13px] font-bold text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Play className="h-4 w-4" strokeWidth={2} aria-hidden />
          Start økt med denne drill
        </Link>
        <button
          type="button"
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-card px-3.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <CalendarPlus className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
          Legg til kalender
        </button>
        <button
          type="button"
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-card px-3.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <Share2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
          Del
        </button>
      </div>
    </article>
  );
}
