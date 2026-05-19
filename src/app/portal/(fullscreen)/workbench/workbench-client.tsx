"use client";

// Unified Workbench — client komponent.
//
// Portering av /public/design/workbench/index.html (3079 linjer)
// til Tailwind v4 + React for Markus R.P. (PlayerHQ).
//
// Struktur:
//   Sidebar (220px, forest)
//   Main:
//     Topbar (56px)
//     Page:
//       1. Hero
//       2. Årsplan-Gantt
//       3. 3-pane workbench (Profil · Kalender + Neste-opp + Uke-belastning · Drills + Periodisering)
//       4. Mål-trackers (3 cards)
//       5. Insight-strip (SG-trend + slag-prio + DataGolf)
//       6. TrackMan-timeline
//     Sticky footer (64px)
//
// Designsystem-tokens (semantiske + cockpit) hentes fra globals.css.
// Pyramide-farger og enkelte rene hex-verdier er inlined for å matche
// HTML-prototypen 1:1 — disse er allerede definert i globals.css som
// brand-tokens, men brukes her direkte for kompakthet.

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Award,
  Bell,
  Calendar as CalendarIcon,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Flag,
  GripVertical,
  Home,
  LayoutGrid,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// -----------------------------
// Discipline-farger (pyramide)
// -----------------------------
const C = {
  fys: "#1A4D2E",
  tek: "#005840",
  slag: "#2C7D52",
  spill: "#88B45A",
  turn: "#D1F843",
  turnBar: "#C8B72A",
  primary: "#005840",
  primaryDark: "#003A2A",
  accent: "#D1F843",
  bg: "#FAFAF7",
  bgSoft: "#FBF9F4",
  fg: "#0A1F17",
  card: "#FFFFFF",
  border: "#E5E3DD",
  borderSoft: "#EFEDE6",
  muted: "#5E5C57",
  mutedSoft: "#908D86",
  danger: "#A32D2D",
  success: "#2C7D52",
  warning: "#B8852A",
} as const;

// -----------------------------
// Felles små helpers
// -----------------------------
function MonoText({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("font-mono tracking-wide", className)}
      {...rest}
    >
      {children}
    </span>
  );
}

type PillKind = "fys" | "tek" | "slag" | "spill" | "turn";
const PILL_STYLES: Record<PillKind, { bg: string; color: string }> = {
  fys: { bg: "rgba(26,77,46,0.15)", color: C.fys },
  tek: { bg: "rgba(0,88,64,0.13)", color: C.tek },
  slag: { bg: "rgba(44,125,82,0.16)", color: C.slag },
  spill: { bg: "rgba(136,180,90,0.20)", color: "#4D7A2E" },
  turn: { bg: "rgba(209,248,67,0.32)", color: "#4A5418" },
};

function Pill({ kind, children }: { kind: PillKind; children: React.ReactNode }) {
  const s = PILL_STYLES[kind];
  return (
    <span
      className="inline-flex items-center rounded-full px-[9px] py-[3px] font-mono text-[10px] font-semibold uppercase tracking-[0.08em]"
      style={{ background: s.bg, color: s.color }}
    >
      {children}
    </span>
  );
}

type BadgeKind = "success" | "forest" | "lime" | "muted" | "danger";
function Badge({
  kind,
  children,
  icon,
}: {
  kind: BadgeKind;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const styles: Record<BadgeKind, React.CSSProperties> = {
    success: { background: "rgba(44,125,82,0.14)", color: C.success },
    forest: { background: "rgba(0,88,64,0.10)", color: C.primary },
    lime: { background: C.accent, color: C.fg },
    muted: { background: "rgba(94,92,87,0.10)", color: C.muted },
    danger: { background: "rgba(163,45,45,0.12)", color: C.danger },
  };
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em]"
      style={styles[kind]}
    >
      {icon}
      {children}
    </span>
  );
}

// -----------------------------
// SIDEBAR
// -----------------------------
function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col gap-[18px] overflow-y-auto px-[14px] py-5"
      style={{ background: C.primary, color: "#DCE9DE" }}
    >
      <div
        className="px-2 pb-[14px] pt-1"
        style={{ borderBottom: "1px solid rgba(209,248,67,0.12)" }}
      >
        <div
          className="font-display text-[13px] font-bold tracking-[0.02em]"
          style={{ color: C.accent }}
        >
          AK GOLF
        </div>
        <div
          className="mt-[3px] font-mono text-[10px] tracking-[0.08em]"
          style={{ color: "rgba(209,248,67,0.55)" }}
        >
          PLAYERHQ · PRO
        </div>
      </div>

      <div
        className="flex items-center gap-[10px] rounded-xl p-[10px]"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-display text-[13px] font-bold"
          style={{ background: C.accent, color: C.primary }}
        >
          MR
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-[13px] font-semibold text-white">
            Markus R.P.
          </div>
          <div
            className="mt-[2px] font-mono text-[10.5px] tracking-[0.04em]"
            style={{ color: "rgba(209,248,67,0.8)" }}
          >
            HCP +3,5 · A1
          </div>
        </div>
      </div>

      <SidebarGroup label="Hjem">
        <NavItem icon={<Home className="h-[15px] w-[15px]" />}>Hjem</NavItem>
        <NavItem
          icon={<Bell className="h-[15px] w-[15px]" />}
          badge={3}
        >
          Varsler
        </NavItem>
      </SidebarGroup>

      <SidebarGroup label="Trening">
        <NavItem
          active
          icon={<LayoutGrid className="h-[15px] w-[15px]" />}
        >
          Planlegger
        </NavItem>
        <NavItem icon={<CalendarIcon className="h-[15px] w-[15px]" />}>
          Kalender
        </NavItem>
        <NavItem icon={<CalendarDays className="h-[15px] w-[15px]" />}>
          Årsplan
        </NavItem>
        <NavItem icon={<ClipboardList className="h-[15px] w-[15px]" />}>
          Tester
        </NavItem>
      </SidebarGroup>

      <SidebarGroup label="Innsikt">
        <NavItem icon={<Activity className="h-[15px] w-[15px]" />}>
          Statistikk
        </NavItem>
        <NavItem icon={<Target className="h-[15px] w-[15px]" />}>Mål</NavItem>
        <NavItem icon={<UserIcon className="h-[15px] w-[15px]" />}>
          Coach
        </NavItem>
      </SidebarGroup>

      <div
        className="mt-auto px-2 pt-3"
        style={{ borderTop: "1px solid rgba(209,248,67,0.10)" }}
      >
        <div
          className="flex items-center gap-[10px] text-[12px]"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          <Settings className="h-[14px] w-[14px]" />
          Innstillinger
        </div>
      </div>
    </aside>
  );
}

function SidebarGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[2px]">
      <div
        className="px-[10px] pb-2 pt-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: "rgba(209,248,67,0.45)" }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function NavItem({
  icon,
  children,
  active = false,
  badge,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  badge?: number;
}) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full items-center gap-[10px] rounded-lg border-0 px-[10px] py-2 text-left text-[13px] leading-[1.2] transition-colors",
        active
          ? "font-semibold"
          : "font-medium hover:bg-white/5 hover:text-white",
      )}
      style={
        active
          ? { background: C.accent, color: C.fg }
          : { color: "rgba(255,255,255,0.78)" }
      }
    >
      <span
        className={active ? "opacity-100" : "opacity-70"}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="flex-1">{children}</span>
      {badge !== undefined && (
        <span
          className="ml-auto rounded-full px-[6px] py-[1px] font-mono text-[10px] font-semibold"
          style={{ background: C.accent, color: C.fg }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// -----------------------------
// TOPBAR
// -----------------------------
function Topbar() {
  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-6 border-b px-8"
      style={{ background: C.card, borderColor: C.border }}
    >
      <div
        className="flex w-[420px] items-center gap-[10px] rounded-[10px] border px-[14px] py-2 text-[13px]"
        style={{ background: C.bg, borderColor: C.border, color: C.muted }}
      >
        <Search className="h-[14px] w-[14px] opacity-60" />
        <input
          placeholder="Søk drill, plan eller mål…"
          className="flex-1 border-0 bg-transparent font-sans text-[13px] outline-none"
          style={{ color: C.muted }}
        />
        <span
          className="rounded border px-[6px] py-[2px] font-mono text-[10px]"
          style={{
            background: C.card,
            borderColor: C.border,
            color: C.muted,
          }}
        >
          ⌘K
        </span>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          aria-label="Varsler"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-[10px] border-0 bg-transparent text-foreground hover:bg-[#FAFAF7]"
        >
          <Bell className="h-[17px] w-[17px]" />
          <span
            className="absolute right-2 top-2 h-[7px] w-[7px] rounded-full border-[1.5px] border-white"
            style={{ background: C.danger }}
          />
        </button>
        <button
          type="button"
          aria-label="Meldinger"
          className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border-0 bg-transparent text-foreground hover:bg-[#FAFAF7]"
        >
          <MessageSquare className="h-[17px] w-[17px]" />
        </button>
      </div>

      <div
        className="ml-auto font-mono text-[11px] tracking-[0.04em]"
        style={{ color: C.muted }}
      >
        Trening &nbsp;/&nbsp; Min planlegger &nbsp;/&nbsp;{" "}
        <span className="font-semibold" style={{ color: C.fg }}>
          Uke 21
        </span>
      </div>
    </header>
  );
}

// -----------------------------
// 1. HERO
// -----------------------------
function HeroSection() {
  return (
    <section className="flex items-end justify-between gap-8">
      <div className="max-w-[720px]">
        <span
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: C.muted }}
        >
          Min workbench · Uke 21 · 19—25 mai 2026
        </span>
        <h1
          className="mt-[6px] font-display text-[34px] font-bold leading-[1.08] tracking-[-0.02em]"
          style={{ color: C.fg }}
        >
          Min{" "}
          <em
            className="font-serif font-normal not-italic"
            style={{
              fontFamily: "var(--font-instrument-serif), serif",
              fontStyle: "italic",
              color: C.primary,
              letterSpacing: "-0.01em",
            }}
          >
            workbench
          </em>{" "}
          — bygg, juster, be om hjelp
        </h1>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <PillButton variant="primary" icon={<Plus className="h-[14px] w-[14px]" />}>
          Ny økt
        </PillButton>
        <PillButton variant="forest">Be om økt fra coach</PillButton>
        <PillButton
          variant="outline"
          icon={<Sparkles className="h-[14px] w-[14px]" />}
        >
          AI-foreslå uke
        </PillButton>
        <PillButton
          variant="outline"
          icon={<Check className="h-[14px] w-[14px]" />}
        >
          Logg gjennomført økt
        </PillButton>
      </div>
    </section>
  );
}

function PillButton({
  children,
  variant,
  icon,
  size = "md",
  className,
  style,
}: {
  children: React.ReactNode;
  variant: "primary" | "forest" | "outline" | "ghost" | "lime-outline";
  icon?: React.ReactNode;
  size?: "md" | "sm" | "xs";
  className?: string;
  style?: React.CSSProperties;
}) {
  const sizeCls =
    size === "xs"
      ? "px-[10px] py-[5px] text-[11px]"
      : size === "sm"
        ? "px-3 py-[7px] text-[12px]"
        : "px-4 py-[10px] text-[13px]";
  const variantStyle: React.CSSProperties = (() => {
    switch (variant) {
      case "primary":
        return { background: C.accent, color: C.fg, border: "0" };
      case "forest":
        return { background: C.primary, color: C.accent, border: "0" };
      case "outline":
        return {
          background: C.card,
          color: C.fg,
          border: `1px solid ${C.border}`,
        };
      case "ghost":
        return { background: "transparent", color: C.fg, border: "0" };
      case "lime-outline":
        return {
          background: "transparent",
          color: C.accent,
          border: "1px solid rgba(209,248,67,0.4)",
        };
    }
  })();
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap rounded-full font-sans font-semibold leading-none transition-shadow hover:shadow-[0_4px_12px_rgba(10,31,23,0.06)]",
        sizeCls,
        className,
      )}
      style={{ ...variantStyle, ...style }}
    >
      {icon}
      {children}
    </button>
  );
}

