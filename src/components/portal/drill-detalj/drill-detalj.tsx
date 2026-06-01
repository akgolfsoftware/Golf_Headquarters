/**
 * PlayerHQ · Drill-detalj — presentasjonskomponent.
 *
 * Pixel-port av public/design-handover/playerhq/components-drill-detalj.html,
 * mobile-first (430px). Hele drillen på én flate:
 *   topbar (← Bibliotek + drill-tag) · hero (akse-farge venstrekant + tittel
 *   italic + meta-chips) · beskrivelse · media-veksler · numerisk trinn-liste ·
 *   parameter-tabell · coach-notat (lime venstrekant).
 *
 * Server Component. All data kommer fra loadDrillDetalj — ingen fabrikerte tall.
 * DS-tokens kun (bg-pyr-*, var(--color-pyr-*-track), var(--pyr-*)). Ingen
 * hardkodet hex, ingen emoji.
 */

import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  ListChecks,
  Play,
  Target,
  type LucideIcon,
} from "lucide-react";
import { safeUrl } from "@/lib/security/safe-url";
import { cn } from "@/lib/utils";
import { MediaVeksler } from "./media-veksler";
import type { Axis, DrillDetaljData } from "@/lib/portal-drilldetalj/drill-detalj-data";

/* Akse-farge til venstrekant (hero + chip-dot). */
const AXIS_BAR: Record<Axis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

const META_ICON: Record<DrillDetaljData["meta"][number]["icon"], LucideIcon> = {
  clock: Clock,
  list: ListChecks,
  target: Target,
  zap: Target,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </h2>
  );
}

export function DrillDetalj({ data }: { data: DrillDetaljData }) {
  const hasSingleMedia = data.media.length === 1;
  const singleUrl = hasSingleMedia ? safeUrl(data.media[0].url) : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Topbar */}
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <Link
          href="/portal/drills"
          className="inline-flex items-center gap-1.5 rounded-md font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Bibliotek
        </Link>
        <span className="ml-auto font-mono text-[11px] font-bold uppercase tracking-[0.02em] text-foreground">
          {data.topbarTag}
        </span>
      </div>

      {/* Hero — akse-farge venstrekant (ikke flat-grønn flate) */}
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
        {data.meta.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {data.meta.map((m, i) => {
              const Icon = META_ICON[m.icon];
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 font-mono text-[9.5px] font-bold tracking-[0.04em] text-foreground"
                >
                  <Icon className="h-[11px] w-[11px] text-muted-foreground" strokeWidth={1.75} aria-hidden />
                  {m.text}
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
          <p className="text-sm leading-relaxed tracking-[-0.005em] text-foreground">
            {data.description}
          </p>
        </section>
      )}

      {/* Media */}
      <section className="border-b border-border px-[18px] py-4">
        <SectionLabel>Media</SectionLabel>
        {data.media.length > 1 ? (
          <MediaVeksler media={data.media} />
        ) : (
          <div className="relative flex h-[188px] items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary/40">
            {hasSingleMedia && data.media[0].kind === "video" && singleUrl ? (
              <video src={singleUrl} controls className="h-full w-full object-cover" />
            ) : hasSingleMedia && data.media[0].kind === "foto" && singleUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={singleUrl}
                alt={`Foto for ${data.name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
                <Play className="h-3 w-3 text-primary" strokeWidth={2} aria-hidden />
                Media kommer · coach laster opp
              </span>
            )}
          </div>
        )}
      </section>

      {/* Trinn — utledet (skjules om ingen) */}
      {data.steps.length > 0 && (
        <section className="border-b border-border px-[18px] py-4">
          <SectionLabel>Trinn</SectionLabel>
          <ol className="flex flex-col gap-2">
            {data.steps.map((s) => (
              <li
                key={s.n}
                className="grid grid-cols-[28px_1fr] items-start gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-border font-mono text-xs font-extrabold text-muted-foreground">
                  {s.n}
                </span>
                <span className="pt-1 text-[13.5px] font-medium leading-[1.3] tracking-[-0.005em] text-foreground">
                  {s.text}
                </span>
              </li>
            ))}
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

      {/* Coach-notat — lime venstrekant */}
      {data.coachNotes && (
        <section className="px-[18px] py-4">
          <SectionLabel>Coach-notat</SectionLabel>
          <div className="rounded-xl border border-border border-l-[3px] border-l-accent bg-card px-3.5 py-3">
            <p className="text-[13px] leading-relaxed tracking-[-0.005em] text-foreground">
              {data.coachNotes}
            </p>
          </div>
        </section>
      )}
    </article>
  );
}
