// Vinn-tilbake-tilbudssiden (plan A4): «Behold PlayerHQ etter coaching».
// Vises som exit-skjerm etter coaching-oppsigelse og som mål for
// tilbuds-e-posten. Uten aktivt tilbud → tilbake til abonnementssiden.
//
// Design: ingen Paper-fasit for denne skjermen ennå — bygget etter
// docs/port/monsterdokument-paper.md-mønsteret (samme byggeklosser som
// oppgrader-flyten). Merkes for fasit-runde.

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { MegFortsettV2 } from "@/components/portal/v2/MegFortsettV2";

export const dynamic = "force-dynamic";

export default async function FortsettPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });

  const tilbud = await prisma.winbackTilbud.findFirst({
    where: { userId: user.id, status: "TILBUDT" },
    orderBy: { createdAt: "desc" },
    select: { id: true, utlopsDato: true },
  });
  if (!tilbud) redirect("/portal/meg/abonnement");

  const utlopsDato = tilbud.utlopsDato
    ? tilbud.utlopsDato.toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Oslo",
      })
    : null;

  return <MegFortsettV2 tilbudId={tilbud.id} utlopsDato={utlopsDato} />;
}
