// PH-25 Behold PlayerHQ — Precision Athletics, pakke 14 (utkast meg-resten.html, 16.10.2026).
// Vinn-tilbake-tilbudssiden (plan A4): vises som exit-skjerm etter coaching-oppsigelse og som mål
// for tilbuds-e-posten. Uten aktivt tilbud → tilbake til abonnementssiden.

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { etterlevelseFra } from "@/lib/domain/etterlevelse";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25BeholdPlayerHQ } from "@/components/portal/precision/PH25BeholdPlayerHQ";

export const dynamic = "force-dynamic";
export const metadata = { title: "Behold PlayerHQ · PlayerHQ" };

const DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "long" });
const DAG = 24 * 60 * 60 * 1000;

export default async function FortsettPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });

  const tilbud = await prisma.winbackTilbud.findFirst({
    where: { userId: user.id, status: "TILBUDT" },
    orderBy: { createdAt: "desc" },
    select: { id: true, utlopsDato: true },
  });
  if (!tilbud) redirect("/portal/meg/abonnement");

  const naa = new Date();
  const [gjennomfort, okter, runder, tester, malsetninger, uleste] = await Promise.all([
    prisma.workbenchSession.aggregate({
      where: { playerId: user.id, status: "COMPLETED", isTemplate: false, date: { gte: etterlevelseFra(naa), lte: naa } },
      _sum: { durationMinutes: true },
    }),
    prisma.workbenchSession.count({ where: { playerId: user.id, isTemplate: false } }),
    prisma.round.count({ where: { userId: user.id } }),
    prisma.testResult.count({ where: { userId: user.id } }),
    prisma.goal.count({ where: { userId: user.id, status: "ACTIVE" } }),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH25BeholdPlayerHQ data={{
        tilbudId: tilbud.id,
        slutt: tilbud.utlopsDato ? DATO.format(tilbud.utlopsDato) : null,
        fraDato: tilbud.utlopsDato ? DATO.format(new Date(tilbud.utlopsDato.getTime() + DAG)) : null,
        minutter: gjennomfort._sum.durationMinutes ?? 0,
        okter, runder, tester, malsetninger,
      }} />
    </PlayerHQSkall>
  );
}
