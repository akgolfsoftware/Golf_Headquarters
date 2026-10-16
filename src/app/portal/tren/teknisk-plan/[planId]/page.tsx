/**
 * PH-TP-01 Teknisk plan (spiller) i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-TP.jsx). Erstatter v2-visningen med
 * OppgaveModal og dra-og-slipp: spilleren leser planen og registrerer
 * repetisjoner; endringer gjøres av coachen i AG-TP-01.
 *
 * Tilgang som før: bare spillerens egen plan (userId = innlogget). Mangler
 * planen helt, vises tom tilstand; finnes andre planer, er id-en feil → 404.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentTekniskPlan } from "@/lib/teknisk-plan/tp-last";
import { planVisning } from "@/lib/teknisk-plan/tp-visning";
import { loadNesteOkt } from "@/lib/portal/load-neste-okt";
import { PHTP01TekniskPlan } from "@/components/portal/precision/PHTP01TekniskPlan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Teknisk plan · PlayerHQ" };

export default async function TekniskPlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const [rad, uleste] = await Promise.all([
    hentTekniskPlan({ id: planId, userId: user.id }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  if (!rad) {
    const antallPlaner = await prisma.technicalPlan.count({ where: { userId: user.id } });
    if (antallPlaner > 0) notFound();
  }

  const neste = await loadNesteOkt(user.id, new Date());
  return (
    <PHTP01TekniskPlan
      plan={rad ? planVisning(rad) : null}
      uleste={uleste}
      okt={{ href: neste.href, label: neste.okt ? "Start økt" : "Planlegg økt" }}
    />
  );
}
