/**
 * AgencyOS Workbench — coach (AG-11 i Precision Athletics).
 *
 * Uke, Økt og Målsetninger er portert (AG11Workbench): samme guard, samme
 * lastere (loadWeek, loadSources, hentMaalSpor, loadFysTurneringWorkbenchData)
 * og samme skriveside (wb-actions via useUkeMotor) som WorkbenchUke hadde.
 * `?pille=fys` og `?pille=turn` er fysisk plan og turneringer (AG-WB-FYS,
 * AG-WB-TURN) med de samme seks handlingene som før.
 *
 * År, Periode og Måned (egen beslutning, PR #995) og Stall, Live og Min
 * kalender er ikke portert: de vises som før inne i Precision-skallet.
 */

import { notFound } from "next/navigation";
import { CalendarX } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand } from "@/components/precision/pa";
import { AG11Workbench, type AG11Side } from "@/components/admin/precision/AG11Workbench";
import { AG11Fysisk, AG11Turnering } from "@/components/admin/precision/AG11Moduler";
import { WorkbenchAar } from "@/components/workbench/WorkbenchAar";
import { WorkbenchPeriode } from "@/components/workbench/WorkbenchPeriode";
import { AG11Maned } from "@/components/admin/precision/AG11Maned";
import { WorkbenchStall } from "@/components/workbench/WorkbenchStall";
import { WorkbenchLive } from "@/components/workbench/WorkbenchLive";
import { WorkbenchMinKalender } from "@/components/workbench/WorkbenchMinKalender";
import { loadMinCalendar, loadMonth, loadPeriod, loadStallFollowup, loadWeek, loadWorkbenchLive, loadYear, loadSources } from "@/lib/workbench/wb-actions";
import { loadFysTurneringWorkbenchData } from "@/lib/workbench/fys-turnering-data";
import { flyttFysiskOkt, opprettFysiskBlokk, opprettFysiskOkt, opprettTurneringsplan, publiserFysiskBlokk, publiserTurneringsplan } from "@/lib/workbench/fys-turnering-actions";
import { mondayOf } from "@/lib/domain/workbench/operations";
import { parseWeekOffset } from "@/lib/workbench/session-move-math";
import { parseVisning } from "@/lib/workbench/visning-url";
import { hentMaalSpor } from "@/lib/workbench/maal-spor";
import "@/styles/workbench-selected.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Workbench · AgencyOS" };

type Props = {
  params: Promise<{ playerId: string }>;
  searchParams: Promise<{ uke?: string; vis?: string; aar?: string; maned?: string; periode?: string; okt?: string; pille?: string; side?: string; niva?: string }>;
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
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + off * 7);
  return mondayOf(d.toISOString().slice(0, 10));
}

/** Visninger som ikke er portert ennå: samme komponent som før, i Precision-skallet. */
function Arv({ children, live }: { children: React.ReactNode; live?: boolean }) {
  return <div className="a9-arv"><div className="wb-app" data-surface={live ? "live" : "light"}>{children}</div></div>;
}

function Feil({ navn, melding }: { navn: string; melding: string }) {
  return (
    <AgencyOSSkall navn={navn}>
      <div className="pa-side">
        <FeilTilstand icon={CalendarX} title="Workbench kunne ikke lastes" text={melding} />
      </div>
    </AgencyOSSkall>
  );
}

