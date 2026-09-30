/**
 * PlayerHQ Plan — PH-10 i Precision Athletics (Claude Design 7d7c2994, runde 21).
 * Én flate i fire nivåer (År · Måned · Uke · Dag), med fysisk, turneringer og
 * samlinger som lag. `?zoom=&dato=` styrer nivået; `?lag=fys` åpner neste fysiske
 * økt (gamle /tren/fys-plan), `?turnering=<id>` åpner turneringen (gamle
 * /tren/turneringer/[id] når spilleren har den i planen).
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentEffektivNaa } from "@/lib/testing/dato-override";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH10Plan } from "@/components/portal/precision/PH10Plan";
import { erIso } from "@/lib/portal-plan/ph10-dato";
import { finnNesteFysiskOkt, finnTurneringsdato, hentPlanData } from "@/lib/portal-plan/ph10-data";
import { PLAN_ZOOM, type PlanZoom } from "@/lib/portal-plan/ph10-typer";
import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plan · PlayerHQ" };

type Sok = { zoom?: string | string[]; dato?: string | string[]; lag?: string | string[]; turnering?: string | string[] };
const en = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function PlayerPlanPage({ searchParams }: { searchParams: Promise<Sok> }) {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const sok = await searchParams;
  const naa = await hentEffektivNaa(user.email);
  const iDag = OSLO_YMD_FMT.format(naa);
  const zoomParam = en(sok.zoom);
  let zoom: PlanZoom = PLAN_ZOOM.find((z) => z === zoomParam) ?? "uke";
  const datoParam = en(sok.dato);
  let dato = erIso(datoParam) ? datoParam : iDag;

  const lag = en(sok.lag) === "fys" ? "fys" : undefined;
  const turneringId = en(sok.turnering);
  let aapneOktId: string | null = null;
  let aapneTurnering = false;

  if (lag === "fys") {
    const neste = await finnNesteFysiskOkt(user.id, iDag);
    if (neste) { dato = neste.dato; zoom = "uke"; aapneOktId = neste.id; }
  }
  if (turneringId) {
    const start = await finnTurneringsdato(user.id, turneringId);
    if (start) { dato = start; zoom = "uke"; aapneTurnering = true; }
  }

  const data = await hentPlanData({ userId: user.id, naa, zoom, dato, lag, aapneOktId });
  // Radene har påmeldingens id, søket gjelder katalog-id: slå opp hendelsen her.
  const heldag = aapneTurnering ? data.heldag.find((h) => h.turneringId === turneringId) : undefined;

  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={data.uleste}>
    <PH10Plan data={{ ...data, aapneHeldagId: heldag?.id ?? null }} />
  </PlayerHQSkall>;
}
