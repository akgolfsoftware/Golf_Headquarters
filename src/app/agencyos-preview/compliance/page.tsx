/**
 * Preview-rute (offentlig, ingen auth) for AgencyOS Compliance-oversikt.
 * Rendrer <Compliance> med hardkodet demo-data som matcher fasiten
 * (public/design-handover/_screens/ag-compliance.png +
 *  public/design-handover/agencyos/components-compliance.html).
 *
 * Demo-tilstand = den faktisk rendrede skjermen i fasiten:
 *   - Periode SISTE 30 DAGER · valgt spiller Anders Kristiansen (7 planlagte økter,
 *     0 fullført → 0 %, "Under nivå — 0 av 7").
 *   - Stall: 25 spillere (Anders med plan øverst som "BAK PLAN", resten uten plan),
 *     alle "Aldri" logget · snitt/median 0 % · 25 over 14 d uten økt-logg.
 *   - Drill-seksjon tom ("Ingen loggede økter med drills …").
 *
 * Desktop (≥1024px): venstre forest AgencyOS-sidebar (COACHHQ · HEAD COACH) +
 *   bred compliance-flate på cream-bg — primær-fasit.
 * Mobil (≤640px): sidebar skjult, seksjonene stables.
 *
 * INGEN Prisma/DB/auth her — kun presentasjon.
 */

import Link from "next/link";
import {
  BarChart3,
  CalendarRange,
  Eye,
  LayoutDashboard,
  Play,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import {
  Compliance,
  type ComplianceData,
  type StallRow,
} from "@/components/admin/compliance/compliance";

// ── Demo-data ─────────────────────────────────────────────────────

// Tom uke-strip (8 uker, ingen fullføring) — speiler fasitens flate barer.
const EMPTY_WEEKS = [
  { label: "U18", done: 0, planned: 0, fill: 0, band: "bad" as const, isNow: false },
  { label: "U19", done: 0, planned: 0, fill: 0, band: "bad" as const, isNow: false },
  { label: "U20", done: 0, planned: 0, fill: 0, band: "bad" as const, isNow: false },
  { label: "U21", done: 0, planned: 0, fill: 0, band: "bad" as const, isNow: false },
  { label: "U22", done: 0, planned: 0, fill: 0, band: "bad" as const, isNow: false },
  { label: "U23", done: 0, planned: 0, fill: 0, band: "bad" as const, isNow: false },
  { label: "U24", done: 0, planned: 0, fill: 0, band: "bad" as const, isNow: false },
  { label: "U25", done: 0, planned: 0, fill: 0, band: "bad" as const, isNow: true },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Spillere uten plan i perioden (alfabetisk, "Aldri" logget) — som i fasiten.
const NO_PLAN_NAMES: { name: string; homeClub?: string }[] = [
  { name: "Aksel Eilefsen" },
  { name: "Aksel Lind" },
  { name: "Aksel Lind" },
  { name: "Alfred Johan Stene" },
  { name: "Erik Rochette" },
  { name: "Erlend Drabløs" },
  { name: "Filip Svendsen", homeClub: "Gamle Fredrikstad Golfklubb" },
  { name: "Fredrik Kjølberg Hovland" },
  { name: "Fredrik Smith" },
  { name: "Henrik Olsen Smith" },
  { name: "Jakob Holm" },
  { name: "Jørgen Engh" },
  { name: "Kristoffer Buvarp" },
  { name: "Leander Jahr" },
  { name: "Liam Simensen" },
  { name: "Ludvig Andersen" },
  { name: "Mathias Sørby" },
  { name: "Max Risvåg" },
  { name: "Monika Undheim" },
  { name: "Neo Stenlund-Thomassen" },
  { name: "Robin Hansen" },
  { name: "Sebastian Henriksen" },
  { name: "Sonja Sofie Sinding" },
  { name: "Theo Otnes" },
];

// Anders Kristiansen — eneste med plan (7 planlagte, 0 fullført → BAK PLAN).
const ANDERS_ROW: StallRow = {
  playerId: "demo-anders",
  playerName: "Anders Kristiansen",
  initials: "AK",
  hcp: 4.2,
  homeClub: "Gamle Fredrikstad GK",
  planned: 7,
  done: 0,
  pct: 0,
  band: "bad",
  lastLog: "Aldri",
  lastLogBand: "bad",
  spark: [],
  staleDays: null,
};

const NO_PLAN_ROWS: StallRow[] = NO_PLAN_NAMES.map((p, i) => ({
  playerId: `demo-np-${i}`,
  playerName: p.name,
  initials: initials(p.name),
  hcp: null,
  homeClub: p.homeClub ?? null,
  planned: 0,
  done: 0,
  pct: 0,
  band: "bad",
  lastLog: "Aldri",
  lastLogBand: "bad",
  spark: [],
  staleDays: null,
}));

const demoCompliance: ComplianceData = {
  periodLabel: "SISTE 30 DAGER",
  windowDays: 30,

  // Section 1 — Anders, 0 av 7, alle akser bak plan.
  panel: {
    playerId: "demo-anders",
    playerName: "Anders Kristiansen",
    totalPlanned: 7,
    totalDone: 0,
    pct: 0,
    band: "bad",
    axes: [
      { axis: "turn", label: "Turnering", done: 0, planned: 1, pct: 0, band: "bad", delta: -1 },
      { axis: "spill", label: "Spill", done: 0, planned: 1, pct: 0, band: "bad", delta: -1 },
      { axis: "slag", label: "Slag", done: 0, planned: 2, pct: 0, band: "bad", delta: -2 },
      { axis: "tek", label: "Teknisk", done: 0, planned: 2, pct: 0, band: "bad", delta: -2 },
      { axis: "fys", label: "Fysisk", done: 0, planned: 1, pct: 0, band: "bad", delta: -1 },
    ],
    weeks: EMPTY_WEEKS,
    diagnosis:
      "Slag-økter er 2 bak plan (0% fullført). Sjekk om planen treffer hverdagen, eller følg opp spilleren.",
  },

  players: [
    { id: "demo-anders", name: "Anders Kristiansen" },
    ...NO_PLAN_NAMES.map((p, i) => ({ id: `demo-np-${i}`, name: p.name })),
  ],
  selectedPlayerId: "demo-anders",

  // Section 2 — Anders (med plan) øverst, resten uten plan.
  stall: [ANDERS_ROW, ...NO_PLAN_ROWS],
  cohortAvg: 0,
  cohortMedian: 0,
  staleCount: 25,

  // Section 3 — ingen logget økt.
  drillSession: null,
};

// ── Desktop-sidebar (preview-statisk, matcher cockpit-preview-skallet) ──
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
  { href: "/admin/analysere", label: "Innsikt", Icon: BarChart3, active: true },
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

export default function AgencyOsCompliancePreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-coach-content)] px-4 py-5 sm:px-8 sm:py-6 lg:bg-background">
        <Compliance data={demoCompliance} />
      </main>
    </div>
  );
}