export default async function CoachWorkbenchPage({ params, searchParams }: Props) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { playerId } = await params;
  const sp = await searchParams;
  const navn = user.name ?? "Coach";

  const spiller = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(user), { id: playerId }] },
    select: { id: true, name: true },
  });
  if (!spiller) notFound();
  const spillerNavn = spiller.name ?? "Ukjent";

  if (sp.pille === "fys" || sp.pille === "turn") {
    const fys = await loadFysTurneringWorkbenchData(playerId, { viewer: "coach" });
    const actions = { flyttFysiskOkt, opprettFysiskBlokk, opprettFysiskOkt, opprettTurneringsplan, publiserFysiskBlokk, publiserTurneringsplan };
    return (
      <AgencyOSSkall navn={navn}>
        {sp.pille === "fys"
          ? <AG11Fysisk playerId={playerId} spillerNavn={spillerNavn} data={fys} actions={actions} />
          : <AG11Turnering playerId={playerId} spillerNavn={spillerNavn} data={fys} actions={actions} />}
      </AgencyOSSkall>
    );
  }

  const goals = await hentMaalSpor(playerId);
  const weekStart = ukeStartFraParam(sp.uke);
  const mode = { kind: "AGENCY" as const, subjectId: playerId, sources: [] };
  const visning = sp.vis === "mal" ? "mal" : parseVisning(sp.vis ?? (sp.niva === "maned" ? "maned" : undefined));
  const hentRoster = () => prisma.user.findMany({
    where: coachScopedPlayerWhere(user),
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (visning === "aar") {
    const year = aarFraParam(sp.aar);
    const [roster, yearRes, kilderRes] = await Promise.all([
      hentRoster(),
      loadYear({ year, mode, playerId }),
      loadSources({ playerId, weekStart: `${year}-01-01` }),
    ]);
    if (!yearRes.ok) return <Feil navn={navn} melding={yearRes.error} />;
    return (
      <AgencyOSSkall navn={navn}><Arv>
        <WorkbenchAar key={`${playerId}:${year}`} playerId={playerId} roster={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
          spillerNavn={spillerNavn} aar={yearRes.data} kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} />
      </Arv></AgencyOSSkall>
    );
  }

  if (visning === "maned") {
    const monthStart = manedFraParam(sp.maned);
    const [roster, monthRes] = await Promise.all([
      hentRoster(),
      loadMonth({ monthStart, mode, playerId }),
    ]);
    if (!monthRes.ok) return <Feil navn={navn} melding={monthRes.error} />;
    return (
      <AgencyOSSkall navn={navn}>
        <AG11Maned key={`${playerId}:${monthStart}`} playerId={playerId} roster={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
          spillerNavn={spillerNavn} maned={monthRes.data} />
      </AgencyOSSkall>
    );
  }

  if (visning === "periode") {
    const year = aarFraParam(sp.aar);
    const [roster, periodRes, kilderRes] = await Promise.all([
      hentRoster(),
      loadPeriod({ year, periodId: sp.periode, mode, playerId }),
      loadSources({ playerId, weekStart }),
    ]);
    if (!periodRes.ok) return <Feil navn={navn} melding={periodRes.error} />;
    return (
      <AgencyOSSkall navn={navn}><Arv>
        <WorkbenchPeriode key={`${playerId}:${year}:${periodRes.data.period?.id ?? "tom"}`} playerId={playerId} roster={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
          spillerNavn={spillerNavn} periode={periodRes.data} kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} />
      </Arv></AgencyOSSkall>
    );
  }

  if (visning === "stall") {
    const stallRes = await loadStallFollowup({ weekStart, playerId });
    if (!stallRes.ok) return <Feil navn={navn} melding={stallRes.error} />;
    return (
      <AgencyOSSkall navn={navn}><Arv>
        <WorkbenchStall key={`${playerId}:${weekStart}:${sp.okt ?? "forste"}`} playerId={playerId} spillerNavn={spillerNavn} data={stallRes.data} selectedSessionId={sp.okt} />
      </Arv></AgencyOSSkall>
    );
  }

  if (visning === "live") {
    const liveRes = await loadWorkbenchLive({ weekStart, playerId });
    if (!liveRes.ok) return <Feil navn={navn} melding={liveRes.error} />;
    return (
      <AgencyOSSkall navn={navn}><Arv live>
        <WorkbenchLive key={liveRes.data.current?.id ?? "ingen-pagaaende"} playerId={playerId} spillerNavn={spillerNavn} data={liveRes.data} />
      </Arv></AgencyOSSkall>
    );
  }

  if (visning === "min") {
    const calendarRes = await loadMinCalendar({ weekStart, playerId });
    if (!calendarRes.ok) return <Feil navn={navn} melding={calendarRes.error} />;
    return (
      <AgencyOSSkall navn={navn}><Arv>
        <WorkbenchMinKalender key={`${playerId}:${weekStart}`} playerId={playerId} coachName={navn} data={calendarRes.data} />
      </Arv></AgencyOSSkall>
    );
  }

  // Uke, Økt og Målsetninger: samme data, nivået velges i klienten.
  const [roster, weekRes, kilderRes, fysTurnering, grupper] = await Promise.all([
    hentRoster(),
    loadWeek({ weekStart, mode, playerId }),
    loadSources({ playerId, weekStart }),
    loadFysTurneringWorkbenchData(playerId, { viewer: "coach" }),
    // Samme eierskap som /admin/grupper: en coach ser gruppene hun eier, admin alle.
    prisma.group.findMany({
      where: user.role === "COACH" ? { coachId: user.id } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!weekRes.ok) return <Feil navn={navn} melding={weekRes.error} />;

  const side = SIDER.find((s) => s === sp.side);
  return (
    <AgencyOSSkall navn={navn}>
      <AG11Workbench
        key={`${playerId}:${weekStart}`}
        playerId={playerId}
        spillerNavn={spillerNavn}
        uke={weekRes.data}
        kilder={kilderRes.ok ? kilderRes.data : []}
        roster={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
        grupper={grupper.map((g) => ({ id: g.id, navn: g.name }))}
        goals={goals}
        fys={fysTurnering}
        niva={visning === "mal" ? "mal" : visning === "okt" ? "okt" : "uke"}
        side={side}
        valgtOktId={sp.okt}
      />
    </AgencyOSSkall>
  );
}
