/**
 * Preview-rute (offentlig, ingen auth) for AgencyOS «Sammenlign flere spillere».
 * Rendrer <TalentSammenligning> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/ag-compare.png — ekte tom-tilstand med 3
 *  valgte spillere uten registrert SG + 25-spillers kohort + region-fordeling).
 *
 * Desktop (≥1024px): venstre forest AgencyOS-sidebar (COACHHQ · HEAD COACH,
 *   nav: Oversikt/Stall[aktiv]/Planlegge/Gjennomføre/Innsikt/Admin) +
 *   bred sammenlignings-flate på cream-bg — primær-fasit.
 * Mobil (≤640px): sidebar skjult, panelene stables.
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
import {
  TalentSammenligning,
  type CompareData,
} from "@/components/admin/talent/sammenligning";

// ── Demo-data — matcher ag-compare.png (tom-tilstand, 3 valgte spillere) ──
const demoCompare: CompareData = {
  eyebrow: "TALENT · B10 SAMMENLIGNING",
  title: { lead: "Side om side", rest: " · 3 spillere" },
  helper:
    "Tre nivåer: 2–4 spillere parallelt, hele stallen rangert på SG, og geografisk fordeling. Referanse er PGA Tour-baseline.",
  backHref: "/admin/talent",

  sideBySide: {
    heading: { lead: "Talent-kohort", rest: " · konkurranseprofiler" },
    sub: "3 spillere i sammenligning · SG fra siste registrerte periode · referanse PGA Tour-baseline",
    editHref: "/admin/talent/sammenligning",
    players: [
      {
        id: "mathias",
        initials: "MS",
        name: "Mathias Sørby",
        meta: "— · —",
        sub: "HCP —",
        avatarTone: "pri",
        href: "/admin/spillere/mathias",
      },
      {
        id: "jorgen",
        initials: "JE",
        name: "Jørgen Engh",
        meta: "— · —",
        sub: "HCP —",
        avatarTone: "alt",
        href: "/admin/spillere/jorgen",
      },
      {
        id: "leander",
        initials: "LJ",
        name: "Leander Jahr",
        meta: "— · —",
        sub: "HCP —",
        avatarTone: "pri",
        href: "/admin/spillere/leander",
      },
    ],
    refTop: { label: "REFERANSE", value: "PGA Tour", valueSub: "BASELINE 0,0" },
    metrics: [
      {
        id: "sg-total",
        axisTone: "sg",
        name: "SG Total",
        sub: "per runde · vs Tour-baseline",
        refLabel: "TOUR-BASELINE",
        refValue: "0,00",
      },
      {
        id: "sg-ott",
        axisTone: "slag",
        name: "SG Off-the-tee",
        sub: "drive line + carry",
        refLabel: "TOUR-BASELINE",
        refValue: "0,00",
      },
      {
        id: "sg-app",
        axisTone: "tek",
        name: "SG Approach",
        sub: "innspill mot green",
        refLabel: "TOUR-BASELINE",
        refValue: "0,00",
      },
      {
        id: "sg-arg",
        axisTone: "spill",
        name: "SG Around-green",
        sub: "nærspill < 30 m",
        refLabel: "TOUR-BASELINE",
        refValue: "0,00",
      },
      {
        id: "sg-putt",
        axisTone: "spill",
        name: "SG Putt",
        sub: "alle putter · per runde",
        refLabel: "TOUR-BASELINE",
        refValue: "0,00",
      },
      {
        id: "siste-test",
        axisTone: "turn",
        name: "Siste test",
        sub: "nyeste resultat · score",
        refLabel: "VARIERER",
        refValue: "—",
      },
    ],
    frule:
      "Hver rad er én metrikk, kolonnene er spillerne. Referanse-kolonnen helt til høyre er PGA Tour-baseline (0,0). Verdier vises kun der spilleren har registrert SG i perioden.",
  },

  pyramid: {
    heading: { lead: "Pyramide", rest: "-fordeling" },
    sub: "ANDEL ØKTER PER AKSE · ALLE PLANER",
    emptyText: "Ingen treningsplaner registrert for de valgte spillerne.",
  },

  cohort: {
    count: 25,
    heading: { lead: "Hele stallen", rest: " · SG total" },
    sub: "25 SPILLERE I KOHORT · SNITT — · SORTERT HØYEST FØRST",
    rows: [
      { id: "c1", rank: 1, initials: "AE", name: "Aksel Eilefsen", sub: "HCP —", avatarTone: "pri" },
      { id: "c2", rank: 2, initials: "AL", name: "Aksel Lind", sub: "HCP —", avatarTone: "alt" },
      { id: "c3", rank: 3, initials: "AL", name: "Aksel Lind", sub: "HCP —", avatarTone: "pri" },
      { id: "c4", rank: 4, initials: "AS", name: "Alfred Johan Stene", sub: "HCP —", avatarTone: "alt" },
      {
        id: "c5",
        rank: 5,
        initials: "AK",
        name: "Anders Kristiansen",
        sub: "GAMLE FREDRIKSTAD GK · HCP 4,2",
        avatarTone: "pri",
      },
      { id: "c6", rank: 6, initials: "ER", name: "Erik Rochette", sub: "HCP —", avatarTone: "alt" },
      { id: "c7", rank: 7, initials: "ED", name: "Erlend Drabløs", sub: "HCP —", avatarTone: "pri" },
      {
        id: "c8",
        rank: 8,
        initials: "FS",
        name: "Filip Svendsen",
        sub: "GAMLE FREDRIKSTAD GOLFKLUBB · HCP —",
        avatarTone: "alt",
      },
      { id: "c9", rank: 9, initials: "FH", name: "Fredrik Kjølberg …", sub: "HCP —", avatarTone: "pri" },
      { id: "c10", rank: 10, initials: "FS", name: "Fredrik Smith", sub: "HCP —", avatarTone: "alt" },
      { id: "c11", rank: 11, initials: "HS", name: "Henrik Olsen Smith", sub: "HCP —", avatarTone: "pri" },
      { id: "c12", rank: 12, initials: "JH", name: "Jakob Holm", sub: "HCP —", avatarTone: "alt" },
      {
        id: "c13",
        rank: 13,
        initials: "JE",
        name: "Jørgen Engh",
        sub: "HCP —",
        avatarTone: "pri",
        tagged: true,
        href: "/admin/spillere/jorgen",
      },
      { id: "c14", rank: 14, initials: "KB", name: "Kristoffer Buvarp", sub: "HCP —", avatarTone: "alt" },
      {
        id: "c15",
        rank: 15,
        initials: "LJ",
        name: "Leander Jahr",
        sub: "HCP —",
        avatarTone: "pri",
        tagged: true,
        href: "/admin/spillere/leander",
      },
      { id: "c16", rank: 16, initials: "LS", name: "Liam Simensen", sub: "HCP —", avatarTone: "alt" },
      { id: "c17", rank: 17, initials: "LA", name: "Ludvig Andersen", sub: "HCP —", avatarTone: "pri" },
      {
        id: "c18",
        rank: 18,
        initials: "MS",
        name: "Mathias Sørby",
        sub: "HCP —",
        avatarTone: "alt",
        tagged: true,
        href: "/admin/spillere/mathias",
      },
      { id: "c19", rank: 19, initials: "MR", name: "Max Risvåg", sub: "HCP —", avatarTone: "pri" },
      { id: "c20", rank: 20, initials: "MU", name: "Monika Undheim", sub: "HCP —", avatarTone: "alt" },
      { id: "c21", rank: 21, initials: "NS", name: "Neo Stenlund-Th…", sub: "HCP —", avatarTone: "pri" },
      { id: "c22", rank: 22, initials: "RH", name: "Robin Hansen", sub: "HCP —", avatarTone: "alt" },
      { id: "c23", rank: 23, initials: "SH", name: "Sebastian Henrik…", sub: "HCP —", avatarTone: "pri" },
      { id: "c24", rank: 24, initials: "SS", name: "Sonja Sofie Sindi…", sub: "HCP —", avatarTone: "alt" },
      { id: "c25", rank: 25, initials: "TO", name: "Theo Otnes", sub: "HCP —", avatarTone: "pri" },
    ],
    frule:
      "Én metrikk, hele kohorten på én skjerm. Søylene er tegnet mot skalaen −2,0 → +2,0 med den svarte senterlinjen som nullpunkt (Tour-baseline) — søylen henger til høyre hvis positiv, venstre hvis negativ. Lime-merkede rader er med i side-om-side over. Spillere uten registrert SG vises nederst uten søyle.",
  },

  region: {
    count: 3,
    heading: { lead: "Spiller", rest: "-geografi" },
    sub: "VÅR STALL · 25 spillere · 3 REGIONER",
    bars: [
      { id: "r1", name: "Uten region", count: 23, pct: 92 },
      { id: "r2", name: "Gamle Fredrikstad GK", count: 1, pct: 4 },
      { id: "r3", name: "Gamle Fredrikstad …", count: 1, pct: 4 },
    ],
    frule:
      "Fordelingen viser hvor i landet stallen er — basert på registrert region (talent-program) eller hjemmeklubb. Spillere uten region samles under «Uten region». Geografi er kontekst, ikke uttaks-grunnlag.",
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
  { href: "/admin/stall", label: "Stall", Icon: Users, active: true },
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

export default function AgencyOsComparePreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-coach-content)] px-4 py-5 sm:px-8 sm:py-6 lg:bg-background">
        <TalentSammenligning data={demoCompare} />
      </main>
    </div>
  );
}
