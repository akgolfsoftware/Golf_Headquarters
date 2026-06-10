"use client";

/**
 * Onboarding-wizard — felles chrome (mobil-først, 430px).
 * Visuelt skall fra fersk fasit: public/design-handover/AK Golf HQ Design
 * System/playerhq-app/ph-auth.jsx → AOnboarding (StepsRail + AHead + CTA-rad).
 *
 *   - Steps-rail: tynne baner — fullført = lime, aktiv = grønn, gjenstår = border
 *   - AHead-typografi: eyebrow (mono-caps) → 30px display-tittel → ingress
 *   - CTA-rad: valgfri spøkelses-tilbakeknapp + primær (52px, display-font, pil)
 *
 * Ren presentasjon — all steg-logikk og lagre-actions bor i wizardene.
 * Ingen hardkodet hex, kun DS-token-klasser. Ingen emoji — kun lucide-react.
 */

import { ArrowLeft, ArrowRight, ChevronLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Steps-rail (fasit: done=accent, aktiv=primary, gjenstår=border) ──
export function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex gap-1.5" role="presentation">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const done = n < current;
        const now = n === current;
        return (
          <span
            key={n}
            className={cn(
              "h-1 flex-1 rounded-full",
              done && "bg-accent",
              now && "bg-primary",
              !done && !now && "bg-border",
            )}
          />
        );
      })}
    </div>
  );
}

// ── Steg-header (brukes av forelder-wizarden) ───────────────────
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

// ── Tittel + ingress (fasit AHead) ──────────────────────────────
export function StepHeading({
  eyebrow,
  title,
  emphasis,
  titleAfter,
  deck,
  center,
}: {
  eyebrow?: string;
  title: string;
  emphasis?: string;
  titleAfter?: string;
  deck?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={cn(center && "text-center")}>
      {eyebrow && (
        <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "font-display text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground [text-wrap:balance]",
          eyebrow && "mt-2",
        )}
      >
        {title}{" "}
        {emphasis && <em className="font-normal italic text-primary">{emphasis}</em>}
        {titleAfter}
      </h2>
      {deck && (
        <p className="mt-3 text-[14.5px] leading-[1.55] text-muted-foreground">{deck}</p>
      )}
    </div>
  );
}

// ── CTA-rad: valgfri spøkelses-tilbake + primær (fasit .btn-primary .btn-lg) ──
export function PrimaryCta({
  children,
  onClick,
  disabled,
  icon: Icon = ArrowRight,
  onBack,
  backDisabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  /** Vis spøkelses-tilbakeknapp til venstre (fasitens CTA-rad). */
  onBack?: () => void;
  backDisabled?: boolean;
}) {
  return (
    <div className="flex gap-2.5">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled}
          aria-label="Tilbake"
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-display text-[15px] font-semibold tracking-[-0.005em] text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
      </button>
    </div>
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
