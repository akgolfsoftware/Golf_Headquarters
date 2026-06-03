/**
 * Preview-rute (offentlig, ingen auth) for AgencyOS · Tester på tvers.
 * Rendrer <TesterOversikt> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/ag-tester.png +
 *  public/design-handover/agencyos/components-agency-tests.html):
 *   - 25 spillere · 6 tester · spillere × tester ytelse-matrise
 *   - Kun Anders Kristiansen er målt (6 målinger), resten "ingen målinger"
 *   - Mål ikke definert → ingen fargekoding, kun "målt" / "ikke testet"
 *   - 144 mangler · TILDEL-knapp per rad (rød badge = antall manglende tester)
 *
 * Desktop (≥1024px): venstre forest AgencyOS-sidebar (COACHHQ · HEAD COACH) +
 *   sentrert innhold på cream-bg — primær-fasit (matrisen breddes ut).
 * Mobil (≤640px): sidebar skjult, matrisen scroller horisontalt, snitt/trend
 *   stables.
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
  TesterOversikt,
  type Cell,
  type PlayerRow,
  type TesterOversiktData,
} from "@/components/admin/tester/tester-oversikt";

// ── Hjelpere for demo-data ───────────────────────────────────────────────

const TILDEL_HREF = "/admin/tester/tildel";

/** Seks "ikke testet"-celler — brukt for alle umålte spillere. */
const untestedRow: Cell[] = Array.from({ length: 6 }, () => ({
  state: "untested" as const,
  value: "—",
  when: "IKKE TESTET",
}));

/** Initialer fra fullt navn (to bokstaver). */
function initials(name: string): string {
  const parts = name.split(" ");
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

// Spillere som har lime-avatar i fasiten.
const LIME = new Set([
  "Aksel Eilefsen",
  "Erik Rochette",
  "Henrik Olsen Smith",
  "Liam Simensen",
  "Neo Stenlund-Thomassen",
]);

/** Bygg en umålt spiller-rad (alle 6 tester mangler). */
function player(name: string, group?: PlayerRow["group"]): PlayerRow {
  return {
    id: name.toLowerCase().replace(/[^a-z]+/g, "-"),
    initials: initials(name),
    avatarTone: LIME.has(name) ? "lime" : "default",
    name,
    group,
    sub: "INGEN MÅLINGER",
    cells: untestedRow,
    missingCount: 6,
    assignHref: TILDEL_HREF,
  };
}

// ── Demo-data — matcher ag-tester.png ──────────────────────────────────────

const demoTester: TesterOversiktData = {
  eyebrow: "TESTER",
  title: "Spillere × tester — ytelse-matrise",
  meta: { players: 25, tests: 6, measured: 6, missing: 144 },

  filters: [
    { label: "Alle", count: 25, active: true },
    { label: "GFGK", count: 2, href: "/admin/tester?gruppe=gfgk" },
  ],

  legendNote: "Mål-fargekoding krever definerte mål — ikke satt ennå",
  showColorLegend: false,

  columns: [
    { id: "8ball-blocked", axis: "slag", name: "8-ball Blocked", unit: "VERDI · HØYERE BEDRE" },
    { id: "8ball-variation", axis: "slag", name: "8-ball Variation", unit: "POENG · HØYERE BEDRE" },
    { id: "driver-basic", axis: "slag", name: "Driver Basic", unit: "PEI · LAVERE BEDRE" },
    { id: "golfslag-bane", axis: "slag", name: "Golfslag Bane", unit: "STROKES GAINED · HØYERE BEDRE" },
    { id: "9-hull-lengde", axis: "spill", name: "9 hull lengde", unit: "VERDI · HØYERE BEDRE" },
    { id: "18-hull-inspill", axis: "turn", name: "18-hull Inspill", unit: "VERDI · LAVERE BEDRE" },
  ],

  rows: [
    // Eneste målte spiller — Anders. Verdier + relativ dato fra fasiten,
    // ingen delta (kun én måling → ingen trend), ingen fargekode (mål mangler).
    {
      id: "anders-kristiansen",
      initials: "AK",
      avatarTone: "primary",
      name: "Anders Kristiansen",
      group: { label: "GFGK", tone: "gfgk" },
      sub: "6 AV 6 TESTER · HCP 4,2",
      cells: [
        { state: "measured", value: "72,2", when: "42 D" },
        { state: "measured", value: "62,7", when: "56 D" },
        { state: "measured", value: "90,2", when: "84 D" },
        { state: "measured", value: "89,2", when: "98 D" },
        { state: "measured", value: "84,4", when: "70 D" },
        { state: "measured", value: "64,5", when: "28 D" },
      ],
      // Alle tester målt → outline-knapp uten badge.
      assignHref: TILDEL_HREF,
    },
    player("Aksel Eilefsen"),
    player("Aksel Lind"),
    player("Aksel Lind"),
    player("Alfred Johan Stene"),
    player("Erik Rochette"),
    player("Erlend Drabløs"),
    player("Filip Svendsen", { label: "GFGK", tone: "gfgk" }),
    player("Fredrik Kjølberg Hovland"),
    player("Fredrik Smith"),
    player("Henrik Olsen Smith"),
    player("Jakob Holm"),
    player("Jørgen Engh"),
    player("Kristoffer Buvarp"),
    player("Leander Jahr"),
    player("Liam Simensen"),
    player("Ludvig Andersen"),
    player("Mathias Sørby"),
    player("Max Risvåg"),
    player("Monika Undheim"),
    player("Neo Stenlund-Thomassen"),
    player("Robin Hansen"),
    player("Sebastian Henriksen"),
    player("Sonja Sofie Sinding"),
    player("Theo Otnes"),
  ],

  footerHint: "Klikk en celle for historikk · Klikk Tildel for å planlegge ny test",

  avg: [
    { name: "8-ball Blocked", value: "72,2" },
    { name: "8-ball Variation", value: "62,7", unit: "poeng" },
    { name: "Driver Basic", value: "90,2", unit: "PEI" },
    { name: "Golfslag Bane", value: "89,2", unit: "strokes gained" },
    { name: "9 hull lengde", value: "84,4" },
    { name: "18-hull Inspill", value: "64,5" },
  ],

  trends: [
    { label: "Bedring", count: "0 spillere", tone: "up" },
    { label: "Stagnasjon", count: "0 spillere", tone: "flat" },
    { label: "Tilbakegang", count: "0 spillere", tone: "down" },
  ],
  trendNote:
    "Ingen spillere har nok historikk til å vise trend ennå (krever minst 2 målinger på samme test).",

  exportHref: "/admin/tester/eksport",
  templateHref: "/admin/tester/maler",
  newTestHref: "/admin/tester/ny",
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
  { href: "/admin/analysere", label: "Innsikt", Icon: BarChart3, active: true },
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

export default function AgencyOsTesterPreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-coach-content)] px-4 py-5 sm:px-8 sm:py-6 lg:bg-background">
        <TesterOversikt data={demoTester} />
      </main>
    </div>
  );
}
