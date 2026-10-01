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
import { mondayOf } from "@/lib/domain/workbench/operations";
import { parseWeekOffset } from "@/lib/workbench/session-move-math";
import { parseVisning } from "@/lib/workbench/visning-url";
import { hentMaalSpor } from "@/lib/workbench/maal-spor";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import "@/styles/workbench-selected.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Workbench · PlayerHQ" };

type Props = {
  searchParams: Promise<{
    uke?: string;
    vis?: string;
    niva?: string;
    aar?: string;
    maned?: string;
    periode?: string;
    okt?: string;
    pille?: string;
    side?: string;
  }>;
};

const SIDER: readonly AG11Side[] = ["bank", "fys", "maler", "turn", "tp", "mal"];

function aarFraParam(raw?: string): number {
  const aar = Number(raw);
  if (Number.isInteger(aar) && aar >= 2000 && aar <= 2100) return aar;
  return Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Europe/Oslo" }).format(new Date()));
}

function manedFraParam(raw?: string): string {
  if (raw && /^\d{4}-(0[1-9]|1[0-2])$/.test(raw)) return `${raw}-01`;
  const iso = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  return `${iso.slice(0, 7)}-01`;
}

function ukeStartFraParam(raw?: string): string {
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return mondayOf(raw);
  const off = parseWeekOffset(raw);
  const iso = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + off * 7);
  return mondayOf(d.toISOString().slice(0, 10));
}

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
  const visning = parseVisning(sp.niva ?? sp.vis);
  const weekStart = ukeStartFraParam(sp.uke);
  const mode = { kind: "PLAYER" as const, subjectId: playerId, sources: [] };

  if (sp.pille === "fys" || sp.pille === "turn") {
    const fys = await loadFysTurneringWorkbenchData(playerId, { viewer: "player" });
    const actions = {};
    return <Ramme navn={user.name}>{sp.pille === "fys"
      ? <AG11Fysisk playerId={playerId} spillerNavn={spillerNavn} data={fys} actions={actions} routeSurface="player" />
      : <AG11Turnering playerId={playerId} spillerNavn={spillerNavn} data={fys} actions={actions} routeSurface="player" />}</Ramme>;
  }

  const goals = await hentMaalSpor(playerId);

  if (visning === "aar") {
    const year = aarFraParam(sp.aar);
    const [yearRes, kilderRes] = await Promise.all([
      loadYear({ year, mode, playerId }),
      loadSources({ playerId, weekStart: `${year}-01-01` }),
    ]);
    if (!yearRes.ok) return <Feil navn={user.name} melding={yearRes.error} />;
    return <Ramme navn={user.name}><Arv><WorkbenchAar playerId={playerId} spillerNavn={spillerNavn} aar={yearRes.data} kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} routeSurface="player" /></Arv></Ramme>;
  }

  if (visning === "maned") {
    const monthStart = manedFraParam(sp.maned);
    const [monthRes, kilderRes] = await Promise.all([
      loadMonth({ monthStart, mode, playerId }),
      loadSources({ playerId, weekStart: mondayOf(monthStart) }),
    ]);
    if (!monthRes.ok) return <Feil navn={user.name} melding={monthRes.error} />;
    return <Ramme navn={user.name}><Arv><WorkbenchManed playerId={playerId} spillerNavn={spillerNavn} maned={monthRes.data} kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} routeSurface="player" /></Arv></Ramme>;
  }

  if (visning === "periode") {
    const year = aarFraParam(sp.aar);
    const [periodRes, kilderRes] = await Promise.all([
      loadPeriod({ year, periodId: sp.periode, mode, playerId }),
      loadSources({ playerId, weekStart }),
    ]);
    if (!periodRes.ok) return <Feil navn={user.name} melding={periodRes.error} />;
    return <Ramme navn={user.name}><Arv><WorkbenchPeriode playerId={playerId} spillerNavn={spillerNavn} periode={periodRes.data} kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} routeSurface="player" /></Arv></Ramme>;
  }

  const [weekRes, kilderRes, fys] = await Promise.all([
    loadWeek({ weekStart, mode, playerId }),
    loadSources({ playerId, weekStart }),
    loadFysTurneringWorkbenchData(playerId, { viewer: "player" }),
  ]);
  if (!weekRes.ok) return <Feil navn={user.name} melding={weekRes.error} />;

  const side = SIDER.find((s) => s === sp.side);
  return <Ramme navn={user.name}><AG11Workbench
    key={`${playerId}:${weekStart}:${visning}`}
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
    valgtOktId={sp.okt}
    routeSurface="player"
    role="player"
  /></Ramme>;
}
