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
} from "lucide-react";
import {
  LiveBar,
  PageHero,
  useNowTime,
} from "@/components/v2";
import {
  COACH_DATA,
  TODAY_SESSIONS,
  WEATHER_DATA,
  TRAINING_PARTNERS,
} from "@/lib/v2-fixtures";
import type { Partner } from "@/lib/v2-fixtures";

// ── Extended stall med 8 ekstra spillere ──────────────────────────────────────

const EXTENDED_STALL: Partner[] = [
  ...TRAINING_PARTNERS,
  {
    id: "p4",
    name: "Erik Andersen",
    initials: "EA",
    hcp: 1.5,
    akademi: "GFGK Elite",
    lastSession: "I dag · FYS",
  },
  {
    id: "p5",
    name: "Lena Bakken",
    initials: "LB",
    hcp: -0.3,
    akademi: "WANG Toppidrett",
    lastSession: "I går · TEK",
  },
  {
    id: "p6",
    name: "Jonas Vold",
    initials: "JV",
    hcp: 6.8,
    akademi: "GFGK Junior",
    lastSession: "Mandag · SPILL",
  },
  {
    id: "p7",
    name: "Amalie Berg",
    initials: "AB",
    hcp: 2.1,
    akademi: "WANG Toppidrett",
    lastSession: "Onsdag · SLAG",
  },
  {
    id: "p8",
    name: "Henrik Dahl",
    initials: "HD",
    hcp: -1.2,
    akademi: "GFGK Elite",
    lastSession: "I dag · TEK",
  },
  {
    id: "p9",
    name: "Mathilde Rø",
    initials: "MR",
    hcp: 3.4,
    akademi: "GFGK U19",
    lastSession: "Forrige uke · FYS",
  },
  {
    id: "p10",
    name: "Sander Liu",
    initials: "SL",
    hcp: -2.8,
    akademi: "WANG Toppidrett",
    lastSession: "I dag · SPILL",
  },
  {
    id: "p11",
    name: "Tuva Holm",
    initials: "TH",
    hcp: 5.0,
    akademi: "GFGK Junior",
    lastSession: "Tirsdag · TEK",
  },
  {
    id: "p12",
    name: "Christian Mo",
    initials: "CM",
    hcp: 0.0,
    akademi: "GFGK Elite",
    lastSession: "I går · SLAG",
  },
  {
    id: "p13",
    name: "Ida Normann",
    initials: "IN",
    hcp: 7.5,
    akademi: "GFGK U19",
    lastSession: "Mandag · FYS",
  },
  {
    id: "p14",
    name: "Vegard Foss",
    initials: "VF",
    hcp: -1.8,
    akademi: "WANG Toppidrett",
    lastSession: "I dag · TEK",
  },
];

// Tier — tildeles deterministisk basert på HCP
function getTier(hcp: number): { label: string; color: string; bg: string } {
  if (hcp <= 0) {
    return {
      label: "PRO",
      bg: "color-mix(in oklab, var(--accent) 22%, transparent)",
      color: "var(--accent-foreground)",
    };
  }
  if (hcp <= 4) {
    return {
      label: "GRATIS",
      bg: "color-mix(in oklab, var(--foreground) 6%, transparent)",
      color: "hsl(var(--muted-foreground))",
    };
  }
  return {
    label: "GRATIS",
    bg: "color-mix(in oklab, var(--foreground) 6%, transparent)",
    color: "hsl(var(--muted-foreground))",
  };
}

// ── Coach sidebar (delt med admin/page.tsx) ────────────────────────────────────

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

// ── Spiller-kort ─────────────────────────────────────────────────────────────

function SpillerKort({ partner }: { partner: Partner }) {
  const tier = getTier(partner.hcp);
  const hcpDisplay =
    partner.hcp < 0
      ? `−${Math.abs(partner.hcp).toFixed(1)}`
      : `+${partner.hcp.toFixed(1)}`;

  return (
    <div
      className="lift flex flex-col gap-4 rounded-[20px] border border-border p-6"
      style={{ background: "var(--card)" }}
    >
      {/* Top: avatar + tier */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-12 h-12 rounded-full grid place-items-center flex-shrink-0 font-display font-bold text-[15px]"
          style={{
            background:
              "color-mix(in oklab, var(--primary) 88%, transparent)",
            color: "var(--accent)",
          }}
        >
          {partner.initials}
        </div>
        <span
          className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] rounded-full"
          style={{
            background: tier.bg,
            color: tier.color,
            padding: "3px 10px",
          }}
        >
          {tier.label}
        </span>
      </div>

      {/* Name + akademi */}
      <div className="flex flex-col gap-1">
        <span className="font-display font-bold text-[17px] tracking-[-0.01em] text-foreground">
          {partner.name}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.08em]">
          {partner.akademi}
        </span>
      </div>

      {/* HCP + siste økt */}
      <div
        className="flex items-center justify-between gap-2 pt-4 border-t border-border"
      >
        <div className="flex flex-col gap-[2px]">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.10em]">
            HCP
          </span>
          <span
            className="font-display tabular font-bold leading-none tracking-[-0.02em]"
            style={{ fontSize: 22 }}
          >
            {hcpDisplay}
          </span>
        </div>
        <div className="flex flex-col items-end gap-[2px]">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.10em]">
            Siste økt
          </span>
          <span className="font-mono text-[11px] text-foreground font-semibold">
            {partner.lastSession}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Filter-bar ────────────────────────────────────────────────────────────────

