"use client";

/**
 * Onboarding-wizard — mobil-først chrome (430px).
 * Pixel-port av public/design-handover/playerhq/components-onboarding.html.
 *
 * Felles ramme rundt hvert wizard-steg:
 *   - Progress-prikker (done / now / todo) — én per steg, forutsigbar utfylling
 *   - Header: "← Tilbake" + "STEG N AV M" (mono-caps), jf. design-prompt
 *   - CTA-rad nederst (primær + valgfri sekundær/skip)
 *
 * Ren presentasjon — all steg-logikk og lagre-actions bor i onboarding-wizard.tsx.
 * Ingen hardkodet hex, kun DS-token-klasser. Ingen emoji — kun lucide-react.
 */

import { ArrowRight, ChevronLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Progress-prikker ────────────────────────────────────────────
export function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex gap-1" role="presentation">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const done = n < current;
        const now = n === current;
        return (
          <span
            key={n}
            className={cn(
              "h-[3px] flex-1 rounded-full",
              done && "bg-primary",
              now && "bg-accent",
              !done && !now && "bg-secondary",
            )}
          />
        );
      })}
    </div>
  );
}

// ── Steg-header ─────────────────────────────────────────────────
export function StepHeader({
  step,
  total,
  eyebrow,
  onBack,
  canGoBack,
  disabled,
}: {
  step: number;
  total: number;
  eyebrow: string;
  onBack: () => void;
  canGoBack: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      {canGoBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={disabled}
          className="-ml-1 inline-flex items-center gap-1 rounded-md px-1 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Tilbake
        </button>
      ) : (
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          {eyebrow}
        </span>
      )}
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        Steg {step} av {total}
      </span>
    </div>
  );
}

// ── Tittel + ingress ────────────────────────────────────────────
export function StepHeading({
  eyebrow,
  title,
  emphasis,
  titleAfter,
  deck,
}: {
  eyebrow?: string;
  title: string;
  emphasis?: string;
  titleAfter?: string;
  deck?: React.ReactNode;
}) {
  return (
    <div>
      {eyebrow && (
        <span className="mb-1.5 block font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
        {title}{" "}
        {emphasis && <em className="font-normal italic text-primary">{emphasis}</em>}
        {titleAfter}
      </h2>
      {deck && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{deck}</p>
      )}
    </div>
  );
}

// ── Primær CTA ──────────────────────────────────────────────────
export function PrimaryCta({
  children,
  onClick,
  disabled,
  icon: Icon = ArrowRight,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-[0_0_0_1px_hsl(var(--primary))] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
      <Icon className="h-[15px] w-[15px]" strokeWidth={2} aria-hidden />
    </button>
  );
}

// ── Sekundær / skip-lenke ───────────────────────────────────────
export function SecondaryLink({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-full items-center justify-center font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
    >
      {children}
    </button>
  );
}
