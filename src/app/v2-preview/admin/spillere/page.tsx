"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Calendar,
  BarChart3,
  Settings,
  ClipboardCheck,
  Bell,
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import {
  LiveBar,
  PageHero,
  SectionHeader,
  StatTile,
  PhotoDivider,
  useNowTime,
} from "@/components/athletic";
import {
  COACH_DATA,
  TODAY_SESSIONS,
  WEATHER_DATA,
} from "@/lib/v2-fixtures";
import type { StatTile as StatTileData } from "@/lib/v2-fixtures";

// ── Utvidet spillermodell ──────────────────────────────────────────────────────

type NivaPill = "A1" | "A2" | "B1" | "B2" | "JR";
type TierLabel = "PRO" | "GRATIS" | "JUNIOR";
type StatusLabel = "Aktiv" | "Inaktiv 30d" | "Skadd";
type TrendDir = "up" | "down" | "flat";

type Spiller = {
  id: string;
  name: string;
  initials: string;
  hcp: number;
  hcpTrend: TrendDir;
  akademi: string;
  lastSession: string;
  tier: TierLabel;
  niva: NivaPill;
  status: StatusLabel;
  planWeek: number;
  planWeeksTotal: number;
};

// ── 14 spillere — lokalt fixture ──────────────────────────────────────────────

const STALL: Spiller[] = [
  {
    id: "s01",
    name: "Øyvind Rohjan",
    initials: "ØR",
    hcp: -2.1,
    hcpTrend: "down",
    akademi: "WANG Toppidrett",
    lastSession: "for 12 min siden",
    tier: "PRO",
    niva: "A1",
    status: "Aktiv",
    planWeek: 8,
    planWeeksTotal: 12,
  },
  {
    id: "s02",
    name: "Markus Roinas Pedersen",
    initials: "MP",
    hcp: -0.8,
    hcpTrend: "down",
    akademi: "WANG Toppidrett",
    lastSession: "i går · TEK",
    tier: "PRO",
    niva: "A1",
    status: "Aktiv",
    planWeek: 5,
    planWeeksTotal: 12,
  },
  {
    id: "s03",
    name: "Sara Lindqvist",
    initials: "SL",
    hcp: 1.8,
    hcpTrend: "down",
    akademi: "AK Golf Academy",
    lastSession: "i går · SLAG",
    tier: "PRO",
    niva: "A2",
    status: "Aktiv",
    planWeek: 3,
    planWeeksTotal: 8,
  },
  {
    id: "s04",
    name: "Erik Andersen",
    initials: "EA",
    hcp: 1.5,
    hcpTrend: "flat",
    akademi: "GFGK Elite",
    lastSession: "i dag · FYS",
    tier: "PRO",
    niva: "A2",
    status: "Aktiv",
    planWeek: 6,
    planWeeksTotal: 10,
  },
  {
    id: "s05",
    name: "Lena Bakken",
    initials: "LB",
    hcp: -0.3,
    hcpTrend: "down",
    akademi: "WANG Toppidrett",
    lastSession: "i går · TEK",
    tier: "PRO",
    niva: "A1",
    status: "Aktiv",
    planWeek: 9,
    planWeeksTotal: 12,
  },
  {
    id: "s06",
    name: "Henrik Dahl",
    initials: "HD",
    hcp: -1.2,
    hcpTrend: "down",
    akademi: "GFGK Elite",
    lastSession: "i dag · TEK",
    tier: "PRO",
    niva: "A1",
    status: "Aktiv",
    planWeek: 7,
    planWeeksTotal: 12,
  },
  {
    id: "s07",
    name: "Sander Liu",
    initials: "SL",
    hcp: -2.8,
    hcpTrend: "down",
    akademi: "WANG Toppidrett",
    lastSession: "i dag · SPILL",
    tier: "PRO",
    niva: "A1",
    status: "Aktiv",
    planWeek: 11,
    planWeeksTotal: 12,
  },
  {
    id: "s08",
    name: "Christian Mo",
    initials: "CM",
    hcp: 0.0,
    hcpTrend: "flat",
    akademi: "GFGK Elite",
    lastSession: "i går · SLAG",
    tier: "PRO",
    niva: "A2",
    status: "Aktiv",
    planWeek: 4,
    planWeeksTotal: 10,
  },
  {
    id: "s09",
    name: "Amalie Berg",
    initials: "AB",
    hcp: 2.1,
    hcpTrend: "flat",
    akademi: "WANG Toppidrett",
    lastSession: "onsdag · SLAG",
    tier: "GRATIS",
    niva: "B1",
    status: "Aktiv",
    planWeek: 2,
    planWeeksTotal: 8,
  },
  {
    id: "s10",
    name: "Vegard Foss",
    initials: "VF",
    hcp: -1.8,
    hcpTrend: "up",
    akademi: "WANG Toppidrett",
    lastSession: "i dag · TEK",
    tier: "PRO",
    niva: "A1",
    status: "Aktiv",
    planWeek: 1,
    planWeeksTotal: 8,
  },
  {
    id: "s11",
    name: "Jonas Vold",
    initials: "JV",
    hcp: 6.8,
    hcpTrend: "down",
    akademi: "GFGK Junior",
    lastSession: "mandag · SPILL",
    tier: "JUNIOR",
    niva: "JR",
    status: "Aktiv",
    planWeek: 3,
    planWeeksTotal: 12,
  },
  {
    id: "s12",
    name: "Mathilde Rø",
    initials: "MR",
    hcp: 3.4,
    hcpTrend: "down",
    akademi: "GFGK U19",
    lastSession: "forrige uke · FYS",
    tier: "JUNIOR",
    niva: "JR",
    status: "Inaktiv 30d",
    planWeek: 1,
    planWeeksTotal: 8,
  },
  {
    id: "s13",
    name: "Tuva Holm",
    initials: "TH",
    hcp: 5.0,
    hcpTrend: "up",
    akademi: "GFGK Junior",
    lastSession: "tirsdag · TEK",
    tier: "JUNIOR",
    niva: "JR",
    status: "Aktiv",
    planWeek: 5,
    planWeeksTotal: 10,
  },
  {
    id: "s14",
    name: "Ida Normann",
    initials: "IN",
    hcp: 7.5,
    hcpTrend: "up",
    akademi: "GFGK U19",
    lastSession: "mandag · FYS",
    tier: "JUNIOR",
    niva: "B2",
    status: "Skadd",
    planWeek: 0,
    planWeeksTotal: 8,
  },
];

