/**
 * Preview-rute (offentlig, ingen auth) for AgencyOS Innboks.
 * Rendrer <InnboksListe> med hardkodet demo-data i AgencyOS desktop-skall
 * (venstre forest-sidebar COACHHQ · HEAD COACH + cream content).
 *
 * Rad-mønster portet fra v10-fasit:
 *   public/design-handover/agencyos/components-agency-dashboard.html (kol. 2)
 * Side-header (tittel + status-pill) speiler:
 *   public/design-handover/_screens/ag-innboks.png
 *
 * Desktop (≥1024px): sidebar + sentrert innboks-liste på cream-bg.
 * Mobil (≤640px): sidebar skjult, rader som fullbredde stablede kort,
 *   filter-tabs scrollbar på topp.
 *
 * INGEN Prisma/DB/auth — kun presentasjon.
 */

import Link from "next/link";
import {
  BarChart3,
  CalendarRange,
  Eye,
  LayoutDashboard,
  MessageSquare,
  Play,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import {
  InnboksListe,
  type InnboksData,
} from "@/components/admin/innboks/innboks-liste";

// ── Demo-data — varierte typer (melding / faktura forfalt / forespørsel /
//    godkjenning / råd / bekreftelse). Initialer som uniform sand-avatar. ──
const demoInnboks: InnboksData = {
  items: [
    {
      id: "ib-1",
      initials: "MB",
      sender: "Markus Berg",
      type: "godkjenn",
      typeLabel: "GODKJENN",
      preview: "Foreslår å bytte fre-økt til lørdag før Srixon Tour #2",
      when: "07:42",
      unread: true,
      href: "/admin/innboks/ib-1",
    },
    {
      id: "ib-2",
      initials: "SK",
      sender: "Sofie Kvam",
      type: "forespørsel",
      typeLabel: "FORESPØRSEL",
      preview: "Kan jeg booke ekstra TrackMan-time tirsdag?",
      when: "06:18",
      unread: true,
      href: "/admin/foresporsler",
    },
    {
      id: "ib-3",
      initials: "FB",
      sender: "Fakturahub",
      type: "forfalt",
      typeLabel: "FORFALT",
      preview: "Faktura #2041 — Coaching Pro mai · 3 200 kr · 4 dager på overtid",
      when: "08:05",
      unread: true,
      href: "/admin/finance",
    },
    {
      id: "ib-4",
      initials: "KL",
      sender: "Karl Ludvig",
      type: "melding",
      typeLabel: "MELDING",
      preview: "Sender video fra runden i går — ser noe på driveren",
      when: "i går 21:14",
      unread: true,
      href: "/admin/innboks/ib-4",
    },
    {
      id: "ib-5",
      initials: "NB",
      sender: "Booking",
      type: "bekreftet",
      typeLabel: "BEKREFTET",
      preview: "Ny booking bekreftet — Flex 20 min · 4. juni 14:00",
      when: "i går 19:30",
      unread: false,
      href: "/admin/innboks/ib-5",
    },
    {
      id: "ib-6",
      initials: "EB",
      sender: "Emilie Berg",
      type: "melding",
      typeLabel: "MELDING",
      preview: "Takk for økten — føles bra med ny grep",
      when: "i går 18:02",
      unread: false,
      href: "/admin/innboks/ib-6",
    },
    {
      id: "ib-7",
      initials: "JH",
      sender: "Jonas Holt",
      type: "råd",
      typeLabel: "RÅD",
      preview: "Wedge-bytte før neste turnering — får ikke til vinkelen",
      when: "i går 15:55",
      unread: false,
      href: "/admin/innboks/ib-7",
    },
    {
      id: "ib-8",
      initials: "FR",
      sender: "Foresatt — Pedersen",
      type: "svar",
      typeLabel: "SVAR",
      preview: "Lurer på fakturaplan for høstsemesteret — kan vi ta en prat?",
      when: "i går 14:10",
      unread: false,
      href: "/admin/innboks/ib-8",
    },
    {
      id: "ib-9",
      initials: "SY",
      sender: "Stiftelsen Ynglinge",
      type: "melding",
      typeLabel: "MELDING",
      preview: "Bekreftelse på reise-stipend Q3 — vedlegg i tråden",
      when: "i går 12:30",
      unread: false,
      href: "/admin/innboks/ib-9",
    },
    {
      id: "ib-10",
      initials: "FB",
      sender: "Fakturahub",
      type: "behandle",
      typeLabel: "BEHANDLE",
      preview: "Ny faktura klar til godkjenning — Mulligan studio-leie juni",
      when: "2. jun",
      unread: false,
      href: "/admin/finance",
    },
    {
      id: "ib-11",
      initials: "LA",
      sender: "Lars Aune",
      type: "forespørsel",
      typeLabel: "FORESPØRSEL",
      preview: "Ønsker oppstart på Pro-pakke fra august — ledig kapasitet?",
      when: "2. jun",
      unread: false,
      href: "/admin/foresporsler",
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
  { href: "/admin/planlegge", label: "Planlegge", Icon: CalendarRange },
  { href: "/admin/gjennomfore", label: "Gjennomføre", Icon: Play },
  { href: "/admin/innboks", label: "Innboks", Icon: MessageSquare, active: true },
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

export default function AgencyOsInnboksPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-coach-content)] px-4 py-5 sm:px-8 sm:py-6 lg:bg-background">
        <InnboksListe data={demoInnboks} />
      </main>
    </div>
  );
}
