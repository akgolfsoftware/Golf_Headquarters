"use client";

/**
 * PlayerHQ · Drill-detalj — presentasjonskomponent (props-drevet).
 *
 * Pixel-port av public/design-handover/preview/components-drill-detalj.html.
 * Mobile-first (≤640px = primær-fasit). Hele drillen på én flate:
 *   topbar (← Bibliotek + DRILL #N) · hero (akse-farge venstrekant + eyebrow
 *   med farget dot + tittel italic + meta-chips: varighet/trinn/CS) ·
 *   Beskrivelse · Media (media-faner + hatch-ramme) · Trinn (avkryssbare med
 *   live-progresjon) · Parametere (nøkkel/verdi-tabell) · Coach-notat (lime
 *   venstrekant + avatar) · sticky CTA-bar (bokmerke + «Legg til i plan»).
 *
 * Lokal state KUN for skjema (ingen DB/Prisma). DS-tokens kun — ingen
 * hardkodet hex (akse-farge via bg-pyr-*), ingen emoji.
 */

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  CalendarPlus,
  ChevronLeft,
  Check,
  Clock,
  List,
  Play,
  Target,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DrillAxis = "fys" | "tek" | "slag" | "spill" | "turn";

export type DrillParam = { key: string; value: string };

export type DrillMetaChip = {
  icon: "clock" | "list" | "target";
  text: string;
};

