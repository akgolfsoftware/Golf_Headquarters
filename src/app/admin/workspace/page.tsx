/**
 * v2-preview: AgencyOS Workspace (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell leverer
 * all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Oppgaver leses fra KommandoTask — vedtak Anders 13.08.2026 (nattrapport
 * spm. 1): KommandoTask er oppgavehjemmet, Notion-cachen (OppgaveCache) er
 * duplikat og vises ikke her lenger. Prosjekter leses fortsatt fra
 * ProsjektCache (Notion-sync) — prosjektvalget er ikke berørt av vedtaket.
 * Mapper til AdminWorkspaceV2Data (ærlige tomrom, ingen fabrikerte tall).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getProjectsForUser } from "@/lib/notion/queries";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminWorkspaceHubTrainLock,
  type AdminWorkspaceV2Data,
  type AdminWorkspaceV2Task,
  type AdminWorkspaceV2Project,
} from "@/components/admin/v2/workspace/AdminWorkspaceHubTrainLock";
import type { CompanyKind } from "@/components/workspace/primitives";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";

export const dynamic = "force-dynamic";
export const metadata = { title: "Workspace · AgencyOS (v2)" };

const SELSKAP_LABEL: Record<CompanyKind, string> = {
  AK: "AK Golf",
  MULLIGAN: "Mulligan",
  WANG: "WANG Topp",
  SKARP: "Skarpnord",
  PRIVAT: "Privat",
};

export default async function V2AdminWorkspacePage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const [tasks, projects] = await Promise.all([
    prisma.kommandoTask.findMany({
      where: { userId: user.id },
      orderBy: [{ status: "desc" }, { createdAt: "desc" }], // "open" før "done"
      take: 100,
    }),
    getProjectsForUser(),
  ]);

  const OSLO_DAG = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    day: "2-digit",
    month: "2-digit",
  });
  const idag = OSLO_DAG.format(new Date());

  const oppgaver: AdminWorkspaceV2Task[] = tasks.map((t) => {
    const due = t.dueAt ? OSLO_DAG.format(t.dueAt) : "";
    return {
      id: t.id,
      tittel: t.title,
      selskap: "Kommando",
      prio: t.priority === "haster" ? "HOY" : "MED",
      due,
      today: due !== "" && due === idag,
      done: t.status === "done",
      status: t.status === "done" ? "DONE" : "TODO",
      brenner: false,
      assigned: [],
    };
  });

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
    <V2Shell bredde="kolonne" aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TlTilbake href="/admin/agencyos">Cockpit</TlTilbake>
      <AdminWorkspaceHubTrainLock data={data} />
    </V2Shell>
  );
}
