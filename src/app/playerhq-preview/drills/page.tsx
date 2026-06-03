/**
 * Preview-rute (offentlig, ingen auth) for PlayerHQ Drill-bibliotek.
 * Rendrer <DrillBibliotek> med hardkodet demo-data som matcher fasiten
 * (public/design-handover/_screens/pl-drills.png) — populert bibliotek med
 * akse-/nivå-/anlegg-filtre og ærlige (live-beregnede) tellere.
 *
 * Mobil (≤640px): ren innholds-kolonne, sidebar skjult — primær-fasit.
 * Desktop (≥1024px): venstre PlayerHQ-sidebar (ak-logo + PLAYERHQ · PRO +
 * Ny økt + 5-items nav) + sentrert innholds-kolonne på cream-bg.
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
  DrillBibliotek,
  type DrillCard,
} from "@/components/portal/drills/drill-bibliotek";

// ── Demo-data — matcher fasiten (populert bibliotek, alle akser/nivå/anlegg) ──
// Representativt utvalg; tellere beregnes live fra denne lista (ingen falske tall).
const demoDrills: DrillCard[] = [
  // FYS
  {
    id: "fys-aerob-base",
    axis: "fys",
    axisLabel: "FYS",
    title: "Aerob Base-løp",
    meta: ["25 MIN"],
    difficulty: "lett",
    fasilitet: ["LOPEBANE"],
    chsLink: false,
  },
  {
    id: "fys-benkpress",
    axis: "fys",
    axisLabel: "FYS",
    title: "Benkpress",
    meta: ["4×6"],
    difficulty: "hard",
    fasilitet: ["VEKTSTANG"],
    chsLink: false,
  },
  {
    id: "fys-box-jump",
    axis: "fys",
    axisLabel: "FYS",
    title: "Box Jump",
    meta: ["4×5"],
    difficulty: "middels",
    fasilitet: ["MED_BALL"],
    chsLink: true,
  },
  {
    id: "fys-bulgarian-split",
    axis: "fys",
    axisLabel: "FYS",
    title: "Bulgarian Split Squat",
    meta: ["3×8/BEN"],
    difficulty: "middels",
    fasilitet: ["VEKTSTANG"],
    chsLink: false,
  },
  {
    id: "fys-kettlebell-sving",
    axis: "fys",
    axisLabel: "FYS · POWER",
    title: "Kettlebell-sving rotasjonell",
    meta: ["4×8", "16 KG"],
    difficulty: "hard",
    fasilitet: ["MED_BALL"],
    chsLink: true,
  },
  {
    id: "fys-rotasjon-core",
    axis: "fys",
    axisLabel: "FYS · CORE",
    title: "Rotasjonsstyrke core",
    meta: ["3×12", "ANTI-ROTASJON"],
    difficulty: "middels",
    fasilitet: ["MED_BALL"],
    chsLink: true,
  },
  // TEK
  {
    id: "tek-stopp-toppen",
    axis: "tek",
    axisLabel: "TEK · SEKVENS",
    title: "Stopp-på-toppen P4",
    meta: ["30 MIN", "3 TRINN"],
    difficulty: "middels",
    fasilitet: ["RADAR", "MAT_NET", "KAMERA"],
    chsLink: false,
  },
  {
    id: "tek-100-puttende",
    axis: "tek",
    axisLabel: "TEK · PUTT",
    title: "100-puttende 3 m",
    meta: ["20 MIN", "3 TRINN"],
    difficulty: "lett",
    fasilitet: ["PUTTING_GREEN_KORT"],
    chsLink: false,
  },
  {
    id: "tek-tempo-3-1",
    axis: "tek",
    axisLabel: "TEK · TEMPO",
    title: "Tempo 3:1 med metronom",
    meta: ["25 MIN", "4 TRINN"],
    difficulty: "middels",
    fasilitet: ["RADAR", "DRIVING_RANGE"],
    chsLink: false,
  },
  // SLAG
  {
    id: "slag-wedge-presisjon",
    axis: "slag",
    axisLabel: "SLAG · TILNÆRMING",
    title: "Wedge presisjon 50–80 m",
    meta: ["60 MIN", "4 TRINN", "CS 80"],
    difficulty: "middels",
    fasilitet: ["DRIVING_RANGE", "RADAR"],
    chsLink: false,
  },
  {
    id: "slag-lengdekontroll",
    axis: "slag",
    axisLabel: "SLAG · LENGDE",
    title: "Lengdekontroll ladder",
    meta: ["40 MIN", "5 DISTANSER"],
    difficulty: "middels",
    fasilitet: ["DRIVING_RANGE", "RADAR"],
    chsLink: false,
  },
  {
    id: "slag-bunkerteknikk",
    axis: "slag",
    axisLabel: "SLAG · NÆRSPILL",
    title: "Bunkerteknikk høy ball",
    meta: ["35 MIN", "3 TRINN"],
    difficulty: "hard",
    fasilitet: ["BUNKER", "SHORT_GAME_AREA"],
    chsLink: false,
  },
  // SPILL
  {
    id: "spill-9-hull-sim",
    axis: "spill",
    axisLabel: "SPILL · SCORING",
    title: "9-hulls spillsimulering",
    meta: ["90 MIN", "TRYKK-TEST"],
    difficulty: "hard",
    fasilitet: ["BANE", "SIMULATOR"],
    chsLink: false,
  },
  {
    id: "spill-36-walk-test",
    axis: "spill",
    axisLabel: "SPILL",
    title: "36-hulls-walk-test",
    meta: ["480 MIN", "1×1"],
    difficulty: "middels",
    fasilitet: ["BANE"],
    chsLink: false,
  },
  // TURN
  {
    id: "turn-mtq-press",
    axis: "turn",
    axisLabel: "TURN · PRESS",
    title: "MTQ press-progresjon",
    meta: ["45 MIN", "PR3-PROTOKOLL"],
    difficulty: "hard",
    fasilitet: ["BANE", "SIMULATOR"],
    chsLink: false,
  },
  {
    id: "turn-rutine-tee",
    axis: "turn",
    axisLabel: "TURN · RUTINE",
    title: "Pre-shot rutine på tee",
    meta: ["30 MIN", "10 SLAG"],
    difficulty: "lett",
    fasilitet: ["DRIVING_RANGE", "BANE"],
    chsLink: false,
  },
];

// ── Desktop-sidebar (preview-statisk, matcher PlayerHQ-skallets formspråk) ──
type NavItem = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  active?: boolean;
};

const NAV: NavItem[] = [
  { href: "/portal", label: "Oversikt", Icon: LayoutDashboard },
  { href: "/portal/planlegge", label: "Planlegge", Icon: CalendarRange },
  { href: "/portal/gjennomfore", label: "Gjennomføre", Icon: Play, active: true },
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
        <SidebarBrand variant="player" role="PRO" />
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

export default function PlayerHqDrillsPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-player-content)] lg:bg-background">
        <div className="px-4 py-6 lg:px-8 lg:py-10">
          <DrillBibliotek drills={demoDrills} />
        </div>
      </main>
    </div>
  );
}
