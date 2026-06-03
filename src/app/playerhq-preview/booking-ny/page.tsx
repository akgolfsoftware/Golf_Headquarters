/**
 * Preview-rute (offentlig, ingen auth) for PlayerHQ Ny booking-wizard.
 * Rendrer <BookingNy> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/pl-booking-ny.png) — free-konto med gate,
 * saldo 3/4, tjeneste «Flex 20 min — Anders» valgt, mandag 1. juni valgt.
 *
 * Mobil (≤640px): ren innholds-kolonne, sidebar skjult — primær-fasit.
 * Desktop (≥1024px): venstre PlayerHQ-sidebar (ak-logo + PLAYERHQ · GRATIS +
 * Ny økt + 5-items nav) + sentrert innholds-kolonne på cream-bg.
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
import { BookingNy, type BookingNyData } from "@/components/portal/booking/booking-ny";

// ── Demo-data — matcher pl-booking-ny.png (free-konto, gate aktiv) ──
const demoBooking: BookingNyData = {
  eyebrow: "PLAYERHQ · BOOK NY TIME",
  heroFor: "Bruk",
  heroItalic: "månedens",
  heroEtter: "timer",
  intro: "3 av 4 timer igjen denne måneden. Velg tjeneste og tid på ett sted.",
  steg: ["Tjeneste", "Tid", "Bekreft"],
  aktivtSteg: 1,
  gate: {
    tittel: "Booking krever Pro",
    body: "Free-konto: oppgrader til Pro eller et aktivt coaching-abonnement for å bruke forhåndsbetalte timer.",
    cta: { label: "Oppgrader til Pro", href: "/portal/innstillinger/abonnement" },
  },
  saldo: {
    label: "Min saldo",
    igjen: 3,
    total: 4,
    suffiks: "igjen",
  },
  tjenesteTittel: "Velg tjeneste",
  tjenester: [
    {
      id: "flex20-anders",
      navn: "Flex 20 min — Anders",
      varighet: "20 MIN",
      beskrivelse:
        "2 coaching-økter à 20 min per måned med Anders. Trackman + analyse + plan.",
      pris: "1300 kr",
    },
    {
      id: "flex50-markus",
      navn: "Flex 50 min — Markus",
      varighet: "50 MIN",
      beskrivelse: "Standard drop-in-økt med Markus. Tek eller spill.",
      pris: "800 kr",
    },
    {
      id: "flex50-anders",
      navn: "Flex 50 min — Anders",
      varighet: "50 MIN",
      beskrivelse: "Standard coaching-økt med Anders. Tek, taktikk eller mental.",
      pris: "1500 kr",
    },
    {
      id: "gruppe",
      navn: "Gruppe-økt",
      varighet: "60 MIN",
      beskrivelse: "Inntil 6 spillere. Egnet for nivåtilpasset trening.",
      pris: "390 kr",
    },
    {
      id: "perfpro-anders",
      navn: "Performance Pro — Anders",
      varighet: "80 MIN",
      beskrivelse:
        "4 coaching-økter à 20 min per måned med Anders. Trackman + video + dispersjon + skriftlig plan.",
      pris: "2300 kr",
    },
    {
      id: "flex90-anders",
      navn: "Flex 90 min — Anders",
      varighet: "90 MIN",
      beskrivelse: "Utvidet coaching-økt med Anders. Dybde-analyse + praksis.",
      pris: "2500 kr",
    },
    {
      id: "wang",
      navn: "WANG-økt",
      varighet: "90 MIN",
      beskrivelse: "Intern økt for WANG Toppidrett-spillere. Tilknyttes Group, ikke booking.",
      pris: "1 credit",
    },
  ],
  valgtTjenesteId: "flex20-anders",
  tidTittel: "Velg tid",
  dagStripLabel: "Velg dag",
  dagStripHint: "Neste 14 dager",
  dager: [
    { id: "man-1", ukedag: "MA", dato: "1", maaned: "JUN" },
    { id: "tir-2", ukedag: "TI", dato: "2", maaned: "JUN" },
    { id: "ons-3", ukedag: "ON", dato: "3", maaned: "JUN" },
    { id: "tor-4", ukedag: "TO", dato: "4", maaned: "JUN" },
    { id: "fre-5", ukedag: "FR", dato: "5", maaned: "JUN" },
    { id: "lor-6", ukedag: "LØ", dato: "6", maaned: "JUN" },
  ],
  valgtDagId: "man-1",
  valgtDagTittel: "Mandag 1. juni",
  valgtDagCoach: "Anders Kristiansen",
  tider: [
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
  ],
  valgtTid: null,
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

export default function PlayerHqBookingNyPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-player-content)] lg:bg-background">
        <BookingNy data={demoBooking} />
      </main>
    </div>
  );
}
