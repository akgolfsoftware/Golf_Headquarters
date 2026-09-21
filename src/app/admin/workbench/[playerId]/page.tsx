/**
 * AgencyOS Workbench — coach. Kroppen er WorkbenchUke (lov: 8 piller,
 * inspector 340, rust Publiser, sand, formel 8). WorkbenchV2 er ikke fasit.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { WorkbenchShell } from "@/components/workbench/WorkbenchShell";
import { WorkbenchAar } from "@/components/workbench/WorkbenchAar";
import { WorkbenchPeriode } from "@/components/workbench/WorkbenchPeriode";
import { WorkbenchManed } from "@/components/workbench/WorkbenchManed";
import { WorkbenchOkt } from "@/components/workbench/WorkbenchOkt";
import { WorkbenchStall } from "@/components/workbench/WorkbenchStall";
import { WorkbenchLive } from "@/components/workbench/WorkbenchLive";
import { WorkbenchMinKalender } from "@/components/workbench/WorkbenchMinKalender";
import { WorkbenchUke } from "@/components/workbench/WorkbenchUke";
import { loadMinCalendar, loadMonth, loadPeriod, loadStallFollowup, loadWeek, loadWorkbenchLive, loadYear, loadSources } from "@/lib/workbench/wb-actions";
import { mondayOf } from "@/lib/domain/workbench/operations";
import { parseWeekOffset } from "@/lib/workbench/session-move-math";
import { parseVisning } from "@/lib/workbench/visning-url";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ playerId: string }>;
  searchParams: Promise<{ uke?: string; vis?: string; aar?: string; maned?: string; periode?: string; okt?: string }>;
};

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

export default async function CoachWorkbenchPage({ params, searchParams }: Props) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { playerId } = await params;
  const sp = await searchParams;

  const spiller = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(user), { id: playerId }] },
    select: { id: true, name: true },
  });
  if (!spiller) notFound();

  const weekStart = ukeStartFraParam(sp.uke);
  const mode = { kind: "AGENCY" as const, subjectId: playerId, sources: [] };
  const visning = parseVisning(sp.vis);

  if (visning === "aar") {
    const year = aarFraParam(sp.aar);
    const [roster, yearRes, kilderRes] = await Promise.all([
      prisma.user.findMany({
        where: coachScopedPlayerWhere(user),
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      loadYear({ year, mode, playerId }),
      loadSources({ playerId, weekStart: `${year}-01-01` }),
    ]);
    if (!yearRes.ok) {
      return <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId}><p style={{ padding: 24 }}>{yearRes.error}</p></WorkbenchShell>;
    }
    return (
      <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId}>
        <WorkbenchAar
          key={`${playerId}:${year}`}
          playerId={playerId}
          roster={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
          spillerNavn={spiller.name ?? "Ukjent"}
          aar={yearRes.data}
          kilder={kilderRes.ok ? kilderRes.data : []}
        />
      </WorkbenchShell>
    );
  }

  if (visning === "maned") {
    const monthStart = manedFraParam(sp.maned);
    const [roster, monthRes, kilderRes] = await Promise.all([
      prisma.user.findMany({
        where: coachScopedPlayerWhere(user),
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      loadMonth({ monthStart, mode, playerId }),
      loadSources({ playerId, weekStart: mondayOf(monthStart) }),
    ]);
    if (!monthRes.ok) {
      return <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId}><p style={{ padding: 24 }}>{monthRes.error}</p></WorkbenchShell>;
    }
    return (
      <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId}>
        <WorkbenchManed
          key={`${playerId}:${monthStart}`}
          playerId={playerId}
          roster={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
          spillerNavn={spiller.name ?? "Ukjent"}
          maned={monthRes.data}
          kilder={kilderRes.ok ? kilderRes.data : []}
        />
      </WorkbenchShell>
    );
  }

  if (visning === "periode") {
    const year = aarFraParam(sp.aar);
    const [roster, periodRes, kilderRes] = await Promise.all([
      prisma.user.findMany({
        where: coachScopedPlayerWhere(user),
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      loadPeriod({ year, periodId: sp.periode, mode, playerId }),
      loadSources({ playerId, weekStart }),
    ]);
    if (!periodRes.ok) {
      return <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId}><p style={{ padding: 24 }}>{periodRes.error}</p></WorkbenchShell>;
    }
    return (
      <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId}>
        <WorkbenchPeriode
          key={`${playerId}:${year}:${periodRes.data.period?.id ?? "tom"}`}
          playerId={playerId}
          roster={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
          spillerNavn={spiller.name ?? "Ukjent"}
          periode={periodRes.data}
          kilder={kilderRes.ok ? kilderRes.data : []}
        />
      </WorkbenchShell>
    );
  }

  if (visning === "stall") {
    const stallRes = await loadStallFollowup({ weekStart, playerId });
    if (!stallRes.ok) {
      return <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId}><p style={{ padding: 24 }}>{stallRes.error}</p></WorkbenchShell>;
    }
    return (
      <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId}>
        <WorkbenchStall
          key={`${playerId}:${weekStart}:${sp.okt ?? "forste"}`}
          playerId={playerId}
          spillerNavn={spiller.name ?? "Ukjent"}
          data={stallRes.data}
          selectedSessionId={sp.okt}
        />
      </WorkbenchShell>
    );
  }

  if (visning === "live") {
    const liveRes = await loadWorkbenchLive({ weekStart, playerId });
    if (!liveRes.ok) {
      return <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId} surface="live"><p className="wb-live-load-error">{liveRes.error}</p></WorkbenchShell>;
    }
    return (
      <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId} surface="live">
        <WorkbenchLive key={liveRes.data.current?.id ?? "ingen-pagaaende"} playerId={playerId} spillerNavn={spiller.name ?? "Ukjent"} data={liveRes.data} />
      </WorkbenchShell>
    );
  }

  if (visning === "min") {
    const calendarRes = await loadMinCalendar({ weekStart, playerId });
    if (!calendarRes.ok) {
      return <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId}><p style={{ padding: 24 }}>{calendarRes.error}</p></WorkbenchShell>;
    }
    return (
      <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId}>
        <WorkbenchMinKalender key={`${playerId}:${weekStart}`} playerId={playerId} coachName={user.name ?? "Coach"} data={calendarRes.data} />
      </WorkbenchShell>
    );
  }

  const [roster, weekRes, kilderRes] = await Promise.all([
    prisma.user.findMany({
      where: coachScopedPlayerWhere(user),
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    loadWeek({ weekStart, mode, playerId }),
    loadSources({ playerId, weekStart }),
  ]);

  if (!weekRes.ok) {
    return (
      <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId}>
        <p style={{ padding: 24 }}>{weekRes.error}</p>
      </WorkbenchShell>
    );
  }

  if (visning === "okt") {
    return (
      <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId}>
        <WorkbenchOkt
          key={`${playerId}:${weekStart}:${sp.okt ?? "forste"}`}
          playerId={playerId}
          roster={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
          spillerNavn={spiller.name ?? "Ukjent"}
          uke={weekRes.data}
          selectedSessionId={sp.okt}
          kilder={kilderRes.ok ? kilderRes.data : []}
        />
      </WorkbenchShell>
    );
  }

  return (
    <WorkbenchShell coachName={user.name ?? "Coach"} playerId={playerId}>
      <WorkbenchUke
        key={`${playerId}:${weekStart}`}
        playerId={playerId}
        roster={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
        spillerNavn={spiller.name ?? "Ukjent"}
        uke={weekRes.data}
        kilder={kilderRes.ok ? kilderRes.data : []}
      />
    </WorkbenchShell>
  );
}
