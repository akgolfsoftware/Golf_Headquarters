/**
 * PlayerHQ Velg treningsplan (PH-12) i Precision Athletics — /portal/planlegge/bygger.
 * Tegning: Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-12.jsx.
 * MIDLERTIDIG: malene er PlanTemplate (4-ukersblokker) filtrert på nivå. Beslutningen 28.09 krever fem
 * navngitte standardplaner i alle kategorier A–K; de kommer når Anders sender innholdet i dem.
 * Malene har ikke timer per uke, så timer settes av spilleren (ingen gjettet verdi).
 * Den gamle AI-byggeren (PlanByggerV2 og actionene) ligger urørt i koden.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { anbefalMalCore } from "@/lib/plan-builder";
import { fordelingFraMal, startUker } from "@/lib/plan-builder/velg-plan";
import { PH12VelgPlan, type VelgPlanMal } from "@/components/portal/precision/PH12VelgPlan";
import { sendPlanTilCoachV2 } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lag en plan · PlayerHQ" };

export default async function PlanByggerPage() {
  // Bare spilleren (forelder sendes til /forelder). requirePortalUser sperrer også TALENT/INGEN før steg 1.
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [mal, uleste] = await Promise.all([
    anbefalMalCore(user, { maltype: "GENERELL" }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  const maler: VelgPlanMal[] = [...(mal.anbefalt ? [mal.anbefalt] : []), ...mal.alternativer].slice(0, 5).map((t) => ({
    id: t.templateId,
    navn: t.navn,
    sub: `${t.varighetUker} uker · ${t.ukentligOktAntall} økter per uke`,
    uker: Math.min(52, Math.max(2, t.varighetUker)),
    fordeling: fordelingFraMal(t.disciplinFordeling),
  }));

  return <PH12VelgPlan maler={maler} startUker={startUker(new Date())} uleste={uleste} onSend={sendPlanTilCoachV2} workbenchHref="/portal/planlegge/workbench" />;
}
