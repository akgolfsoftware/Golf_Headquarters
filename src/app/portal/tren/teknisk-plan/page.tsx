/**
 * /portal/tren/teknisk-plan — inngangen til spillerens tekniske plan.
 * Sender til den aktive planen (ellers utkast, ellers nyeste) i PH-TP-01.
 * Uten plan vises PH-TP-01 sin tomme tilstand. /portal/teknisk peker hit
 * (next.config.ts), så det finnes én vei inn.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { velgPlan } from "@/lib/teknisk-plan/tp-oversikt";
import { loadNesteOkt } from "@/lib/portal/load-neste-okt";
import { PHTP01TekniskPlan } from "@/components/portal/precision/PHTP01TekniskPlan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Teknisk plan · PlayerHQ" };

export default async function TekniskPlanInngang() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const planer = await prisma.technicalPlan.findMany({
    where: { userId: user.id },
    select: { id: true, status: true, startDato: true },
  });
  const plan = velgPlan(planer);
  if (plan) redirect(`/portal/tren/teknisk-plan/${plan.id}`);

  const [uleste, neste] = await Promise.all([
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    loadNesteOkt(user.id, new Date()),
  ]);
  return <PHTP01TekniskPlan plan={null} uleste={uleste} okt={{ href: neste.href, label: neste.okt ? "Start økt" : "Planlegg økt" }} />;
}
