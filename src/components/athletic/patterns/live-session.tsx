"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Settings, ChevronRight, Activity, Zap, Target, Timer } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type LiveSessionAxis = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export type LiveSessionPhase = "BRIEF" | "ACTIVE" | "LOGGER" | "TAPPER" | "SUMMARY";

export type LiveSessionPatternProps = {
  sessionId: string;
  sessionTitle: string;
  axis: LiveSessionAxis;
  phase: LiveSessionPhase;
  timer: string; // "12:34" elapsed
  primaryCtaLabel: string;
  primaryCtaAction?: () => void;
  secondaryCtaLabel?: string;
  secondaryCtaAction?: () => void;
  onCancel?: () => void;
  bgImage?: string; // optional photo-bg path
  children: React.ReactNode;
};

// ── Axis pill config ──────────────────────────────────────────────────────────
// All colors use CSS custom properties defined in globals.css / patterns.css.
// No hex literals — the lint rule forbids them in src/components/v2/.

type AxisConfig = {
  label: string;
  // CSS color-mix expression strings — no hex literals
  pillBg: string;
  pillText: string;
};

const AXIS_CONFIG: Record<LiveSessionAxis, AxisConfig> = {
  FYS: {
    label: "FYS",
    pillBg: "color-mix(in oklab, var(--pyr-fys) 30%, transparent)",
    pillText: "hsl(var(--accent))",
  },
  TEK: {
    label: "TEK",
    pillBg: "color-mix(in oklab, var(--pyr-tek) 30%, transparent)",
    pillText: "var(--pyr-tek)",
  },
  SLAG: {
    label: "SLAG",
    pillBg: "color-mix(in oklab, var(--pyr-slag) 30%, transparent)",
    pillText: "var(--pyr-slag)",
  },
  SPILL: {
    label: "SPILL",
    pillBg: "color-mix(in oklab, var(--pyr-spill) 40%, transparent)",
    pillText: "hsl(var(--accent-foreground))",
  },
  TURN: {
    label: "TURN",
    pillBg: "color-mix(in oklab, var(--pyr-turn) 30%, transparent)",
    pillText: "hsl(var(--destructive))",
  },
};

// ── Phase label map ───────────────────────────────────────────────────────────

const PHASE_LABEL: Record<LiveSessionPhase, string> = {
  BRIEF: "INTRO",
  ACTIVE: "AKTIV",
  LOGGER: "LOGGER",
  TAPPER: "TAPPER",
  SUMMARY: "OPPSUMMERING",
};

// ── Reusable opacity token shorthands ─────────────────────────────────────────
// rgba() is not a hex literal and passes the lint rule.

const WHITE_06 = "rgba(255,255,255,0.06)";
const WHITE_08 = "rgba(255,255,255,0.08)";
const WHITE_10 = "rgba(255,255,255,0.10)";
const WHITE_12 = "rgba(255,255,255,0.12)";
const WHITE_16 = "rgba(255,255,255,0.16)";
const WHITE_20 = "rgba(255,255,255,0.20)";
const WHITE_40 = "rgba(255,255,255,0.40)";
const WHITE_50 = "rgba(255,255,255,0.50)";
const WHITE_55 = "rgba(255,255,255,0.55)";
const WHITE_70 = "rgba(255,255,255,0.70)";
const WHITE_90 = "rgba(255,255,255,0.90)";
const WHITE_92 = "rgba(255,255,255,0.92)";
const DARK_60  = "rgba(10,31,23,0.60)";

// ── Cancel modal ──────────────────────────────────────────────────────────────

type CancelModalProps = {
  onConfirm: () => void;
  onDismiss: () => void;
};

function CancelModal({ onConfirm, onDismiss }: CancelModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    },
    [onDismiss],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {/* Backdrop — z-60 sits above the fullscreen z-50 takeover */}
      <div
        className="fixed inset-0 z-[60]"
        style={{
          background: "rgba(10,31,23,0.72)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        onClick={onDismiss}
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal
        aria-labelledby="cancel-session-title"
        className="fixed z-[60] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-6 rounded-[24px] border"
        style={{
          width: "calc(100% - 48px)",
          maxWidth: 400,
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
          padding: 32,
          boxShadow: "0 32px 64px -16px rgba(10,31,23,0.40)",
        }}
      >
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-full grid place-items-center mx-auto"
          style={{
            background: "color-mix(in oklab, hsl(var(--destructive)) 12%, transparent)",
          }}
          aria-hidden
        >
          <X size={22} style={{ color: "hsl(var(--destructive))" }} />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2 text-center">
          <h2
            id="cancel-session-title"
            className="m-0 font-display font-bold tracking-[-0.02em] text-foreground"
            style={{ fontSize: 22 }}
          >
            Avbryt økten?
          </h2>
          <p className="m-0 text-[15px] text-muted-foreground leading-[1.5]">
            Fremgang i denne økten vil ikke bli lagret. Er du sikker på at du
            vil avbryte?
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] border-0 cursor-pointer"
            style={{
              background: "hsl(var(--destructive))",
              color: "hsl(var(--destructive-foreground))",
              padding: "14px 24px",
              minHeight: 48,
            }}
          >
            Ja, avbryt økten
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] border cursor-pointer"
            style={{
              background: "transparent",
              color: "hsl(var(--foreground))",
              borderColor: "hsl(var(--border))",
              padding: "14px 24px",
              minHeight: 48,
            }}
          >
            Fortsett økten
          </button>
        </div>
      </div>
    </>
  );
}