// ── Stat-tiles ─────────────────────────────────────────────────────────────────

const STALL_STATS: StatTileData[] = [
  {
    label: "Aktive",
    value: 14,
    unit: "spillere",
    context: "2 ny denne måneden",
    tone: "accent",
  },
  {
    label: "Junior (U18)",
    value: 4,
    unit: "U18",
    context: "jenter og gutter",
    tone: "default",
  },
  {
    label: "Snitt HCP",
    value: -1.2,
    unit: "hcp",
    context: "−0.4 siste 3 mnd",
    tone: "default",
    decimals: 1,
  },
  {
    label: "Nye i mai",
    value: 3,
    unit: "nye",
    context: "+2 vs april",
    tone: "default",
  },
];

// ── Filter- og sort-verdier ────────────────────────────────────────────────────

const TIER_FILTERS = ["Alle", "PRO", "GRATIS", "JUNIOR"] as const;
type TierFilter = (typeof TIER_FILTERS)[number];

const STATUS_FILTERS = ["Alle", "Aktiv", "Inaktiv 30d", "Skadd"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const SORT_OPTIONS = ["HCP", "Sist aktiv", "Navn"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const PAGE_SIZE = 9;

// ── Hjelpefunksjoner ──────────────────────────────────────────────────────────

function getNivaBg(niva: NivaPill): { bg: string; color: string } {
  switch (niva) {
    case "A1":
      return {
        bg: "color-mix(in oklab, var(--primary) 22%, transparent)",
        color: "var(--primary)",
      };
    case "A2":
      return {
        bg: "color-mix(in oklab, var(--primary) 14%, transparent)",
        color: "var(--primary)",
      };
    case "B1":
      return {
        bg: "color-mix(in oklab, var(--foreground) 8%, transparent)",
        color: "var(--foreground)",
      };
    case "B2":
      return {
        bg: "color-mix(in oklab, var(--foreground) 5%, transparent)",
        color: "hsl(var(--muted-foreground))",
      };
    case "JR":
      return {
        bg: "color-mix(in oklab, var(--accent) 28%, transparent)",
        color: "var(--accent-foreground)",
      };
  }
}

function getTierStyle(tier: TierLabel): { bg: string; color: string } {
  switch (tier) {
    case "PRO":
      return {
        bg: "color-mix(in oklab, var(--accent) 20%, transparent)",
        color: "var(--accent-foreground)",
      };
    case "JUNIOR":
      return {
        bg: "color-mix(in oklab, var(--primary) 16%, transparent)",
        color: "var(--primary)",
      };
    case "GRATIS":
      return {
        bg: "color-mix(in oklab, var(--foreground) 6%, transparent)",
        color: "hsl(var(--muted-foreground))",
      };
  }
}

function sortSpillere(list: Spiller[], sort: SortOption): Spiller[] {
  const copy = [...list];
  switch (sort) {
    case "HCP":
      return copy.sort((a, b) => a.hcp - b.hcp);
    case "Navn":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "nb"));
    case "Sist aktiv":
    default:
      return copy;
  }
}

