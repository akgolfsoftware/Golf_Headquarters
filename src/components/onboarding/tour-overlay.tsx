"use client";

/**
 * Tutorial-overlay for førstegangsbrukere.
 *
 * Bruk:
 * 1) Plasser <TourOverlay steps={[...]} tourId="playerhq-v1" /> i en hvilken som helst
 *    portal-side. Den mounter kun for førstegangs-brukere.
 * 2) Mål-elementer identifiseres via data-tour="navnet" attributter i UI-en.
 *
 * Sjekker både:
 *   - localStorage (`ak-tour-completed:<tourId>`) — rask sjekk på klient-siden
 *   - (TODO når feltet finnes) prisma.user.tutorialCompleted
 *
 * Komponenten er selvstendig — den importerer ingen UI-primitives og bruker
 * inline stiler for å unngå konflikter med vert-siden.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, HelpCircle } from "lucide-react";

// ──────────────────────────────────────────────────────────────────────────────
// Typer
// ──────────────────────────────────────────────────────────────────────────────

export type TourStep = {
  /** data-tour-attribut på elementet vi peker mot. Hvis null → midtstilt modal */
  target?: string;
  /** Kort tittel */
  title: string;
  /** Lenger forklaring */
  body: string;
  /** Plassering ift. target. Default 'bottom'. */
  placement?: "top" | "bottom" | "left" | "right";
};

type Props = {
  steps: TourStep[];
  /** Unik ID for å lagre fullført-status. Brukes i localStorage. */
  tourId: string;
  /** Vis "?"-knapp i hjørne for å starte tour manuelt. Default true. */
  showHelpButton?: boolean;
  /** Hvis true: start automatisk når komponenten mounter. Default true. */
  autoStart?: boolean;
};

// ──────────────────────────────────────────────────────────────────────────────
// Default tour for PlayerHQ
// ──────────────────────────────────────────────────────────────────────────────