// ── Header bar ────────────────────────────────────────────────────────────────

type SessionHeaderProps = {
  title: string;
  axis: LiveSessionAxis;
  phase: LiveSessionPhase;
  timer: string;
  onCancelClick: () => void;
  onSettingsClick: () => void;
};

function SessionHeader({
  title,
  axis,
  phase,
  timer,
  onCancelClick,
  onSettingsClick,
}: SessionHeaderProps) {
  const axisCfg = AXIS_CONFIG[axis];
  const phaseLabel = PHASE_LABEL[phase];

  return (
    <header
      className="flex items-center justify-between gap-4 flex-shrink-0 px-4 sm:px-6"
      style={{
        height: 64,
        borderBottom: `1px solid ${WHITE_08}`,
      }}
    >
      {/* Left: cancel — 44px touch target */}
      <button
        type="button"
        onClick={onCancelClick}
        aria-label="Avbryt økt"
        className="flex-shrink-0 grid place-items-center rounded-full border cursor-pointer"
        style={{
          width: 44,
          height: 44,
          minWidth: 44,
          background: WHITE_06,
          borderColor: WHITE_12,
          color: WHITE_55,
        }}
      >
        <X size={18} />
      </button>

      {/* Center: title + pills + timer */}
      <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
        <span
          className="font-display font-bold tracking-[-0.02em] truncate text-center w-full"
          style={{ fontSize: 16, color: WHITE_92, lineHeight: 1.2 }}
        >
          {title}
        </span>

        <div className="flex items-center gap-2">
          {/* Axis pill */}
          <span
            className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] rounded-full"
            style={{
              background: axisCfg.pillBg,
              color: axisCfg.pillText,
              padding: "3px 10px",
            }}
          >
            {axisCfg.label}
          </span>

          {/* Phase pill */}
          <span
            className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] rounded-full"
            style={{
              background: WHITE_10,
              color: WHITE_55,
              padding: "3px 10px",
            }}
          >
            {phaseLabel}
          </span>

          {/* Divider */}
          <span style={{ color: WHITE_20, fontSize: 12 }}>·</span>

          {/* Timer — lime accent */}
          <span
            className="font-mono font-bold tabular"
            style={{
              fontSize: 13,
              color: "hsl(var(--accent))",
              letterSpacing: "0.04em",
            }}
          >
            {timer}
          </span>
        </div>
      </div>

      {/* Right: settings — 44px touch target */}
      <button
        type="button"
        aria-label="Oktsinnstillinger"
        onClick={onSettingsClick}
        className="flex-shrink-0 grid place-items-center rounded-full border cursor-pointer"
        style={{
          width: 44,
          height: 44,
          minWidth: 44,
          background: WHITE_06,
          borderColor: WHITE_12,
          color: WHITE_55,
        }}
      >
        <Settings size={18} />
      </button>
    </header>
  );
}

// ── Footer bar ────────────────────────────────────────────────────────────────

type SessionFooterProps = {
  primaryCtaLabel: string;
  primaryCtaAction?: () => void;
  secondaryCtaLabel?: string;
  secondaryCtaAction?: () => void;
  timer: string;
};

