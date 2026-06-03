/**
 * Preview-rute (offentlig, ingen auth) for PlayerHQ Innstillinger.
 * Rendrer <Innstillinger> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/pl-innstillinger.png) — Mathias Sørby,
 * GRATIS, Profil-seksjon åpen, hjemmeklubb «Ikke satt», Varsler 2 av 4 på.
 *
 * Mobil (≤640px): ren innholds-kolonne, sidebar skjult — primær-fasit.
 * Desktop (≥1024px): venstre PlayerHQ-sidebar (ak-logo + PLAYERHQ · GRATIS +
 * Ny økt + 5-items nav) + sentrert innholds-kolonne på cream-bg. Skall gjenbrukt
 * fra hjem-preview.
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
  Innstillinger,
  type InnstillingerData,
} from "@/components/portal/meg/innstillinger";

// ── Demo-data — matcher pl-innstillinger.png (Mathias Sørby, GRATIS) ──
const demoInnstillinger: InnstillingerData = {
  tilbake: { label: "Profil", href: "/portal/meg" },
  profil: {
    initialer: "MS",
    fulltNavn: "Mathias Sørby",
    epost: "mathias-sorby+stub@akgolf.no",
    hjemmeklubb: "Ikke satt",
    redigerHref: "/portal/meg",
  },
  fasiliteterSub: "INGEN VALGT · ALLE DRILLS",
  fasiliteter: [
    { id: "range", navn: "Range maks-lengde", min: 50, max: 320, step: 5, value: 250, unit: "m" },
    { id: "innspill", navn: "Innspill-område", min: 20, max: 140, step: 5, value: 90, unit: "m" },
    { id: "green", navn: "Putting-green", min: 100, max: 1200, step: 50, value: 600, unit: "m²" },
  ],
  varsler: [
    { id: "okt", tittel: "Økt-påminnelser", sub: "24 T FØR HVER ØKT", on: true },
    { id: "uke", tittel: "Ukerapport", sub: "SØNDAG 18:00", on: true },
    { id: "coach", tittel: "Coach-meldinger", sub: "PUSH + E-POST", on: false },
    { id: "test", tittel: "Testuke-varsel", sub: "2 UKER FØR", on: false },
  ],
  personvern: [
    { id: "last-ned", label: "Last ned mine data", retning: "intern", href: "/portal/meg/innstillinger" },
    { id: "erklaering", label: "Personvernerklæring", retning: "ekstern", href: "/akgolf-personvern" },
    { id: "slett", label: "Slett konto", retning: "intern", danger: true, href: "/portal/meg/innstillinger" },
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

export default function PlayerHqInnstillingerPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-player-content)] py-5 lg:bg-background lg:py-8">
        <Innstillinger data={demoInnstillinger} />
      </main>
    </div>
  );
}
