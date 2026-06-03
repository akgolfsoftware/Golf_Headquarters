/**
 * Preview-rute (offentlig, ingen auth) for AgencyOS operations cockpit.
 * Rendrer <AgencyCockpit> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/ag-dashboard.png + components-agency-dashboard.html):
 *   - Anders (coach), tom timeline (0 økter), 1 uleste innboks-melding,
 *     3 aldri-aktive spillere (JE/LJ/ER), 4 business-KPIer.
 *
 * Desktop (≥1024px): venstre forest AgencyOS-sidebar (COACHHQ · HEAD COACH) +
 *   sentrert cockpit på cream-bg — primær-fasit, 3 kolonner side-om-side.
 * Mobil (≤640px): sidebar skjult, kolonnene stables, KPI 2-opp.
 *
 * INGEN Prisma/DB/auth her — kun presentasjon.
 */

import Link from "next/link";
import {
  Activity,
  BarChart3,
  CalendarRange,
  Clock,
  Eye,
  LayoutDashboard,
  MessageSquare,
  Phone,
  Play,
  Plus,
  Settings,
  User,
  Users,
  ZapOff,
} from "lucide-react";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import {
  AgencyCockpit,
  type CockpitData,
} from "@/components/admin/cockpit/agency-cockpit";

// Demo-spiller-id brukt for PROFIL → /admin/spillere/[id]-lenker.
const DEMO_PLAYER_ID = "demo-jorgen";

// ── Demo-data — matcher ag-dashboard.png (tom-tilstand, mandags-morgen) ──
const demoCockpit: CockpitData = {
  coachFirstName: "Anders",
  aiContext: "ingen økter i dag — rom for planlegging.",
  liveLabel: "MANDAG 1 JUNI · 07:35",
  timelineDateLabel: "MANDAG 1 JUNI · 0 ØKTER",
  now: 7 * 60 + 35, // 07:35

  // Tom timeline — fasit viser ingen økter i dag.
  timeline: [],

  // Innboks — én uleste melding (booking-bekreftelse).
  inboxCount: 1,
  inboxUnread: 1,
  inbox: [
    {
      id: "ib-1",
      initials: "NB",
      avatarTone: "default",
      title: "Ny booking bekreftet",
      type: "msg",
      typeLabel: "MELDING",
      preview: "Anders Kristiansen · Flex 20 min — Anders · 2. ju…",
      when: "00:52",
      unread: true,
      href: "/admin/innboks",
    },
  ],

  // Oppgaver — tomt (0 av 0 i dag).
  tasks: [],
  tasksDoneToday: 0,
  tasksTotalToday: 0,

  // Fokus — 3 aldri-aktive spillere (header viser 3, jf. fasit).
  focusCount: 3,
  focus: [
    {
      id: "fp-1",
      initials: "JE",
      avatarTone: "default",
      name: "Jørgen Engh",
      meta: "— · INAKTIV",
      signal: { label: "ALDRI AKTIV", tone: "warn", icon: ZapOff },
      reason: "Ingen registrert aktivitet ennå. Sjekk inn.",
      actions: [
        { label: "RING", icon: Phone, primary: true },
        { label: "MELDING", icon: MessageSquare, href: "/admin/innboks" },
        { label: "PROFIL", icon: User, href: `/admin/spillere/${DEMO_PLAYER_ID}` },
      ],
    },
    {
      id: "fp-2",
      initials: "LJ",
      avatarTone: "default",
      name: "Leander Jahr",
      meta: "— · INAKTIV",
      signal: { label: "ALDRI AKTIV", tone: "warn", icon: ZapOff },
      reason: "Ingen registrert aktivitet ennå. Sjekk inn.",
      actions: [
        { label: "RING", icon: Phone, primary: true },
        { label: "MELDING", icon: MessageSquare, href: "/admin/innboks" },
        { label: "PROFIL", icon: User, href: "/admin/spillere/demo-leander" },
      ],
    },
    {
      id: "fp-3",
      initials: "ER",
      avatarTone: "default",
      name: "Erik Rochette",
      meta: "— · INAKTIV",
      signal: { label: "ALDRI AKTIV", tone: "warn", icon: ZapOff },
      reason: "Ingen registrert aktivitet ennå. Sjekk inn.",
      actions: [
        { label: "RING", icon: Phone, primary: true },
        { label: "MELDING", icon: MessageSquare, href: "/admin/innboks" },
        { label: "PROFIL", icon: User, href: "/admin/spillere/demo-erik" },
      ],
    },
  ],

  // KPI-strip — 4 business-KPIer. Struktur/labels/chart-typer fra
  // components-agency-dashboard.html; verdier/deltaer fra ag-dashboard.png
  // (mandags-tom-tilstand). Ingen "Utestående"-kort → ingen finance-lenke.
  kpis: [
    {
      label: "AKTIVE SPILLERE",
      value: "42",
      icon: Users,
      delta: { text: "+25 denne mnd.", tone: "up" },
      spark: { type: "line", values: [17, 19, 22, 26, 31, 36, 42] },
    },
    {
      label: "ØKTER DENNE UKA",
      value: "28",
      icon: Clock,
      delta: { text: "ingen i dag", tone: "flat" },
      spark: { type: "bar", values: [5, 9, 22, 8, 6, 20, 4], barActive: 2 },
    },
    {
      label: "BOOKINGER · UKE 22",
      value: "12",
      icon: CalendarRange,
      delta: { text: "+1 vs forrige uke", tone: "up" },
      spark: { type: "line", values: [9, 12, 10, 14, 12, 16, 12] },
    },
    {
      label: "TRENINGSTIMER · STALLEN",
      value: "13",
      unit: "t",
      icon: Activity,
      delta: { text: "+8 t vs 30 d", tone: "up" },
      spark: { type: "line", values: [4, 6, 5, 8, 9, 11, 13] },
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
  { href: "/admin/agencyos", label: "Oversikt", Icon: LayoutDashboard, active: true },
  { href: "/admin/stall", label: "Stall", Icon: Users },
  { href: "/admin/planlegge", label: "Planlegge", Icon: CalendarRange },
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

export default function AgencyOsCockpitPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-coach-content)] px-4 py-5 sm:px-8 sm:py-6 lg:bg-background">
        <AgencyCockpit data={demoCockpit} />
      </main>
    </div>
  );
}