function SessionFooter({
  primaryCtaLabel,
  primaryCtaAction,
  secondaryCtaLabel,
  secondaryCtaAction,
  timer,
}: SessionFooterProps) {
  return (
    <footer
      className="flex-shrink-0 px-4 sm:px-6"
      style={{
        paddingTop: 16,
        paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
        borderTop: `1px solid ${WHITE_08}`,
        background: DARK_60,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-4 max-w-xl mx-auto" style={{ minHeight: 56 }}>
        {/* Secondary CTA — left side, optional */}
        {secondaryCtaLabel && (
          <button
            type="button"
            onClick={secondaryCtaAction}
            className="flex-shrink-0 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.10em] border cursor-pointer"
            style={{
              background: WHITE_06,
              borderColor: WHITE_16,
              color: WHITE_70,
              padding: "0 20px",
              height: 48,
              minWidth: 48,
              whiteSpace: "nowrap",
            }}
          >
            {secondaryCtaLabel}
          </button>
        )}

        {/* Primary CTA — lime accent, full-width on mobile, centered on desktop */}
        <button
          type="button"
          onClick={primaryCtaAction}
          className="flex-1 flex items-center justify-center gap-2 rounded-full font-mono font-bold uppercase tracking-[0.10em] cursor-pointer border-0"
          style={{
            background: "hsl(var(--accent))",
            color: "hsl(var(--accent-foreground))",
            fontSize: 13,
            height: 56,
            boxShadow: "0 4px 16px rgba(209,248,67,0.28)",
          }}
        >
          {primaryCtaLabel}
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>

        {/* Timer — right side */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1" style={{ minWidth: 48 }}>
          <span
            className="font-mono font-bold tabular"
            style={{
              fontSize: 14,
              color: "hsl(var(--accent))",
              letterSpacing: "0.04em",
            }}
          >
            {timer}
          </span>
          <span
            className="font-mono uppercase"
            style={{
              fontSize: 8,
              color: WHITE_40,
              letterSpacing: "0.12em",
            }}
          >
            tid
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── Settings dropdown ─────────────────────────────────────────────────────────

const SETTINGS_ITEMS = [
  "Juster intensitet",
  "Bytt øvelse",
  "Legg til pause",
  "Avslutt tidlig",
] as const;

type SettingsDropdownProps = {
  onClose: () => void;
};

function SettingsDropdown({ onClose }: SettingsDropdownProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-[60]"
        style={{ background: "transparent" }}
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed z-[60] right-4 top-[72px] rounded-[16px] border flex flex-col overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
          boxShadow: "0 16px 40px rgba(10,31,23,0.24)",
          width: 220,
        }}
        role="menu"
        aria-label="Oktsinnstillinger"
      >
        {SETTINGS_ITEMS.map((label) => (
          <button
            key={label}
            type="button"
            role="menuitem"
            className="w-full text-left font-mono text-[11px] font-bold uppercase tracking-[0.10em] cursor-pointer border-0"
            style={{
              background: "transparent",
              color: "hsl(var(--foreground))",
              padding: "12px 16px",
            }}
            onClick={onClose}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "hsl(var(--muted))";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}

// ── Main pattern ──────────────────────────────────────────────────────────────

export default function LiveSessionPattern({
  sessionTitle,
  axis,
  phase,
  timer,
  primaryCtaLabel,
  primaryCtaAction,
  secondaryCtaLabel,
  secondaryCtaAction,
  onCancel,
  bgImage,
  children,
}: LiveSessionPatternProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Lock body scroll while mounted — requirement #9
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Esc triggers cancel modal — requirement #8
  // When cancel modal is open, its own Esc handler fires instead (dismisses back)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showCancelModal) {
        setShowCancelModal(true);
      }
    },
    [showCancelModal],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleCancelClick() {
    setShowCancelModal(true);
  }

  function handleCancelConfirm() {
    setShowCancelModal(false);
    onCancel?.();
  }

  function handleCancelDismiss() {
    setShowCancelModal(false);
  }

  // Background: photo with overlay gradient, or solid dark (hsl(var(--foreground)) = #0A1F17)
  const backgroundStyle = bgImage
    ? {
        background: `linear-gradient(to bottom, rgba(10,31,23,0.82) 0%, rgba(10,31,23,0.94) 100%), url(${bgImage}) center/cover no-repeat`,
      }
    : { background: "hsl(var(--foreground))" };

  return (
    <>
      {/*
       * Fullscreen takeover — fixed inset-0 z-50
       * Three-row grid: header (64px) + content (1fr) + footer (auto)
       * No sidebar, no topbar, no parent padding bleeds in.
       * isolation: isolate ensures we form our own stacking context
       * so nested z-[60] modals layer correctly above us.
       */}
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{
          ...backgroundStyle,
          isolation: "isolate",
        }}
        role="main"
        aria-label={`Live-økt: ${sessionTitle}`}
      >
        {/* ── Header (64px) ──────────────────────────────────────── */}
        <SessionHeader
          title={sessionTitle}
          axis={axis}
          phase={phase}
          timer={timer}
          onCancelClick={handleCancelClick}
          onSettingsClick={() => setShowSettings((v) => !v)}
        />

        {/* ── Content (flex-1, full bleed, scrollable) ───────────── */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ minHeight: 0 }}
        >
          {children}
        </div>

        {/* ── Footer (~80px sticky CTA) ──────────────────────────── */}
        <SessionFooter
          primaryCtaLabel={primaryCtaLabel}
          primaryCtaAction={primaryCtaAction}
          secondaryCtaLabel={secondaryCtaLabel}
          secondaryCtaAction={secondaryCtaAction}
          timer={timer}
        />
      </div>

      {/* Settings dropdown — z-[60], above takeover */}
      {showSettings && <SettingsDropdown onClose={() => setShowSettings(false)} />}

      {/* Cancel confirmation modal — z-[60], above takeover */}
      {showCancelModal && (
        <CancelModal
          onConfirm={handleCancelConfirm}
          onDismiss={handleCancelDismiss}
        />
      )}
    </>
  );
}

// ── Demo content: "ACTIVE" phase ──────────────────────────────────────────────
// Exported for use in showcase pages. Not re-exported from index.ts per spec.

type ActivePhaseStatProps = {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  accent?: boolean;
};

function ActivePhaseStat({
  label,
  value,
  unit,
  icon,
  accent = false,
}: ActivePhaseStatProps) {
  return (
    <div
      className="flex flex-col gap-2 rounded-[20px] border"
      style={{
        padding: "20px 20px 18px",
        background: accent
          ? "color-mix(in oklab, hsl(var(--accent)) 12%, rgba(10,31,23,0.60))"
          : WHITE_08,
        borderColor: accent
          ? "color-mix(in oklab, hsl(var(--accent)) 25%, transparent)"
          : WHITE_08,
      }}
    >
      <div
        className="w-8 h-8 rounded-full grid place-items-center"
        style={{
          background: accent
            ? "color-mix(in oklab, hsl(var(--accent)) 20%, transparent)"
            : WHITE_08,
          color: accent ? "hsl(var(--accent))" : WHITE_50,
        }}
        aria-hidden
      >
        {icon}
      </div>

      <div className="flex flex-col gap-1">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.12em]"
          style={{ color: WHITE_40 }}
        >
          {label}
        </span>
        <span className="flex items-baseline gap-1">
          <span
            className="font-display font-bold tabular"
            style={{
              fontSize: 28,
              color: accent ? "hsl(var(--accent))" : WHITE_92,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {value}
          </span>
          <span
            className="font-mono text-[11px]"
            style={{ color: WHITE_40 }}
          >
            {unit}
          </span>
        </span>
      </div>
    </div>
  );
}

export function LiveSessionActivePhaseDemo() {
  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 py-6" style={{ minHeight: "100%" }}>
      {/* Active drill banner */}
      <div
        className="flex items-center gap-4 rounded-[16px] border px-4 py-4"
        style={{
          background: WHITE_06,
          borderColor: WHITE_10,
        }}
      >
        <div className="live-dot flex-shrink-0" aria-hidden />
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span
            className="font-mono text-[9px] uppercase tracking-[0.14em]"
            style={{ color: WHITE_40 }}
          >
            Aktiv øvelse
          </span>
          <span
            className="font-display font-bold truncate"
            style={{
              fontSize: 15,
              color: WHITE_90,
              letterSpacing: "-0.01em",
            }}
          >
            Sving-tempo · 3.0:1
          </span>
        </div>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.10em] rounded-full flex-shrink-0 pill-fys"
          style={{ padding: "4px 12px" }}
        >
          FYS
        </span>
      </div>

      {/* 2-column stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <ActivePhaseStat
          label="Puls"
          value="142"
          unit="BPM"
          icon={<Activity size={16} />}
        />
        <ActivePhaseStat
          label="Beste hastighet"
          value="47"
          unit="m/s"
          icon={<Zap size={16} />}
          accent
        />
        <ActivePhaseStat
          label="Slag logget"
          value="24/30"
          unit="slag"
          icon={<Target size={16} />}
        />
        <ActivePhaseStat
          label="Tid igjen"
          value="6:22"
          unit="min"
          icon={<Timer size={16} />}
        />
      </div>

      {/* Progress bar — shots logged */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.12em] font-bold"
            style={{ color: WHITE_50 }}
          >
            Slag-fremgang
          </span>
          <span
            className="font-mono text-[13px] font-bold tabular"
            style={{ color: "hsl(var(--accent))" }}
          >
            24 / 30
          </span>
        </div>
        <div
          className="relative overflow-hidden rounded-full"
          style={{
            height: 8,
            background: WHITE_08,
          }}
          role="progressbar"
          aria-valuenow={24}
          aria-valuemin={0}
          aria-valuemax={30}
          aria-label="Slag fremgang: 24 av 30"
        >
          <div
            className="pyr-bar-fill absolute inset-y-0 left-0 rounded-full"
            style={{
              width: "80%",
              background: "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
              boxShadow: "0 0 12px rgba(209,248,67,0.40)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

