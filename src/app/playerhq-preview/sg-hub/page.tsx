/**
 * Preview-rute (offentlig, ingen auth) for PlayerHQ Strokes Gained Hub.
 * Rendrer <SgHub> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/pl-sghub.png) — ny GRATIS-spiller,
 * tom-tilstand (0 runder, 0 TrackMan-økter).
 *
 * Mobil (≤640px): ren innholds-kolonne, sidebar skjult — primær-fasit.
 * Desktop (≥1024px): venstre PlayerHQ-sidebar (ak-logo + PLAYERHQ · GRATIS +
 * Ny økt + 5-items nav, "Analysere" aktiv) + sentrert innholds-kolonne.
 *
 * INGEN Prisma/DB/auth her — kun presentasjon.
 */

import Link from "next/link";
import {
  Activity,
  BarChart2,
  BarChart3,
  Box,
  CalendarRange,
  Crosshair,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Play,
  Plus,
  Wind,
} from "lucide-react";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import { SgHub, type SgHubData } from "@/components/portal/sg-hub/sg-hub";

// ── Demo-data — matcher pl-sghub.png (tom-tilstand, ny GRATIS-spiller) ──
const demoSgHub: SgHubData = {
  eyebrow: "PLAYERHQ · /PORTAL/MAL/SG-HUB",
  subtittel: "Logg din første runde for å låse opp SG-pipelinen.",

  totalEyebrow: "SG TOTAL · 90 D",
  totalPill: "0 TrackMan-økter",
  totalBody:
    "SG-pipelinen viser hvor du tjener eller taper strokes mot benchmark. Bygd på 0 runder siste 90 dager.",
  totalValue: "—",

  kpi: [
    { eyebrow: "TrackMan-økter", value: "0", footnote: "totalt" },
    { eyebrow: "Aktive innsikter", value: "0", footnote: "ikke kvittert" },
    { eyebrow: "Snitt-score", value: "—", footnote: "0 runder 90 d" },
    { eyebrow: "Benchmark", value: "PGA Tour", footnote: "kategori A1" },
  ],

  cta: {
    tittel: "Hvordan bygges SG-pipelinen?",
    body: (
      <>
        Vi beregner strokes gained per disiplin og per kølle så snart du logger
        runder med <strong className="font-semibold text-foreground">slag-for-slag-data</strong>.
      </>
    ),
    knapp: { label: "Logg runde", href: "/portal/mal/sg-hub/logg-runde" },
  },

  disiplinNote: "dummy-tall vises til du har 3+ runder",
  disipliner: [
    { eyebrow: "SG · OFF-THE-TEE", value: "—", status: "Ingen data", href: "/portal/mal/sg-hub/ott" },
    { eyebrow: "SG · APPROACH", value: "—", status: "Ingen data", href: "/portal/mal/sg-hub/app" },
    { eyebrow: "SG · AROUND-GREEN", value: "—", status: "Ingen data", href: "/portal/mal/sg-hub/arg" },
    { eyebrow: "SG · PUTTING", value: "—", status: "Ingen data", href: "/portal/mal/sg-hub/putt" },
  ],

  prioriteringer: {
    eyebrow: "TOPP 3 PRIORITERINGER FOR NESTE TURNERING",
    body: "Vi trenger flere runder for å rangere prioriteringer. Logg minst 3 runder.",
  },

  trackman: {
    eyebrow: "SIST TRACKMAN-ØKT",
    body: (
      <>
        Ingen TrackMan-økter ennå.{" "}
        <Link href="/portal/mal/sg-hub/import" className="font-medium text-primary hover:opacity-80">
          Importer din første økt
        </Link>{" "}
        for å låse opp insights og per-kølle analyse.
      </>
    ),
  },

  perKolleTom: (
    <>
      Ingen TrackMan-data ennå.{" "}
      <Link href="/portal/mal/sg-hub/import" className="font-medium text-primary hover:opacity-80">
        Importer din første økt
      </Link>{" "}
      for å aktivere per-kølle analyse.
    </>
  ),

  verktoy: [
    { ikon: Activity, tittel: "Benchmark vs Tour", badge: "LIVE", live: true, href: "/portal/mal/sg-hub/benchmark" },
    { ikon: BarChart2, tittel: "Stock Yardage Chart", badge: "FASE 3", href: "/portal/mal/sg-hub/yardage" },
    { ikon: Wind, tittel: "Værjustert distanse", badge: "FASE 3", href: "/portal/mal/sg-hub/yardage" },
    { ikon: MapPin, tittel: "Same-Distance strategi", badge: "FASE 3", href: "/portal/mal/sg-hub/strategy" },
    { ikon: Crosshair, tittel: "Best vs Today", badge: "FASE 4", href: "/portal/mal/sg-hub/best-vs-now" },
    { ikon: Box, tittel: "Equipment Fit", badge: "FASE 5", href: "/portal/mal/sg-hub/equipment" },
  ],
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
  { href: "/portal/planlegge", label: "Planlegge", Icon: CalendarRange },
  { href: "/portal/gjennomfore", label: "Gjennomføre", Icon: Play },
  { href: "/portal/analysere", label: "Analysere", Icon: BarChart3, active: true },
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

export default function PlayerHqSgHubPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-player-content)] lg:bg-background">
        <SgHub data={demoSgHub} />
      </main>
    </div>
  );
}
