/**
 * PlayerHQ Workbench — Precision Athletics (PH-11).
 *
 * Samme Workbench-motor og samme sju nivåer som AgencyOS: År, Periode,
 * Måned, Uke, Økt, Volum og Målsetninger. Spilleren ser bare egen plan.
 */

import { redirect } from "next/navigation";
import { CalendarX } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
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
} from "@/lib/workbench/wb-actions";
import { loadFysTurneringWorkbenchData } from "@/lib/workbench/fys-turnering-data";
import { parsePlanKontekst, type PlanQuery } from "@/lib/workbench/plan-kontekst";
import { hentMaalSpor } from "@/lib/workbench/maal-spor";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import "@/styles/workbench-selected.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Workbench · PlayerHQ" };

type Props = {
  searchParams: Promise<PlanQuery>;
};

const SIDER: readonly AG11Side[] = ["bank", "fys", "maler", "turn", "tp", "mal"];

function Ramme({ navn, children }: { navn: string | null; children: React.ReactNode }) {
  return <V2Shell bredde="full" aktiv="plan" nav={PLAYERHQ_NAV} navn={navn ?? undefined}><div className="pa-root">{children}</div></V2Shell>;
}

function Feil({ navn, melding }: { navn: string | null; melding: string }) {
  return <Ramme navn={navn}><div className="pa-side"><FeilTilstand icon={CalendarX} title="Workbench kunne ikke lastes" text={melding} /></div></Ramme>;
}

function Arv({ children }: { children: React.ReactNode }) {
  return <div className="a9-arv"><div className="wb-app" data-surface="light">{children}</div></div>;
}

export default async function PlayerWorkbenchPage({ searchParams }: Props) {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const sp = await searchParams;
  const playerId = user.id;
  const spillerNavn = user.name ?? "Spiller";

  if (sp.pille === "fys" || sp.pille === "turn") {
    const fys = await loadFysTurneringWorkbenchData(playerId, { viewer: "player" });
    const actions = {};
    return <Ramme navn={user.name}>{sp.pille === "fys"
      ? <AG11Fysisk playerId={playerId} spillerNavn={spillerNavn} data={fys} actions={actions} routeSurface="player" />
      : <AG11Turnering playerId={playerId} spillerNavn={spillerNavn} data={fys} actions={actions} routeSurface="player" />}</Ramme>;
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
    if (!yearRes.ok) return <Feil navn={user.name} melding={yearRes.error} />;
    return <Ramme navn={user.name}><Arv><WorkbenchAar key={`${playerId}:${year}:${kontekst.referanse.periode ?? ""}`} planKontekst={kontekst.referanse} playerId={playerId} spillerNavn={spillerNavn} aar={yearRes.data} kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} routeSurface="player" /></Arv></Ramme>;
  }

  if (visning === "maned") {
    const monthStart = kontekst.monthStart;
    const [monthRes, kilderRes] = await Promise.all([
      loadMonth({ monthStart, mode, playerId }),
      loadSources({ playerId, weekStart }),
    ]);
    if (!monthRes.ok) return <Feil navn={user.name} melding={monthRes.error} />;
    return <Ramme navn={user.name}><Arv><WorkbenchManed planKontekst={kontekst.referanse} playerId={playerId} spillerNavn={spillerNavn} maned={monthRes.data} kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} routeSurface="player" /></Arv></Ramme>;
  }

  if (visning === "periode") {
    const kilderRes = await loadSources({ playerId, weekStart });
    if (!periodRes?.ok) return <Feil navn={user.name} melding={periodRes?.error ?? "Perioden kunne ikke lastes"} />;
    return <Ramme navn={user.name}><Arv><WorkbenchPeriode key={`${playerId}:${kontekst.year}:${periodRes.data.period?.id ?? "tom"}`} planKontekst={kontekst.referanse} playerId={playerId} spillerNavn={spillerNavn} periode={periodRes.data} kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} routeSurface="player" /></Arv></Ramme>;
  }

  const [weekRes, kilderRes, fys] = await Promise.all([
    loadWeek({ weekStart, mode, playerId }),
    loadSources({ playerId, weekStart }),
    loadFysTurneringWorkbenchData(playerId, { viewer: "player" }),
  ]);
  if (!weekRes.ok) return <Feil navn={user.name} melding={weekRes.error} />;

  const side = SIDER.find((s) => s === sp.side);
  return <Ramme navn={user.name}><AG11Workbench
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
