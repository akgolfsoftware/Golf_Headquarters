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
  Upload,
} from "lucide-react";
import {
  LiveBar,
  SectionHeader,
  InsightCard,
  StatTile,
  PhotoDivider,
  PartnerCard,
  ItineraryList,
  AuditLogPattern,
  useNowTime,
} from "@/components/v2";
import {
  COACH_DATA,
  WEATHER_DATA,
  DEMO_AUDIT_EVENTS,
  TRAINING_PARTNERS,
} from "@/lib/v2-fixtures";
import type { StatTile as StatTileData, Insight } from "@/lib/v2-fixtures";

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

// ── Coach hero ───────────────────────────────────────────────────────────────

function CoachHero() {
  return (
    <div
      className="relative overflow-hidden rounded-[20px]"
      style={{ boxShadow: "0 20px 48px -12px rgba(10,31,23,0.18)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/akgolf/AK-Golf-Academy-17.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.58) 45%, rgba(0,0,0,0.18) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)",
        }}
      />
      {/* Grain texture */}
      <div className="grain" aria-hidden />

      <div
        className="relative flex flex-col justify-between"
        style={{ minHeight: 460, padding: "40px 48px", color: "var(--background)" }}
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

        {/* Bottom — greeting + meta */}
        <div>
          <h1
            className="m-0 font-display font-bold leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: "clamp(48px, 5vw, 72px)", color: "var(--background)" }}
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

// ── Coach stat tiles ─────────────────────────────────────────────────────────

const COACH_STATS: StatTileData[] = [
  {
    label: "Aktive spillere",
    value: 14,
    unit: "tot.",
    context: "+2 siden forrige uke",
    tone: "accent",
  },
  {
    label: "Økter i dag",
    value: 7,
    unit: "plan.",
    context: "5 igjen denne uka",
    tone: "default",
  },
  {
    label: "Godkjenninger",
    value: 3,
    unit: "venter",
    context: "Forfaller innen 48t",
    tone: "critical",
  },
  {
    label: "Meldinger",
    value: 5,
    unit: "ulest",
    context: "3 fra spillere i dag",
    tone: "warning",
  },
];

// ── Coach insights med spiller-perspektiv ────────────────────────────────────

const COACH_INSIGHTS: Insight[] = [
  {
    id: "ci1",
    type: "HANDLING",
    eyebrow: "Putting-fokus for Øyvind",
    body: "Øyvind har ikke trent putting på 10 dager. SG-putt er nå -1.4 — siste av alle parametere før Sørlandsåpent. Anbefaler dedikert økt onsdag.",
    cta: "Planlegg økt",
    href: "/admin/gjennomfore",
    icon: "Sparkles",
  },
  {
    id: "ci2",
    type: "OBSERVASJON",
    eyebrow: "Markus' SG-OTT har droppet",
    body: "Markus R.P. har gått fra +0.4 til -0.2 SG-OTT over siste tre runder. Sving-tempo ned 0.3. Kan henge sammen med muskelstivhet etter FYS-blokk.",
    cta: "Se TrackMan",
    href: "/admin/analysere",
    icon: "BarChart3",
  },
  {
    id: "ci3",
    type: "MAAL",
    eyebrow: "Sofies HCP nær -1.0 (mål Q3)",
    body: "Sofie Larsen er nå på HCP 0.8 og trenger én god runde for å nå -1.0 innen Q3-fristen. Hun er på sporet — hold fremdrift med SPILL-økt denne uka.",
    cta: "Se mål",
    href: "/admin/stall",
    icon: "Target",
  },
];

// ── Coach schedule sessions (itinerary) ──────────────────────────────────────

import type { Session } from "@/lib/v2-fixtures";

const COACH_SCHEDULE: Session[] = [
  {
    id: "cs1",
    time: "08:30",
    end: "10:00",
    startH: 8.5,
    endH: 10.0,
    axis: "TEK",
    title: "Øyvind — Teknisk økt",
    subtitle: "Lavt punkt + sving-plan",
    location: "Driving range · GFGK",
    drills: 4,
    status: "DONE",
  },
  {
    id: "cs2",
    time: "10:00",
    end: "11:30",
    startH: 10.0,
    endH: 11.5,
    axis: "SLAG",
    title: "Markus — Slagteknikk",
    subtitle: "Avstandskontroll 50–120m",
    location: "Grønt-felt · GFGK",
    drills: 3,
    status: "DONE",
  },
  {
    id: "cs3",
    time: "12:00",
    end: "13:30",
    startH: 12.0,
    endH: 13.5,
    axis: "FYS",
    title: "Sofie — FYS-evaluering",
    subtitle: "CMJ + rotasjonstester",
    location: "Performance Studio",
    drills: 2,
    status: "NEXT",
  },
  {
    id: "cs4",
    time: "14:00",
    end: "15:30",
    startH: 14.0,
    endH: 15.5,
    axis: "SLAG",
    title: "Lars — Putting-økt",
    subtitle: "Gate-drill 1.5m + 3m konsistens",
    location: "Putting-green · GFGK",
    drills: 3,
    status: "PLANNED",
  },
  {
    id: "cs5",
    time: "15:30",
    end: "17:00",
    startH: 15.5,
    endH: 17.0,
    axis: "SPILL",
    title: "Anna — Spilløkt",
    subtitle: "9 huller scoring-fokus",
    location: "GFGK · sløyfe A",
    drills: 1,
    status: "PLANNED",
  },
  {
    id: "cs6",
    time: "17:00",
    end: "18:00",
    startH: 17.0,
    endH: 18.0,
    axis: "TURN",
    title: "Coach-møte",
    subtitle: "Sesong-evaluering + neste uke",
    location: "Coaches-room",
    drills: 0,
    status: "PLANNED",
  },
];

// ── Stall — fire kompakte partner-kort ───────────────────────────────────────

const STALL_FOUR = TRAINING_PARTNERS.concat([
  {
    id: "p4",
    name: "Lars Andersen",
    initials: "LA",
    hcp: 6.1,
    akademi: "AK Golf Academy",
    lastSession: "for 12 min siden",
  },
]);

// ── Ventende handlinger ───────────────────────────────────────────────────────

type PendingAction = {
  id: string;
  icon: React.ReactNode;
  label: string;
  count: number;
  detail: string;
  href: string;
  tone: "critical" | "warning" | "default";
};

const PENDING_ACTIONS: PendingAction[] = [
  {
    id: "pa1",
    icon: <ClipboardCheck size={18} />,
    label: "Økt-godkjenninger venter",
    count: 3,
    detail: "Øyvind · Markus · Sofie",
    href: "/admin/gjennomfore",
    tone: "critical",
  },
  {
    id: "pa2",
    icon: <BookOpen size={18} />,
    label: "Plan-publiseringer venter",
    count: 2,
    detail: "Sommerplan · FYS-fase 3",
    href: "/admin/plan-templates",
    tone: "warning",
  },
  {
    id: "pa3",
    icon: <Upload size={18} />,
    label: "WAGR-import klar",
    count: 1,
    detail: "1247 nye rangeringer",
    href: "/admin/talent/wagr-import",
    tone: "default",
  },
];

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
          sessions={COACH_SCHEDULE}
          weather={WEATHER_DATA}
        />

        {/* Page content */}
        <main className="mx-auto max-w-7xl px-4 py-6 space-y-10 lg:space-y-12">

          {/* Coach hero */}
          <CoachHero />

          {/* ── Section 01 — Dagens tall ─────────────────────────────────── */}
          <section className="relative">
            <SectionHeader
              eyebrow="OVERSIKT"
              title="Dagens tall"
              description="Live-status for stallen og dagens program."
              ghostNum="01"
            />

            {/* Asymmetric grid: hero tile (col-span-2) + 3 compact */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Hero tile — col-span-2 */}
              <div
                className="col-span-2 flex flex-col gap-2 rounded-[16px] border border-border p-6"
                style={{
                  background:
                    "color-mix(in oklab, var(--accent) 12%, var(--card))",
                }}
              >
                <span className="eyebrow text-muted-foreground">
                  Aktive spillere
                </span>
                <div className="flex items-baseline gap-[6px] mt-1">
                  <span
                    className="font-display font-bold tabular leading-none tracking-[-0.03em]"
                    style={{ fontSize: 56, color: "var(--foreground)" }}
                  >
                    14
                  </span>
                  <span className="font-mono text-[13px] text-muted-foreground">
                    spillere
                  </span>
                </div>
                <span
                  className="inline-flex self-start mt-1 font-mono text-[10px] font-semibold tracking-[0.04em] rounded-full px-[10px] py-[3px]"
                  style={{
                    background:
                      "color-mix(in oklab, var(--accent) 35%, transparent)",
                    color: "var(--accent-foreground)",
                  }}
                >
                  +2 siden forrige uke
                </span>
                <p className="m-0 mt-auto text-[13px] text-muted-foreground">
                  7 med økt i dag · 5 aktive mål denne uka
                </p>
              </div>

              {/* 3 compact tiles */}
              {COACH_STATS.slice(1).map((tile, i) => (
                <StatTile key={tile.label} tile={tile} idx={i + 1} hero />
              ))}
            </div>
          </section>

          {/* ── Section 02 — Spillerinnsikt ──────────────────────────────── */}
          <section className="relative">
            <SectionHeader
              eyebrow="FRA CADDIE"
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

          {/* ── Photo divider ─────────────────────────────────────────────── */}
          <PhotoDivider
            img={25}
            kicker="DAGENS FOKUS"
            line="Tre spillere trenger personlig oppmerksomhet i dag."
            dateLabel="AK GOLF ACADEMY · SESONG 2026"
          />

          {/* ── Section 03 — Dagens itinerary ────────────────────────────── */}
          <section className="relative">
            <SectionHeader
              eyebrow="PROGRAM"
              title="Dagens itinerary"
              description="Spillerøkter og møter — sortert etter tid."
              ghostNum="03"
            />
            <div
              className="rounded-[16px] border border-border p-6"
              style={{ background: "var(--card)" }}
            >
              <ItineraryList
                sessions={COACH_SCHEDULE}
                nowDecimal={nowTime.decimal}
              />
            </div>
          </section>

          {/* ── Section 04 — Stallen ─────────────────────────────────────── */}
          <section className="relative">
            <SectionHeader
              eyebrow="STALL"
              title="Stallen"
              description="Fire spillere — siste aktivitet og status."
              cta="Se hele stallen"
              ctaHref="/v2-preview/admin/spillere"
              ghostNum="04"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STALL_FOUR.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
          </section>

          {/* ── Section 05 — Ventende handlinger ─────────────────────────── */}
          <section className="relative">
            <SectionHeader
              eyebrow="HANDLINGSLISTE"
              title="Ventende handlinger"
              description="Elementer som krever din godkjenning eller handling."
              ghostNum="05"
            />
            <div className="flex flex-col gap-3">
              {PENDING_ACTIONS.map((action) => {
                const toneStyle =
                  action.tone === "critical"
                    ? {
                        borderColor:
                          "color-mix(in oklab, var(--destructive) 40%, var(--border))",
                        iconBg:
                          "color-mix(in oklab, var(--destructive) 14%, transparent)",
                        iconColor: "var(--destructive)",
                        badgeBg:
                          "color-mix(in oklab, var(--destructive) 18%, transparent)",
                        badgeColor: "var(--destructive)",
                      }
                    : action.tone === "warning"
                      ? {
                          borderColor:
                            "color-mix(in oklab, var(--accent) 30%, var(--border))",
                          iconBg:
                            "color-mix(in oklab, var(--accent) 14%, transparent)",
                          iconColor: "var(--accent-foreground)",
                          badgeBg:
                            "color-mix(in oklab, var(--accent) 22%, transparent)",
                          badgeColor: "var(--accent-foreground)",
                        }
                      : {
                          borderColor: "var(--border)",
                          iconBg:
                            "color-mix(in oklab, var(--foreground) 8%, transparent)",
                          iconColor: "var(--muted-foreground)",
                          badgeBg:
                            "color-mix(in oklab, var(--foreground) 8%, transparent)",
                          badgeColor: "var(--muted-foreground)",
                        };

                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="lift flex items-center gap-4 p-4 rounded-[14px] border no-underline"
                    style={{
                      background: "var(--card)",
                      borderColor: toneStyle.borderColor,
                      color: "inherit",
                    }}
                  >
                    {/* Icon */}
                    <span
                      className="w-10 h-10 rounded-[10px] grid place-items-center flex-shrink-0"
                      style={{
                        background: toneStyle.iconBg,
                        color: toneStyle.iconColor,
                      }}
                    >
                      {action.icon}
                    </span>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-[15px] text-foreground">
                          {action.count} {action.label}
                        </span>
                      </div>
                      <span className="text-[12px] text-muted-foreground mt-[2px] block">
                        {action.detail}
                      </span>
                    </div>

                    {/* Badge + arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className="font-mono text-[11px] font-bold tabular rounded-full px-[10px] py-[4px]"
                        style={{
                          background: toneStyle.badgeBg,
                          color: toneStyle.badgeColor,
                        }}
                      >
                        {action.count}
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-muted-foreground"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ── Section 06 — Siste hendelser ──────────────────────────────── */}
          <section className="relative">
            <div className="flex items-start justify-between gap-4 mb-4">
              <SectionHeader
                eyebrow="AKTIVITETSLOGG"
                title="Siste hendelser"
                ghostNum="06"
              />
              <Link
                href="/admin/audit-log"
                className="flex-shrink-0 inline-flex items-center gap-[6px] font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-foreground no-underline mt-8"
              >
                Full logg <ChevronRight size={13} />
              </Link>
            </div>
            <div
              className="rounded-[20px] border border-border overflow-hidden"
              style={{ background: "var(--card)" }}
            >
              <AuditLogPattern events={DEMO_AUDIT_EVENTS.slice(0, 6)} />
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