export type DrillDetaljData = {
  /** Tag øverst til høyre i topbar, f.eks. "DRILL #142". */
  topbarTag: string;
  axis: DrillAxis;
  /** Eyebrow-tekst ved farget dot, f.eks. "SLAG · INNSPILL". */
  eyebrow: string;
  /** Drill-navn (rendres italic i primary). */
  name: string;
  /** Hero-meta chips (varighet, trinn, CS). */
  meta: DrillMetaChip[];
  /** @deprecated Beholdt for bakoverkompatibilitet med page.tsx. Bruk meta[]. */
  csBadge?: string | null;
  description: string | null;
  /** Utførelse-trinn (avkryssbar liste). Tom array = skjul seksjon. */
  steps: { n: number; text: string }[];
  /** Coach-notat (vises med lime venstrekant + avatar). null = skjul seksjon. */
  coachNotes: string | null;
  /** Coach-initialer for avatar, f.eks. "AK". */
  coachInitials?: string;
  /** Media-elementer. Tom = vis placeholder. */
  media?: { kind: "video" | "foto"; label: string; url: string }[];
  /** @deprecated Bruk media[]. Beholdt for bakoverkompatibilitet. */
  mediaUrl?: string | null;
  params: DrillParam[];
  hrefs: {
    bibliotek: string;
    /** Mål for «Legg til i plan»-knappen (Workbench). */
    leggTilIPlan: string;
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

const META_ICON_MAP = {
  clock: Clock,
  list: List,
  target: Target,
} as const;

function SectionLabel({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <h2 className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {children}
      </h2>
      {right && (
        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-primary">
          {right}
        </span>
      )}
    </div>
  );
}

export function DrillDetalj({ data }: { data: DrillDetaljData }) {
  const mediaItems = data.media ?? (data.mediaUrl ? [{ kind: "video" as const, label: "Video", url: data.mediaUrl }] : []);
  const [activeMedia, setActiveMedia] = useState<string>(mediaItems[0]?.kind ?? "video");
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());

  const toggleStep = (n: number) => {
    setDoneSteps((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const doneCount = doneSteps.size;
  const totalSteps = data.steps.length;

  const activeMediaItem = mediaItems.find((m) => m.kind === activeMedia);

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
        {/* Meta chips */}
        {data.meta.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {data.meta.map((chip) => {
              const Icon = META_ICON_MAP[chip.icon];
              return (
                <span
                  key={chip.icon}
                  className="inline-flex items-center gap-[5px] rounded-full bg-secondary px-2.5 py-1 font-mono text-[9.5px] font-bold tracking-[0.04em] text-foreground"
                >
                  <Icon className="h-[11px] w-[11px] text-muted-foreground" strokeWidth={1.75} aria-hidden />
                  {chip.text}
                </span>
              );
            })}
          </div>
        )}
      </header>

      {/* Beskrivelse */}
      {data.description && (
        <section className="border-b border-border px-[18px] py-4">
          <SectionLabel>Beskrivelse</SectionLabel>
          <p className="text-[14px] leading-[1.6] tracking-[-0.005em] text-foreground">
            {data.description}
          </p>
        </section>
      )}

      {/* Media */}
      <section className="border-b border-border px-[18px] py-4">
        <SectionLabel>Media</SectionLabel>
        {/* Media tabs — vis kun hvis to eller flere medier */}
        {mediaItems.length > 1 && (
          <div className="mb-2.5 inline-flex gap-[3px] rounded-[10px] bg-secondary p-[3px]">
            {mediaItems.map((m) => (
              <button
                key={m.kind}
                type="button"
                onClick={() => setActiveMedia(m.kind)}
                className={cn(
                  "rounded-[8px] px-3 py-[6px] font-mono text-[10px] font-extrabold uppercase tracking-[0.06em] transition-colors",
                  activeMedia === m.kind
                    ? "bg-card text-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
        {/* Media frame */}
        <div
          className="relative flex h-[188px] items-center justify-center overflow-hidden rounded-xl border border-border"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(10,31,23,0.05) 0 12px, rgba(10,31,23,0.02) 12px 24px)",
            backgroundColor: "hsl(var(--background))",
          }}
        >
          {activeMediaItem ? (
            <span className="inline-flex items-center gap-[7px] rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              <Play className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} aria-hidden />
              {activeMediaItem.label.toUpperCase()} · AVSPILL
            </span>
          ) : (
            <span className="inline-flex items-center gap-[7px] rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              <Video className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} aria-hidden />
              Media kommer · coach laster opp
            </span>
          )}
        </div>
      </section>

      {/* Trinn — avkryssbar liste med live-progresjon */}
      {data.steps.length > 0 && (
        <section className="border-b border-border px-[18px] py-4">
          <SectionLabel
            right={
              totalSteps > 0
                ? `${doneCount} / ${totalSteps} fullført`
                : undefined
            }
          >
            Trinn
          </SectionLabel>
          <ol className="flex flex-col gap-2">
            {data.steps.map((s) => {
              const done = doneSteps.has(s.n);
              return (
                <li key={s.n}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={done}
                    onClick={() => toggleStep(s.n)}
                    className={cn(
                      "grid w-full grid-cols-[28px_1fr] items-start gap-3 rounded-xl border border-border bg-card p-2.5 pl-3 text-left transition-colors hover:bg-secondary",
                      done && "opacity-75",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-extrabold transition-colors",
                        done
                          ? "bg-primary text-accent"
                          : "border-2 border-border text-muted-foreground",
                      )}
                    >
                      {done ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                      ) : (
                        <span>{s.n}</span>
                      )}
                    </span>
                    <div>
                      <span
                        className={cn(
                          "block text-[13.5px] font-semibold leading-[1.3] tracking-[-0.005em] text-foreground",
                          done && "line-through text-muted-foreground",
                        )}
                      >
                        {s.text}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}

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
                <dt className="flex items-center border-r border-border bg-background px-3 py-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
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

      {/* Coach-notat — lime venstrekant + avatar */}
      {data.coachNotes && (
        <section className="border-b border-border px-[18px] py-4">
          <SectionLabel>Coach-notat</SectionLabel>
          <div className="flex gap-[11px] rounded-xl border border-border border-l-[3px] border-l-accent bg-card p-3.5">
            <span
              className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-primary font-display text-[11px] font-bold text-accent"
              aria-hidden
            >
              {data.coachInitials ?? "AK"}
            </span>
            <p className="text-[13px] leading-[1.5] tracking-[-0.005em] text-foreground">
              {data.coachNotes}
            </p>
          </div>
        </section>
      )}

      {/* Sticky CTA-bar */}
      <div className="sticky bottom-0 left-0 right-0 flex items-center gap-2 border-t border-border bg-gradient-to-t from-card via-card/95 to-transparent px-4 py-3 backdrop-blur supports-[backdrop-filter]:from-card/80">
        <button
          type="button"
          aria-label="Bokmerke drill"
          className="inline-flex h-[50px] w-[52px] shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <Bookmark className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
        <Link
          href={data.hrefs.leggTilIPlan}
          className="inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-accent shadow-[0_8px_20px_rgba(0,88,64,0.18)] transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <CalendarPlus className="h-[15px] w-[15px]" strokeWidth={2} aria-hidden />
          Legg til i plan
        </Link>
      </div>
    </article>
  );
}
