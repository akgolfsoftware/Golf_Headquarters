/**
 * Preview-rute (offentlig, ingen auth) for PlayerHQ "Varsler".
 * Rendrer <Varsler> med hardkodet demo-data som matcher fasiten
 * public/design-handover/_screens/pl-varsler.png — 3 uleste varsler gruppert
 * "I DAG" (2) og "I GÅR" (2), demo-bar synlig, "Vis eldre" nederst.
 *
 * Mobil (≤640px): ren innholds-kolonne, sidebar skjult — primær-fasit.
 * Desktop (≥1024px): venstre PlayerHQ-sidebar (ak-logo + PLAYERHQ · PRO +
 * Ny økt + 5-items nav) + sentrert innholds-kolonne på cream-bg.
 *
 * INGEN Prisma/DB/auth her — kun presentasjon. Skall gjenbrukt fra meg-preview.
 */

import Link from "next/link";
import {
  BarChart3,
  CalendarRange,
  LayoutDashboard,
  MessageSquare,
  Play,
  Plus,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import { Varsler, type VarslerData } from "@/components/portal/varsler/varsler";

// ── Demo-data — matcher pl-varsler.png (3 uleste, I DAG + I GÅR) ──
const demoVarsler: VarslerData = {
  ulestAntall: 3,
  demo: true,
  harEldre: true,
  eldreHref: "/portal/varsler",
  grupper: [
    {
      label: "I dag",
      items: [
        {
          id: "v1",
          icon: MessageSquare,
          tone: "melding",
          eyebrow: "Coach",
          title: "Coach-melding fra Anders",
          body: "Bra økt i går — fokuser på tempo i wedge-spillet de neste dagene.",
          time: "Nå",
          unread: true,
          href: "/portal/coach",
        },
        {
          id: "v2",
          icon: Zap,
          tone: "plan",
          eyebrow: "Plan-vakten",
          title: "Plan-justering godkjent",
          body: "Coach har justert ukens plan basert på TrackMan-dataene dine.",
          time: "Nå",
          unread: true,
          href: "/portal/planlegge",
        },
      ],
    },
    {
      label: "I går",
      items: [
        {
          id: "v3",
          icon: Target,
          tone: "drill",
          eyebrow: "Coach",
          title: "Ny drill tildelt: Pitch 50–100m",
          body: "Coach Anders har lagt til en ny drill i utfordringer-listen din.",
          time: "15 t siden",
          unread: true,
          href: "/portal/gjennomfore",
        },
        {
          id: "v4",
          icon: Trophy,
          tone: "milepael",
          eyebrow: "Milepæl",
          title: "Mål-fremdrift: 60% av HCP-mål",
          body: "Du er godt på vei — fortsett som du gjør.",
          time: "20 t siden",
          unread: false,
          href: "/portal/analysere",
        },
      ],
    },
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
        <SidebarBrand variant="player" role="PRO" />
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

export default function PlayerHqVarslerPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-player-content)] lg:bg-background">
        <Varsler data={demoVarsler} />
      </main>
    </div>
  );
}
