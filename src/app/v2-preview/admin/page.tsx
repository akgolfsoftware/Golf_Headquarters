"use client";

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
  ChevronRight,
} from "lucide-react";
import {
  LiveBar,
  SectionHeader,
  InsightCard,
  StatTile,
  AuditLogPattern,
  useNowTime,
} from "@/components/v2";
import {
  COACH_DATA,
  TODAY_SESSIONS,
  WEATHER_DATA,
  AI_INSIGHTS,
  DEMO_AUDIT_EVENTS,
} from "@/lib/v2-fixtures";
import type { StatTile as StatTileData } from "@/lib/v2-fixtures";

// ── Coach-specific sidebar ─────────────────────────────────────────────────

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
      { id: "/admin/settings", label: "Innstillinger", icon: <Settings size={18} /> },
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
      className="sticky top-0 h-screen border-r border-border flex flex-col gap-2 px-4 py-5"
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
          <div className="font-mono text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase px-[10px] py-3">
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

// ── Coach hero — ersatter PhotoHero for coach-kontekst ───────────────────────

function CoachHero() {
  return (
    <div
      className="relative overflow-hidden rounded-[20px]"
      style={{ boxShadow: "0 20px 48px -12px rgba(10,31,23,0.18)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/akgolf/AK-Golf-Academy-7.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.18) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.70) 0%, transparent 50%)",
        }}
      />

      <div
        className="relative flex flex-col justify-between"
        style={{ minHeight: 420, padding: "40px 48px", color: "var(--background)" }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-[6px] px-3 py-[6px] rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{
              background: "color-mix(in oklab, var(--accent) 28%, rgba(0,0,0,0.4))",
              color: "var(--accent)",
              backdropFilter: "blur(8px)",
            }}
          >
            HEAD COACH
          </span>
          <span
            className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase"
            style={{ color: "rgba(250,250,247,0.78)" }}
          >
            COACHHQ · SESONG 2026
          </span>
        </div>

        {/* Bottom */}
        <div>
          <h1
            className="m-0 font-display font-bold leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: 64, color: "var(--background)" }}
          >
            God morgen,{" "}
            <span style={{ fontStyle: "italic", color: "var(--accent)" }}>
              Anders
            </span>
            .
          </h1>
          <div
            className="flex flex-wrap items-baseline gap-x-[18px] gap-y-2 font-mono text-[12px] uppercase tracking-[0.10em] mt-4"
            style={{ color: "rgba(250,250,247,0.78)" }}
          >
            <span>14 aktive spillere</span>
            <span className="opacity-50">·</span>
            <span>7 økter i dag</span>
            <span className="opacity-50">·</span>
            <span style={{ color: "var(--accent)" }}>3 godkjenninger venter</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Coach-stat tiles ─────────────────────────────────────────────────────────

const COACH_STATS: StatTileData[] = [
  {
    label: "Spillere aktive",
    value: 14,
    unit: "tot.",
    context: "+2 siden forrige uke",
    tone: "accent",
  },
  {
    label: "Økter i dag",
    value: 7,
    unit: "plan.",
    context: "2 gjennomført, 5 igjen",
    tone: "default",
  },
  {
    label: "Godkjenninger",
    value: 3,
    unit: "venter",
    context: "Forfaller innen 48t",
    tone: "critical",
  },
];

// ── Coach insights (re-bruker AI_INSIGHTS med coach-perspektiv) ───────────────

const COACH_INSIGHTS = AI_INSIGHTS.map((insight) => ({
  ...insight,
  eyebrow:
    insight.id === "i1"
      ? "Øyvind: Putting mangler"
      : insight.id === "i2"
        ? "Sving-tempo endret"
        : "HCP-justerings-runde",
}));

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminHomeSamplePage() {
  const nowTime = useNowTime();

  return (
    <div
      className="min-h-screen"
      style={{
        display: "grid",
        gridTemplateColumns: "256px 1fr",
        background: "var(--background)",
      }}
    >
      {/* Coach sidebar */}
      <CoachSidebar />

      {/* Main content area */}
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
          <div className="flex items-center gap-2 px-6 py-3">
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

        {/* Page content */}
        <main className="px-8 pt-6 pb-12 max-w-[1280px] mx-auto space-y-10">

          {/* Coach hero */}
          <CoachHero />

          {/* Coach stat tiles */}
          <section>
            <SectionHeader
              eyebrow="01 · OVERSIKT"
              title="Dagens tall"
              ghostNum="01"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {COACH_STATS.map((tile, i) => (
                <StatTile key={tile.label} tile={tile} idx={i} hero />
              ))}
            </div>
          </section>

          {/* AI insights for coach */}
          <section>
            <SectionHeader
              eyebrow="02 · FRA CADDIE"
              title="Spillerinnsikt"
              description="AI-observasjoner på tvers av stallen din fra siste 7 dager."
              cta="Se alle"
              ctaHref="/admin/analysere"
              ghostNum="02"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {COACH_INSIGHTS.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </section>

          {/* Recent activity */}
          <section>
            <div className="flex items-center justify-between gap-4 mb-4">
              <SectionHeader
                eyebrow="03 · AKTIVITETSLOGG"
                title="Siste hendelser"
                ghostNum="03"
              />
              <Link
                href="/admin/audit-log"
                className="inline-flex items-center gap-[6px] font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-foreground no-underline"
              >
                Full logg <ChevronRight size={13} />
              </Link>
            </div>
            <div
              className="rounded-[20px] border border-border overflow-hidden"
              style={{ background: "var(--card)" }}
            >
              <AuditLogPattern
                events={DEMO_AUDIT_EVENTS.slice(0, 5)}
              />
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