// -----------------------------
// 2. ÅRSPLAN-GANTT
// -----------------------------
function GanttSection() {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  type Block = {
    left: number;
    width: number;
    label: string;
    bg: string;
    color?: string;
    active?: boolean;
  };
  const blocks: Block[] = [
    { left: 0, width: 24, label: "GRUNNTRENING", bg: "#C8D5C8" },
    { left: 16.67, width: 16.67, label: "OPPBYGGING", bg: "#6FA686", color: "#fff" },
    {
      left: 25,
      width: 16.67,
      label: "SPESIALISERING",
      bg: C.primary,
      color: "#fff",
      active: true,
    },
    {
      left: 41.67,
      width: 16.67,
      label: "KONKURRANSE",
      bg: C.accent,
      color: C.fg,
    },
    { left: 66.67, width: 16.67, label: "OVERGANG", bg: "#A8B89B" },
    { left: 83.33, width: 16.67, label: "HVILE", bg: "#E5E3DD", color: C.muted },
  ];
  type FlagMark = {
    left: number;
    star: boolean;
    tip: string;
  };
  const flags: FlagMark[] = [
    { left: 44.4, star: true, tip: "10. JUN · SØRLANDSÅPENT · HOVEDMÅL" },
    { left: 48.3, star: false, tip: "24. JUN · BOSSUM OPEN" },
    { left: 52.1, star: true, tip: "8. JUL · NM SLAG · HOVEDMÅL" },
    { left: 55.9, star: false, tip: "22. JUL · TRONDHEIM OPEN" },
    { left: 59.7, star: false, tip: "5. AUG · GFGK MESTERSKAP" },
  ];
  const weeks = [
    { label: "U17 · 21—27 APR" },
    { label: "U18 · 28 APR — 4 MAI" },
    { label: "U19 · 5—11 MAI" },
    { label: "U20 · 12—18 MAI" },
    { label: "U21 · 19—25 MAI", active: true },
    { label: "U22 · 26 MAI — 1 JUN" },
    { label: "U23 · 2—8 JUN" },
  ];

  return (
    <section
      className="rounded-2xl border bg-card px-6 pb-[18px] pt-[22px]"
      style={{ borderColor: C.border }}
    >
      <div className="mb-4 flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <div
            className="font-display text-[15px] font-semibold"
            style={{ color: C.fg }}
          >
            Årsplan 2026
          </div>
          <Badge kind="forest">SPESIALISERING · AKTIV</Badge>
        </div>
        <MonoText
          className="text-[10.5px] tracking-[0.06em]"
          style={{ color: C.muted }}
        >
          UKE 21 · 19. MAI · 6 PERIODER · 5 TURNERINGER
        </MonoText>
      </div>

      <div
        className="grid grid-cols-12 border-b pb-2"
        style={{ borderColor: C.borderSoft }}
      >
        {months.map((m) => (
          <span
            key={m}
            className="text-center font-mono text-[10px] uppercase tracking-[0.10em]"
            style={{ color: C.muted }}
          >
            {m}
          </span>
        ))}
      </div>

      <div className="relative mt-[14px] h-[44px]">
        {blocks.map((b, i) => (
          <div
            key={i}
            className={cn(
              "absolute top-[6px] flex h-8 items-center overflow-hidden rounded-[10px] px-3 font-mono text-[10px] font-semibold tracking-[0.10em]",
              b.active && "ring-2",
            )}
            style={{
              left: `${b.left}%`,
              width: `${b.width}%`,
              background: b.bg,
              color: b.active ? C.accent : (b.color ?? C.fg),
              boxShadow: b.active ? `0 0 0 2px ${C.accent}` : undefined,
            }}
          >
            {b.label}
          </div>
        ))}

        {flags.map((f, i) => (
          <div
            key={i}
            className="group absolute flex items-center justify-center"
            style={{
              bottom: "36px",
              left: `${f.left}%`,
              transform: "translateX(-50%)",
              width: "14px",
              height: "14px",
            }}
          >
            {f.star ? (
              <Star
                className="h-[14px] w-[14px]"
                fill={C.accent}
                color={C.fg}
                strokeWidth={1.5}
              />
            ) : (
              <Flag
                className="h-[14px] w-[14px]"
                fill={C.danger}
                color="#fff"
                strokeWidth={1.5}
              />
            )}
            <span
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-[6px] py-[3px] font-mono text-[9px] opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                bottom: "18px",
                background: C.fg,
                color: "#fff",
              }}
            >
              {f.tip}
            </span>
          </div>
        ))}

        {/* Today pin */}
        <div
          className="absolute"
          style={{
            top: "-8px",
            bottom: "-32px",
            width: "1.5px",
            left: "38.4%",
            background: C.danger,
          }}
        >
          <div
            className="absolute"
            style={{
              top: "-6px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: C.danger,
            }}
          />
          <span
            className="absolute whitespace-nowrap rounded px-[6px] py-[2px] font-mono text-[9px] font-bold tracking-[0.10em] text-white"
            style={{
              top: "-22px",
              left: "50%",
              transform: "translateX(-50%)",
              background: C.danger,
            }}
          >
            I DAG
          </span>
        </div>
      </div>

      <div
        className="mt-3 flex justify-between border-t pt-[10px]"
        style={{ borderColor: C.borderSoft }}
      >
        {weeks.map((w, i) => (
          <span
            key={i}
            className={cn(
              "rounded-full px-2 py-[3px] font-mono text-[10px] tracking-[0.06em]",
              w.active && "font-semibold",
            )}
            style={{
              background: w.active ? C.accent : "transparent",
              color: w.active ? C.fg : C.muted,
            }}
          >
            {w.label}
          </span>
        ))}
      </div>
    </section>
  );
}

// -----------------------------
// 3. 3-PANE WORKBENCH
// -----------------------------
function WorkbenchSection() {
  const [activeTab, setActiveTab] = useState<"Dag" | "Uke" | "Måned" | "Sesong">(
    "Uke",
  );
  const tabs: Array<"Dag" | "Uke" | "Måned" | "Sesong"> = [
    "Dag",
    "Uke",
    "Måned",
    "Sesong",
  ];

  return (
    <section>
      <div
        className="mb-5 flex gap-1 border-b"
        style={{ borderColor: C.border }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={cn(
              "-mb-px border-0 border-b-2 bg-transparent px-[18px] py-[10px] font-display text-[13px] tracking-[0.01em]",
              activeTab === t ? "font-semibold" : "font-medium",
            )}
            style={{
              color: activeTab === t ? C.fg : C.muted,
              borderBottomColor:
                activeTab === t ? C.accent : "transparent",
            }}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: C.muted }}
          >
            Sortering
          </span>
          <PillButton variant="outline" size="sm">
            <span className="flex items-center gap-1">
              Tidslinje <ChevronDown className="h-3 w-3" />
            </span>
          </PillButton>
        </div>
      </div>

      <div className="grid grid-cols-[252px_1fr_340px] gap-6">
        <PaneA />
        <PaneB />
        <PaneC />
      </div>
    </section>
  );
}

