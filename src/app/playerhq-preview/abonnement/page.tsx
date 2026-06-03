/**
 * Preview-rute (offentlig, ingen auth) for PlayerHQ Abonnement.
 * Rendrer <Abonnement> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/pl-abonnement.png) — spiller "Mathias Sørby",
 * tier GRATIS, tom-tilstand (0 kr, ingen credits, ingen faktura-historikk).
 *
 * Mobil (≤640px): ren innholds-kolonne, sidebar skjult — primær-fasit.
 * Desktop (≥1024px): venstre PlayerHQ-sidebar (ak-logo + PLAYERHQ · GRATIS +
 * Ny økt + 5-items nav) + sentrert innholds-kolonne på cream-bg.
 *
 * INGEN Prisma/DB/auth/Stripe her — kun presentasjon.
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
  Abonnement,
  type AbonnementData,
} from "@/components/portal/abonnement/abonnement";

// ── Demo-data — matcher pl-abonnement.png (GRATIS-tier, tom-tilstand) ──
const demoAbonnement: AbonnementData = {
  spillerNavn: "Mathias Sørby",
  tier: "GRATIS",
  mndAvgift: 0,
  creditsIgjen: null,
  forfallOmDager: null,
  proPris: 300,
  proFeatures: [
    "3 aktive treningsplaner",
    "Ubegrenset coaching-historikk",
    "AI-anbefalinger fra coach-agenten",
    "TrackMan-import",
    "Helse + restitusjon",
    "50 coach-meldinger / mnd",
  ],
  fakturaer: [],
  hrefs: {
    oppgrader: "/portal/meg/abonnement/oppgrader",
    endrePlan: "/portal/meg/abonnement",
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

export default function PlayerHqAbonnementPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-player-content)] lg:bg-background">
        <Abonnement data={demoAbonnement} />
      </main>
    </div>
  );
}
