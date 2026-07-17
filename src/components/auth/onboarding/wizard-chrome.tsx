"use client";

/**
 * Onboarding-wizard — felles chrome (mobil-først, 430px kolonne).
 * v2-port 16. juli 2026 (retning C «Presis»): restylet IN PLACE til
 * v2-tokens (T fra @/lib/v2/tokens) — samme eksporterte navn og
 * prop-signaturer som før, så wizard-filene (onboarding-wizard.tsx og
 * forelder-wizard.tsx) er UENDRET. Steg-indikatoren følger `Veiviser`-idiomet
 * fra src/components/v2/skjema.tsx visuelt (lime-sirkler, hake på fullført),
 * men beholder ProgressDots-API-et (total/current).
 *
 * Ny eksport: `VeiviserFlate` — v2-flaten (lys, jf. B28 «PlayerHQ alltid lys»)
 * som sidene monterer rundt wizardene i stedet for gammel bg-background/
 * OnboardingShell. Ren presentasjon — all steg-logikk og lagre-actions bor
 * uendret i wizardene. Ingen rå hex, ingen emoji — kun lucide-react.
 */

import { Fragment, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, type LucideIcon } from "lucide-react";
import { T } from "@/lib/v2/tokens";
// LogoAK fra v2-kjernen; importen trigger også core.tsx sin ensureStyles
// (v2-press/v2-focus-klassene som brukes under).
import { LogoAK } from "@/components/v2/core";

// ── v2-flate for veivisere (lys — B28: PlayerHQ alltid lys) ──────
// Speiler V2Shell-oppførselen for ikke-AgencyOS-flater: låser data-v2-tema
// til "light" så --v2-*-variablene resolver lys skala, uansett cookie.
export function VeiviserFlate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (document.documentElement.getAttribute("data-v2-tema") !== "light") {
      document.documentElement.setAttribute("data-v2-tema", "light");
      window.dispatchEvent(new Event("ak-v2-tema"));
    }
  }, []);
  return (
    <main
      className="light"
      style={{
        minHeight: "100svh",
        background: `radial-gradient(900px 380px at 50% -10%, var(--v2-vignett), transparent 62%), ${T.bg}`,
        color: T.fg,
        fontFamily: T.ui,
        colorScheme: "light",
        paddingBottom: 28,
      }}
    >
      <div style={{ margin: "0 auto", maxWidth: 430, padding: "18px 16px 0" }}>
        <LogoAK size={24} />
      </div>
      {children}
    </main>
  );
}

// ── Steg-indikator (Veiviser-idiom: lime-sirkler, hake på fullført) ──
export function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center" }} role="presentation">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const done = n < current;
        const now = n === current;
        return (
          <Fragment key={n}>
            {i > 0 && (
              <span
                style={{
                  flex: 1,
                  height: 2,
                  borderRadius: 2,
                  background:
                    done || now
                      ? `color-mix(in srgb, ${T.lime} 45%, transparent)`
                      : T.track,
                  margin: "0 6px",
                }}
              />
            )}
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 9999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: T.mono,
                fontSize: 11,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                flex: "none",
                background: done ? T.lime : now ? "transparent" : T.panel2,
                border: `2px solid ${done || now ? T.lime : T.borderS}`,
                color: done ? T.onLime : now ? T.lime : T.mut,
              }}
            >
              {done ? <Check size={13} strokeWidth={2.5} aria-hidden /> : n}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}

// ── Steg-header (brukes av forelder-wizarden) ───────────────────
const CAPS: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: T.mut,
};

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
    <div
      style={{
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      {canGoBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={disabled}
          className="v2-press v2-focus"
          style={{
            ...CAPS,
            appearance: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "transparent",
            border: "none",
            borderRadius: 8,
            padding: "4px 4px 4px 0",
            marginLeft: -2,
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <ChevronLeft size={13} strokeWidth={2} aria-hidden />
          Tilbake
        </button>
      ) : (
        <span style={CAPS}>{eyebrow}</span>
      )}
      <span style={{ ...CAPS, fontVariantNumeric: "tabular-nums" }}>
        Steg {step} av {total}
      </span>
    </div>
  );
}

// ── Tittel + ingress ─────────────────────────────────────────────
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
    <div style={center ? { textAlign: "center" } : undefined}>
      {eyebrow && <span style={{ ...CAPS, display: "block" }}>{eyebrow}</span>}
      <h2
        style={{
          fontFamily: T.disp,
          fontSize: 30,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          color: T.fg,
          margin: 0,
          marginTop: eyebrow ? 8 : 0,
          textWrap: "balance",
        }}
      >
        {title}{" "}
        {emphasis && (
          <em style={{ fontStyle: "italic", fontWeight: 400, color: T.lime }}>
            {emphasis}
          </em>
        )}
        {titleAfter}
      </h2>
      {deck && (
        <p
          style={{
            marginTop: 12,
            marginBottom: 0,
            fontFamily: T.ui,
            fontSize: 14,
            lineHeight: 1.55,
            color: T.mut,
          }}
        >
          {deck}
        </p>
      )}
    </div>
  );
}

// ── CTA-rad: valgfri spøkelses-tilbake + primær lime-pille ──────
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
  /** Vis spøkelses-tilbakeknapp til venstre. */
  onBack?: () => void;
  backDisabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled}
          aria-label="Tilbake"
          className="v2-press v2-focus"
          style={{
            appearance: "none",
            width: 52,
            height: 52,
            flex: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 9999,
            background: T.panel3,
            border: `1px solid ${T.borderS}`,
            color: T.fg,
            cursor: backDisabled ? "default" : "pointer",
            opacity: backDisabled ? 0.4 : 1,
          }}
        >
          <ArrowLeft size={16} strokeWidth={2} aria-hidden />
        </button>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="v2-press v2-focus"
        style={{
          appearance: "none",
          height: 52,
          flex: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderRadius: 9999,
          padding: "0 24px",
          background: T.lime,
          border: "1px solid transparent",
          color: T.onLime,
          fontFamily: T.ui,
          fontSize: 14.5,
          fontWeight: 600,
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.4 : 1,
        }}
      >
        {children}
        <Icon size={17} strokeWidth={2} aria-hidden />
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
      className="v2-press v2-focus"
      style={{
        ...CAPS,
        appearance: "none",
        height: 36,
        width: "100%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "none",
        borderRadius: 9999,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}
