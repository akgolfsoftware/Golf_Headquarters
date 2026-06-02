/**
 * Preview-rute (offentlig, ingen auth) for AgencyOS Spiller-detalj (DetailShell).
 * Rendrer <SpillerDetalj> med hardkodet demo-data (Markus R.P.) som matcher
 * v10-fasiten + delt datakilde (risiko #6):
 *   - Visuell fasit (full-page, 2 kolonner): public/design-handover/_screens/ag-spiller.png
 *   - Komponent-/token-referanse: public/design-handover/agencyos/components-agency-player-panel.html
 *   Markus' KPI (14,5 t · −0,42 SG) og pyramide (FYS 100 · TEK 100 · SLAG 33 alarm ·
 *   SPILL 67 · TURN 38) er identiske med spillertabellen (ag-stallen).
 *   Uke 22 (MAN 26 → SØN 01) — label matcher datoene, jf. player-panel.html.
 *
 * Desktop (≥1024px): venstre forest AgencyOS-sidebar (COACHHQ · HEAD COACH,
 *   nav: Oversikt/Stall[aktiv]/Planlegge/Gjennomføre/Innsikt/Admin) + DetailShell
 *   på cream-bg — primær-fasit, 2 kolonner side-om-side.
 * Mobil (≤640px): sidebar skjult, hero stabler, tab-rad scrollbar, kolonner stables.
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
  Trophy,
  Users,
} from "lucide-react";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import {
  SpillerDetalj,
  type SpillerDetaljData,
} from "@/components/admin/spiller-detalj/spiller-detalj";

// ── Demo-data — Markus R.P. (delt datakilde m/ ag-stallen + player-panel.html) ──
const demoSpiller: SpillerDetaljData = {
  id: "markus-rp",
  initials: "MR",
  name: "Markus R.P.",
  hcp: "+1,4",
  group: "WANG",
  tier: { label: "KONK", icon: Trophy },
  coachName: "Andreas K.",
  status: { label: "Bak plan", tone: "warn" },
  alarm: "2 ØKTER BAK · 12 DG TIL SRIXON #2",

  kpiHeading: "SISTE 30 DAGER",
  kpis: [
    { label: "ØKTER", value: "12", delta: { text: "−2 vs plan", tone: "down" } },
    { label: "TIM. TRENT", value: "14,5 t", delta: { text: "−3 t", tone: "down" } },
    { label: "SG-TREND", value: "−0,42", tone: "neg", delta: { text: "innspill", tone: "down" } },
  ],

  pyramidHeading: "PYRAMIDE · UKE 22 / PLAN",
  // Fyll = andel av target nådd; verdi = trent / target.
  pyramid: [
    { key: "turn", label: "TURN", pct: 38, targetPct: 40, value: "1,5 / 4 t" },
    { key: "spill", label: "SPILL", pct: 67, targetPct: 100, value: "2,0 / 3 t" },
    { key: "slag", label: "SLAG", pct: 33, targetPct: 100, value: "2,0 / 6 t", alarm: true },
    { key: "tek", label: "TEK", pct: 100, targetPct: 100, value: "2,0 / 2 t" },
    { key: "fys", label: "FYS", pct: 100, targetPct: 100, value: "3,0 / 3 t" },
  ],

  weekHeading: "UKE 22 · MAN → SØN",
  // Kun bekreftede økter. ONS = i dag. TOR/FRE = slag-økter (coach laster slag).
  week: [
    { dow: "MAN", date: "26", pips: ["fys", "slag"] },
    { dow: "TIR", date: "27", pips: ["tek", "fys"] },
    { dow: "ONS", date: "28", pips: ["fys", "slag", "spill"], today: true },
    { dow: "TOR", date: "29", pips: ["slag"] },
    { dow: "FRE", date: "30", pips: ["slag"] },
    { dow: "LØR", date: "31", pips: [] },
    { dow: "SØN", date: "01", pips: [] },
  ],

  booking: {
    dow: "TOR",
    date: "29",
    title: "Innspill 50–80 m · 1-til-1",
    time: "14:30 · 60 m",
    location: "GFGK TM 3",
    axis: { label: "SLAG", key: "slag" },
  },

  comms: [
    {
      id: "c1",
      initials: "MR",
      who: "Markus R.P.",
      type: { label: "GODKJENN", appr: true },
      preview: "Foreslår å bytte fre-økt til lørdag før Srixon Tour #2",
      when: "07:42",
    },
    {
      id: "c2",
      initials: "AK",
      coach: true,
      who: "Andreas K.",
      preview: "Bra video — pass på lavpunktet på random-mix-drillen",
      when: "i går",
    },
    {
      id: "c3",
      initials: "MR",
      who: "Markus R.P.",
      type: { label: "VIDEO" },
      preview: "Innspill 65 m · 30 reps · merk: rask sequencing",
      when: "man 22:14",
    },
  ],
};

// ── Desktop-sidebar (preview-statisk, matcher cockpit/spillere-preview-skallet) ──
type NavItem = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  active?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin/agencyos", label: "Oversikt", Icon: LayoutDashboard },
  { href: "/admin/stall", label: "Stall", Icon: Users, active: true },
  { href: "/admin/planlegge", label: "Planlegge", Icon: CalendarRange },
  { href: "/admin/gjennomfore", label: "Gjennomføre", Icon: Play },
  { href: "/admin/analysere", label: "Innsikt", Icon: BarChart3 },
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

export default function AgencyOsSpillerDetaljPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-coach-content)] px-4 py-5 sm:px-8 sm:py-6 lg:bg-background">
        <SpillerDetalj data={demoSpiller} />
      </main>
    </div>
  );
}