// -----------------------------
// Pane A — Profil
// -----------------------------
function PaneA() {
  const goals = [
    { title: "HCP +3,0 innen sesong-slutt", pct: 60, meta: "60% · 82 dager igjen" },
    { title: "Top 10 NM Slag", pct: 38, meta: "38% sannsynlig · 50 dager" },
    { title: "Bryte 70 på Bossum", pct: 48, meta: "Sist forsøk 71 · 4 runder" },
  ];
  const streak = [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0];
  const todayIdx = 12;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {/* Profile hero */}
      <div
        className="relative flex flex-col items-center gap-[10px] overflow-hidden rounded-2xl p-5 text-center text-white"
        style={{
          background: "linear-gradient(160deg, #006C50 0%, #003A2A 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 80% 0%, rgba(209,248,67,0.10), transparent 60%)",
          }}
        />
        <div
          className="flex h-[76px] w-[76px] items-center justify-center rounded-full font-display text-[26px] font-bold"
          style={{ background: C.accent, color: C.primaryDark }}
        >
          MR
        </div>
        <div className="font-display text-[15px] font-semibold leading-[1.2]">
          Markus Røinås Pedersen
        </div>
        <div
          className="font-mono text-[10.5px] tracking-[0.06em]"
          style={{ color: "rgba(209,248,67,0.85)" }}
        >
          HCP +3,5 · A1 · GFGK · 16 ÅR
        </div>
        <div
          className="z-10 inline-flex items-center gap-[5px] rounded-full px-3 py-[5px] font-mono text-[10px] font-semibold uppercase tracking-[0.06em]"
          style={{ background: C.accent, color: C.fg }}
        >
          <Check className="h-[11px] w-[11px]" strokeWidth={2.5} />
          På plan denne uka
        </div>
      </div>

      {/* Mine mål */}
      <Card>
        <CardHead
          left={<SectionLabel>Mine mål</SectionLabel>}
          right={
            <MonoText
              className="text-[10px]"
              style={{ color: C.muted }}
            >
              3 AKTIVE
            </MonoText>
          }
        />
        {goals.map((g, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col gap-1 py-[10px]",
              i < goals.length - 1 && "border-b",
              i === 0 && "pt-[6px]",
              i === goals.length - 1 && "pb-0",
            )}
            style={{
              borderColor: i < goals.length - 1 ? C.borderSoft : undefined,
            }}
          >
            <div
              className="font-display text-[12.5px] font-medium leading-[1.3]"
              style={{ color: C.fg }}
            >
              {g.title}
            </div>
            <div
              className="mt-1 h-1 overflow-hidden rounded-full"
              style={{ background: C.border }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${g.pct}%`, background: C.accent }}
              />
            </div>
            <MonoText
              className="text-[10.5px] tracking-[0.04em]"
              style={{ color: C.muted }}
            >
              {g.meta}
            </MonoText>
          </div>
        ))}
      </Card>

      {/* Min streak */}
      <Card>
        <CardHead
          left={<SectionLabel>Min streak</SectionLabel>}
          right={
            <MonoText
              className="text-[10px] font-semibold"
              style={{ color: C.success }}
            >
              + 4 DAGER
            </MonoText>
          }
        />
        <div className="mb-2 grid grid-cols-14 gap-[3px]" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
          {streak.map((s, i) => (
            <div
              key={i}
              className="aspect-square rounded-[3px]"
              style={{
                background: s ? C.accent : C.border,
                boxShadow: i === todayIdx ? `0 0 0 1.5px ${C.primary}` : undefined,
              }}
            />
          ))}
        </div>
        <MonoText
          className="text-[10.5px] tracking-[0.04em]"
          style={{ color: C.muted }}
        >
          11 av 14 dager · lengste 23d
        </MonoText>
      </Card>

      {/* Coach */}
      <div
        className="flex flex-col gap-3 rounded-2xl p-4 text-white"
        style={{ background: C.primaryDark }}
      >
        <div className="flex items-center gap-[10px]">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full font-display text-[11px] font-bold"
            style={{ background: C.accent, color: C.primary }}
          >
            AK
          </div>
          <div>
            <div className="font-display text-[13px] font-semibold">
              Anders Kristiansen
            </div>
            <div
              className="font-mono text-[9.5px] tracking-[0.08em]"
              style={{ color: "rgba(209,248,67,0.75)" }}
            >
              HEAD COACH
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[6px]">
          <PillButton variant="lime-outline" size="sm">
            <span className="text-center w-full">Send melding</span>
          </PillButton>
          <PillButton variant="primary" size="sm">
            <span className="text-center w-full">Be om økt</span>
          </PillButton>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Pane B — Kalender + Neste opp + Belastning
// -----------------------------
function PaneB() {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <CalendarCard />
      <NextUpCard />
      <LoadCard />
    </div>
  );
}

type CalEvent = {
  day: number; // 0=MAN ... 6=SØN
  startRow: number; // 0=08:00 ... 11=19:00
  rowSpan: number; // antall rader (44px per rad)
  variant: "tek" | "slag" | "fys" | "spill" | "turn";
  title: string;
  pill: PillKind;
  badge?: { kind: BadgeKind; text: string; icon?: React.ReactNode };
  meta?: string;
  completed?: boolean;
};

const CAL_EVENTS: CalEvent[] = [
  // 09:00 row (startRow=1)
  {
    day: 0,
    startRow: 1,
    rowSpan: 1.3,
    variant: "slag",
    title: "Pitch 50—100m, lav",
    pill: "slag",
    badge: {
      kind: "success",
      text: "FULLFØRT",
      icon: <Check className="h-[10px] w-[10px]" strokeWidth={2.5} />,
    },
    meta: "09:00 — 10:00 · 184 reps",
    completed: true,
  },
  {
    day: 2,
    startRow: 1,
    rowSpan: 1.5,
    variant: "slag",
    title: "Bunker-eskalering",
    pill: "slag",
    badge: { kind: "lime", text: "SELVPLANLAGT" },
    meta: "09:00 — 10:30 · 80 reps",
  },
  {
    day: 5,
    startRow: 1,
    rowSpan: 4,
    variant: "spill",
    title: "Bossum Open · Runde 1",
    pill: "spill",
    badge: {
      kind: "danger",
      text: "TURNERING",
      icon: <Flag className="h-[10px] w-[10px]" />,
    },
    meta: "09:00 — 13:00 · 18 hull",
  },
  // 11:00 row (startRow=3)
  {
    day: 1,
    startRow: 3,
    rowSpan: 0.8,
    variant: "fys",
    title: "Beinbøy + core",
    pill: "fys",
    badge: { kind: "muted", text: "EGEN" },
  },
  {
    day: 4,
    startRow: 3,
    rowSpan: 1.3,
    variant: "tek",
    title: "Driver grunntrening",
    pill: "tek",
    badge: { kind: "forest", text: "AV ANDERS" },
    meta: "11:00 — 12:00 · 120 reps",
  },
  // 14:00 row (startRow=6)
  {
    day: 0,
    startRow: 6,
    rowSpan: 2,
    variant: "tek",
    title: "Iron-progresjon CS70→CS80",
    pill: "tek",
    badge: { kind: "forest", text: "AV ANDERS" },
    meta: "14:00 — 15:30 · 240 reps",
  },
  // 16:00 row (startRow=8)
  {
    day: 2,
    startRow: 8,
    rowSpan: 0.8,
    variant: "turn",
    title: "Mental visualisering",
    pill: "turn",
    badge: { kind: "muted", text: "15 MIN" },
  },
  // 17:00 row (startRow=9)
  {
    day: 1,
    startRow: 9,
    rowSpan: 1.3,
    variant: "spill",
    title: "9-hulls spillsim",
    pill: "spill",
    badge: { kind: "muted", text: "EGEN" },
    meta: "17:00 — 18:30 · 9 hull",
  },
  {
    day: 3,
    startRow: 9,
    rowSpan: 0.8,
    variant: "fys",
    title: "Mobilitet + rotasjon",
    pill: "fys",
    badge: { kind: "muted", text: "EGEN" },
  },
  // 18:00 row (startRow=10)
  {
    day: 6,
    startRow: 10,
    rowSpan: 0.8,
    variant: "slag",
    title: "Putting 0—3m",
    pill: "slag",
    badge: { kind: "lime", text: "FAVORITT" },
  },
];

const EVENT_VARIANT_STYLE: Record<
  CalEvent["variant"],
  { border: string; bg: string }
> = {
  tek: { border: C.tek, bg: "rgba(0,88,64,0.05)" },
  slag: { border: C.slag, bg: "rgba(44,125,82,0.06)" },
  fys: { border: C.fys, bg: "rgba(26,77,46,0.06)" },
  spill: { border: C.spill, bg: "rgba(136,180,90,0.10)" },
  turn: { border: "#C8B72A", bg: "rgba(209,248,67,0.18)" },
};

function CalendarCard() {
  const days = [
    { label: "MAN", num: 19, today: true },
    { label: "TIR", num: 20 },
    { label: "ONS", num: 21 },
    { label: "TOR", num: 22 },
    { label: "FRE", num: 23 },
    { label: "LØR", num: 24, weekend: true },
    { label: "SØN", num: 25, weekend: true },
  ];
  const times = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
  ];
  const ROW_H = 44;

  // tom-celler (event-empty)
  const emptyCells: Array<{ day: number; row: number; text: string }> = [
    { day: 3, row: 4, text: "Selvplanlegg eller be om økt" },
    { day: 3, row: 7, text: "Selvplanlegg eller be om økt" },
  ];
  const ctaCells: Array<{ day: number; row: number }> = [
    { day: 6, row: 1 }, // Be om plan-justering — søndag 09
  ];

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div
            className="font-display text-[18px] font-semibold tracking-[-0.01em]"
            style={{ color: C.fg }}
          >
            Uke 21 · 19—25 mai 2026
          </div>
          <MonoText
            className="mt-[3px] text-[10.5px] tracking-[0.06em]"
            style={{ color: C.muted }}
          >
            5 ØKTER PLANLAGT · 195 MIN · 67% PYRAMIDE
          </MonoText>
        </div>
        <div className="flex gap-[6px]">
          <IconSquareBtn>
            <ChevronLeft className="h-[13px] w-[13px]" />
          </IconSquareBtn>
          <PillButton variant="outline" size="sm">
            I dag
          </PillButton>
          <IconSquareBtn>
            <ChevronRight className="h-[13px] w-[13px]" />
          </IconSquareBtn>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-lg border-l border-t"
        style={{ borderColor: C.borderSoft }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: "38px repeat(7, 1fr)",
          }}
        >
          {/* corner */}
          <div
            className="border-b border-r"
            style={{ background: "#fff", borderColor: C.borderSoft }}
          />
          {days.map((d) => (
            <div
              key={d.label}
              className={cn(
                "border-b border-r px-[6px] py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em]",
              )}
              style={{
                background: d.today
                  ? C.accent
                  : d.weekend
                    ? C.bgSoft
                    : "#fff",
                color: d.today ? C.fg : C.muted,
                borderColor: C.borderSoft,
                borderRight: d.today ? "0" : `1px solid ${C.borderSoft}`,
                fontWeight: d.today ? 700 : undefined,
                boxShadow: d.today ? `inset 0 -2px 0 ${C.primary}` : undefined,
              }}
            >
              {d.label}
              <span
                className="mt-[2px] block font-display text-[16px] font-bold tracking-[-0.01em]"
                style={{ color: C.fg }}
              >
                {d.num}
              </span>
            </div>
          ))}

          {/* Tids-rader */}
          {times.map((t, rowIdx) => (
            <RowCells
              key={t}
              time={t}
              rowIdx={rowIdx}
              rowH={ROW_H}
              days={days}
              events={CAL_EVENTS}
              emptyCells={emptyCells}
              ctaCells={ctaCells}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function RowCells({
  time,
  rowIdx,
  rowH,
  days,
  events,
  emptyCells,
  ctaCells,
}: {
  time: string;
  rowIdx: number;
  rowH: number;
  days: Array<{ today?: boolean; weekend?: boolean }>;
  events: CalEvent[];
  emptyCells: Array<{ day: number; row: number; text: string }>;
  ctaCells: Array<{ day: number; row: number }>;
}) {
  return (
    <>
      <div
        className="border-b border-r px-[6px] pt-1 text-right font-mono text-[9.5px] leading-none tracking-[0.04em]"
        style={{
          background: "#fff",
          borderColor: C.borderSoft,
          color: C.mutedSoft,
        }}
      >
        {time}
      </div>
      {days.map((d, dayIdx) => {
        const matchedEvents = events.filter(
          (e) => e.day === dayIdx && e.startRow === rowIdx,
        );
        const isEmpty = emptyCells.find(
          (c) => c.day === dayIdx && c.row === rowIdx,
        );
        const isCta = ctaCells.find(
          (c) => c.day === dayIdx && c.row === rowIdx,
        );
        return (
          <div
            key={dayIdx}
            className="relative border-b border-r"
            style={{
              background: d.today
                ? "#FCFDF1"
                : d.weekend
                  ? C.bgSoft
                  : "#fff",
              borderColor: C.borderSoft,
              height: `${rowH}px`,
            }}
          >
            {matchedEvents.map((e, i) => (
              <CalendarEvent key={i} event={e} rowH={rowH} />
            ))}
            {isEmpty && (
              <div
                className="absolute flex items-center justify-center rounded-lg p-1 text-center font-mono text-[9.5px] leading-[1.3] tracking-[0.02em]"
                style={{
                  inset: "4px",
                  border: `1.5px dashed ${C.border}`,
                  color: C.mutedSoft,
                }}
              >
                {isEmpty.text}
              </div>
            )}
            {isCta && (
              <div
                className="absolute flex flex-col items-center justify-center gap-[6px] rounded-[10px] p-2 text-center font-display text-[11.5px] font-semibold leading-[1.2]"
                style={{
                  inset: "4px",
                  background: C.accent,
                  color: C.fg,
                }}
              >
                <Plus className="h-[18px] w-[18px]" strokeWidth={2} />
                Be om plan-justering
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function CalendarEvent({ event, rowH }: { event: CalEvent; rowH: number }) {
  const s = EVENT_VARIANT_STYLE[event.variant];
  const height = event.rowSpan * rowH - 4;
  return (
    <div
      className="absolute z-[2] flex flex-col gap-1 overflow-hidden rounded-lg border p-[6px_8px]"
      style={{
        left: "4px",
        right: "4px",
        top: "2px",
        height: `${height}px`,
        background: s.bg,
        borderColor: C.border,
        borderLeft: `3px solid ${s.border}`,
      }}
    >
      {event.completed && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(135deg, transparent 0 6px, rgba(44,125,82,0.04) 6px 7px)",
          }}
        />
      )}
      <div
        className="truncate font-display text-[11.5px] font-semibold leading-[1.2]"
        style={{ color: C.fg }}
      >
        {event.title}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <Pill kind={event.pill}>{event.pill.toUpperCase()}</Pill>
        {event.badge && (
          <Badge kind={event.badge.kind} icon={event.badge.icon}>
            {event.badge.text}
          </Badge>
        )}
      </div>
      {event.meta && (
        <MonoText
          className="text-[9.5px] tracking-[0.04em]"
          style={{ color: C.muted }}
        >
          {event.meta}
        </MonoText>
      )}
    </div>
  );
}

function IconSquareBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border bg-white"
      style={{ borderColor: C.border, color: C.muted }}
    >
      {children}
    </button>
  );
}

function NextUpCard() {
  return (
    <div
      className="grid items-center gap-5 rounded-2xl border p-5 text-white"
      style={{
        gridTemplateColumns: "1fr 180px",
        background: "linear-gradient(160deg, #006C50 0%, #003A2A 100%)",
        borderColor: "transparent",
      }}
    >
      <div>
        <div
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: C.accent }}
        >
          Neste opp · I dag 14:00
        </div>
        <div className="mt-[6px] font-display text-[20px] font-semibold leading-tight tracking-[-0.01em] text-white">
          Iron-progresjon CS70 → CS80
        </div>
        <div className="mt-[10px] flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-[9px] py-[3px] font-mono text-[10px] font-semibold uppercase tracking-[0.08em]"
            style={{ background: "rgba(209,248,67,0.18)", color: C.accent }}
          >
            TEK
          </span>
          <span
            className="inline-flex items-center rounded-full px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em]"
            style={{ background: "rgba(255,255,255,0.10)", color: "#fff" }}
          >
            AV ANDERS
          </span>
          <MonoText
            className="text-[10.5px] tracking-[0.08em]"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            90 MIN · 240 REPS · BAY 4
          </MonoText>
        </div>
        <div className="mt-[14px] flex flex-col gap-[6px]">
          {[
            <>
              Snitt CS opp fra 74 til{" "}
              <strong style={{ color: C.accent }} className="font-mono">
                76 mph
              </strong>
            </>,
            <>
              Smash-faktor over{" "}
              <strong style={{ color: C.accent }} className="font-mono">
                1,42
              </strong>{" "}
              på siste 20 reps
            </>,
            <>
              Lav-spinn dispersjon under{" "}
              <strong style={{ color: C.accent }} className="font-mono">
                ±4 m
              </strong>
            </>,
          ].map((n, i) => (
            <div
              key={i}
              className="flex items-center gap-[10px] text-[12.5px] leading-[1.4]"
              style={{ color: "rgba(255,255,255,0.88)" }}
            >
              <span
                className="h-[6px] w-[6px] flex-shrink-0 rounded-full"
                style={{ background: C.accent }}
              />
              <span>{n}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-stretch gap-3">
        <div
          className="rounded-xl px-[14px] py-3 text-center"
          style={{ background: "rgba(0,0,0,0.20)" }}
        >
          <MonoText
            className="text-[9.5px] uppercase tracking-[0.10em]"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            STARTER OM
          </MonoText>
          <div
            className="mt-1 font-mono text-[22px] font-bold tracking-[-0.01em]"
            style={{ color: C.accent }}
          >
            3 t 42 m
          </div>
        </div>
        <div className="flex flex-col gap-[6px]">
          <PillButton variant="primary" size="sm" className="justify-center">
            Start økt
          </PillButton>
          <PillButton variant="outline" size="sm" className="justify-center">
            Endre
          </PillButton>
        </div>
      </div>
    </div>
  );
}

function LoadCard() {
  type Day = {
    label: string;
    val: number | null;
    today?: boolean;
    segs: Array<{ flex: number; bg: string }>;
    barHeightPct: number;
    empty?: boolean;
  };
  const days: Day[] = [
    {
      label: "MAN",
      val: 150,
      segs: [
        { flex: 46, bg: C.slag },
        { flex: 54, bg: C.tek },
      ],
      barHeightPct: 115,
    },
    {
      label: "TIR",
      val: 30,
      segs: [{ flex: 100, bg: C.fys }],
      barHeightPct: 30,
    },
    {
      label: "ONS",
      val: 180,
      today: true,
      segs: [
        { flex: 50, bg: C.slag },
        { flex: 8, bg: C.turnBar },
        { flex: 42, bg: C.tek },
      ],
      barHeightPct: 95,
    },
    { label: "TOR", val: null, segs: [], barHeightPct: 10, empty: true },
    {
      label: "FRE",
      val: 110,
      segs: [
        { flex: 55, bg: C.tek },
        { flex: 45, bg: C.fys },
      ],
      barHeightPct: 55,
    },
    {
      label: "LØR",
      val: 240,
      segs: [{ flex: 100, bg: C.spill }],
      barHeightPct: 120,
    },
    {
      label: "SØN",
      val: 30,
      segs: [{ flex: 100, bg: C.slag }],
      barHeightPct: 20,
    },
  ];

  return (
    <Card>
      <CardHead
        left={
          <div>
            <div
              className="font-display text-[14px] font-semibold"
              style={{ color: C.fg }}
            >
              Uke-belastning
            </div>
            <MonoText
              className="mt-[2px] text-[10px] tracking-[0.06em]"
              style={{ color: C.muted }}
            >
              MINUTTER PER DAG · MÅL 180 MIN/DAG
            </MonoText>
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <MonoText
              className="text-[10.5px] tracking-[0.06em]"
              style={{ color: C.muted }}
            >
              SNITT
            </MonoText>
            <MonoText
              className="text-[13px] font-bold"
              style={{ color: C.fg }}
            >
              156 MIN
            </MonoText>
          </div>
        }
      />

      <div
        className="grid h-[140px] gap-3"
        style={{ gridTemplateColumns: "34px 1fr" }}
      >
        <div className="flex flex-col justify-between py-[2px] text-right">
          {["240", "120", "0"].map((v) => (
            <MonoText
              key={v}
              className="text-[9.5px] leading-none tracking-[0.04em]"
              style={{ color: C.muted }}
            >
              {v}
            </MonoText>
          ))}
        </div>
        <div
          className="relative grid grid-cols-7 gap-[10px]"
          style={{
            borderTop: `1px dashed ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
            background: `linear-gradient(to bottom, transparent 0, transparent calc(50% - 0.5px), ${C.borderSoft} calc(50% - 0.5px), ${C.borderSoft} calc(50% + 0.5px), transparent calc(50% + 0.5px))`,
          }}
        >
          {days.map((d, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center justify-end pb-[26px]"
            >
              {d.today && (
                <div
                  className="pointer-events-none absolute rounded"
                  style={{
                    top: "-4px",
                    bottom: "24px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "calc(80% + 8px)",
                    maxWidth: "40px",
                    background: "rgba(209,248,67,0.10)",
                    border: `1px dashed ${C.accent}`,
                  }}
                />
              )}
              {d.empty ? (
                <div
                  className="w-[80%] max-w-[32px] self-center rounded-t"
                  style={{
                    height: `${d.barHeightPct}%`,
                    background: C.borderSoft,
                  }}
                />
              ) : (
                <div
                  className="flex w-[80%] max-w-[32px] flex-col justify-end self-center overflow-hidden rounded-t"
                  style={{ height: `${d.barHeightPct}%` }}
                >
                  {d.segs.map((s, j) => (
                    <div
                      key={j}
                      style={{
                        background: s.bg,
                        flexBasis: `${s.flex}%`,
                      }}
                    />
                  ))}
                </div>
              )}
              <span
                className="absolute font-mono text-[9.5px] tracking-[0.10em]"
                style={{ bottom: "10px", color: C.muted }}
              >
                {d.label}
              </span>
              <span
                className={cn(
                  "absolute font-mono text-[10px]",
                  d.val === null ? "font-normal" : "font-semibold",
                )}
                style={{
                  bottom: "-2px",
                  color: d.val === null ? C.mutedSoft : C.fg,
                }}
              >
                {d.val === null ? "—" : d.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-2 flex flex-wrap gap-[14px] border-t pt-[14px]"
        style={{ borderColor: C.borderSoft }}
      >
        {[
          ["FYS", C.fys],
          ["TEK", C.tek],
          ["SLAG", C.slag],
          ["SPILL", C.spill],
          ["TURN", C.turnBar],
        ].map(([label, bg]) => (
          <span
            key={label}
            className="inline-flex items-center gap-[6px] font-mono text-[10.5px] tracking-[0.04em]"
            style={{ color: C.muted }}
          >
            <span
              className="h-[3px] w-[14px] rounded"
              style={{ background: bg }}
            />
            {label}
          </span>
        ))}
      </div>
    </Card>
  );
}

// -----------------------------
// Pane C — Drills + Periodisering
// -----------------------------
function PaneC() {
  const reco = [
    {
      icon: <Target className="h-[14px] w-[14px]" />,
      title: "Pitch fra rough",
      meta: "Coach foreslår · 45 min",
    },
    {
      icon: <TrendingUp className="h-[14px] w-[14px]" />,
      title: "Beinbøy intervall",
      meta: "Du har ikke trent FYS på 9 dager",
    },
    {
      icon: <TrendingDown className="h-[14px] w-[14px]" />,
      title: "Putting 3—6m",
      meta: "SG har sunket 0,4 siste 30 dager",
    },
  ];
  const drills = [
    {
      title: "Pitch 50—100m, lav",
      pill: "slag" as const,
      mins: "60 MIN",
      badge: { kind: "forest" as const, text: "TILDELT" },
    },
    {
      title: "Putting 0—3m blokk",
      pill: "slag" as const,
      mins: "30 MIN",
      badge: { kind: "lime" as const, text: "FAVORITT" },
    },
    { title: "Beinbøy + core", pill: "fys" as const, mins: "30 MIN" },
    {
      title: "Iron CS70→CS80",
      pill: "tek" as const,
      mins: "90 MIN",
      badge: { kind: "forest" as const, text: "TILDELT" },
    },
    { title: "Driver grunntrening", pill: "tek" as const, mins: "60 MIN" },
    { title: "Bunker eskalering", pill: "slag" as const, mins: "45 MIN" },
  ];
  const drillTabs = ["Alle", "Favoritter", "Tildelt (5 nye)"];
  const [activeDrillTab, setActiveDrillTab] = useState(drillTabs[0]);
  const pyramide = [
    { label: "TURN", pct: 5, bg: C.turn },
    { label: "SPILL", pct: 15, bg: C.spill },
    { label: "SLAG", pct: 30, bg: C.slag },
    { label: "TEK", pct: 30, bg: "#3A8B6C" },
    { label: "FYS", pct: 20, bg: "#88B45A" },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {/* Anbefalt */}
      <div
        className="rounded-2xl p-[18px]"
        style={{
          background: "rgba(209,248,67,0.08)",
          border: "1px solid rgba(209,248,67,0.45)",
          borderLeft: `4px solid ${C.accent}`,
        }}
      >
        <CardHead
          left={
            <SectionLabel style={{ color: C.primary }}>
              Anbefalt for deg
            </SectionLabel>
          }
          right={
            <MonoText
              className="text-[10px]"
              style={{ color: C.muted }}
            >
              3 FORSLAG
            </MonoText>
          }
        />
        {reco.map((r, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-[10px] py-[10px]",
              i < reco.length - 1 && "border-b",
              i === 0 && "pt-1",
              i === reco.length - 1 && "pb-0",
            )}
            style={{
              borderColor:
                i < reco.length - 1 ? "rgba(209,248,67,0.25)" : undefined,
            }}
          >
            <div
              className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: C.accent, color: C.fg }}
            >
              {r.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div
                className="font-display text-[12.5px] font-semibold leading-[1.2]"
                style={{ color: C.fg }}
              >
                {r.title}
              </div>
              <MonoText
                className="mt-[2px] text-[9.5px] tracking-[0.02em]"
                style={{ color: C.muted }}
              >
                {r.meta}
              </MonoText>
            </div>
            <PillButton variant="primary" size="xs">
              Bruk
            </PillButton>
          </div>
        ))}
      </div>

      {/* Mine drills */}
      <Card>
        <CardHead
          left={
            <div>
              <div
                className="font-display text-[14px] font-semibold"
                style={{ color: C.fg }}
              >
                Mine drills
              </div>
              <MonoText
                className="mt-[2px] text-[10px] tracking-[0.06em]"
                style={{ color: C.muted }}
              >
                24 TILGJENGELIGE
              </MonoText>
            </div>
          }
          right={
            <PillButton
              variant="outline"
              size="xs"
              icon={<Plus className="h-[14px] w-[14px]" />}
            >
              Ny
            </PillButton>
          }
        />
        <div className="mb-3 flex flex-wrap gap-1">
          {drillTabs.map((t) => {
            const active = activeDrillTab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setActiveDrillTab(t)}
                className="rounded-full border-0 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em]"
                style={{
                  background: active ? C.fg : "transparent",
                  color: active ? C.accent : C.muted,
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {drills.map((d, i) => (
            <div
              key={i}
              className="flex items-center gap-[10px] rounded-[10px] border bg-white p-[10px]"
              style={{ borderColor: C.borderSoft }}
            >
              <GripVertical
                className="h-[14px] w-[12px] flex-shrink-0"
                style={{ color: C.mutedSoft }}
              />
              <div className="min-w-0 flex-1">
                <div
                  className="font-display text-[12.5px] font-semibold leading-[1.25]"
                  style={{ color: C.fg }}
                >
                  {d.title}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-[6px]">
                  <Pill kind={d.pill}>{d.pill.toUpperCase()}</Pill>
                  <MonoText
                    className="text-[10px]"
                    style={{ color: C.muted }}
                  >
                    {d.mins}
                  </MonoText>
                  {d.badge && (
                    <Badge kind={d.badge.kind}>{d.badge.text}</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Min progresjon (dark) */}
      <div
        className="flex flex-col gap-4 rounded-2xl p-5 text-white"
        style={{ background: C.primaryDark }}
      >
        <div>
          <div
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: C.accent }}
          >
            Aktiv periode
          </div>
          <div className="mt-1 font-display text-[18px] font-semibold tracking-[-0.01em] text-white">
            Spesialisering
          </div>
          <MonoText
            className="mt-1 text-[10.5px] tracking-[0.06em]"
            style={{ color: C.accent }}
          >
            Uke 17—22 · 6 uker · CS70 → CS80
          </MonoText>
        </div>

        <div className="flex flex-col gap-[7px] py-1">
          {pyramide.map((p) => (
            <div
              key={p.label}
              className="grid items-center gap-[10px]"
              style={{ gridTemplateColumns: "40px 1fr 36px" }}
            >
              <span
                className="font-mono text-[9.5px] font-semibold tracking-[0.10em]"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {p.label}
              </span>
              <div
                className="h-[7px] overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${p.pct}%`, background: p.bg }}
                />
              </div>
              <span className="text-right font-mono text-[10px] font-medium text-white">
                {p.pct} %
              </span>
            </div>
          ))}
        </div>

        <div
          className="flex items-center gap-[14px] rounded-xl p-[10px]"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <svg
            width="78"
            height="78"
            viewBox="0 0 78 78"
            className="flex-shrink-0"
          >
            <circle
              cx="39"
              cy="39"
              r="32"
              fill="none"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="6"
            />
            <circle
              cx="39"
              cy="39"
              r="32"
              fill="none"
              stroke={C.accent}
              strokeWidth="6"
              strokeDasharray="150.8 201"
              strokeDashoffset="0"
              transform="rotate(-90 39 39)"
              strokeLinecap="round"
            />
            <text
              x="39"
              y="44"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="18"
              fontWeight="600"
              fill="#fff"
            >
              75%
            </text>
          </svg>
          <div>
            <div className="font-display text-[14px] font-medium leading-[1.3] text-white">
              mot CS80
            </div>
            <MonoText
              className="mt-[2px] text-[10.5px] tracking-[0.04em]"
              style={{ color: C.accent }}
            >
              Carry-speed milepæl
            </MonoText>
          </div>
        </div>

        <div
          className="flex items-center justify-between gap-[10px] rounded-xl px-[14px] py-3"
          style={{
            background: "rgba(163,45,45,0.18)",
            border: "1px solid rgba(163,45,45,0.40)",
          }}
        >
          <div>
            <MonoText
              className="text-[10px] uppercase tracking-[0.10em]"
              style={{ color: "#F5C8C8" }}
            >
              Hovedmål
            </MonoText>
            <div className="mt-[2px] font-display text-[13px] font-semibold text-white">
              Sørlandsåpent
            </div>
          </div>
          <div className="font-mono text-[22px] font-bold text-white">
            21
            <span
              className="ml-[2px] text-[10px] font-medium"
              style={{ color: "#F5C8C8" }}
            >
              {" "}
              dager
            </span>
          </div>
        </div>

        <div
          className="flex gap-[10px] rounded-xl bg-white p-3"
          style={{ borderLeft: `3px solid ${C.accent}`, color: C.fg }}
        >
          <div
            className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold"
            style={{ background: C.primary, color: C.accent }}
          >
            AK
          </div>
          <div className="min-w-0 flex-1">
            <MonoText
              className="text-[9.5px] uppercase tracking-[0.08em]"
              style={{ color: C.muted }}
            >
              Anders K. · for 2 t siden
            </MonoText>
            <div
              className="mt-1 text-[14px] italic leading-[1.45]"
              style={{
                fontFamily: "var(--font-instrument-serif), serif",
                color: C.fg,
              }}
            >
              &ldquo;Du har vært jevn denne uka, Markus. Hold trykket inn mot
              Sørlandsåpent.&rdquo;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Generelle card-byggesteiner
// -----------------------------
function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-2xl border p-[18px]", className)}
      style={{ background: C.card, borderColor: C.border }}
    >
      {children}
    </div>
  );
}

function CardHead({
  left,
  right,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-[14px] flex items-center justify-between">
      {left}
      {right}
    </div>
  );
}

function SectionLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em]"
      style={{ color: C.muted, ...style }}
    >
      {children}
    </span>
  );
}

// -----------------------------
// 4. MÅL-TRACKERS
// -----------------------------
function GoalsSection() {
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <div
            className="font-display text-[20px] font-semibold tracking-[-0.01em]"
            style={{ color: C.fg }}
          >
            Mine mål
          </div>
          <MonoText
            className="mt-1 text-[10.5px] tracking-[0.06em]"
            style={{ color: C.muted }}
          >
            3 AKTIVE MÅL · SISTE OPPDATERING 17. MAI
          </MonoText>
        </div>
        <PillButton
          variant="outline"
          icon={<Plus className="h-[14px] w-[14px]" />}
        >
          Nytt mål
        </PillButton>
      </div>

      <div className="grid grid-cols-3 gap-[18px]">
        <GoalCardOne />
        <GoalCardTwo />
        <GoalCardThree />
      </div>
    </section>
  );
}

function GoalCardOne() {
  return (
    <div
      className="flex min-h-[240px] flex-col gap-3 rounded-2xl border bg-white p-[22px]"
      style={{ borderColor: C.border }}
    >
      <div className="flex items-center gap-2">
        <SectionLabel>Resultatmål</SectionLabel>
        <span className="ml-auto">
          <Pill kind="turn">PRIO 1</Pill>
        </span>
      </div>
      <h3
        className="font-display text-[18px] font-semibold leading-[1.2] tracking-[-0.01em]"
        style={{ color: C.fg }}
      >
        Top 10 NM Slag
      </h3>
      <div className="mt-1 flex items-center gap-4">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={C.border}
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={C.accent}
            strokeWidth="8"
            strokeDasharray="100.3 263.9"
            strokeDashoffset="0"
            transform="rotate(-90 50 50)"
            strokeLinecap="round"
          />
          <text
            x="50"
            y="48"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="22"
            fontWeight="600"
            fill={C.fg}
          >
            38%
          </text>
          <text
            x="50"
            y="64"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="9"
            fill={C.muted}
            letterSpacing="1"
          >
            SANNSYNLIG
          </text>
        </svg>
        <div>
          <MonoText
            className="text-[11px] uppercase tracking-[0.08em]"
            style={{ color: C.muted }}
          >
            50 DAGER
          </MonoText>
          <MonoText
            className="mt-[6px] block text-[11px] tracking-[0.04em]"
            style={{ color: C.success }}
          >
            ↑ +6% siden forrige uke
          </MonoText>
        </div>
      </div>
      <div
        className="mt-auto text-[14px] leading-[1.5]"
        style={{ color: C.fg }}
      >
        <em
          className="not-italic"
          style={{
            fontFamily: "var(--font-instrument-serif), serif",
            fontStyle: "italic",
            fontWeight: 400,
            color: C.primary,
          }}
        >
          Du må forbedre approach +0,4 SG
        </em>{" "}
        for 50% sannsynlighet.
      </div>
    </div>
  );
}

function GoalCardTwo() {
  return (
    <div
      className="flex min-h-[240px] flex-col gap-3 rounded-2xl border bg-white p-[22px]"
      style={{ borderColor: C.border }}
    >
      <div className="flex items-center gap-2">
        <SectionLabel>Prosessmål</SectionLabel>
        <span
          className="ml-auto inline-flex items-center gap-[5px] rounded-full px-[10px] py-1 font-mono text-[11px] font-semibold tracking-[0.04em]"
          style={{
            background: "rgba(44,125,82,0.15)",
            color: C.success,
          }}
        >
          <TrendingDown className="h-[10px] w-[10px]" strokeWidth={2.5} />
          71,4
        </span>
      </div>
      <h3
        className="font-display text-[18px] font-semibold leading-[1.2] tracking-[-0.01em]"
        style={{ color: C.fg }}
      >
        Snitt under 72 på Srixon
      </h3>
      <svg
        viewBox="0 0 320 90"
        preserveAspectRatio="none"
        className="h-[90px] w-full"
      >
        <line
          x1="0"
          y1="35"
          x2="320"
          y2="35"
          stroke={C.border}
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text
          x="318"
          y="32"
          textAnchor="end"
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
          fill={C.muted}
        >
          72
        </text>
        <polyline
          fill="rgba(209,248,67,0.18)"
          stroke="none"
          points="6,22 32,30 58,18 84,42 110,28 136,46 162,38 188,28 214,32 240,24 266,40 292,30 292,88 6,88"
        />
        <polyline
          fill="none"
          stroke={C.accent}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points="6,22 32,30 58,18 84,42 110,28 136,46 162,38 188,28 214,32 240,24 266,40 292,30"
        />
        <g fill={C.primary}>
          {[
            [6, 22],
            [32, 30],
            [58, 18],
            [84, 42],
            [110, 28],
            [136, 46],
            [162, 38],
            [188, 28],
            [214, 32],
            [240, 24],
            [266, 40],
            [292, 30],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2.5" />
          ))}
        </g>
      </svg>
      <div
        className="mt-auto text-[14px] leading-[1.5]"
        style={{ color: C.fg }}
      >
        <em
          className="not-italic"
          style={{
            fontFamily: "var(--font-instrument-serif), serif",
            fontStyle: "italic",
            fontWeight: 400,
            color: C.primary,
          }}
        >
          5 av siste 7 runder
        </em>{" "}
        under 72. Snitt 71,4.
      </div>
    </div>
  );
}

function GoalCardThree() {
  return (
    <div
      className="flex min-h-[240px] flex-col gap-3 rounded-2xl border bg-white p-[22px]"
      style={{ borderColor: C.border }}
    >
      <div className="flex items-center gap-2">
        <SectionLabel>Resultatmål</SectionLabel>
        <span className="ml-auto">
          <Pill kind="fys">SESONG</Pill>
        </span>
      </div>
      <h3
        className="font-display text-[18px] font-semibold leading-[1.2] tracking-[-0.01em]"
        style={{ color: C.fg }}
      >
        HCP under +2,0 innen sesongslutt
      </h3>
      <div className="mt-auto flex flex-col gap-[14px]">
        <div
          className="relative h-3 overflow-visible rounded-full"
          style={{
            background:
              "linear-gradient(to right, rgba(163,45,45,0.25) 0%, rgba(163,45,45,0.25) 30%, rgba(184,133,42,0.30) 30%, rgba(184,133,42,0.30) 65%, rgba(44,125,82,0.30) 65%, rgba(44,125,82,0.30) 100%)",
          }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 rounded-full"
            style={{
              width: "60%",
              background: C.accent,
              boxShadow: "0 0 0 2px rgba(255,255,255,0.6)",
            }}
          />
          <div
            className="absolute"
            style={{
              top: "-5px",
              left: "calc(60% - 1.5px)",
              width: "3px",
              height: "22px",
              background: C.fg,
              borderRadius: "2px",
            }}
          />
        </div>
        <div className="flex items-baseline justify-between">
          <MonoText
            className="text-[11px] tracking-[0.06em]"
            style={{ color: C.muted }}
          >
            +3,5
          </MonoText>
          <MonoText
            className="text-[18px] font-bold"
            style={{ color: C.fg }}
          >
            +2,9
          </MonoText>
          <MonoText
            className="text-[11px] tracking-[0.06em]"
            style={{ color: C.muted }}
          >
            +2,0
          </MonoText>
        </div>
        <div className="flex items-center justify-between">
          <MonoText
            className="text-[10.5px] tracking-[0.06em]"
            style={{ color: C.muted }}
          >
            82 DAGER IGJEN
          </MonoText>
          <MonoText
            className="text-[11px] font-semibold"
            style={{ color: C.success }}
          >
            60% AV VEIEN
          </MonoText>
        </div>
      </div>
      <div className="text-[14px] leading-[1.5]" style={{ color: C.fg }}>
        <em
          className="not-italic"
          style={{
            fontFamily: "var(--font-instrument-serif), serif",
            fontStyle: "italic",
            fontWeight: 400,
            color: C.primary,
          }}
        >
          Fra +3,5 til +2,0
        </em>{" "}
        = forbedring på 1,5 slag.
      </div>
    </div>
  );
}

// -----------------------------
// 5. INSIGHT STRIP
// -----------------------------
function InsightSection() {
  const prios = [
    {
      num: "01",
      title: "Approach 100—150m",
      meta: "Bossum har 6 hull i dette området. Største gap mot kategori-snitt.",
      pot: "+0,42 SG potensial",
    },
    {
      num: "02",
      title: "Putting 3—6m",
      meta: "SG har sunket 0,4 siste 30 dager. Stort comeback-potensial.",
      pot: "+0,38 SG potensial",
    },
    {
      num: "03",
      title: "Driver-presisjon",
      meta: "Smale fairways på Bossum. Treff-prosent under kategori-snitt.",
      pot: "+0,22 SG potensial",
    },
  ];
  const dgRows: Array<{
    label: string;
    val: string;
    valTone: "pos" | "neg" | "warn";
    fill: { side: "left" | "right"; width: number; color: string };
  }> = [
    {
      label: "Off-tee",
      val: "−0,12",
      valTone: "warn",
      fill: { side: "right", width: 6, color: C.warning },
    },
    {
      label: "Approach",
      val: "−0,42",
      valTone: "neg",
      fill: { side: "right", width: 21, color: C.danger },
    },
    {
      label: "A-green",
      val: "+0,15",
      valTone: "pos",
      fill: { side: "left", width: 8, color: C.accent },
    },
    {
      label: "Putting",
      val: "−0,28",
      valTone: "warn",
      fill: { side: "right", width: 14, color: C.warning },
    },
    {
      label: "Strategy",
      val: "+0,08",
      valTone: "pos",
      fill: { side: "left", width: 4, color: C.accent },
    },
  ];

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <div>
          <div
            className="font-display text-[20px] font-semibold tracking-[-0.01em]"
            style={{ color: C.fg }}
          >
            Hva må jeg jobbe med?
          </div>
          <MonoText
            className="mt-1 text-[10.5px] tracking-[0.06em]"
            style={{ color: C.muted }}
          >
            SG-DATA · SLAG-PRIORITERING · DATAGOLF KATEGORI A1
          </MonoText>
        </div>
        <PillButton variant="outline" size="sm">
          Full analyse →
        </PillButton>
      </div>

      <div
        className="mt-4 grid gap-[18px]"
        style={{ gridTemplateColumns: "1.4fr 1.2fr 0.9fr" }}
      >
        {/* SG-trend */}
        <div
          className="flex flex-col gap-[14px] rounded-2xl border bg-white p-5"
          style={{ borderColor: C.border }}
        >
          <div>
            <h3
              className="font-display text-[15px] font-semibold tracking-[-0.005em]"
              style={{ color: C.fg }}
            >
              SG-trend siste 90 dager
            </h3>
            <MonoText
              className="mt-1 text-[10px] uppercase tracking-[0.08em]"
              style={{ color: C.muted }}
            >
              Strokes Gained · 4 disipliner
            </MonoText>
          </div>
          <svg
            viewBox="0 0 380 180"
            preserveAspectRatio="none"
            className="h-[180px] w-full"
          >
            <line
              x1="32"
              y1="20"
              x2="380"
              y2="20"
              stroke={C.border}
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
            <line
              x1="32"
              y1="60"
              x2="380"
              y2="60"
              stroke={C.border}
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
            <line
              x1="32"
              y1="100"
              x2="380"
              y2="100"
              stroke={C.borderSoft}
              strokeWidth="1"
            />
            <line
              x1="32"
              y1="140"
              x2="380"
              y2="140"
              stroke={C.border}
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
            {[
              { y: 24, label: "+1,5" },
              { y: 64, label: "+0,5" },
              { y: 104, label: "0,0" },
              { y: 144, label: "−1,0" },
            ].map((l) => (
              <text
                key={l.label}
                x="28"
                y={l.y}
                textAnchor="end"
                fontFamily="JetBrains Mono, monospace"
                fontSize="9"
                fill={C.muted}
              >
                {l.label}
              </text>
            ))}
            <polyline
              fill="none"
              stroke={C.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points="38,90 80,86 122,84 164,80 206,78 248,76 290,74 332,72 374,70"
            />
            <polyline
              fill="none"
              stroke={C.danger}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points="38,70 80,76 122,80 164,88 206,96 248,104 290,118 332,126 374,134"
            />
            <polyline
              fill="none"
              stroke={C.success}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points="38,86 80,82 122,80 164,76 206,74 248,72 290,68 332,66 374,64"
            />
            <polyline
              fill="none"
              stroke={C.accent}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points="38,118 80,114 122,108 164,100 206,90 248,80 290,68 332,52 374,40"
            />
            {[
              { x: 60, label: "MAR" },
              { x: 200, label: "APR" },
              { x: 340, label: "MAI" },
            ].map((l) => (
              <text
                key={l.label}
                x={l.x}
                y="172"
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="9"
                fill={C.muted}
              >
                {l.label}
              </text>
            ))}
          </svg>
          <div className="flex flex-wrap gap-[14px] pt-1">
            {[
              ["Off-the-tee +0,12", C.primary],
              ["Approach −0,42", C.danger],
              ["Around-green +0,15", C.success],
              ["Putting +0,38", C.accent],
            ].map(([label, color]) => (
              <span
                key={label}
                className="inline-flex items-center gap-[6px] font-mono text-[10.5px] tracking-[0.04em]"
                style={{ color: C.muted }}
              >
                <span
                  className="h-[3px] w-[14px] rounded"
                  style={{ background: color }}
                />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Slag-prioritering */}
        <div
          className="flex flex-col gap-[14px] rounded-2xl border bg-white p-5"
          style={{ borderColor: C.border }}
        >
          <div>
            <SectionLabel>
              SLAG-PRIORITERING · SØRLANDSÅPENT · 21 DAGER
            </SectionLabel>
            <h3
              className="mt-[6px] font-display text-[15px] font-semibold tracking-[-0.005em]"
              style={{ color: C.fg }}
            >
              Hva gir mest poeng?
            </h3>
          </div>
          <div className="flex flex-col">
            {prios.map((p, i) => (
              <div
                key={p.num}
                className={cn(
                  "flex gap-3 py-3",
                  i < prios.length - 1 && "border-b",
                  i === prios.length - 1 && "pb-0",
                )}
                style={{
                  borderColor:
                    i < prios.length - 1 ? C.borderSoft : undefined,
                }}
              >
                <div
                  className="min-w-[26px] font-mono text-[18px] font-bold leading-none tracking-[-0.02em]"
                  style={{ color: C.mutedSoft }}
                >
                  {p.num}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="font-display text-[13.5px] font-semibold leading-[1.3]"
                    style={{ color: C.fg }}
                  >
                    {p.title}
                  </div>
                  <MonoText
                    className="mt-1 block text-[10.5px] leading-[1.4] tracking-[0.02em]"
                    style={{ color: C.muted }}
                  >
                    {p.meta}
                  </MonoText>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="inline-block rounded-full px-2 py-[2px] font-mono text-[10.5px] font-semibold tracking-[0.04em]"
                      style={{ background: C.accent, color: C.fg }}
                    >
                      {p.pot}
                    </span>
                    <PillButton variant="outline" size="xs">
                      Opprett drill
                    </PillButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DataGolf */}
        <div
          className="flex flex-col gap-[14px] rounded-2xl border bg-white p-5"
          style={{ borderColor: C.border }}
        >
          <div>
            <SectionLabel>DU VS DATAGOLF · KATEGORI A1</SectionLabel>
            <h3
              className="mt-[6px] font-display text-[15px] font-semibold tracking-[-0.005em]"
              style={{ color: C.fg }}
            >
              Sammenligning
            </h3>
          </div>
          <div>
            {dgRows.map((r, i) => (
              <div
                key={r.label}
                className={cn(
                  "grid items-center gap-2 py-2",
                  i < dgRows.length - 1 && "border-b",
                )}
                style={{
                  gridTemplateColumns: "80px 1fr 56px",
                  borderColor:
                    i < dgRows.length - 1 ? C.borderSoft : undefined,
                }}
              >
                <span
                  className="font-mono text-[10.5px] uppercase tracking-[0.04em]"
                  style={{ color: C.muted }}
                >
                  {r.label}
                </span>
                <div
                  className="relative h-[18px] overflow-hidden rounded-[6px]"
                  style={{ background: C.bg }}
                >
                  <div
                    className="absolute bottom-0 top-0 w-px"
                    style={{ left: "50%", background: C.border }}
                  />
                  <div
                    className="absolute rounded"
                    style={{
                      top: "3px",
                      bottom: "3px",
                      [r.fill.side]: "50%",
                      width: `${r.fill.width}%`,
                      background: r.fill.color,
                    }}
                  />
                </div>
                <MonoText
                  className="text-right text-[11px] font-semibold"
                  style={{
                    color:
                      r.valTone === "pos"
                        ? C.success
                        : r.valTone === "neg"
                          ? C.danger
                          : C.warning,
                  }}
                >
                  {r.val}
                </MonoText>
              </div>
            ))}
          </div>
          <MonoText
            className="border-t pt-[6px] text-[10px] tracking-[0.06em]"
            style={{ borderColor: C.borderSoft, color: C.muted }}
          >
            N=247 SPILLERE · A1-KATEGORI · DATA OPPDATERT 14. MAI
          </MonoText>
        </div>
      </div>
    </section>
  );
}

// -----------------------------
// 6. TRACKMAN-TIMELINE
// -----------------------------
function TrackmanSection() {
  const cards = [
    {
      date: "17. MAI",
      type: "Driver-økt",
      metrics: [
        { label: "Club-speed", val: "112 mph" },
        { label: "Smash", val: "1,48" },
      ],
    },
    {
      date: "15. MAI",
      type: "Iron 7",
      metrics: [
        { label: "Carry", val: "158 m" },
        { label: "Spinn", val: "6 820 rpm" },
      ],
    },
    {
      date: "13. MAI",
      type: "Pitch 50—100m",
      metrics: [
        { label: "Landing", val: "±3,2 m" },
        { label: "184 reps", val: "· 71% mål" },
      ],
    },
    {
      date: "12. MAI",
      type: "Putting blokk",
      metrics: [
        { label: "0—3m", val: "87%" },
        { label: "3—6m", val: "52%" },
      ],
    },
    {
      date: "10. MAI",
      type: "Iron-progresjon",
      metrics: [
        { label: "CS", val: "74 → 76 mph" },
        { label: "240 reps", val: "" },
      ],
    },
  ];

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <div>
          <SectionLabel>Min TrackMan · Siste økter</SectionLabel>
          <div
            className="mt-1 font-display text-[20px] font-semibold tracking-[-0.01em]"
            style={{ color: C.fg }}
          >
            Hva har jeg gjort sist?
          </div>
        </div>
        <PillButton
          variant="outline"
          icon={<Download className="h-[14px] w-[14px]" />}
        >
          Importer ny økt
        </PillButton>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-3">
        {cards.map((c, i) => (
          <div
            key={i}
            className="flex min-h-[140px] flex-col gap-[10px] rounded-[14px] border bg-white p-4"
            style={{ borderColor: C.border }}
          >
            <MonoText
              className="text-[10px] uppercase tracking-[0.10em]"
              style={{ color: C.muted }}
            >
              {c.date}
            </MonoText>
            <div
              className="font-display text-[14px] font-semibold tracking-[-0.005em]"
              style={{ color: C.fg }}
            >
              {c.type}
            </div>
            {c.metrics.map((m, j) => (
              <div
                key={j}
                className="font-mono text-[11.5px] font-medium leading-[1.4]"
                style={{ color: C.fg }}
              >
                <span className="font-normal" style={{ color: C.muted }}>
                  {m.label}
                </span>{" "}
                {m.val}
              </div>
            ))}
            <a
              className="mt-auto inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] font-semibold tracking-[0.04em] no-underline hover:opacity-80"
              style={{ color: C.primary }}
            >
              Åpne <ArrowRight className="h-[11px] w-[11px]" strokeWidth={2} />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

// -----------------------------
// 7. STICKY FOOTER
// -----------------------------
function StickyFooter() {
  const bars = [
    { label: "FYS", pct: 20, bg: C.fys },
    { label: "TEK", pct: 30, bg: C.tek },
    { label: "SLAG", pct: 30, bg: C.slag },
    { label: "SPILL", pct: 15, bg: C.spill },
    { label: "TURN", pct: 5, bg: C.turn },
  ];
  return (
    <footer
      className="fixed bottom-0 right-0 z-[25] flex h-16 items-center gap-8 border-t bg-white px-8"
      style={{ left: "220px", borderColor: C.border }}
    >
      <div className="flex items-center gap-[14px]">
        <span
          className="mr-1 font-mono text-[10px] uppercase tracking-[0.08em]"
          style={{ color: C.muted }}
        >
          Min pyramide denne uka:
        </span>
        {bars.map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-1">
            <span
              className="font-mono text-[9px] leading-none tracking-[0.06em]"
              style={{ color: C.muted }}
            >
              {b.label}
            </span>
            <div
              className="h-[5px] w-[60px] overflow-hidden rounded-full"
              style={{ background: C.border }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${b.pct}%`, background: b.bg }}
              />
            </div>
            <MonoText
              className="text-[9.5px] font-semibold"
              style={{ color: C.fg }}
            >
              {b.pct} %
            </MonoText>
          </div>
        ))}
      </div>

      <div
        className="flex-1 text-center font-mono text-[11px] tracking-[0.06em]"
        style={{ color: C.muted }}
      >
        <strong className="font-semibold" style={{ color: C.fg }}>
          4 PLANLAGT
        </strong>{" "}
        ·{" "}
        <strong className="font-semibold" style={{ color: C.fg }}>
          1 FULLFØRT
        </strong>{" "}
        ·{" "}
        <strong className="font-semibold" style={{ color: C.fg }}>
          195 MIN
        </strong>{" "}
        ·{" "}
        <strong className="font-semibold" style={{ color: C.fg }}>
          67% PYRAMIDE
        </strong>
      </div>

      <div className="ml-auto flex gap-2">
        <PillButton variant="outline">Be om økt-forslag</PillButton>
        <PillButton variant="primary" icon={<Plus className="h-[14px] w-[14px]" />}>
          Logg ny økt
        </PillButton>
      </div>
    </footer>
  );
}

// -----------------------------
// Root client component
// -----------------------------
export function WorkbenchClient() {
  // Award er importert men ikke i bruk ennå — referansen holdes for fremtidig
  // bruk i hero/medalje-seksjon. ESLint-stille pga eksplisitt void.
  void Award;
  void Mail;

  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: "220px 1fr" }}>
      <Sidebar />
      <main
        className="col-start-2 flex min-w-0 flex-col"
        style={{ paddingBottom: "64px" }}
      >
        <Topbar />
        <div className="flex flex-col gap-9 px-8 pb-12 pt-8">
          <HeroSection />
          <GanttSection />
          <WorkbenchSection />
          <GoalsSection />
          <InsightSection />
          <TrackmanSection />
        </div>
      </main>
      <StickyFooter />
    </div>
  );
}
