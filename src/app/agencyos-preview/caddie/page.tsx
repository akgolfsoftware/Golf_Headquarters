/**
 * Preview-rute (offentlig, ingen auth) for AgencyOS Caddie / co-agent rammeverk.
 * Rendrer <Caddie> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/ag-caddie.png + components-co-agent.html):
 *   - Anders (coach), tomt utkast (ingen pending), 5 LIVE integrasjons-agenter
 *     (cleanup-recordings, refresh-calendar-watches, golfbox-leaderboards,
 *      golfbox-schedule, Plan-copilot), summary 5/5/0/94 %/19,
 *      8 audit-rader (alle agent-kjøringer · UTFØRT + booking-checkout).
 *
 * Desktop (≥1024px): venstre forest AgencyOS-sidebar (COACHHQ · HEAD COACH) +
 *   sentrert co-agent-rammeverk på cream-bg — primær-fasit.
 * Mobil (≤640px): sidebar skjult, seksjoner stables, tabeller scroller.
 *
 * INGEN Prisma/DB/auth her — kun presentasjon.
 */

import Link from "next/link";
import {
  BarChart3,
  Bot,
  CalendarRange,
  Eye,
  LayoutDashboard,
  Play,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import { Caddie, type CaddieProps } from "@/components/admin/caddie/caddie";

// ── Demo-data — matcher ag-caddie.png (mandags-morgen, integrasjons-flåte) ──
const demoCaddie: CaddieProps = {
  coachFirstName: "Anders",
  dateLabel: "MANDAG 1 JUNI",
  timeLabel: "07:35",

  // Seksjon 1 — ingen utkast venter (tom-tilstand i fasiten).
  draft: null,

  // Seksjon 2 — Co-agent fleet: 5 LIVE-agenter.
  fleetSummary: { total: 5, active: 5, draft: 0, avgAccuracy: 94, runs7d: 19 },
  fleet: [
    {
      id: "cleanup-recordings",
      name: "cleanup-recordings",
      role: "co-agent",
      icon: "bot",
      iconTone: "primary",
      status: "live",
      maturity: 4,
      maturityLabel: "AUTOPILOT",
      accuracy: 100,
      accuracyN: 7,
      accuracyTone: "ok",
      lastAction: "Kjørte uten feil",
      lastWhen: "SISTE 7D",
      runs7d: 7,
      runsLabel: "SISTE 7D",
      enabled: true,
    },
    {
      id: "refresh-calendar-watches",
      name: "refresh-calendar-watches",
      role: "co-agent",
      icon: "calendar-sync",
      iconTone: "primary",
      status: "live",
      maturity: 4,
      maturityLabel: "AUTOPILOT",
      accuracy: 100,
      accuracyN: 7,
      accuracyTone: "ok",
      lastAction: "Kjørte uten feil",
      lastWhen: "SISTE 7D",
      runs7d: 7,
      runsLabel: "SISTE 7D",
      enabled: true,
    },
    {
      id: "golfbox-leaderboards",
      name: "golfbox-leaderboards",
      role: "co-agent",
      icon: "trophy",
      iconTone: "primary",
      status: "live",
      maturity: 3,
      maturityLabel: "UTKAST",
      accuracy: null,
      accuracyN: 4,
      accuracyTone: "warn",
      lastAction: "Kjørte uten feil",
      lastWhen: "4 T SIDEN",
      runs7d: 2,
      runsLabel: "SISTE 7D",
      enabled: true,
    },
    {
      id: "golfbox-schedule",
      name: "golfbox-schedule",
      role: "co-agent",
      icon: "calendar-sync",
      iconTone: "primary",
      status: "live",
      maturity: 2,
      maturityLabel: "FORSLAG",
      accuracy: null,
      accuracyN: 2,
      accuracyTone: "warn",
      lastAction: "Kjørte uten feil",
      lastWhen: "4 T SIDEN",
      runs7d: 2,
      runsLabel: "SISTE 7D",
      enabled: true,
    },
    {
      id: "plan-copilot",
      name: "Plan-copilot",
      role: "plan-justering · diff",
      icon: "layers",
      iconTone: "primary",
      status: "live",
      maturity: 2,
      maturityLabel: "FORSLAG",
      accuracy: null,
      accuracyN: 2,
      accuracyTone: "warn",
      lastAction: "Kjørte uten feil",
      lastWhen: "7 D SIDEN",
      runs7d: 1,
      runsLabel: "SISTE 7D",
      enabled: true,
    },
  ],

  // Seksjon 3 — Audit · co-agent fleet: 8 hendelser (agent-kjøringer).
  audit: [
    {
      id: "a1",
      dayLabel: "I dag",
      timeLabel: "05:00",
      actor: "agent",
      actorName: "cleanup-recordings",
      actorMeta: "AGENT · KJØRING",
      what: "Fullførte kjøring",
      outcome: "ok",
      outcomeLabel: "UTFØRT",
    },
    {
      id: "a2",
      dayLabel: "I dag",
      timeLabel: "04:01",
      actor: "agent",
      actorName: "refresh-calendar-watches",
      actorMeta: "AGENT · KJØRING",
      what: "Fullførte kjøring",
      outcome: "ok",
      outcomeLabel: "UTFØRT",
    },
    {
      id: "a3",
      dayLabel: "I dag",
      timeLabel: "03:30",
      actor: "agent",
      actorName: "golfbox-leaderboards",
      actorMeta: "AGENT · KJØRING",
      what: "Fullførte kjøring",
      outcome: "ok",
      outcomeLabel: "UTFØRT",
    },
    {
      id: "a4",
      dayLabel: "I dag",
      timeLabel: "03:29",
      actor: "agent",
      actorName: "golfbox-schedule",
      actorMeta: "AGENT · KJØRING",
      what: "Fullførte kjøring",
      outcome: "ok",
      outcomeLabel: "UTFØRT",
    },
    {
      id: "a5",
      dayLabel: "I dag",
      timeLabel: "02:59",
      actor: "agent",
      actorName: "golfbox-leaderboards",
      actorMeta: "AGENT · KJØRING",
      what: "Fullførte kjøring",
      outcome: "ok",
      outcomeLabel: "UTFØRT",
    },
    {
      id: "a6",
      dayLabel: "I dag",
      timeLabel: "02:58",
      actor: "agent",
      actorName: "golfbox-schedule",
      actorMeta: "AGENT · KJØRING",
      what: "Fullførte kjøring",
      outcome: "ok",
      outcomeLabel: "UTFØRT",
    },
    {
      id: "a7",
      dayLabel: "I dag",
      timeLabel: "00:52",
      actor: "agent",
      actorName: "booking.checkout_started",
      actorMeta: "AGENT · KJØRING",
      what: (
        <>
          Booking checkout started{" "}
          <b className="font-bold">Booking:cmpudk4z4000004l5mh1l67dp</b>
        </>
      ),
      outcome: "ok",
      outcomeLabel: "UTFØRT",
    },
    {
      id: "a8",
      dayLabel: "I går",
      timeLabel: "05:00",
      actor: "agent",
      actorName: "cleanup-recordings",
      actorMeta: "AGENT · KJØRING",
      what: "Fullførte kjøring",
      outcome: "ok",
      outcomeLabel: "UTFØRT",
    },
  ],

  activityHref: "/admin/agencyos/caddie/aktivitet",
};

// ── Desktop-sidebar (preview-statisk, matcher AgencyOS-skallets formspråk) ──
type NavItem = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  active?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin/agencyos", label: "Oversikt", Icon: LayoutDashboard },
  { href: "/admin/stall", label: "Stall", Icon: Users },
  { href: "/admin/planlegge", label: "Planlegge", Icon: CalendarRange },
  { href: "/admin/gjennomfore", label: "Gjennomføre", Icon: Play },
  { href: "/admin/analysere", label: "Innsikt", Icon: BarChart3 },
  { href: "/admin/agencyos/caddie", label: "Caddie", Icon: Bot, active: true },
  { href: "/admin/organisasjon", label: "Admin", Icon: Settings },
];