// ── Coach sidebar ─────────────────────────────────────────────────────────────

type CoachNavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type CoachNavGroup = {
  group: string;
  items: CoachNavItem[];
};

const COACH_NAV: CoachNavGroup[] = [
  {
    group: "COACHHQ",
    items: [
      { id: "/v2-preview/admin", label: "Hjem", icon: <Home size={18} /> },
      {
        id: "/v2-preview/admin/spillere",
        label: "Stall",
        icon: <Users size={18} />,
      },
      {
        id: "/admin/gjennomfore",
        label: "Gjennomfør",
        icon: <Calendar size={18} />,
      },
    ],
  },
  {
    group: "ANALYSE",
    items: [
      {
        id: "/admin/analysere",
        label: "Analyse",
        icon: <BarChart3 size={18} />,
      },
      {
        id: "/admin/plan-templates",
        label: "Plan-maler",
        icon: <BookOpen size={18} />,
      },
      {
        id: "/admin/drills",
        label: "Drills",
        icon: <ClipboardCheck size={18} />,
      },
    ],
  },
  {
    group: "SYSTEM",
    items: [
      {
        id: "/admin/settings",
        label: "Innstillinger",
        icon: <Settings size={18} />,
      },
    ],
  },
];

function CoachSidebar() {
  const pathname = usePathname();

  function matchRoute(navId: string, p: string): boolean {
    return p === navId || p.startsWith(navId + "/");
  }

  return (
    <aside
      className="sticky top-0 h-screen border-r border-border flex flex-col gap-2 px-4 py-6"
      style={{
        background: "color-mix(in oklab, var(--background) 70%, var(--card))",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-[10px] px-2 pb-4 mb-2 border-b border-border">
        <div
          className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0 font-display italic font-bold text-[18px]"
          style={{ background: "var(--foreground)", color: "var(--accent)" }}
        >
          AK
        </div>
        <div className="flex flex-col leading-[1.15]">
          <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
            COACHHQ · HEAD COACH
          </span>
          <span className="font-display text-[14px] font-bold tracking-[-0.01em] text-foreground">
            AK Golf
          </span>
        </div>
      </div>

      {/* Nav groups */}
      {COACH_NAV.map((group) => (
        <div key={group.group} className="flex flex-col gap-[2px] mt-1">
          <div className="font-mono text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase px-[10px] py-2">
            {group.group}
          </div>
          {group.items.map((item) => {
            const active = matchRoute(item.id, pathname);
            return (
              <Link
                key={item.id}
                href={item.id}
                className={[
                  "flex items-center gap-[10px] px-[10px] py-[9px] rounded-[10px]",
                  "text-[14px] transition-[background,color] duration-[160ms]",
                  "focus-visible:outline-2 focus-visible:outline-ring",
                  active
                    ? "font-semibold text-foreground bg-[color-mix(in_oklab,var(--accent)_20%,transparent)]"
                    : "font-medium text-muted-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] hover:text-foreground",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}

      {/* Coach card */}
      <div
        className="mt-auto flex items-center gap-[10px] p-2 rounded-[12px]"
        style={{
          background: "color-mix(in oklab, var(--foreground) 4%, transparent)",
        }}
      >
        <div
          className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0 font-display font-bold text-[13px]"
          style={{ background: "var(--primary)", color: "var(--accent)" }}
        >
          AK
        </div>
        <div className="flex flex-col leading-[1.2] min-w-0">
          <span className="text-[13px] font-semibold text-foreground">
            {COACH_DATA.name}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground tracking-[0.06em]">
            {COACH_DATA.role}
          </span>
        </div>
      </div>
    </aside>
  );
}

// ── Plan-progress mini-bar ────────────────────────────────────────────────────

function PlanProgress({
  week,
  total,
}: {
  week: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((week / total) * 100) : 0;
  const accent =
    pct >= 80
      ? "var(--accent)"
      : pct >= 40
        ? "var(--primary)"
        : "hsl(var(--muted-foreground))";

  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.10em]">
          Plan
        </span>
        <span className="font-mono text-[9px] text-muted-foreground tabular">
          Uke {week}/{total}
        </span>
      </div>
      <div
        className="h-[3px] rounded-full overflow-hidden"
        style={{
          background:
            "color-mix(in oklab, var(--foreground) 8%, transparent)",
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: accent }}
        />
      </div>
    </div>
  );
}

// ── Trend-ikon ────────────────────────────────────────────────────────────────

function TrendIcon({ dir }: { dir: TrendDir }) {
  if (dir === "down")
    return (
      <TrendingDown
        size={13}
        strokeWidth={2}
        style={{ color: "var(--primary)" }}
      />
    );
  if (dir === "up")
    return (
      <TrendingUp
        size={13}
        strokeWidth={2}
        style={{ color: "var(--destructive)" }}
      />
    );
  return (
    <Minus
      size={13}
      strokeWidth={2}
      className="text-muted-foreground"
    />
  );
}

// ── Spiller-kort v2 ───────────────────────────────────────────────────────────

function SpillerKort({ spiller }: { spiller: Spiller }) {
  const tier = getTierStyle(spiller.tier);
  const niva = getNivaBg(spiller.niva);
  const hcpDisplay =
    spiller.hcp < 0
      ? `−${Math.abs(spiller.hcp).toFixed(1)}`
      : `+${spiller.hcp.toFixed(1)}`;

  return (
    <Link
      href={`/v2-preview/admin/spillere/${spiller.id}`}
      className="group flex flex-col gap-0 rounded-[20px] border border-border overflow-hidden no-underline transition-all duration-[200ms] hover:border-[color-mix(in_oklab,var(--accent)_60%,transparent)] hover:-translate-y-[2px] hover:shadow-[0_8px_24px_color-mix(in_oklab,var(--foreground)_8%,transparent)]"
      style={{ background: "var(--card)" }}
    >
      {/* Toppfelt: avatar + tier-pill */}
      <div
        className="flex items-start justify-between gap-2 px-6 pt-6 pb-4"
        style={{
          borderBottom:
            "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
        }}
      >
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div
            className="w-11 h-11 rounded-full grid place-items-center flex-shrink-0 font-display font-bold text-[14px] ring-2 ring-offset-2 transition-all duration-200 group-hover:ring-[color-mix(in_oklab,var(--accent)_50%,transparent)]"
            style={{
              background:
                "color-mix(in oklab, var(--primary) 85%, transparent)",
              color: "var(--accent)",
              ringColor: "transparent",
              ringOffsetColor: "var(--card)",
            } as React.CSSProperties}
          >
            {spiller.initials}
          </div>
          {/* Navn + akademi */}
          <div className="flex flex-col gap-[2px] min-w-0">
            <span className="font-display font-bold text-[15px] tracking-[-0.01em] text-foreground leading-none truncate">
              {spiller.name}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.07em] truncate">
              {spiller.akademi}
            </span>
          </div>
        </div>

        {/* Tier-pill */}
        <span
          className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] rounded-full flex-shrink-0"
          style={{
            background: tier.bg,
            color: tier.color,
            padding: "3px 9px",
          }}
        >
          {spiller.tier}
        </span>
      </div>

      {/* Midtseksjon: HCP + nivå-pill */}
      <div className="flex items-center justify-between gap-2 px-6 py-4">
        {/* HCP */}
        <div className="flex flex-col gap-[3px]">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.10em]">
            HCP
          </span>
          <div className="flex items-center gap-[5px]">
            <span
              className="font-display tabular font-bold leading-none tracking-[-0.02em]"
              style={{ fontSize: 24, color: "var(--foreground)" }}
            >
              {hcpDisplay}
            </span>
            <TrendIcon dir={spiller.hcpTrend} />
          </div>
        </div>

        {/* Nivå-pill */}
        <span
          className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] rounded-full"
          style={{
            background: niva.bg,
            color: niva.color,
            padding: "4px 12px",
          }}
        >
          {spiller.niva}
        </span>
      </div>

      {/* Bunnfelt: sist aktiv + plan-bar */}
      <div
        className="flex flex-col gap-2 px-6 pb-6 pt-2"
        style={{
          borderTop:
            "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
        }}
      >
        {/* Sist aktiv */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.10em]">
            Siste økt
          </span>
          <span className="font-mono text-[10px] text-foreground font-semibold">
            {spiller.lastSession}
          </span>
        </div>

        {/* Plan-progress */}
        <PlanProgress week={spiller.planWeek} total={spiller.planWeeksTotal} />
      </div>
    </Link>
  );
}

// ── Filter-bar ────────────────────────────────────────────────────────────────

type FilterBarProps = {
  search: string;
  onSearch: (v: string) => void;
  activeTier: TierFilter;
  onTier: (v: TierFilter) => void;
  activeStatus: StatusFilter;
  onStatus: (v: StatusFilter) => void;
  activeSort: SortOption;
  onSort: (v: SortOption) => void;
  totalVisible: number;
  pageStart: number;
  pageEnd: number;
};

function FilterBar({
  search,
  onSearch,
  activeTier,
  onTier,
  activeStatus,
  onStatus,
  activeSort,
  onSort,
  totalVisible,
  pageStart,
  pageEnd,
}: FilterBarProps) {
  return (
    <div
      className="sticky z-20 flex flex-wrap items-center gap-2 mb-8 -mx-8 px-8 py-4 border-b border-border"
      style={{
        top: 57,
        background:
          "color-mix(in oklab, var(--background) 92%, transparent)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {/* Søk — full-width mobil, 50% desktop */}
      <div
        className="flex items-center gap-2 rounded-[10px] w-full md:w-auto md:flex-1 md:max-w-[420px]"
        style={{
          background:
            "color-mix(in oklab, var(--foreground) 4%, transparent)",
          border: "1px solid hsl(var(--border))",
          padding: "8px 12px",
        }}
      >
        <Search size={14} className="text-muted-foreground shrink-0" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Søk etter spiller eller akademi…"
          className="flex-1 bg-transparent border-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 font-mono text-[13px] text-foreground placeholder:text-muted-foreground"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="border-0 bg-transparent p-0 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Tøm søk"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Tier-filter pills */}
      <div className="flex items-center gap-1 flex-wrap">
        {TIER_FILTERS.map((tier) => (
          <button
            key={tier}
            type="button"
            onClick={() => onTier(tier)}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] rounded-full cursor-pointer border-0 transition-all duration-[160ms] whitespace-nowrap"
            style={{
              padding: "5px 13px",
              background:
                activeTier === tier
                  ? "var(--foreground)"
                  : "color-mix(in oklab, var(--foreground) 5%, transparent)",
              color:
                activeTier === tier
                  ? "var(--background)"
                  : "hsl(var(--muted-foreground))",
              border:
                activeTier === tier
                  ? "1px solid var(--foreground)"
                  : "1px solid hsl(var(--border))",
            }}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* Status-filter pills */}
      <div className="flex items-center gap-1 flex-wrap">
        {STATUS_FILTERS.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => onStatus(st)}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] rounded-full cursor-pointer border-0 transition-all duration-[160ms] whitespace-nowrap"
            style={{
              padding: "5px 13px",
              background:
                activeStatus === st
                  ? "var(--primary)"
                  : "color-mix(in oklab, var(--foreground) 5%, transparent)",
              color:
                activeStatus === st
                  ? "var(--accent)"
                  : "hsl(var(--muted-foreground))",
              border:
                activeStatus === st
                  ? "1px solid var(--primary)"
                  : "1px solid hsl(var(--border))",
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Sort-knapp */}
      <div className="flex items-center gap-1 ml-auto">
        <SlidersHorizontal size={13} className="text-muted-foreground" />
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSort(opt)}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] rounded-full cursor-pointer border-0 transition-all duration-[160ms] whitespace-nowrap"
            style={{
              padding: "5px 11px",
              background:
                activeSort === opt
                  ? "color-mix(in oklab, var(--accent) 22%, transparent)"
                  : "transparent",
              color:
                activeSort === opt
                  ? "var(--accent-foreground)"
                  : "hsl(var(--muted-foreground))",
              border:
                activeSort === opt
                  ? "1px solid color-mix(in oklab, var(--accent) 40%, transparent)"
                  : "1px solid transparent",
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Teller */}
      <span className="font-mono text-[11px] text-muted-foreground tabular whitespace-nowrap">
        Viser {pageStart}–{pageEnd} av {totalVisible}
      </span>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

type PaginationProps = {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
};

function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="flex items-center justify-between gap-4 mt-8 pt-8 border-t border-border">
      {/* Forrige */}
      <button
        type="button"
        onClick={() => onPage(Math.max(0, page - 1))}
        disabled={page === 0}
        className="inline-flex items-center gap-2 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.10em] cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-[160ms]"
        style={{
          background:
            "color-mix(in oklab, var(--foreground) 6%, transparent)",
          color: "var(--foreground)",
          border: "1px solid hsl(var(--border))",
          padding: "8px 18px",
        }}
      >
        <ChevronLeft size={14} />
        Forrige
      </button>

      {/* Side-numre */}
      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            className="w-8 h-8 grid place-items-center rounded-full font-mono text-[11px] font-bold cursor-pointer border-0 transition-all duration-[160ms]"
            style={{
              background:
                p === page
                  ? "var(--foreground)"
                  : "color-mix(in oklab, var(--foreground) 5%, transparent)",
              color: p === page ? "var(--background)" : "hsl(var(--muted-foreground))",
              border:
                p === page
                  ? "1px solid var(--foreground)"
                  : "1px solid hsl(var(--border))",
            }}
          >
            {p + 1}
          </button>
        ))}
      </div>

      {/* Neste */}
      <button
        type="button"
        onClick={() => onPage(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        className="inline-flex items-center gap-2 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.10em] cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-[160ms]"
        style={{
          background:
            "color-mix(in oklab, var(--foreground) 6%, transparent)",
          color: "var(--foreground)",
          border: "1px solid hsl(var(--border))",
          padding: "8px 18px",
        }}
      >
        Neste
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ── Hovedside ─────────────────────────────────────────────────────────────────

export default function StallSamplePage() {
  const nowTime = useNowTime();
  const [search, setSearch] = useState("");
  const [activeTier, setActiveTier] = useState<TierFilter>("Alle");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("Alle");
  const [activeSort, setActiveSort] = useState<SortOption>("HCP");
  const [page, setPage] = useState(0);

  const filtered = STALL.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.akademi.toLowerCase().includes(search.toLowerCase());

    const matchTier = activeTier === "Alle" || s.tier === activeTier;
    const matchStatus = activeStatus === "Alle" || s.status === activeStatus;

    return matchSearch && matchTier && matchStatus;
  });

  const sorted = sortSpillere(filtered, activeSort);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageSlice = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pageStart = sorted.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const pageEnd = Math.min((page + 1) * PAGE_SIZE, sorted.length);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(0);
  }

  function handleTier(tier: TierFilter) {
    setActiveTier(tier);
    setPage(0);
  }

  function handleStatus(st: StatusFilter) {
    setActiveStatus(st);
    setPage(0);
  }

  function handleSort(opt: SortOption) {
    setActiveSort(opt);
    setPage(0);
  }

  return (
    <div
      className="min-h-screen"
      style={{
        display: "grid",
        gridTemplateColumns: "256px 1fr",
        background: "var(--background)",
      }}
    >
      {/* Sidebar */}
      <CoachSidebar />

      {/* Innholdskolonne */}
      <div className="min-w-0">
        {/* Topbar */}
        <div
          className="sticky top-0 z-40 border-b border-border"
          style={{
            background:
              "color-mix(in oklab, var(--background) 80%, transparent)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-2 px-6 py-2">
            <div
              className="flex-1 flex items-center gap-[10px] px-[14px] py-2 rounded-[10px] text-muted-foreground text-[13px] border border-border max-w-[420px]"
              style={{ background: "var(--card)" }}
            >
              <Search size={16} />
              <span>Søk i spillere, planer, drills…</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                ⌘K
              </span>
            </div>
            <button
              className="relative w-8 h-8 grid place-items-center rounded-[10px] border border-border text-foreground"
              style={{ background: "var(--card)" }}
              aria-label="Varsler"
              type="button"
            >
              <Bell size={16} />
              <span
                className="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-full bg-destructive border-2"
                style={{ borderColor: "var(--card)" }}
                aria-hidden
              />
            </button>
            <Link
              href="/admin/settings"
              className="w-8 h-8 grid place-items-center rounded-[10px] border border-border text-foreground"
              style={{ background: "var(--card)" }}
              aria-label="Innstillinger"
            >
              <Settings size={16} />
            </Link>
          </div>
        </div>

        {/* LiveBar */}
        <LiveBar
          nowTime={nowTime}
          sessions={TODAY_SESSIONS}
          weather={WEATHER_DATA}
        />

        {/* Side-innhold */}
        <main className="px-8 pt-6 pb-16 max-w-[1280px] mx-auto">

          {/* ── PageHero ── */}
          <PageHero
            eyebrow="STALL"
            title="Spillere"
            italic={`${STALL.length} aktive`}
            lead="Full oversikt over alle spillere i akademiet. Klikk for spillerprofil og planstatus."
            crumb="Hjem"
            crumbHref="/v2-preview/admin"
          />

          {/* ── Seksjon 01: Stallen i tall ── */}
          <section className="relative mb-10">
            <SectionHeader
              ghostNum="01"
              eyebrow="OVERSIKT"
              title="Stallen i tall"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STALL_STATS.map((tile, idx) => (
                <StatTile
                  key={tile.label}
                  tile={tile}
                  idx={idx}
                  hero={idx === 0}
                />
              ))}
            </div>
          </section>

          {/* ── PhotoDivider ── */}
          <PhotoDivider
            img={30}
            kicker="STALLEN"
            line="14 ambisiøse golfere i utvikling — fra A1 til U14."
            dateLabel="AK GOLF ACADEMY · 26/05/26"
          />

          {/* ── Seksjon 02: Alle spillere ── */}
          <section className="relative mt-10">
            <SectionHeader
              ghostNum="02"
              eyebrow="REGISTER"
              title="Alle spillere"
              description="Filtrer på tier, status eller søk etter navn og akademi."
            />

            {/* Filter-bar */}
            <FilterBar
              search={search}
              onSearch={handleSearch}
              activeTier={activeTier}
              onTier={handleTier}
              activeStatus={activeStatus}
              onStatus={handleStatus}
              activeSort={activeSort}
              onSort={handleSort}
              totalVisible={filtered.length}
              pageStart={pageStart}
              pageEnd={pageEnd}
            />

            {/* Spiller-grid */}
            {pageSlice.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pageSlice.map((spiller) => (
                  <SpillerKort key={spiller.id} spiller={spiller} />
                ))}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center gap-4 rounded-[20px] border border-dashed py-16 px-8 text-center"
                style={{ borderColor: "hsl(var(--border))" }}
              >
                <Search size={32} className="text-muted-foreground" />
                <p className="m-0 text-muted-foreground">
                  Ingen spillere matcher filteret.
                </p>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPage={setPage}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
