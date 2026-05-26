"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";

type Props = {
  sessionId: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  durationMin: number;
  repsPlanned: number;
  coachTip?: {
    text: string;
    author: string;
    initials: string;
    relativeTime: string;
  } | null;
  /** "1 / 4 · forberedelse" — viser progress i top */
  step?: { current: number; total: number; label: string };
  /** Hvor "Start"-knappen lenker. Default: live-aktiv. */
  startHref?: string;
  /** Initielt åpen — for demo/preview-kontekst. */
  defaultOpen?: boolean;
};

/**
 * LiveIntroModal — fullscreen intro før en live-økt starter.
 * Mørk bakgrunn med radial accent, coach-tip og stor CTA.
 * Designet etter wireframe/design-package/project/screens/03-modal-live-intro.html
 */
export function LiveIntroModal({
  sessionId,
  eyebrow,
  title,
  subtitle,
  durationMin,
  repsPlanned,
  coachTip,
  step = { current: 1, total: 4, label: "forberedelse" },
  startHref,
  defaultOpen = true,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const progressPct = Math.round((step.current / step.total) * 100);
  const href = startHref ?? `/portal/live/${sessionId}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Intro · ${title}`}
      className="fixed inset-0 z-50 grid grid-rows-[56px_1fr_auto] overflow-hidden bg-[#0A1F18] text-white"
    >
      {/* Radial accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[720px] -translate-x-1/2 -translate-y-[55%] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(209,248,67,0.07) 0%, rgba(209,248,67,0) 65%)",
        }}
      />

      {/* Top bar */}
      <div className="safe-top relative z-10 flex items-center gap-4 px-4 sm:px-6">
        <div className="flex flex-1 items-center gap-4">
          <div className="h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #D1F843, #C2EE2F)",
                boxShadow: "0 0 12px rgba(209,248,67,0.35)",
              }}
            />
          </div>
          <div className="font-sans text-[12px] text-white/65">
            <b className="font-semibold text-white/95">
              {step.current} / {step.total}
            </b>{" "}
            · {step.label}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Lukk"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Center */}
      <div className="relative z-0 flex flex-col items-center justify-center px-6 text-center">
        <div className="inline-flex items-center gap-2.5 font-sans text-[12px] font-semibold uppercase tracking-[0.10em] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          {eyebrow}
        </div>
        <h1 className="mt-7 font-display text-[44px] font-bold leading-[0.95] -tracking-[0.035em] text-white sm:text-[64px] md:text-[88px]">
          {title}
        </h1>
        <div className="mt-2.5 font-sans text-[16px] leading-tight text-white/75 sm:text-[20px] md:text-[24px]">
          {subtitle}
        </div>

        <div className="mt-8 inline-flex items-center gap-8 rounded-full border border-white/10 bg-white/[0.04] px-6 py-4">
          <div className="inline-flex items-baseline gap-2 font-sans text-[16px] text-white/65">
            ~
            <b className="font-mono text-[18px] font-semibold text-white tabular-nums">
              {durationMin} min
            </b>
          </div>
          <span className="h-4 w-px bg-white/15" />
          <div className="inline-flex items-baseline gap-2 font-sans text-[16px] text-white/65">
            <b className="font-mono text-[18px] font-semibold text-white tabular-nums">
              {repsPlanned} reps
            </b>
            planlagt
          </div>
        </div>

        {coachTip && (
          <div className="mt-10 grid w-full max-w-[480px] grid-cols-[36px_1fr] gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-left">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-accent font-sans text-[13px] font-bold text-accent-foreground">
              {coachTip.initials}
            </div>
            <div>
              <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Coach-tip
              </div>
              <div className="mt-1.5 font-display text-[15px] italic leading-[1.5] text-white/95 -tracking-[0.005em]">
                «{coachTip.text}»
              </div>
              <div className="mt-2 font-sans text-[12px] text-white/50">
                — {coachTip.author} · {coachTip.relativeTime}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="relative z-10 flex items-center justify-center px-4 pb-safe pt-4 sm:px-6 sm:pb-8">
        <Link
          href={href}
          className="inline-flex h-16 w-full max-w-[320px] items-center justify-center gap-2 rounded-2xl bg-accent font-sans text-[18px] font-semibold text-accent-foreground transition-transform hover:opacity-95 active:scale-[0.98]"
          style={{
            boxShadow:
              "0 0 0 1px rgba(209,248,67,0.5), 0 16px 32px rgba(209,248,67,0.18)",
          }}
        >
          Start økt
          <ArrowRight className="h-5 w-5" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
