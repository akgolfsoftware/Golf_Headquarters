/**
 * Preview-rute (offentlig, ingen auth) for AgencyOS Spillere (Stallen).
 * Rendrer <SpillerListe> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/ag-stallen.png +
 *  public/design-handover/agencyos/components-agency-player-table.html).
 *
 * Desktop (≥1024px): venstre forest AgencyOS-sidebar (COACHHQ · HEAD COACH,
 *   nav: Oversikt/Stall[aktiv]/Planlegge/Gjennomføre/Innsikt/Admin) +
 *   bred spillertabell på cream-bg — primær-fasit.
 * Mobil (≤640px): sidebar skjult, spillerliste som stablede kort.
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
  SpillerListe,
  type SpillerListeData,
} from "@/components/admin/spillere/spiller-liste";

// ── Demo-data — matcher components-agency-player-table.html (10 spillere) ──
const demoSpillere: SpillerListeData = {
  eyebrow: "STALLEN",
  week: 23,
  bakPlan: 3,
  inaktive: 2,
  hoursDelta: "+18 t",
  rows: [
    {
      id: "markus-rp",
      initials: "MR",
      avatarTone: "pri",
      name: "Markus R.P.",
      sub: "SRIXON #2 · 12 DG",
      group: "WANG",
      coachInitials: "AK",
      coachName: "Andreas K.",
      tier: "konk",
      oktDone: 2,
      oktPlanned: 4,
      hours30: "14,5",
      sgSpark: [40, 38, 36, 33, 30, 26, 22, 18],
      sgValue: "−0,42",
      sgTone: "neg",
      adherence: [100, 100, 33, 67, 38],
      adherencePct: 68,
      status: "bak",
    },
    {
      id: "sofie-k",
      initials: "SK",
      avatarTone: "default",
      name: "Sofie K.",
      sub: "PLAN B · UTKAST",
      group: "GFGK",
      coachInitials: "MV",
      coachName: "Marte V.",
      tier: "mosj",
      oktDone: 3,
      oktPlanned: 3,
      hours30: "8,0",
      sgSpark: [22, 26, 30, 33, 36, 42, 46, 52],
      sgValue: "+0,18",
      sgTone: "pos",
      adherence: [70, 84, 68, 78, 50],
      adherencePct: 78,
      status: "veil",
    },
    {
      id: "karl-ludvig",
      initials: "KL",
      avatarTone: "lime",
      name: "Karl Ludvig",
      sub: "ELIT · 12 CR.",
      group: "AKA",
      coachInitials: "NT",
      coachName: "Nina T.",
      tier: "akad",
      oktDone: 6,
      oktPlanned: 5,
      hours30: "22,5",
      sgSpark: [30, 36, 42, 48, 44, 56, 64, 70],
      sgValue: "+0,64",
      sgTone: "pos",
      adherence: [90, 88, 84, 90, 76],
      adherencePct: 86,
      status: "aktiv",
    },
    {
      id: "emilie-b",
      initials: "EB",
      avatarTone: "default",
      name: "Emilie B.",
      sub: "TEST-UKE",
      group: "GFGK",
      coachInitials: "AK",
      coachName: "Andreas K.",
      tier: "konk",
      oktDone: 4,
      oktPlanned: 4,
      hours30: "17,0",
      sgSpark: [36, 36, 40, 44, 40, 48, 52, 56],
      sgValue: "+0,22",
      sgTone: "pos",
      adherence: [76, 88, 80, 72, 64],
      adherencePct: 76,
      status: "aktiv",
    },
    {
      id: "jonas-h",
      initials: "JH",
      avatarTone: "default",
      name: "Jonas H.",
      sub: "5 D INAKTIV",
      group: "GFGK",
      coachInitials: "MV",
      coachName: "Marte V.",
      tier: "konk",
      oktDone: 0,
      oktPlanned: 4,
      hours30: "3,0",
      sgSpark: [44, 42, 38, 36, 32, 28, 26, 22],
      sgValue: "−0,28",
      sgTone: "neg",
      adherence: [22, 18, 14, 10, 8],
      adherencePct: 14,
      status: "inaktiv",
    },
    {
      id: "nora-t",
      initials: "NT",
      avatarTone: "default",
      name: "Nora T.",
      sub: "JUNIOR · 16 år",
      group: "AKA",
      coachInitials: "NT",
      coachName: "Nina T.",
      tier: "konk",
      oktDone: 5,
      oktPlanned: 5,
      hours30: "19,5",
      sgSpark: [36, 42, 38, 48, 44, 52, 56, 60],
      sgValue: "+0,35",
      sgTone: "pos",
      adherence: [82, 80, 76, 84, 70],
      adherencePct: 78,
      status: "aktiv",
    },
    {
      id: "lars-erik-b",
      initials: "LB",
      avatarTone: "default",
      name: "Lars-Erik B.",
      sub: "SENIOR · 54 år",
      group: "WANG",
      coachInitials: "MV",
      coachName: "Marte V.",
      tier: "mosj",
      oktDone: 2,
      oktPlanned: 2,
      hours30: "6,5",
      sgSpark: [40, 40, 38, 40, 40, 38, 40, 40],
      sgValue: "±0,02",
      sgTone: "flat",
      adherence: [60, 72, 64, 80, 30],
      adherencePct: 62,
      status: "aktiv",
    },
    {
      id: "tobias-w",
      initials: "TW",
      avatarTone: "default",
      name: "Tobias W.",
      sub: "SKADE · KNE",
      group: "AKA",
      coachInitials: "AK",
      coachName: "Andreas K.",
      tier: "akad",
      oktDone: 1,
      oktPlanned: 3,
      hours30: "7,5",
      sgSpark: [42, 42, 40, 38, 36, 34, 32, 30],
      sgValue: "−0,12",
      sgTone: "neg",
      adherence: [38, 60, 50, 32, 20],
      adherencePct: 40,
      status: "bak",
    },
    {
      id: "maria-s",
      initials: "MS",
      avatarTone: "default",
      name: "Maria S.",
      sub: "NL · KVAL.",
      group: "WANG",
      coachInitials: "NT",
      coachName: "Nina T.",
      tier: "konk",
      oktDone: 4,
      oktPlanned: 4,
      hours30: "16,0",
      sgSpark: [36, 38, 36, 42, 44, 44, 48, 52],
      sgValue: "+0,14",
      sgTone: "pos",
      adherence: [74, 80, 78, 76, 68],
      adherencePct: 75,
      status: "aktiv",
    },
    {
      id: "aksel-r",
      initials: "AR",
      avatarTone: "default",
      name: "Aksel R.",
      sub: "U-18 · EM JUNIOR",
      group: "GFGK",
      coachInitials: "AK",
      coachName: "Andreas K.",
      tier: "konk",
      oktDone: 6,
      oktPlanned: 5,
      hours30: "21,0",
      sgSpark: [30, 33, 38, 44, 50, 52, 60, 64],
      sgValue: "+0,52",
      sgTone: "pos",
      adherence: [84, 86, 88, 80, 72],
      adherencePct: 82,
      status: "aktiv",
    },
  ],
};

// ── Desktop-sidebar (preview-statisk, matcher cockpit-preview-skallet) ──
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

export default function AgencyOsSpillerePreviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <PreviewSidebar />
      <main className="min-w-0 flex-1 bg-[var(--color-coach-content)] px-4 py-5 sm:px-8 sm:py-6 lg:bg-background">
        <SpillerListe data={demoSpillere} />
      </main>
    </div>
  );
}
