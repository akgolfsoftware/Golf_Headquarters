/**
 * Preview-rute (offentlig, ingen auth) for AgencyOS Drift — "Innstillinger og team".
 * Rendrer <Drift> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/ag-drift.png +
 * public/design-handover/agencyos/components-agency-drift.html):
 *   - Header "DRIFT · Innstillinger og team" + EIER Anders K. · OPPRETTET 01.06.2026
 *   - Akkordion: Innstillinger (kollaps) · Team [4] (utvidet, 4 medlemmer) ·
 *     Plan-maler [11] (utvidet, mal-grid) · Tilgjengelighet · Audit-log · WAGR-import
 *   - Footer "Andre undersider"-pills
 *
 * Desktop (≥1024px): venstre forest AgencyOS-sidebar (COACHHQ · HEAD COACH) +
 *   innhold på cream-bg — primær-fasit. Mobil (≤640px): sidebar skjult, stablet.
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
import { Drift, type DriftData } from "@/components/admin/drift/drift";

// ── Demo-data — matcher ag-drift.png (ekte AK Golf-akademi-data) ──
const demoDrift: DriftData = {
  eyebrow: "DRIFT",
  title: "Innstillinger og team",
  ownerName: "Anders K.",
  createdAt: "01.06.2026",

  settingsHref: "/admin/organisasjon/innstillinger",
  availabilityHref: "/admin/organisasjon/tilgjengelighet",
  auditHref: "/admin/organisasjon/audit",
  wagrHref: "/admin/organisasjon/wagr-import",

  team: {
    memberCount: 4,
    summary: "0 aktive · 2 coacher · 2 admin",
    rollMatrixHref: "/admin/organisasjon/roller",
    inviteHref: "/admin/organisasjon/inviter",
    members: [
      {
        id: "tm-ek",
        initials: "EK",
        avatarTone: "primary",
        presence: "off",
        name: "Espen Kjølberg",
        email: "leder@gfgkjunior.no",
        role: { label: "Admin", kind: "admin" },
        scopes: ["coach.*", "admin.team", "admin.billing"],
        scopeNote: "Full tilgang · alle grupper",
        seen: "—",
        href: "/admin/organisasjon/team/ek",
      },
      {
        id: "tm-tp",
        initials: "TP",
        avatarTone: "primary",
        presence: "off",
        name: "Template Placeholder",
        email: "templates+placeholder@akgolf.no",
        role: { label: "Admin", kind: "admin" },
        scopes: ["coach.*", "admin.team", "admin.billing"],
        scopeNote: "Full tilgang · alle grupper",
        seen: "—",
        href: "/admin/organisasjon/team/tp",
      },
      {
        id: "tm-ak",
        initials: "AK",
        avatarTone: "lime",
        presence: "off",
        name: "Anders Kristiansen",
        email: "anders@akgolf.no",
        role: { label: "Instruktør", kind: "instruktor" },
        scopes: ["coach.bookings", "coach.players.read", "coach.plans.edit"],
        scopeNote: "2 grupper",
        seen: "—",
        href: "/admin/organisasjon/team/ak",
      },
      {
        id: "tm-mp",
        initials: "MP",
        avatarTone: "neutral",
        presence: "off",
        name: "Markus Røinås Pedersen",
        email: "markus@akgolf.no",
        role: { label: "Instruktør", kind: "instruktor" },
        scopes: ["coach.bookings", "coach.players.read", "coach.plans.edit"],
        scopeNote: "3 grupper",
        seen: "—",
        href: "/admin/organisasjon/team/mp",
      },
    ],
  },

  templates: {
    count: 11,
    summary: "11 maler · sortert på nivå",
    importHref: "/admin/plan-templates/import",
    newHref: "/admin/plan-templates/new",
    items: [
      {
        id: "pt-1",
        periode: { label: "GRUNN", kind: "grunn" },
        name: "Comeback-fra-skade",
        meta: "4 UKER · 3 ØKTER/UKE · KAT. H",
        dist: { fys: 45, tek: 25, slag: 25, spill: 5, turn: 0 },
        uses: 0,
        editedBy: "AK Golf",
        href: "/admin/plan-templates/comeback-fra-skade",
      },
      {
        id: "pt-2",
        periode: { label: "GRUNN", kind: "grunn" },
        shared: true,
        name: "L Grunnplan",
        meta: "4 UKER · 3 ØKTER/UKE · KAT. L",
        dist: { fys: 40, tek: 30, slag: 5, spill: 15, turn: 10 },
        uses: 0,
        editedBy: "AK Golf",
        href: "/admin/plan-templates/l-grunnplan",
      },
      {
        id: "pt-3",
        periode: { label: "SPES", kind: "spes" },
        shared: true,
        name: "OVERGANG-uke (mellomfase)",
        meta: "2 UKER · 4 ØKTER/UKE · KAT. H",
        dist: { fys: 20, tek: 25, slag: 30, spill: 15, turn: 10 },
        uses: 0,
        editedBy: "AK Golf",
        href: "/admin/plan-templates/overgang-uke",
      },
      {
        id: "pt-4",
        periode: { label: "GRUNN", kind: "grunn" },
        shared: true,
        name: "HVILE-uke (universal)",
        meta: "2 UKER · 2 ØKTER/UKE · KAT. H",
        dist: { fys: 60, tek: 10, slag: 20, spill: 10, turn: 0 },
        uses: 0,
        editedBy: "AK Golf",
        href: "/admin/plan-templates/hvile-uke",
      },
      {
        id: "pt-5",
        periode: { label: "TURN", kind: "turn" },
        shared: true,
        name: "L Turnerings-fase Nybegynner",
        meta: "4 UKER · 3 ØKTER/UKE · KAT. L",
        dist: { fys: 20, tek: 20, slag: 30, spill: 25, turn: 5 },
        uses: 0,
        editedBy: "AK Golf",
        href: "/admin/plan-templates/l-turnering-nybegynner",
      },
      {
        id: "pt-6",
        periode: { label: "SPES", kind: "spes" },
        shared: true,
        name: "L Spesialiserings-fase Nybegynner",
        meta: "4 UKER · 3 ØKTER/UKE · KAT. L",
        dist: { fys: 30, tek: 35, slag: 30, spill: 5, turn: 0 },
        uses: 0,
        editedBy: "AK Golf",
        href: "/admin/plan-templates/l-spes-nybegynner",
      },
      {
        id: "pt-7",
        periode: { label: "GRUNN", kind: "grunn" },
        shared: true,
        name: "L Grunn-fase Nybegynner",
        meta: "4 UKER · 3 ØKTER/UKE · KAT. L",
        dist: { fys: 40, tek: 30, slag: 25, spill: 5, turn: 0 },
        uses: 0,
        editedBy: "AK Golf",
        href: "/admin/plan-templates/l-grunn-nybegynner",
      },
      {
        id: "pt-8",
        periode: { label: "TURN", kind: "turn" },
        shared: true,
        name: "K Turnerings-fase Standard",
        meta: "4 UKER · 4 ØKTER/UKE · KAT. K",
        dist: { fys: 15, tek: 20, slag: 30, spill: 25, turn: 10 },
        uses: 0,
        editedBy: "AK Golf",
        href: "/admin/plan-templates/k-turnering-standard",
      },
      {
        id: "pt-9",
        periode: { label: "SPES", kind: "spes" },
        shared: true,
        name: "K Spesialiserings-fase Standard",
        meta: "6 UKER · 4 ØKTER/UKE · KAT. K",
        dist: { fys: 20, tek: 30, slag: 35, spill: 10, turn: 5 },
        uses: 0,
        editedBy: "AK Golf",
        href: "/admin/plan-templates/k-spes-standard",
      },
      {
        id: "pt-10",
        periode: { label: "GRUNN", kind: "grunn" },
        shared: true,
        name: "K Grunn-fase Standard",
        meta: "6 UKER · 4 ØKTER/UKE · KAT. K",
        dist: { fys: 45, tek: 25, slag: 20, spill: 5, turn: 5 },
        uses: 0,
        editedBy: "AK Golf",
        href: "/admin/plan-templates/k-grunn-standard",
      },
      {
        id: "pt-11",
        periode: { label: "TEST", kind: "test" },
        name: "Test-uke (baseline)",
        meta: "1 UKE · 5 ØKTER/UKE · ALLE NIVÅ",
        dist: { fys: 25, tek: 25, slag: 20, spill: 20, turn: 10 },
        uses: 0,
        editedBy: "AK Golf",
        href: "/admin/plan-templates/test-uke",
      },
    ],
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
  { href: "/admin/planlegge", label: "Planlegge", Icon: CalendarRange },
  { href: "/admin/gjennomfore", label: "Gjennomføre", Icon: Play },
  { href: "/admin/analysere", label: "Innsikt", Icon: BarChart3 },
  { href: "/admin/organisasjon", label: "Admin", Icon: Settings, active: true },
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

export default function AgencyOsDriftPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-coach-content)] px-4 py-5 sm:px-8 sm:py-6 lg:bg-background">
        <Drift data={demoDrift} />
      </main>
    </div>
  );
}
