// PlayerHQ Turneringer — Precision Athletics, pakke 17 (utkast plan-hjelpere.html, 16.10.2026).
/**
 * Neste offisielle turnering, spillerens turneringer i planen og kalenderen fra GolfBox.
 * Påmelding skjer aldri fra lista; den bor på siden for én turnering (spilleransvar).
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { loadMinTurneringsplan, loadPlanleggerKatalog, type PlanleggerTurnering } from "@/lib/portal-turnering/planlegger-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHTurneringer, type PHTurneringRad } from "@/components/portal/precision/PHTurneringer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Turneringer · PlayerHQ" };

const OSLO = "Europe/Oslo";
const DAG = new Intl.DateTimeFormat("nb-NO", { timeZone: OSLO, day: "numeric" });
const MND = new Intl.DateTimeFormat("nb-NO", { timeZone: OSLO, month: "short" });
const LANG = new Intl.DateTimeFormat("nb-NO", { timeZone: OSLO, day: "numeric", month: "long", year: "numeric" });
const UKE = 7 * 24 * 60 * 60 * 1000;

function tilRad(t: PlanleggerTurnering): PHTurneringRad {
  return {
    id: t.id, navn: t.name, dag: DAG.format(t.startDate).replace(".", ""), mnd: MND.format(t.startDate).replace(".", ""),
    dato: t.datoLabel, sted: t.venue, tour: t.tour, frist: t.entryClosesLabel, fristHaster: t.entryClosesUrgent,
    tier: t.entry?.planTier ?? null, status: t.entry?.statusLabel ?? null,
  };
}

export default async function TurneringerPage() {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const [katalog, minPlan, uleste] = await Promise.all([
    loadPlanleggerKatalog(user.id),
    loadMinTurneringsplan(user.id),
    getUnreadNotifications(user.id, 1),
  ]);
  const naa = new Date();
  const neste = katalog.find((t) => t.startDate.getTime() >= naa.getTime()) ?? null;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PHTurneringer data={{
        neste: neste ? {
          id: neste.id, navn: neste.name, sted: neste.venue, dato: LANG.format(neste.startDate),
          uker: Math.max(0, Math.round((neste.startDate.getTime() - naa.getTime()) / UKE)),
          frist: neste.entryCloses ? LANG.format(neste.entryCloses) : null,
        } : null,
        mine: minPlan.map(tilRad),
        katalog: katalog.map(tilRad),
      }} />
    </PlayerHQSkall>
  );
}