export const PLAYER_HQ_TOUR: TourStep[] = [
  {
    title: "Velkommen til PlayerHQ",
    body: "Dette er det personlige nav-senteret ditt — alt du trenger samlet på ett sted.",
  },
  {
    target: "today-focus",
    title: "Her ser du dagens fokus",
    body: "Coachen din legger inn dagens viktigste oppgave og økter. Sjekk denne hver morgen.",
    placement: "bottom",
  },
  {
    target: "calendar-link",
    title: "Klikk her for å se kalender",
    body: "Du finner alle planlagte økter, turneringer og avtaler i kalenderen.",
    placement: "right",
  },
  {
    target: "booking-link",
    title: "Slik booker du en time",
    body: "Du kan booke økter med coachen din direkte fra portalen. Tilgjengelige tider vises i sanntid.",
    placement: "right",
  },
  {
    target: "progress-link",
    title: "Slik ser du fremgangen din",
    body: "Statistikk, HCP-historikk, drill-progresjon og personlige rekorder samlet i progresjons-dashboardet.",
    placement: "right",
  },
  {
    target: "coach-link",
    title: "Spør coach når du vil",
    body: "Direkte meldinger til coachen din. De svarer typisk innen et døgn.",
    placement: "right",
  },
  {
    title: "Ferdig — du er klar!",
    body: "Du kan alltid kjøre denne omvisningen igjen fra Innstillinger eller via spørsmålstegnet i hjørnet.",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export function TourOverlay({
  steps,
  tourId,
  showHelpButton = true,
  autoStart = true,
}: Props) {
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  const storageKey = `ak-tour-completed:${tourId}`;

  // Mount-check (unngå SSR-hydration mismatch — bevisst setState ved mount)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (!autoStart) return;
    try {
      const completed = localStorage.getItem(storageKey);
      if (!completed) {
        // Liten delay for å la siden mounte UI før vi måler elementer.
        const t = setTimeout(() => setActive(true), 400);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage utilgjengelig — vis tour likevel
      setActive(true);
    }
  }, [autoStart, storageKey]);

  const measureTarget = useCallback(() => {
    const step = steps[stepIdx];
    if (!step?.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) {
      setTargetRect(null);
      return;
    }
    setTargetRect(el.getBoundingClientRect());
  }, [steps, stepIdx]);

  // Mål-element kan endre seg ved scroll/resize
  useEffect(() => {
    if (!active) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    measureTarget();
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);
    return () => {
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [active, measureTarget]);

  // Skroll mål-element inn i view
  useEffect(() => {
    if (!active) return;
    const step = steps[stepIdx];
    if (!step?.target) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [active, stepIdx, steps]);

  function startTour() {
    setStepIdx(0);
    setActive(true);
  }

  function neste() {
    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      ferdig();
    }
  }

  function tilbake() {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }

  function hoppOver() {
    ferdig();
  }

  function ferdig() {
    try {
      localStorage.setItem(storageKey, new Date().toISOString());
    } catch {
      // localStorage utilgjengelig — fortsett uten
    }
    setActive(false);
    setStepIdx(0);
  }

  if (!mounted) return null;

  const step = steps[stepIdx];
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === steps.length - 1;

  return (
    <>
      {showHelpButton && !active && (
        <button
          type="button"
          onClick={startTour}
          aria-label="Start omvisning"
          style={helpButtonStyle}
        >
          <HelpCircle size={20} />
        </button>
      )}

      {active && step && (
        <TourFrame
          step={step}
          stepIdx={stepIdx}
          totalSteps={steps.length}
          targetRect={targetRect}
          onNeste={neste}
          onTilbake={tilbake}
          onHoppOver={hoppOver}
          onLukk={hoppOver}
          isFirst={isFirst}
          isLast={isLast}
        />
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Tour-frame (popover + spotlight)
// ──────────────────────────────────────────────────────────────────────────────

type FrameProps = {
  step: TourStep;
  stepIdx: number;
  totalSteps: number;
  targetRect: DOMRect | null;
  onNeste: () => void;
  onTilbake: () => void;
  onHoppOver: () => void;
  onLukk: () => void;
  isFirst: boolean;
  isLast: boolean;
};

function TourFrame({
  step,
  stepIdx,
  totalSteps,
  targetRect,
  onNeste,
  onTilbake,
  onHoppOver,
  onLukk,
  isFirst,
  isLast,
}: FrameProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Beregn popover-posisjon basert på target og placement
  const popoverPos = computePopoverPosition(step, targetRect);
  const spotlightStyle: React.CSSProperties = targetRect
    ? {
        position: "fixed",
        top: targetRect.top - 8,
        left: targetRect.left - 8,
        width: targetRect.width + 16,
        height: targetRect.height + 16,
        borderRadius: 12,
        boxShadow: "0 0 0 9999px rgba(10, 31, 23, 0.65)",
        pointerEvents: "none",
        transition: "all 0.25s ease",
        zIndex: 9998,
      }
    : {
        position: "fixed",
        inset: 0,
        background: "rgba(10, 31, 23, 0.65)",
        pointerEvents: "auto",
        zIndex: 9998,
      };

  return (
    <>
      {/* Backdrop / spotlight */}
      <div style={spotlightStyle} onClick={onHoppOver} />

      {/* Popover */}
      <div
        ref={popoverRef}
        role="dialog"
        aria-modal="true"
        aria-label="Omvisning"
        style={{ ...popoverStyle, ...popoverPos }}
      >
        <div style={popoverHeaderStyle}>
          <span style={stepCounterStyle}>
            {stepIdx + 1} / {totalSteps}
          </span>
          <button
            type="button"
            onClick={onLukk}
            aria-label="Lukk omvisning"
            style={closeButtonStyle}
          >
            <X size={16} />
          </button>
        </div>

        <h3 style={titleStyle}>{step.title}</h3>
        <p style={bodyStyle}>{step.body}</p>

        <div style={ctaRowStyle}>
          <button
            type="button"
            onClick={onHoppOver}
            style={skipButtonStyle}
          >
            Hopp over
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            {!isFirst && (
              <button
                type="button"
                onClick={onTilbake}
                style={secondaryButtonStyle}
                aria-label="Forrige steg"
              >
                <ChevronLeft size={14} />
                Forrige
              </button>
            )}
            <button
              type="button"
              onClick={onNeste}
              style={primaryButtonStyle}
            >
              {isLast ? "Ferdig" : "Neste"}
              {!isLast && <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Posisjons-beregning
// ──────────────────────────────────────────────────────────────────────────────

function computePopoverPosition(
  step: TourStep,
  targetRect: DOMRect | null,
): React.CSSProperties {
  const POPOVER_W = 360;
  const POPOVER_H = 220;
  const GAP = 14;

  if (!targetRect) {
    // Midt på skjermen
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const placement = step.placement ?? "bottom";

  let top = 0;
  let left = 0;

  switch (placement) {
    case "top":
      top = targetRect.top - POPOVER_H - GAP;
      left = targetRect.left + targetRect.width / 2 - POPOVER_W / 2;
      break;
    case "bottom":
      top = targetRect.bottom + GAP;
      left = targetRect.left + targetRect.width / 2 - POPOVER_W / 2;
      break;
    case "left":
      top = targetRect.top + targetRect.height / 2 - POPOVER_H / 2;
      left = targetRect.left - POPOVER_W - GAP;
      break;
    case "right":
      top = targetRect.top + targetRect.height / 2 - POPOVER_H / 2;
      left = targetRect.right + GAP;
      break;
  }

  // Clamp innenfor viewport
  top = Math.max(16, Math.min(top, vh - POPOVER_H - 16));
  left = Math.max(16, Math.min(left, vw - POPOVER_W - 16));

  return { top, left };
}

// ──────────────────────────────────────────────────────────────────────────────
// Stiler (inline for å unngå CSS-konflikter)
// ──────────────────────────────────────────────────────────────────────────────

const popoverStyle: React.CSSProperties = {
  position: "fixed",
  width: 360,
  maxWidth: "calc(100vw - 32px)",
  background: "#FFFFFF",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 24px 64px rgba(10, 31, 23, 0.35)",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const popoverHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const stepCounterStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.12em",
  color: "hsl(var(--primary))",
  textTransform: "uppercase",
};

const closeButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: 0,
  cursor: "pointer",
  color: "hsl(var(--muted-foreground))",
  padding: 4,
  borderRadius: 6,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
  fontSize: 19,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: "hsl(var(--foreground))",
  margin: 0,
  lineHeight: 1.25,
};

const bodyStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.5,
  color: "hsl(var(--muted-foreground))",
  margin: 0,
};

const ctaRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  paddingTop: 4,
};

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "9px 18px",
  borderRadius: 999,
  background: "hsl(var(--accent))",
  color: "hsl(var(--foreground))",
  fontSize: 13,
  fontWeight: 700,
  border: 0,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "9px 14px",
  borderRadius: 999,
  background: "#FFFFFF",
  color: "hsl(var(--foreground))",
  fontSize: 13,
  fontWeight: 600,
  border: "1px solid #E5E3DD",
  cursor: "pointer",
};

const skipButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: 0,
  fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
  fontSize: 11,
  color: "hsl(var(--muted-foreground))",
  textDecoration: "underline",
  cursor: "pointer",
  padding: 0,
};

const helpButtonStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 24,
  right: 24,
  width: 44,
  height: 44,
  borderRadius: "50%",
  background: "hsl(var(--primary))",
  color: "hsl(var(--accent))",
  border: 0,
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(0, 88, 64, 0.30)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9997,
};
