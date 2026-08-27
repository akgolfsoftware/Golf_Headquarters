/**
 * AgencyOS Workspace · Prosjekter — Train-lock (T13-restside, 27.08.2026).
 *
 * Ekte data fra getProjectsForUser() (Notion-sync via ProsjektCache), bevart
 * 1:1 — faller tilbake til SAMPLE_PROJECTS kun i dev når ingen
 * Notion-tilkobling (arvet, uendret). Re-skinnet med
 * AdminWorkspaceProsjekterTrainLock (TL-tokens) i stedet for Paper-inline-JSX.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { SAMPLE_PEOPLE } from "@/components/workspace/sample-data";
import { getProjectsForUser } from "@/lib/notion/queries";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";
import {
  AdminWorkspaceProsjekterTrainLock,
  type WorkspaceProsjektKort,
} from "@/components/admin/v2/workspace/AdminWorkspaceProsjekterTrainLock";

export const dynamic = "force-dynamic";

export default async function WorkspaceProsjekterPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN"] });
  const sp = await searchParams;
  const filter = (["alle", "aktive", "pause", "arkiv"] as const).includes(sp.filter as never)
    ? (sp.filter as "alle" | "aktive" | "pause" | "arkiv")
    : "alle";

  const projects = await getProjectsForUser();

  const prosjekter: WorkspaceProsjektKort[] = projects.map((p) => ({
    id: p.id,
    tittel: p.title,
    beskrivelse: p.desc,
    selskap: p.company,
    synlighet: p.vis,
    status: p.status,
    open: p.open,
    doing: p.doing,
    done: p.done,
    total: p.total,
    pct: p.pct,
    due: p.due,
    tildeltNavn: p.assigned.map((k) => SAMPLE_PEOPLE[k]?.name ?? k),
  }));

  return (
    <V2Shell bredde="kolonne" aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TlTilbake href="/admin/workspace">Workspace</TlTilbake>
      <AdminWorkspaceProsjekterTrainLock prosjekter={prosjekter} filter={filter} />
    </V2Shell>
  );
}
