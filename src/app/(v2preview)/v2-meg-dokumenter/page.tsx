/**
 * v2-forhåndsvisning — PlayerHQ Meg · Dokumenter (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell
 * leverer chrome-en (IkonRail/BunnNav), MegDokumenterV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbruker den ekte /portal/meg/dokumenter-siden:
 * requirePortalUser + samme Document-query (globale + egne). Datoen formateres
 * server-side (nb-NO) for konsistent tidssone.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MegDokumenterV2, type MegDokumenterData } from "@/components/portal/v2/MegDokumenterV2";

export const dynamic = "force-dynamic";

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function V2MegDokumenterPreviewPage() {
  const user = await requirePortalUser();

  const documents = await prisma.document.findMany({
    where: { OR: [{ userId: null }, { userId: user.id }] },
    orderBy: { createdAt: "desc" },
  });

  const data: MegDokumenterData = {
    dokumenter: documents.map((d) => ({
      id: d.id,
      title: d.title,
      url: d.url,
      kind: d.kind,
      dato: formatDato(d.createdAt),
    })),
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <MegDokumenterV2 data={data} />
    </V2Shell>
  );
}
