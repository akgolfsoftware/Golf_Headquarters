/**
 * AgencyOS — Mer (/admin/mer). Net-new mobil-flate (Fase 4).
 *
 * Inngangen er «Mer»-fanen i mobil-bunnbaren (< md). Mørk lenkeliste
 * gruppert som desktop-sidebaren (Daglig / Stall & talent / Operasjon /
 * System) med ikon + chevron per rad (44px+ touch-mål via AgMobileRow).
 *
 * Workbench-raden er LETT-versjonens inngang — lenker til
 * /admin/coach-workbench (stub-href) inntil M2 (lett-Workbench) bygges.
 * Server component — ingen client-state.
 */

import {
  BarChart3,
  Briefcase,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Dumbbell,
  FileBarChart,
  GitCompareArrows,
  Globe,
  LayoutTemplate,
  Library,
  ListTodo,
  MapPin,
  Radar,
  Settings,
  Trophy,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  AgMobileRow,
  AgPage,
  AgPageHead,
  AgSectionHead,
} from "@/components/admin/agencyos/ui";

export const dynamic = "force-dynamic";

type MerRad = { href: string; label: string; sub?: string; icon: LucideIcon };
type MerSeksjon = { label: string; rader: MerRad[] };

// Speiler desktop-sidebarens grupper (agencyos-sidebar.tsx buildNav).
const SEKSJONER: MerSeksjon[] = [
  {
    label: "Min uke",
    rader: [
      { href: "/admin/workspace/oppgaver", label: "Oppgaver", icon: ListTodo },
      { href: "/admin/workspace/tildelt-meg", label: "Tildelt meg", icon: ClipboardCheck },
    ],
  },
  {
    label: "Stall & talent",
    rader: [
      { href: "/admin/grupper", label: "Grupper", icon: UsersRound },
      { href: "/admin/talent/radar", label: "Talent-radar", icon: Radar },
      { href: "/admin/talent/sammenligning", label: "Sammenligning", icon: GitCompareArrows },
      { href: "/admin/talent/wagr-import", label: "WAGR-import", icon: Globe },
    ],
  },
  {
    label: "Operasjon",
    rader: [
      {
        href: "/admin/coach-workbench",
        label: "Workbench",
        sub: "Planlegging — alle spillere",
        icon: LayoutTemplate,
      },
      { href: "/admin/plans", label: "Treningsplaner", icon: ClipboardList },
      { href: "/admin/plan-templates", label: "Plan-maler", icon: Library },
      { href: "/admin/drills", label: "Drill-bibliotek", icon: Dumbbell },
      { href: "/admin/tournaments", label: "Turneringer", icon: Trophy },
      { href: "/admin/bookinger", label: "Bookinger", icon: CalendarClock },
      { href: "/admin/anlegg", label: "Anlegg", icon: MapPin },
      { href: "/admin/availability", label: "Tilgjengelighet", icon: Clock },
      { href: "/admin/services", label: "Tjenester", icon: Briefcase },
    ],
  },
  {
    label: "Analysere",
    rader: [
      { href: "/admin/analyse", label: "Stall-analyse", icon: BarChart3 },
      { href: "/admin/lag-snitt", label: "Lag-snitt", icon: Users },
      { href: "/admin/tester", label: "Tester", icon: ClipboardCheck },
    ],
  },
  {
    label: "System",
    rader: [
      { href: "/admin/reports", label: "Rapporter", icon: FileBarChart },
      { href: "/admin/settings", label: "Admin", icon: Settings },
    ],
  },
];

export default async function MerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <AgPage className="max-w-[640px]">
      <AgPageHead
        eyebrow="AgencyOS"
        title="Mer"
        lead="Alt som ikke bor i bunnmenyen — samme grupper som sidemenyen på desktop."
      />

      {SEKSJONER.map((seksjon, i) => (
        <section key={seksjon.label}>
          <AgSectionHead className={i === 0 ? "mt-0" : undefined}>
            {seksjon.label}
          </AgSectionHead>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {seksjon.rader.map((rad) => {
              const Ikon = rad.icon;
              return (
                <AgMobileRow
                  key={rad.href}
                  href={rad.href}
                  title={rad.label}
                  sub={rad.sub}
                  leading={
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-secondary text-foreground/70">
                      <Ikon className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
                    </span>
                  }
                />
              );
            })}
          </div>
        </section>
      ))}
    </AgPage>
  );
}