function PreviewSidebar() {
  return (
    <aside
      aria-label="AgencyOS sidemeny"
      className="hidden w-64 shrink-0 flex-col bg-[var(--color-coach-sidebar)] text-white lg:flex"
    >
      <div className="flex justify-center px-4 py-6">
        <SidebarBrand variant="coach" role="HEAD COACH" />
      </div>

      <div className="px-4 pb-4">
        <Link
          href="/admin/plans/new"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          Ny plan
        </Link>
      </div>

      <nav aria-label="Hovednavigasjon" className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-0.5">
          {NAV.map(({ href, label, Icon, active }) => (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-coach-sidebar)] ${
                active
                  ? "bg-[var(--color-accent-fill)] font-semibold text-white before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-[var(--color-brand-accent)]"
                  : "text-white/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Vis som spiller */}
      <div className="px-4 pb-2">
        <Link
          href="/portal"
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Vis som spiller
        </Link>
      </div>

      <div
        aria-label="CoachHQ"
        className="m-4 rounded-md bg-accent/10 px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-accent"
      >
        COACHHQ
      </div>
    </aside>
  );
}

export default function AgencyOsCaddiePreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-coach-content)] px-4 py-5 sm:px-8 sm:py-6 lg:bg-background">
        <Caddie {...demoCaddie} />
      </main>
    </div>
  );
}
