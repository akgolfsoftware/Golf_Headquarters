/**
 * Preview-rute (offentlig, ingen auth) for PlayerHQ · Trening · Tester.
 * Rendrer <TesterListe> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/pl-tester.png): 36-test-batteri i
 * tom-tilstand (0 gjennomført, 0 forsøk, hver rad «Ingen målinger ennå · IKKE TATT»).
 *
 * Mobil (≤640px): ren innholds-kolonne, sidebar skjult — primær-fasit.
 * Desktop (≥1024px): venstre PlayerHQ-sidebar (samme skall som hjem-preview)
 * + sentrert innholds-kolonne på cream-bg.
 *
 * INGEN Prisma/DB/auth her — kun presentasjon.
 */

import Link from "next/link";
import {
  BarChart3,
  CalendarRange,
  LayoutDashboard,
  MessageSquare,
  Play,
  Plus,
} from "lucide-react";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import {
  TesterListe,
  type Axis,
  type TesterListeData,
  type TestRow,
} from "@/components/portal/tester/tester-liste";

// ── Test-batteri (36) — fasit-rekkefølge FYS → TEK → SLAG → SPILL → TURN ──
// Navn lest direkte fra pl-tester.png. De tre FYS-radene som er skjult bak
// cookie-banneret i fasiten (mellom «Ball Throw» og «Standing Long Jump») er
// rekonstruert fra AK fysiske test-batteri + alfabetisk rekkefølge.
const TESTS: { name: string; axis: Axis }[] = [
  // FYS (8)
  { name: "3000m Utholdenhet", axis: "fys" },
  { name: "Balanse 30 sek", axis: "fys" },
  { name: "Ball Throw", axis: "fys" },
  { name: "Benkpress", axis: "fys" },
  { name: "Knebøy 1RM", axis: "fys" },
  { name: "Sprint 20 m", axis: "fys" },
  { name: "Standing Long Jump", axis: "fys" },
  { name: "Trapbar Deadlift", axis: "fys" },
  // TEK (7)
  { name: "Drive treffsikkerhet", axis: "tek" },
  { name: "Teknikktest Spredning", axis: "tek" },
  { name: "TN Driver Gate", axis: "tek" },
  { name: "TN Nærspill Gate", axis: "tek" },
  { name: "TN Putt Gate", axis: "tek" },
  { name: "TN VISA Express", axis: "tek" },
  { name: "TN Wedge Gate", axis: "tek" },
  // SLAG (12)
  { name: "8-ball Blocked", axis: "slag" },
  { name: "8-ball Variation", axis: "slag" },
  { name: "Chip-test 4 m", axis: "slag" },
  { name: "Driver Basic", axis: "slag" },
  { name: "Golfslag Bane", axis: "slag" },
  { name: "Inspill 120m", axis: "slag" },
  { name: "Inspill 160m", axis: "slag" },
  { name: "Inspill Basis", axis: "slag" },
  { name: "Inspill Variation", axis: "slag" },
  { name: "Pitch 50 m", axis: "slag" },
  { name: "Putt 2 m", axis: "slag" },
  { name: "Wedge Variation", axis: "slag" },
  // SPILL (4)
  { name: "9 hull lengde", axis: "spill" },
  { name: "Putt 1-3m", axis: "spill" },
  { name: "Putt Speed 1x5", axis: "spill" },
  { name: "Putt Speed 3x3", axis: "spill" },
  // TURN (5)
  { name: "18-hull Inspill", axis: "turn" },
  { name: "PEI Test Bane", axis: "turn" },
  { name: "PGA Tour 27 Shots", axis: "turn" },
  { name: "TN Slagtest", axis: "turn" },
  { name: "TN Wedgetest", axis: "turn" },
];

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const rows: TestRow[] = TESTS.map((t) => ({
  id: slug(t.name),
  name: t.name,
  axis: t.axis,
}));

const demoTester: TesterListeData = {
  eyebrow: "PlayerHQ · Trening · Tester",
  gjennomfort: 0,
  totalt: rows.length, // 36
  totaleForsok: 0,
  pagaende: 0,
  rows,
  hrefs: {
    nyTest: "/portal/tren/tester/ny",
    katalog: "/portal/tren/tester/katalog",
  },
};

// ── Desktop-sidebar (preview-statisk, matcher PlayerHQ-skallets formspråk) ──
type NavItem = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  active?: boolean;
};

const NAV: NavItem[] = [
  { href: "/portal", label: "Oversikt", Icon: LayoutDashboard },
  { href: "/portal/planlegge", label: "Planlegge", Icon: CalendarRange, active: true },
  { href: "/portal/gjennomfore", label: "Gjennomføre", Icon: Play },
  { href: "/portal/analysere", label: "Analysere", Icon: BarChart3 },
  { href: "/portal/coach", label: "Coach", Icon: MessageSquare },
];

function PreviewSidebar() {
  return (
    <aside
      aria-label="PlayerHQ sidemeny"
      className="hidden w-64 shrink-0 flex-col bg-[var(--color-player-sidebar)] text-white lg:flex"
    >
      <div className="flex justify-center px-4 py-6">
        <SidebarBrand variant="player" role="GRATIS" />
      </div>

      <div className="px-4 pb-4">
        <Link
          href="/portal/ny-okt"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          Ny økt
        </Link>
      </div>

      <nav aria-label="Hovednavigasjon" className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-0.5">
          {NAV.map(({ href, label, Icon, active }) => (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-player-sidebar)] ${
                active
                  ? "bg-white/10 font-semibold text-accent"
                  : "text-white/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}

export default function PlayerHqTesterPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-player-content)] lg:bg-background">
        <TesterListe data={demoTester} />
      </main>
    </div>
  );
}
