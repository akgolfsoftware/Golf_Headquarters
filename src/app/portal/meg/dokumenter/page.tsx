/**
 * PH24Dokumenter — Meg · Dokumenter i PlayerHQSkall (Precision Athletics).
 * Viser avtaler, samtykker, kvitteringer og veiledninger.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { MegDokumenterV2, type MegDokumenterData } from "@/components/portal/v2/MegDokumenterV2";

export const dynamic = "force-dynamic";

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function PH24DokumenterPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });

  const [documents, ulest] = await Promise.all([
    prisma.document.findMany({
      where: { OR: [{ userId: null }, { userId: user.id }] },
      orderBy: { createdAt: "desc" },
    }),
    getUnreadNotifications(user.id, 1),
  ]);

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
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side ph24d">
        <header>
          <p className="ph24d-kicker">PlayerHQ · Meg</p>
          <h1>Dokumenter</h1>
          <p>Avtaler, samtykker, lisenser og kvitteringer tilknyttet din spillerprofil.</p>
        </header>
        <section className="pa-card ph24d-kort">
          <MegDokumenterV2 data={data} />
        </section>
      </div>
    </PlayerHQSkall>
  );
}
