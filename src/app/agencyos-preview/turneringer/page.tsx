/**
 * Preview-rute (offentlig, ingen auth) for AgencyOS Turneringer.
 * Rendrer <Turneringer> i AgencyOS desktop-skall (venstre forest-sidebar
 * COACHHQ · HEAD COACH + cream content) med hardkodet demo-data.
 *
 * Bygget FRA design-manifest (ingen v10-screenshot finnes):
 *   docs/skjerm-manifest-agencyos.md §3 «/admin/tournaments» — Uke/Måned/År +
 *   auto-populert «DENNE HELGEN» + «Send fellesmelding til alle N deltakere».
 *
 * Demo-data matcher wireframens to navngitte turneringer (Sørlandsåpent 8 spillere,
 * OLYO Juniortour 3 spillere) + flere kommende for å fylle Måned/År-visning.
 *
 * Desktop (≥1024px): sidebar + sentrert turneringsliste på cream-bg — primær.
 * Mobil (≤640px): sidebar skjult, kort stables fullbredde, tabs scroller.
 *
 * INGEN Prisma/DB/auth — kun presentasjon.
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
  Turneringer,
  type TurneringerData,
} from "@/components/admin/turneringer/turneringer";

// ── Demo-data — matcher manifest-wireframe + utvidet for Måned/År ──
const demoTurneringer: TurneringerData = {
  thisWeekend: [
    {
      id: "t-sorlandsapent",
      name: "Sørlandsåpent",
      venue: "Bortelid GK",
      dates: "14 – 16. juni",
      startISO: "2026-06-14",
      category: "SRIXON TOUR · #4",
      href: "/admin/tournaments/t-sorlandsapent",
      participants: [
        { id: "p-magnus", initials: "MB", name: "Magnus Berg" },
        { id: "p-kari", initials: "KH", name: "Kari Holm" },
        { id: "p-per", initials: "PA", name: "Per Aas" },
        { id: "p-lina", initials: "LS", name: "Lina Strand" },
        { id: "p-jonas", initials: "JK", name: "Jonas Krog" },
        { id: "p-sofie", initials: "SK", name: "Sofie Kvam" },
        { id: "p-henrik", initials: "HD", name: "Henrik Dahl" },
        { id: "p-ida", initials: "IR", name: "Ida Røed" },
      ],
    },
  ],
  upcoming: [
    {
      id: "t-olyo",
      name: "OLYO Juniortour",
      venue: "Huseby & Hankø",
      dates: "21 – 22. juni",
      startISO: "2026-06-21",
      category: "JUNIORTOUR",
      href: "/admin/tournaments/t-olyo",
      participants: [
        { id: "p-anders", initials: "AN", name: "Anders Nilsen" },
        { id: "p-emma", initials: "EL", name: "Emma Lie" },
        { id: "p-noah", initials: "NV", name: "Noah Vik" },
      ],
    },
    {
      id: "t-nm-junior",
      name: "NM Junior",
      venue: "Oslo GK · Bogstad",
      dates: "4 – 6. juli",
      startISO: "2026-07-04",
      category: "MESTERSKAP",
      href: "/admin/tournaments/t-nm-junior",
      participants: [
        { id: "p-magnus2", initials: "MB", name: "Magnus Berg" },
        { id: "p-lina2", initials: "LS", name: "Lina Strand" },
        { id: "p-emma2", initials: "EL", name: "Emma Lie" },
        { id: "p-noah2", initials: "NV", name: "Noah Vik" },
        { id: "p-ida2", initials: "IR", name: "Ida Røed" },
      ],
    },
    {
      id: "t-srixon-5",
      name: "Srixon Tour #5",
      venue: "Losby GK",
      dates: "18 – 19. juli",
      startISO: "2026-07-18",
      category: "SRIXON TOUR · #5",
      href: "/admin/tournaments/t-srixon-5",
      participants: [
        { id: "p-per2", initials: "PA", name: "Per Aas" },
        { id: "p-jonas2", initials: "JK", name: "Jonas Krog" },
        { id: "p-henrik2", initials: "HD", name: "Henrik Dahl" },
        { id: "p-kari2", initials: "KH", name: "Kari Holm" },
      ],
    },
    {
      id: "t-narvik",
      name: "Narvik Open",
      venue: "Narvik GK",
      dates: "8 – 9. august",
      startISO: "2026-08-08",
      category: "REGIONSTOUR",
      href: "/admin/tournaments/t-narvik",
      participants: [
        { id: "p-sofie2", initials: "SK", name: "Sofie Kvam" },
        { id: "p-anders2", initials: "AN", name: "Anders Nilsen" },
      ],
    },
  ],
  newHref: "/admin/tournaments/ny",
};

// ── Desktop-sidebar (preview-statisk, matcher AgencyOS-skallet) ──
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

export default function AgencyOsTurneringerPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-coach-content)] px-4 py-5 sm:px-8 sm:py-6 lg:bg-background">
        <Turneringer data={demoTurneringer} />
      </main>
    </div>
  );
}