const TIER_FILTERS = ["Alle", "PRO", "GRATIS"] as const;
type TierFilter = (typeof TIER_FILTERS)[number];

const PAGE_SIZE = 9;

// ── Main page ─────────────────────────────────────────────────────────────────

export default function StallSamplePage() {
  const nowTime = useNowTime();
  const [search, setSearch] = useState("");
  const [activeTier, setActiveTier] = useState<TierFilter>("Alle");
  const [page, setPage] = useState(0);

  const filtered = EXTENDED_STALL.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.akademi.toLowerCase().includes(search.toLowerCase());

    const tier = getTier(p.hcp);
    const matchTier = activeTier === "Alle" || tier.label === activeTier;

    return matchSearch && matchTier;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageSlice = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(0);
  }

  function handleTierChange(tier: TierFilter) {
    setActiveTier(tier);
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
        <main className="px-8 pt-6 pb-12 max-w-[1280px] mx-auto">

          {/* Page hero */}
          <PageHero
            eyebrow="STALL"
            title="Spillere"
            italic={`${EXTENDED_STALL.length} aktive`}
            lead="Full oversikt over alle spillere i akademiet. Klikk for spiller-profil og plan-status."
            crumb="Hjem"
            crumbHref="/v2-preview/admin"
          />

          {/* Filter-bar */}
          <div
            className="sticky z-20 flex flex-wrap items-center gap-4 mb-8 -mx-8 px-8 py-4 border-b border-border"
            style={{
              top: 57,
              background:
                "color-mix(in oklab, var(--background) 90%, transparent)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            {/* Search */}
            <div
              className="flex items-center gap-2 rounded-[10px] flex-1 min-w-[200px] max-w-[360px]"
              style={{
                background:
                  "color-mix(in oklab, hsl(var(--foreground)) 5%, transparent)",
                border: "1px solid hsl(var(--border))",
                padding: "8px 12px",
              }}
            >
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                type="search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Søk etter spiller eller akademi…"
                className="flex-1 bg-transparent border-0 outline-none font-mono text-[13px] text-foreground placeholder:text-muted-foreground"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="border-0 bg-transparent p-0 cursor-pointer text-muted-foreground"
                  aria-label="Tøm søk"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Tier filter pills */}
            <div className="flex items-center gap-2">
              {TIER_FILTERS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => handleTierChange(tier)}
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] rounded-full cursor-pointer border-0 transition-all duration-[160ms]"
                  style={{
                    padding: "5px 14px",
                    background:
                      activeTier === tier
                        ? "var(--foreground)"
                        : "color-mix(in oklab, hsl(var(--foreground)) 5%, transparent)",
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

            {/* Antall */}
            <span className="font-mono text-[11px] text-muted-foreground ml-auto">
              {filtered.length} spillere
            </span>
          </div>

          {/* Spiller grid */}
          {pageSlice.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageSlice.map((partner) => (
                <SpillerKort key={partner.id} partner={partner} />
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-4 rounded-[20px] border border-dashed py-16 px-8 text-center"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              <Search size={32} className="text-muted-foreground" />
              <p className="m-0 text-muted-foreground">
                Ingen spillere matcher søket.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 mt-8 pt-8 border-t border-border">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="inline-flex items-center gap-2 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.10em] cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background:
                    "color-mix(in oklab, hsl(var(--foreground)) 6%, transparent)",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                  padding: "8px 18px",
                }}
              >
                <ChevronLeft size={14} />
                Forrige
              </button>

              <span className="font-mono text-[12px] text-muted-foreground tabular">
                Side {page + 1} av {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="inline-flex items-center gap-2 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.10em] cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background:
                    "color-mix(in oklab, hsl(var(--foreground)) 6%, transparent)",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                  padding: "8px 18px",
                }}
              >
                Neste
                <ChevronRight size={14} />
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
