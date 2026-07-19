/**
 * v2-preview: AgencyOS Workspace (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell leverer
 * all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/workspace-flaten: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme loadere (getTasksForUser +
 * getProjectsForUser mot OppgaveCache/ProsjektCache — Notion-sync). Mapper til
 * AdminWorkspaceV2Data (ærlige tomrom, ingen fabrikerte tall).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getTasksForUser, getProjectsForUser } from "@/lib/notion/queries";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminWorkspaceV2,
  type AdminWorkspaceV2Data,
  type AdminWorkspaceV2Task,
  type AdminWorkspaceV2Project,
  type WorkspacePrio,
} from "@/components/admin/v2/AdminWorkspaceV2";
import type { CompanyKind } from "@/components/workspace/primitives";
import { TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Workspace · AgencyOS (v2)" };

const SELSKAP_LABEL: Record<CompanyKind, string> = {
  AK: "AK Golf",
  MULLIGAN: "Mulligan",
  WANG: "WANG Topp",
  SKARP: "Skarpnord",
  PRIVAT: "Privat",
};

/** primitives.PrioKind ("HOY") er allerede v2-kompatibel — samme union. */
function prio(p: string): WorkspacePrio {
  if (p === "BRENNER" || p === "HOY" || p === "MED" || p === "LAV") return p;
  return "MED";
}

export default async function V2AdminWorkspacePage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const [tasks, projects] = await Promise.all([
    getTasksForUser(user.id),
    getProjectsForUser(),
  ]);

  const oppgaver: AdminWorkspaceV2Task[] = tasks.map((t) => ({
    id: t.id,
    tittel: t.title,
    selskap: t.project.name ?? SELSKAP_LABEL[t.project.company],
    prio: prio(t.prio),
    due: t.due,
    today: Boolean(t.today),
    done: t.done,
    status: t.status,
    brenner: Boolean(t.brenner),
    assigned: t.assigned,
  }));

  const prosjekter: AdminWorkspaceV2Project[] = projects.map((p) => ({
    id: p.id,
    tittel: p.title,
    selskap: SELSKAP_LABEL[p.company],
    desc: p.desc,
    open: p.open,
    doing: p.doing,
    done: p.done,
    total: p.total,
    pct: p.pct,
    status: p.status,
    due: p.due,
    assigned: p.assigned,
  }));

  const data: AdminWorkspaceV2Data = {
    coachNavn: user.name ?? "Coach",
    oppgaver,
    prosjekter,
  };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/agencyos">Cockpit</TilbakeLenke>
      <AdminWorkspaceV2 data={data} />
    </V2Shell>
  );
}
