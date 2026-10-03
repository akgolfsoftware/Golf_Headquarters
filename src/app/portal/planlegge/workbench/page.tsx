/**
 * PlayerHQ Workbench — PH11Workbench i PlayerHQSkall.
 * Samme motor og samme sju nivåer: år, periode, måned, uke, økt, volum og mål.
 * Spilleren ser bare egen plan. Øktarket på /portal/tren/wb er en annen flate.
 * Tegningen ui_kits/playerhq/screens/PH-11.jsx ligger ikke i git.
 */

import { redirect } from "next/navigation";
import { CalendarX } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand } from "@/components/precision/pa";
import { AG11Workbench, type AG11Side } from "@/components/admin/precision/AG11Workbench";
import { AG11Fysisk, AG11Turnering } from "@/components/admin/precision/AG11Moduler";
import { WorkbenchAar } from "@/components/workbench/WorkbenchAar";
import { WorkbenchPeriode } from "@/components/workbench/WorkbenchPeriode";
import { WorkbenchManed } from "@/components/workbench/WorkbenchManed";
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
import { WorkbenchSamlet } from "@/components/workbench/WorkbenchSamlet";
import { loadWorkbenchSamletData } from "@/lib/workbench/workbench-samlet-data";
import { brukSamletWorkbench, parseWorkbenchFlate } from "@/lib/workbench/samlet-url";
import { parseVisning } from "@/lib/workbench/visning-url";
import { queryVerdi } from "@/lib/workbench/plan-kontekst";
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
  const uleste = (await getUnreadNotifications(user.id, 1)).count;

  if (sp.pille === "fys" || sp.pille === "turn") {
    const fys = await loadFysTurneringWorkbenchData(playerId, { viewer: "player" });
    const actions = {};
    return <Ramme uleste={uleste}>{sp.pille === "fys"
      ? <AG11Fysisk playerId={playerId} spillerNavn={spillerNavn} data={fys} actions={actions} routeSurface="player" />
      : <AG11Turnering playerId={playerId} spillerNavn={spillerNavn} data={fys} actions={actions} routeSurface="player" />}</Ramme>;
  }

  if (brukSamletWorkbench(sp)) {
    const data = await loadWorkbenchSamletData({
      playerId, routeSurface: "player", query: sp,
      flate: parseWorkbenchFlate(queryVerdi(sp, "flate"), parseVisning(queryVerdi(sp, "niva") ?? queryVerdi(sp, "vis"))),
    });
    if (!data.ok) return <Feil uleste={uleste} melding={data.error} />;
    return <Ramme uleste={uleste}><WorkbenchSamlet key={[playerId, data.data.planKontekst.weekStart, data.data.planKontekst.year, data.data.planKontekst.monthStart, data.data.planKontekst.referanse.periode, data.data.planKontekst.visning, data.data.flate].join(":")} data={data.data} /></Ramme>;
  }

  const goals = await hentMaalSpor(playerId);
  const mode = { kind: "PLAYER" as const, subjectId: playerId, sources: [] };
  const now = new Date();
  let kontekst = parsePlanKontekst(sp, { now });
  const visning = kontekst.visning;
  const periodRes = visning === "periode" || (!kontekst.harValgtUke && kontekst.referanse.periode)
    ? await loadPeriod({ year: kontekst.year, periodId: kontekst.referanse.periode, mode, playerId })
    : null;
  if (periodRes?.ok) kontekst = parsePlanKontekst(sp, { now, periode: periodRes.data.period });
  const weekStart = kontekst.weekStart;

  if (visning === "aar") {
    const year = kontekst.year;
    const [yearRes, kilderRes] = await Promise.all([
      loadYear({ year, mode, playerId }),
      loadSources({ playerId, weekStart }),
    ]);
    if (!yearRes.ok) return <Feil uleste={uleste} melding={yearRes.error} />;
    return <Ramme uleste={uleste}><Arv><WorkbenchAar key={`${playerId}:${year}:${kontekst.referanse.periode ?? ""}`} planKontekst={kontekst.referanse} playerId={playerId} spillerNavn={spillerNavn} aar={yearRes.data} kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} routeSurface="player" /></Arv></Ramme>;
  }

  if (visning === "maned") {
    const monthStart = kontekst.monthStart;
    const [monthRes, kilderRes] = await Promise.all([
      loadMonth({ monthStart, mode, playerId }),
      loadSources({ playerId, weekStart }),
    ]);
    if (!monthRes.ok) return <Feil uleste={uleste} melding={monthRes.error} />;
    return <Ramme uleste={uleste}><Arv><WorkbenchManed planKontekst={kontekst.referanse} playerId={playerId} spillerNavn={spillerNavn} maned={monthRes.data} kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} routeSurface="player" /></Arv></Ramme>;
  }

  if (visning === "periode") {
    const kilderRes = await loadSources({ playerId, weekStart });
    if (!periodRes?.ok) return <Feil uleste={uleste} melding={periodRes?.error ?? "Perioden kunne ikke lastes"} />;
    return <Ramme uleste={uleste}><Arv><WorkbenchPeriode key={`${playerId}:${kontekst.year}:${periodRes.data.period?.id ?? "tom"}`} planKontekst={kontekst.referanse} playerId={playerId} spillerNavn={spillerNavn} periode={periodRes.data} kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} routeSurface="player" /></Arv></Ramme>;
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

  const [weekRes, kilderRes, fys] = await Promise.all([
    loadWeek({ weekStart, mode, playerId }),
    loadSources({ playerId, weekStart }),
    loadFysTurneringWorkbenchData(playerId, { viewer: "player" }),
  ]);
  if (!weekRes.ok) return <Feil uleste={uleste} melding={weekRes.error} />;

  const side = SIDER.find((s) => s === sp.side);
  return <Ramme uleste={uleste}><AG11Workbench
    planKontekst={kontekst.referanse}
    key={`${playerId}:${weekStart}:${visning}:${kontekst.referanse.okt ?? ""}`}
    playerId={playerId}
    spillerNavn={spillerNavn}
    uke={weekRes.data}
    kilder={kilderRes.ok ? kilderRes.data : []}
    roster={[]}
    grupper={[]}
    goals={goals}
    fys={fys}
    niva={visning === "mal" ? "mal" : visning === "vol" ? "vol" : visning === "okt" ? "okt" : "uke"}
    side={side}
    valgtOktId={kontekst.referanse.okt}
    routeSurface="player"
    role="player"
  /></Ramme>;
}
