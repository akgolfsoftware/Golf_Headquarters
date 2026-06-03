/**
 * Preview-rute (offentlig, ingen auth) for PlayerHQ Drill-detalj.
 * Rendrer <DrillDetalj> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/pl-drill.png) — drill "Chip-landing",
 * akse SLAG, CS 45, tom media-tilstand.
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
  DrillDetalj,
  type DrillDetaljData,
} from "@/components/portal/drills/drill-detalj";

// ── Demo-data — matcher pl-drill.png ──
const demoDrill: DrillDetaljData = {
  topbarTag: "DRILL",
  axis: "slag",
  eyebrow: "Slag",
  name: "Chip-landing",
  csBadge: "CS 45",
  description: "Chip til target-sone, landing-spot fokus.",
  mediaUrl: null,
  params: [
    { key: "Reps", value: "3x10" },
    { key: "CS", value: "65" },
  ],
  feedbackOptions: ["Aha!", "Utfordrende", "Passe", "Kjedelig", "For vanskelig"],
  hrefs: {
    bibliotek: "/portal/drills",
    startOkt: "/portal/ny-okt",
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

export default function PlayerHqDrillDetaljPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-player-content)] lg:bg-background">
        <div className="mx-auto max-w-2xl px-0 py-0 sm:px-6 sm:py-8">
          <DrillDetalj data={demoDrill} />
        </div>
      </main>
    </div>
  );
}
