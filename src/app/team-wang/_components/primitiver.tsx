"use client";

// Gjenskapte primitiver fra designsystemet «WANG Treningsplattform»
// (HeroCard, IconChip, Tabs, StatusChip, AkChip, HelpDot) — portert fra
// Claude Design-skjermen «WANG Toppidrett Fredrikstad Golf v2».

import type { CSSProperties, ReactNode } from "react";
import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  Dumbbell,
  Flag,
  HeartPulse,
  HelpCircle,
  Home,
  MessageCircle,
  Moon,
  Pencil,
  Send,
  Settings,
  Sun,
  Target,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { WangFarge } from "../_data/wang-plan";

// ---- Ikon-navn (designets strenger) → Lucide ---------------------------

const IKONER: Record<string, LucideIcon> = {
  target: Target,
  dumbbell: Dumbbell,
  flag: Flag,
  trophy: Trophy,
  users: Users,
  calendar: Calendar,
  "check-circle": CheckCircle2,
  "chevron-down": ChevronDown,
  moon: Moon,
  home: Home,
  clock: Clock,
  "clipboard-list": ClipboardList,
  sun: Sun,
  "message-circle": MessageCircle,
  activity: Activity,
  "heart-pulse": HeartPulse,
  pencil: Pencil,
  send: Send,
  settings: Settings,
};

export function Ikon({
  name,
  size = 18,
  strokeWidth = 2,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Cmp = IKONER[name] ?? HelpCircle;
  return <Cmp size={size} strokeWidth={strokeWidth} aria-hidden />;
}

// ---- Fargekart for tonede chips ----------------------------------------

export const FARGE_TINT: Record<WangFarge, { bg: string; fg: string }> = {
  navy: { bg: "var(--tint-navy)", fg: "var(--wang-navy)" },
  teal: { bg: "var(--tint-teal)", fg: "var(--wang-teal-text)" },
  mint: { bg: "var(--tint-mint)", fg: "var(--wang-teal-text)" },
  blue: { bg: "var(--tint-blue)", fg: "var(--cat-blue)" },
  orange: { bg: "var(--tint-orange)", fg: "var(--cat-orange)" },
  purple: { bg: "var(--tint-purple)", fg: "var(--cat-purple)" },
  pink: { bg: "var(--tint-pink)", fg: "var(--cat-pink)" },
  gray: { bg: "var(--tint-gray)", fg: "var(--text-secondary)" },
};

// ---- IconChip: Lucide-ikon i tonet squircle ----------------------------

export function IconChip({
  icon,
  color,
  size = 42,
}: {
  icon: string;
  color: WangFarge;
  size?: number;
}) {
  const f = FARGE_TINT[color] ?? FARGE_TINT.navy;
  return (
    <span
      style={{
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "var(--radius-icon-chip)",
        background: f.bg,
        color: f.fg,
      }}
    >
      <Ikon name={icon} size={Math.round(size * 0.46)} />
    </span>
  );
}

// ---- HeroCard: det mørke navy-kortet (ett per skjerm) ------------------

export function HeroCard({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--grad-hero-line)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-hero)",
        padding: "clamp(22px, 4vw, 32px)",
        color: "var(--text-on-dark)",
      }}
    >
      <div
        className="t-label wang-num"
        style={{ color: "var(--wang-mint)", marginBottom: 10 }}
      >
        {label}
      </div>
      <h1
        style={{
          margin: "0 0 12px",
          fontFamily: "var(--font-brand)",
          fontWeight: 800,
          fontSize: "clamp(24px, 4.5vw, 34px)",
          lineHeight: 1.15,
          color: "var(--text-on-dark)",
        }}
      >
        {title}
      </h1>
      {children}
    </section>
  );
}

// ---- Tabs: pillegruppe (aktiv = fylt navy pille) -----------------------

export function Tabs({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      role="tablist"
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: "var(--surface-card)",
        boxShadow: "var(--shadow-card-sm)",
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
      {options.map((o) => {
        const aktiv = o === value;
        return (
          <button
            key={o}
            role="tab"
            aria-selected={aktiv}
            onClick={() => onChange(o)}
            className="wang-pressable"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 36,
              padding: "0 16px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-brand)",
              fontWeight: 600,
              fontSize: 13,
              background: aktiv ? "var(--wang-navy)" : "transparent",
              color: aktiv ? "var(--white)" : "var(--text-secondary)",
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

// ---- Pillestiler for hovednavigasjon og årsvalg ------------------------

export function navPillStyle(active: boolean, mobil: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    height: mobil ? 40 : 44,
    padding: mobil ? "0 16px" : "0 20px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "var(--font-brand)",
    fontWeight: 600,
    fontSize: mobil ? 13 : 14,
    background: active ? "var(--wang-navy)" : "var(--neutral-50)",
    color: active ? "var(--white)" : "var(--text-secondary)",
    flexShrink: 0,
  };
}

export function yearPillStyle(active: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    height: 36,
    padding: "0 18px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-brand)",
    fontWeight: 600,
    fontSize: 13.5,
    background: active ? "var(--wang-teal)" : "var(--neutral-50)",
    color: active ? "var(--white)" : "var(--text-secondary)",
  };
}

// ---- StatusChip --------------------------------------------------------

export function StatusChip({
  color,
  icon,
  label,
}: {
  color: WangFarge;
  icon: string;
  label: string;
}) {
  const f = FARGE_TINT[color] ?? FARGE_TINT.teal;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 24,
        padding: "0 10px",
        borderRadius: 999,
        background: f.bg,
        color: f.fg,
        fontFamily: "var(--font-brand)",
        fontWeight: 700,
        fontSize: 11,
        whiteSpace: "nowrap",
      }}
    >
      <Ikon name={icon} size={12} />
      {label}
    </span>
  );
}

// ---- AkChip: LABEL + verdi med forklaring (title-tooltip) --------------

export function AkChip({
  label,
  value,
  tip,
  color,
}: {
  label: string;
  value: string;
  tip: string;
  color: WangFarge;
}) {
  const f = FARGE_TINT[color] ?? FARGE_TINT.navy;
  return (
    <span
      title={tip}
      className="wang-num"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 26,
        padding: "0 10px",
        borderRadius: 999,
        background: f.bg,
        color: f.fg,
        cursor: "help",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-brand)",
          fontWeight: 800,
          fontSize: 10,
          letterSpacing: "0.06em",
          opacity: 0.75,
        }}
      >
        {label}
      </span>
      <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12 }}>
        {value}
      </span>
    </span>
  );
}

// ---- HelpDot: lite «?» med forklaring ----------------------------------

export function HelpDot({ tip }: { tip: string }) {
  return (
    <span
      title={tip}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 16,
        color: "var(--neutral-400)",
        cursor: "help",
        flexShrink: 0,
      }}
    >
      <HelpCircle size={16} strokeWidth={2} aria-hidden />
    </span>
  );
}
