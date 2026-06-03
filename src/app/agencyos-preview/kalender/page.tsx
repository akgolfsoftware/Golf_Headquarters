/**
 * Preview-rute (offentlig, ingen auth) for AgencyOS Kalender — uke-visning.
 * Rendrer <Kalender> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/ag-kalender.png + skjerm 7 i
 * SKJERMER-RUNDE-4-AGENCYOS):
 *   - H1 "Kalender" + vis-toggle (UKE aktiv) + Ny booking
 *   - Uke 23 · 1.–7. jun 2026, MAN 1 = i dag (lime-tint + now-line 07:35)
 *   - Sparsom uke (fasiten viser stort sett tomme kolonner + én synlig 17:00-økt;
 *     vi viser de tre legende-typene: 1-til-1 / gruppe / live-økt)
 *   - Legende nederst
 *
 * Desktop (≥1024px): venstre forest AgencyOS-sidebar (COACHHQ · HEAD COACH) +
 *   kalender på cream-bg — primær-fasit. Mobil (≤640px): sidebar skjult,
 *   grid scroller horisontalt, topp-rad brytes.
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
import { Kalender, type CalendarData } from "@/components/admin/kalender/kalender";

// ── Demo-data — matcher ag-kalender.png (Uke 23, MAN 1 jun = i dag, 07:35) ──
const demoCalendar: CalendarData = {
  weekLabel: "Uke 23",
  rangeLabel: "1.–7. jun 2026",
  nowMinutes: 7 * 60 + 35, // now-line 07:35 i today-kolonnen (MAN)
  prevHref: "/admin/kalender?uke=22",
  nextHref: "/admin/kalender?uke=24",
  todayHref: "/admin/kalender",
  monthHref: "/admin/calendar/maned",
  listHref: "/admin/bookinger",
  newBookingHref: "/admin/bookinger/ny",

  days: [
    { dow: "MAN", date: "1", monthSub: "jun", today: true },
    { dow: "TIR", date: "2" },
    { dow: "ONS", date: "3" },
    { dow: "TOR", date: "4" },
    { dow: "FRE", date: "5" },
    { dow: "LØR", date: "6", weekend: true },
    { dow: "SØN", date: "7", weekend: true },
  ],

  // Sparsom uke. TIR 17:00 = den synlige økten i fasiten (1-til-1, lime).
  // De øvrige gir mening til de tre legende-typene uten å fylle uka.
  events: [
    {
      id: "ev-1",
      dayIndex: 1, // TIR
      start: "17:00",
      durationMin: 60,
      kind: "oneToOne",
      player: "Karl Ludvig",
      typeLabel: "SLAG",
      location: "GFGK · TM bay 3",
      href: "/admin/bookinger",
    },
    {
      id: "ev-2",
      dayIndex: 2, // ONS
      start: "09:00",
      durationMin: 90,
      kind: "group",
      player: "Gruppe · WANG",
      typeLabel: "Gruppe · 6 spillere",
      location: "GFGK Performance",
      href: "/admin/bookinger",
    },
    {
      id: "ev-3",
      dayIndex: 3, // TOR
      start: "14:30",
      durationMin: 60,
      kind: "live",
      player: "Jørgen Engh",
      typeLabel: "Live-økt · pågår",
      href: "/admin/live",
    },
  ],
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
  { href: "/admin/planlegge", label: "Planlegge", Icon: CalendarRange, active: true },
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

export default function AgencyOsKalenderPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-coach-content)] px-4 py-5 sm:px-8 sm:py-6 lg:bg-background">
        <Kalender data={demoCalendar} />
      </main>
    </div>
  );
}
