"use client";

/**
 * Preview-rute (offentlig, ingen auth) for AgencyOS Bookinger.
 * Rendrer <Bookinger> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/ag-bookinger.png):
 *   - Uke 23 · 1 bookinger · "ingen i perioden"
 *   - Periode-pill: I DAG · UKE 23 (aktiv) · UKE 24 · ALLE
 *   - Filtre: Coach ALLE · Status ALLE · Type ALLE
 *   - Én dag-gruppe (TIR 2 JUN · 1 bookinger) med én rad:
 *     Anders K. · 2/6 · 17:00 (20 m) · coach Anders K. · Coaching ·
 *     0/4 + PAY · Gamle Fredrikstad GK · Bekreftet
 *
 * Desktop (≥1024px): venstre forest AgencyOS-sidebar (COACHHQ · HEAD COACH) +
 *   sentrert innhold på cream-bg — primær-fasit.
 * Mobil (≤640px): sidebar skjult, tabell scroller horisontalt.
 *
 * INGEN Prisma/DB/auth her — kun presentasjon.
 */

import Link from "next/link";
import {
  BarChart3,
  CalendarRange,
  CircleDot,
  Eye,
  LayoutDashboard,
  Play,
  Plus,
  Settings,
  Tag,
  UserCog,
  Users,
} from "lucide-react";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import { Bookinger, type BookingerData } from "@/components/admin/bookinger/bookinger";

// ── Demo-data — matcher ag-bookinger.png (tom periode-meta, 1 booking) ──
const demoBookinger: BookingerData = {
  periodLabel: "Uke 23",
  totalBookings: 1,
  headMeta: [], // tom → "ingen i perioden"
  periodTabs: [
    { key: "i-dag", label: "I dag" },
    { key: "uke-23", label: "Uke 23" },
    { key: "uke-24", label: "Uke 24" },
    { key: "alle", label: "Alle" },
  ],
  activePeriod: "uke-23",
  filters: [
    { key: "coach", icon: UserCog, label: "Coach", value: "Alle" },
    { key: "status", icon: CircleDot, label: "Status", value: "Alle" },
    { key: "type", icon: Tag, label: "Type", value: "Alle" },
  ],
  groups: [
    {
      label: "TIR 2 JUN",
      count: 1,
      rows: [
        {
          id: "bk-1",
          player: { initials: "AK", name: "Anders K.", sub: "Coaching", tone: "neutral" },
          date: { dow: "TIR", dm: "2/6" },
          time: { start: "17:00", dur: "20 m" },
          coach: { initials: "AK", name: "Anders K." },
          type: "coaching",
          credit: { kind: "credits", used: 0, total: 4, tone: "danger", pay: true },
          location: "Gamle Fredrikstad GK",
          status: "bekreftet",
          href: "/admin/bookinger/bk-1",
        },
      ],
    },
  ],
  pagination: {
    fromTo: "1–1",
    total: 1,
    scope: "uke 23",
    page: 1,
    pages: 1,
  },
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

export default function AgencyOsBookingerPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-coach-content)] px-4 py-5 sm:px-8 sm:py-6 lg:bg-background">
        <Bookinger data={demoBookinger} />
      </main>
    </div>
  );
}
