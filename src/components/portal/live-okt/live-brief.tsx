/**
 * PlayerHQ · Live-økt (preview) — Brief / økt-intro (skjerm 1).
 *
 * Fasit: public/design-handover/_screens/pl-live-brief.png.
 * Fullscreen forest-flate (#005840 = --primary), cream tekst (--background),
 * lime accent (--accent). Topbar (tilbake · ØKT-INTRO · lukk), lime eyebrow,
 * display-tittel, meta-rad, PLAN-liste, MÅL FOR ØKTA, lime START-pill.
 *
 * Presentasjonelt (server-render). Navigasjon via <Link> til preview-ruter.
 * Mobil = primær fasit. Desktop = samme UI sentrert i smal kolonne (ingen sidebar).
 */

import Link from "next/link";
import { ArrowLeft, X, Zap } from "lucide-react";
import { type LiveSessionDemo, axisColor, totalPlannedReps } from "./types";

export function LiveBrief({
  data,
  backHref,
  closeHref,
  startHref,
}: {
  data: LiveSessionDemo;
  /** Tilbake-pil (venstre). */
  backHref: string;
  /** Lukk (høyre). */
  closeHref: string;
  /** Start økt → aktiv-skjerm. */
  startHref: string;
}) {
  const totalReps = totalPlannedReps(data);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-primary text-background"
      style={{ isolation: "isolate" }}
    >
      {/* topbar */}
      <header
        className="flex-shrink-0"
        style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}
      >
        <div className="mx-auto flex h-[60px] w-full max-w-[520px] items-center justify-between gap-3 px-4">
          <Link
            href={backHref}
            aria-label="Tilbake"
            className="grid h-11 w-11 place-items-center rounded-full border border-background/15 bg-background/5 text-background/70"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </Link>
          <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-background/80">
            Økt-intro
          </span>
          <Link
            href={closeHref}
            aria-label="Lukk"
            className="grid h-11 w-11 place-items-center rounded-full border border-background/15 bg-background/5 text-background/70"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </header>

      {/* scroll-innhold */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden" style={{ minHeight: 0 }}>
        <div className="mx-auto w-full max-w-[520px]">
          {/* hero */}
          <div className="px-5 pb-2 pt-5">
            <div className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-accent">
              {data.eyebrow}
            </div>
            <h1 className="mt-3 font-display text-[32px] font-bold leading-[1.05] -tracking-[0.02em] text-background">
              {data.title}
            </h1>
            <div className="mt-4 font-mono text-[14px] font-semibold tabular-nums text-background/65">
              {data.durationMin} min · {data.drills.length}{" "}
              {data.drills.length === 1 ? "drill" : "drills"}
              {totalReps > 0 ? ` · ${totalReps} reps planlagt` : ""}
            </div>
          </div>

          {/* PLAN */}
          <div className="px-5 pb-2 pt-6">
            <SectionHead label="Plan" />
            <ol className="flex flex-col gap-2.5">
              {data.drills.map((d) => (
                <li
                  key={d.index}
                  className="flex items-center gap-3 rounded-xl bg-background/[0.07] px-4 py-4"
                >
                  <span
                    className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg font-display text-[18px] font-bold text-primary"
                    style={{ background: axisColor(d.axis) }}
                  >
                    {d.index}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-background/55">
                      {d.axis}
                    </div>
                    <div className="truncate font-display text-[16px] font-semibold -tracking-[0.01em] text-background">
                      {d.name}
                    </div>
                    <div className="mt-0.5 font-mono text-[12px] font-semibold tabular-nums text-background/55">
                      {d.metaLabel}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* MÅL */}
          {data.goals.length > 0 && (
            <div className="px-5 pb-2 pt-6">
              <SectionHead label="Mål for økta" />
              <ul className="flex flex-col gap-2.5">
                {data.goals.map((line, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-[15px] leading-relaxed text-background/85"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent"
                      aria-hidden
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="h-6" />
        </div>
      </div>

      {/* footer CTA */}
      <footer
        className="flex-shrink-0"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
          paddingTop: 16,
          borderTop: "1px solid hsl(var(--background) / 0.1)",
          background: "hsl(var(--primary))",
        }}
      >
        <div className="mx-auto w-full max-w-[520px] px-5">
          <Link
            href={startHref}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent font-mono text-[14px] font-extrabold uppercase tracking-[0.08em] text-accent-foreground"
            style={{ boxShadow: "0 4px 16px hsl(var(--accent) / 0.28)" }}
          >
            Start økt
            <Zap className="h-4 w-4 fill-current" strokeWidth={2} aria-hidden />
          </Link>
          <div className="mt-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-background/45">
            Spar batteri · wake-lock på
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ label }: { label: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-background/60">
        {label}
      </span>
      <span className="h-px flex-1 bg-background/12" aria-hidden />
    </div>
  );
}
