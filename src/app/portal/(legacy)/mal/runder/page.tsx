/**
 * PlayerHQ · Mål · Runder (/portal/mal/runder) — v10-design.
 *
 * Rendrer <RundeListeSide> (v10-fasit fra pl-runder) med EKTE data fra
 * getRunderListModel (Prisma). Tom-tilstand (0 runder) vises av komponenten selv
 * når runder=[] — aldri liksom-tall.
 *
 * Server component. Auth-guard via requirePortalUser. PortalShell (layout) eier
 * sidebar/topbar/bunn-nav — denne siden rendrer kun innholdet.
 *
 * Byttet fra eldre PageHeader/EmptyState/RundeQueueList til v10 RundeListeSide.
 * mapRunderData oversetter RunderListModel → RunderData. Tom-tilstander bevares.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getRunderListModel } from "@/lib/portal-runder/runder-list-data";
import {
  RundeListeSide,
  type RunderData,
} from "@/components/portal/runder/runde-liste";

export const dynamic = "force-dynamic";

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Oversetter ekte RunderListModel → v10 RunderData. Tom-tilstand bevares (runder=[]). */
function mapRunderData(
  model: Awaited<ReturnType<typeof getRunderListModel>>,
  fornavn: string,
  hcp: number | null,
): RunderData {
  const total = model.kpis.total;
  return {
    eyebrow: "PLAYERHQ · RUNDER",
    fornavn,
    hcp,
    subtittel:
      total === 0
        ? "Ingen registrerte runder ennå. Logg din første runde for å se trender."
        : `Siste ${total} runder · sortert etter dato`,
    runder: model.rows.map((r) => ({
      id: r.id,
      bane: r.courseName,
      dato: formatDato(r.playedAt),
      par: r.par,
      score: r.score,
      tilPar: r.vsPar,
      sgTotal: r.sgTotal,
      beste: r.isBest,
    })),
    hrefs: {
      ny: "/portal/mal/runder/ny",
      importGolfBox: "/portal/mal/runder/ny",
      detalj: (id) => `/portal/mal/runder/${id}`,
    },
  };
}

export default async function RunderPage() {
  const user = await requirePortalUser();
  const model = await getRunderListModel(user.id);
  const fornavn = user.name ? user.name.split(" ")[0] : "";

  return <RundeListeSide data={mapRunderData(model, fornavn, user.hcp)} />;
}
