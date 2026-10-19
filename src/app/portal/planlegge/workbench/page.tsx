/**
 * PlayerHQ Workbench — spillerens nivåer År · Periode · Måned · Uke · Målsetninger
 * (§SPILLERENS WORKBENCH FÅR NIVÅENE, 14.10.2026; fasit docs/design-system/utkast-playerhq/plan.html).
 * Spilleren ser aldri de fire flatene (WorkbenchSamlet); de er coachens. Gamle `flate=`-lenker sendes
 * til riktig nivå. Økt og Volum (AG-11-visningene), Live og Min kalender nås fra Uke.
 * Spilleren ser bare egen plan. Øktarket på /portal/tren/wb er en annen flate.
 */

import { redirect } from "next/navigation";
import { CalendarX } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand } from "@/components/precision/pa";
import { PH11Workbench } from "@/components/portal/precision/PH11Workbench";
import { type AG11Side } from "@/components/admin/precision/AG11Workbench";
import { AG11Fysisk, AG11Turnering } from "@/components/admin/precision/AG11Moduler";
import { PH11Aarsplan } from "@/components/portal/precision/PH11Aarsplan";
import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";
import { addDays } from "@/lib/domain/workbench/operations";
import { PH11Periode } from "@/components/portal/precision/PH11Periode";
import { PH11Maned } from "@/components/portal/precision/PH11Maned";
import {
  loadMonth,
  loadPeriod,
  loadSources,
  loadWeek,
  loadYear,
  loadWorkbenchLive,
} from "@/lib/workbench/wb-actions";
import { loadFysTurneringWorkbenchData } from "@/lib/workbench/fys-turnering-data";
import { parsePlanKontekst, type PlanQuery } from "@/lib/workbench/plan-kontekst";
import { hentMaalSpor } from "@/lib/workbench/maal-spor";
import { WorkbenchLastPaNytt } from "@/components/workbench/WorkbenchLastPaNytt";
import { loadPlayerMinCalendar } from "@/lib/workbench/spiller-min-kalender";
import { WorkbenchLive } from "@/components/workbench/WorkbenchLive";
import { WorkbenchMinKalender } from "@/components/workbench/WorkbenchMinKalender";
import { spillerNivaUrl } from "@/lib/workbench/samlet-url";
import { PH11Uke } from "@/components/portal/precision/PH11Uke";
import { PH11Nivaer } from "@/components/portal/precision/PH11Nivaer";
import { PHMalsetninger } from "@/components/portal/precision/PHMalsetninger";
import { hentMalsetningerSide } from "@/lib/portal-mal/maal-ny-last";
import { harEgenIupInngang } from "@/lib/iup/oversikt";
import { hentIupMaaltallSammendrag } from "@/lib/iup/maaltall-data";
import { periodeForUke } from "@/lib/workbench/uke-periode";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import "@/styles/workbench-selected.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Workbench · PlayerHQ" };

type Props = {
  searchParams: Promise<PlanQuery>;
};

const SIDER: readonly AG11Side[] = ["bank", "fys", "maler", "turn", "tp", "mal"];

function Ramme({ uleste, children }: { uleste: number; children: React.ReactNode }) {
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      {children}
    </PlayerHQSkall>
  );
}

function Feil({ uleste, melding }: { uleste: number; melding: string }) {
  return <Ramme uleste={uleste}><div className="pa-side"><FeilTilstand icon={CalendarX} title="Workbench kunne ikke lastes" text={melding} retry={<WorkbenchLastPaNytt />} /></div></Ramme>;
}

function Arv({ children, live }: { children: React.ReactNode; live?: boolean }) {
  return <div className="a9-arv"><div className="wb-app" data-surface={live ? "live" : "light"}>{children}</div></div>;
}

