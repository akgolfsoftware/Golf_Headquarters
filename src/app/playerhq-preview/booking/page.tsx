/**
 * Preview-rute (offentlig, ingen auth) for PlayerHQ Booking-hub.
 * Rendrer <BookingHub> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/pl-booking.png) — tom-tilstand:
 * Free-spiller (pay-as-you-go, ingen credits), ingen kommende bookinger,
 * men 2 coacher tilgjengelig for direkte booking.
 *
 * Mobil (≤640px): ren innholds-kolonne, sidebar skjult — primær-fasit.
 * Desktop (≥1024px): venstre PlayerHQ-sidebar (ak-logo + PLAYERHQ · GRATIS +
 * Ny økt + 5-items nav, Booking aktiv) + sentrert innholds-kolonne.
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
  BookingHub,
  type HubBooking,
  type HubCoach,
  type HubCredits,
} from "@/components/portal/booking/booking-hub";

// ── Demo-data — matcher pl-booking.png (tom-tilstand, Free-spiller) ──
const demoCredits: HubCredits = {
  tier: "GRATIS",
  monthlyCredits: 0,
  creditsRemaining: 0,
  renewsAtIso: null,
  canUseCredits: false,
};

const demoUpcoming: HubBooking[] = [];

const demoCoaches: HubCoach[] = [
  {
    id: "coach-solberg",
    initials: "AS",
    name: "Anders Solberg",
    serviceCount: 4,
    fromPrice: "450 kr",
  },
  {
    id: "coach-marte",
    initials: "MV",
    name: "Marte Vik",
    serviceCount: 3,
    fromPrice: "450 kr",
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
          href="/portal/booking/ny"
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

export default function PlayerHqBookingPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-player-content)] lg:bg-background">
        <BookingHub
          credits={demoCredits}
          upcoming={demoUpcoming}
          coaches={demoCoaches}
        />
      </main>
    </div>
  );
}
