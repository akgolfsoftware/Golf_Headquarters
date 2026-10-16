/**
 * AgencyOS Workbench — coach (AG-11 i Precision Athletics).
 *
 * Uke, Økt og Målsetninger er portert (AG11Workbench): samme guard, samme
 * lastere (loadWeek, loadSources, hentMaalSpor, loadFysTurneringWorkbenchData)
 * og samme skriveside (wb-actions via useUkeMotor) som WorkbenchUke hadde.
 * `?pille=fys` og `?pille=turn` er fysisk plan og turneringer (AG-WB-FYS,
 * AG-WB-TURN) med de samme seks handlingene som før.
 *
 * År, Periode, Måned, Uke, Økt, Volum og Målsetninger følger det felles
 * skjermkartet. Historiske dyplenker for Stall, Live og Min støttes fortsatt.
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
import { WorkbenchManed } from "@/components/workbench/WorkbenchManed";
import { WorkbenchStall } from "@/components/workbench/WorkbenchStall";
import { WorkbenchLive } from "@/components/workbench/WorkbenchLive";
import { WorkbenchMinKalender } from "@/components/workbench/WorkbenchMinKalender";
import { loadMinCalendar, loadMonth, loadPeriod, loadStallFollowup, loadWeek, loadWorkbenchLive, loadYear, loadSources } from "@/lib/workbench/wb-actions";
import { loadFysTurneringWorkbenchData } from "@/lib/workbench/fys-turnering-data";
import { flyttFysiskOkt, opprettFysiskBlokk, opprettFysiskOkt, opprettTurneringsplan, publiserFysiskBlokk, publiserTurneringsplan } from "@/lib/workbench/fys-turnering-actions";
import { parsePlanKontekst, type PlanQuery } from "@/lib/workbench/plan-kontekst";
import { hentMaalSpor } from "@/lib/workbench/maal-spor";
import { WorkbenchLastPaNytt } from "@/components/workbench/WorkbenchLastPaNytt";
import { WorkbenchSamlet } from "@/components/workbench/WorkbenchSamlet";
import { loadWorkbenchSamletData } from "@/lib/workbench/workbench-samlet-data";
import { brukSamletWorkbench, parseWorkbenchFlate } from "@/lib/workbench/samlet-url";
import { parseVisning } from "@/lib/workbench/visning-url";
import { queryVerdi } from "@/lib/workbench/plan-kontekst";
import "@/styles/workbench-selected.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Workbench · AgencyOS" };

type Props = {
  params: Promise<{ playerId: string }>;
  searchParams: Promise<PlanQuery>;
};

const SIDER: readonly AG11Side[] = ["bank", "fys", "maler", "turn", "tp", "mal"];

/** Ramme for år, periode, måned og historiske dyplenker. */
function Arv({ children, live }: { children: React.ReactNode; live?: boolean }) {
  return <div className="a9-arv"><div className="wb-app" data-surface={live ? "live" : "light"}>{children}</div></div>;
}