export default async function PlayerWorkbenchPage({ searchParams }: Props) {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const sp = await searchParams;
  const playerId = user.id;
  const spillerNavn = user.name ?? "Spiller";
  // Gamle lenker til de fire flatene (flate=, klassisk=1) sendes til spillerens nivå.
  const nivaUrl = spillerNivaUrl(sp);
  if (nivaUrl) redirect(nivaUrl);
  const uleste = (await getUnreadNotifications(user.id, 1)).count;

  if (sp.pille === "fys" || sp.pille === "turn") {
    const fys = await loadFysTurneringWorkbenchData(playerId, { viewer: "player" });
    const actions = {};
    return <Ramme uleste={uleste}>{sp.pille === "fys"
      ? <AG11Fysisk playerId={playerId} spillerNavn={spillerNavn} data={fys} actions={actions} routeSurface="player" />
      : <AG11Turnering playerId={playerId} spillerNavn={spillerNavn} data={fys} actions={actions} routeSurface="player" />}</Ramme>;
  }

  const goals = await hentMaalSpor(playerId);
  const mode = { kind: "PLAYER" as const, subjectId: playerId, sources: [] };
  const now = new Date();
  let kontekst = parsePlanKontekst(sp, { now });
  const visning = kontekst.visning === "stall" ? "uke" : kontekst.visning;
  const periodRes = visning === "periode" || (!kontekst.harValgtUke && kontekst.referanse.periode)
    ? await loadPeriod({ year: kontekst.year, periodId: kontekst.referanse.periode, mode, playerId })
    : null;
  if (periodRes?.ok) kontekst = parsePlanKontekst(sp, { now, periode: periodRes.data.period });
  const weekStart = kontekst.weekStart;

  if (visning === "aar") {
    const year = kontekst.year;
    const yearRes = await loadYear({ year, mode, playerId });
    if (!yearRes.ok) return <Feil uleste={uleste} melding={yearRes.error} />;
    return <Ramme uleste={uleste}><PH11Aarsplan key={`${playerId}:${year}`} playerId={playerId} aar={yearRes.data} referanse={kontekst.referanse} idag={OSLO_YMD_FMT.format(now)} /></Ramme>;
  }

  if (visning === "maned") {
    const monthStart = kontekst.monthStart;
    const monthRes = await loadMonth({ monthStart, mode, playerId });
    if (!monthRes.ok) return <Feil uleste={uleste} melding={monthRes.error} />;
    return <Ramme uleste={uleste}><PH11Maned key={`${playerId}:${monthStart}`} playerId={playerId} maned={monthRes.data} goals={goals} referanse={kontekst.referanse} idag={OSLO_YMD_FMT.format(now)} /></Ramme>;
  }

  if (visning === "periode") {
    if (!periodRes?.ok) return <Feil uleste={uleste} melding={periodRes?.error ?? "Perioden kunne ikke lastes"} />;
    return <Ramme uleste={uleste}><PH11Periode key={`${playerId}:${kontekst.year}:${periodRes.data.period?.id ?? "tom"}`} playerId={playerId} periode={periodRes.data} referanse={kontekst.referanse} idag={OSLO_YMD_FMT.format(now)} /></Ramme>;
  }

  if (visning === "mal") {
    const [side, visIup, iupMaaltall] = await Promise.all([hentMalsetningerSide(user), harEgenIupInngang(), hentIupMaaltallSammendrag()]);
    return <Ramme uleste={uleste}><PHMalsetninger visIup={visIup} iupMaaltall={iupMaaltall} avsluttede={side.avsluttede} data={{ goals: side.goals, milepael: side.milepael }}
      nivaer={<PH11Nivaer playerId={playerId} aktiv="mal" referanse={kontekst.referanse} />} /></Ramme>;
  }

  if (visning === "live") {
    const live = await loadWorkbenchLive({ weekStart, playerId, sessionId: kontekst.referanse.okt });
    if (!live.ok) return <Feil uleste={uleste} melding={live.error} />;
    return <Ramme uleste={uleste}><Arv live><WorkbenchLive key={`${live.data.current?.id ?? "ingen"}:${live.data.next?.id ?? "ingen"}`} playerId={playerId} spillerNavn={spillerNavn} data={live.data} routeSurface="player" planKontekst={kontekst.referanse} /></Arv></Ramme>;
  }
  if (visning === "min") {
    const kalender = await loadPlayerMinCalendar(weekStart);
    if (!kalender.ok) return <Feil uleste={uleste} melding={kalender.error} />;
    return <Ramme uleste={uleste}><Arv><WorkbenchMinKalender key={`${playerId}:${weekStart}`} playerId={playerId} coachName={spillerNavn} data={kalender.data} routeSurface="player" planKontekst={kontekst.referanse} /></Arv></Ramme>;
  }

  const [weekRes, kilderRes, fys, aarRes] = await Promise.all([
    loadWeek({ weekStart, mode, playerId }),
    loadSources({ playerId, weekStart }),
    loadFysTurneringWorkbenchData(playerId, { viewer: "player" }),
    visning === "uke" ? loadYear({ year: Number(addDays(weekStart, 3).slice(0, 4)), mode, playerId }) : Promise.resolve(null),
  ]);
  if (!weekRes.ok) return <Feil uleste={uleste} melding={weekRes.error} />;

  if (visning === "uke") {
    const nu = new Date();
    const [h, m] = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(nu).split(":").map(Number);
    return <Ramme uleste={uleste}><PH11Uke key={`${playerId}:${weekStart}`} playerId={playerId} spillerNavn={spillerNavn} uke={weekRes.data}
      kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} fys={fys} referanse={kontekst.referanse}
      periode={aarRes?.ok ? periodeForUke(aarRes.data.periods, weekStart) : null}
      idag={OSLO_YMD_FMT.format(nu)} naMinutt={h * 60 + m} /></Ramme>;
  }

  // Økt og Volum (AG-11-visningene) for spilleren, nådd fra øktarket og verktøyene i Uke.
  const side = SIDER.find((s) => s === sp.side);
  return <Ramme uleste={uleste}><PH11Workbench
    planKontekst={kontekst.referanse}
    key={`${playerId}:${weekStart}:${visning}:${kontekst.referanse.okt ?? ""}`}
    playerId={playerId}
    spillerNavn={spillerNavn}
    uke={weekRes.data}
    kilder={kilderRes.ok ? kilderRes.data : []}
    goals={goals}
    fys={fys}
    niva={visning === "vol" ? "vol" : "okt"}
    side={side}
    valgtOktId={kontekst.referanse.okt}
  /></Ramme>;
}