function Feil({ navn, melding }: { navn: string; melding: string }) {
  return (
    <AgencyOSSkall navn={navn}>
      <div className="pa-side">
        <FeilTilstand icon={CalendarX} title="Workbench kunne ikke lastes" text={melding} retry={<WorkbenchLastPaNytt />} />
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
    const actions = fys.available === false ? {} : { flyttFysiskOkt, opprettFysiskBlokk, opprettFysiskOkt, opprettTurneringsplan, publiserFysiskBlokk, publiserTurneringsplan };
    return (
      <AgencyOSSkall navn={navn}>
        {sp.pille === "fys"
          ? <AG11Fysisk playerId={playerId} spillerNavn={spillerNavn} data={fys} actions={actions} />
          : <AG11Turnering playerId={playerId} spillerNavn={spillerNavn} data={fys} actions={actions} />}
      </AgencyOSSkall>
    );
  }

  if (brukSamletWorkbench(sp)) {
    const data = await loadWorkbenchSamletData({
      playerId, routeSurface: "agency", query: sp,
      flate: parseWorkbenchFlate(queryVerdi(sp, "flate"), parseVisning(queryVerdi(sp, "niva") ?? queryVerdi(sp, "vis"))),
    });
    if (!data.ok) return <Feil navn={navn} melding={data.error} />;
    return <AgencyOSSkall navn={navn}><WorkbenchSamlet key={[playerId, data.data.planKontekst.weekStart, data.data.planKontekst.year, data.data.planKontekst.monthStart, data.data.planKontekst.referanse.periode, data.data.planKontekst.visning, data.data.flate, data.data.valgtGruppeId].join(":")} data={data.data} /></AgencyOSSkall>;
  }

  const goals = await hentMaalSpor(playerId);
  const mode = { kind: "AGENCY" as const, subjectId: playerId, sources: [] };
  const now = new Date();
  let kontekst = parsePlanKontekst(sp, { now });
  const visning = kontekst.visning;
  const periodRes = visning === "periode" || (!kontekst.harValgtUke && kontekst.referanse.periode)
    ? await loadPeriod({ year: kontekst.year, periodId: kontekst.referanse.periode, mode, playerId })
    : null;
  if (periodRes?.ok) kontekst = parsePlanKontekst(sp, { now, periode: periodRes.data.period });
  const weekStart = kontekst.weekStart;
  const hentRoster = () => prisma.user.findMany({
    where: coachScopedPlayerWhere(user),
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (visning === "aar") {
    const year = kontekst.year;
    const [roster, yearRes, kilderRes] = await Promise.all([
      hentRoster(),
      loadYear({ year, mode, playerId }),
      loadSources({ playerId, weekStart }),
    ]);
    if (!yearRes.ok) return <Feil navn={navn} melding={yearRes.error} />;
    return (
      <AgencyOSSkall navn={navn}><Arv>
        <WorkbenchAar planKontekst={kontekst.referanse} key={`${playerId}:${year}:${kontekst.referanse.periode ?? ""}`} playerId={playerId} roster={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
          spillerNavn={spillerNavn} aar={yearRes.data} kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} />
      </Arv></AgencyOSSkall>
    );
  }

  if (visning === "maned") {
    const monthStart = kontekst.monthStart;
    const [roster, monthRes, kilderRes] = await Promise.all([
      hentRoster(),
      loadMonth({ monthStart, mode, playerId }),
      loadSources({ playerId, weekStart }),
    ]);
    if (!monthRes.ok) return <Feil navn={navn} melding={monthRes.error} />;
    return (
      <AgencyOSSkall navn={navn}><Arv>
        <WorkbenchManed planKontekst={kontekst.referanse} key={`${playerId}:${monthStart}`} playerId={playerId} roster={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
          spillerNavn={spillerNavn} maned={monthRes.data} kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} />
      </Arv></AgencyOSSkall>
    );
  }

  if (visning === "periode") {
    const year = kontekst.year;
    const [roster, kilderRes] = await Promise.all([
      hentRoster(),
      loadSources({ playerId, weekStart }),
    ]);
    if (!periodRes?.ok) return <Feil navn={navn} melding={periodRes?.error ?? "Perioden kunne ikke lastes"} />;
    return (
      <AgencyOSSkall navn={navn}><Arv>
        <WorkbenchPeriode planKontekst={kontekst.referanse} key={`${playerId}:${year}:${periodRes.data.period?.id ?? "tom"}`} playerId={playerId} roster={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
          spillerNavn={spillerNavn} periode={periodRes.data} kilder={kilderRes.ok ? kilderRes.data : []} goals={goals} />
      </Arv></AgencyOSSkall>
    );
  }

  if (visning === "stall") {
    const stallRes = await loadStallFollowup({ weekStart, playerId });
    if (!stallRes.ok) return <Feil navn={navn} melding={stallRes.error} />;
    return (
      <AgencyOSSkall navn={navn}><Arv>
        <WorkbenchStall key={`${playerId}:${weekStart}:${sp.okt ?? "forste"}`} playerId={playerId} spillerNavn={spillerNavn} data={stallRes.data} selectedSessionId={kontekst.referanse.okt} />
      </Arv></AgencyOSSkall>
    );
  }

  if (visning === "live") {
    const liveRes = await loadWorkbenchLive({ weekStart, playerId, sessionId: kontekst.referanse.okt });
    if (!liveRes.ok) return <Feil navn={navn} melding={liveRes.error} />;
    return (
      <AgencyOSSkall navn={navn}><Arv live>
        <WorkbenchLive key={`${liveRes.data.current?.id ?? "ingen"}:${liveRes.data.next?.id ?? "ingen"}`} playerId={playerId} spillerNavn={spillerNavn} data={liveRes.data} planKontekst={kontekst.referanse} />
      </Arv></AgencyOSSkall>
    );
  }

  if (visning === "min") {
    const calendarRes = await loadMinCalendar({ weekStart, playerId });
    if (!calendarRes.ok) return <Feil navn={navn} melding={calendarRes.error} />;
    return (
      <AgencyOSSkall navn={navn}><Arv>
        <WorkbenchMinKalender key={`${playerId}:${weekStart}`} playerId={playerId} coachName={navn} data={calendarRes.data} planKontekst={kontekst.referanse} />
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
        planKontekst={kontekst.referanse}
        key={`${playerId}:${weekStart}:${visning}:${kontekst.referanse.okt ?? ""}`}
        playerId={playerId}
        spillerNavn={spillerNavn}
        uke={weekRes.data}
        kilder={kilderRes.ok ? kilderRes.data : []}
        roster={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
        grupper={grupper.map((g) => ({ id: g.id, navn: g.name }))}
        goals={goals}
        fys={fysTurnering}
        niva={visning === "mal" ? "mal" : visning === "vol" ? "vol" : visning === "okt" ? "okt" : "uke"}
        side={side}
        valgtOktId={kontekst.referanse.okt}
      />
    </AgencyOSSkall>
  );
}
