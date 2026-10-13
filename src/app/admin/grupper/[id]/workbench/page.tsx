/**
 * AgencyOS — GRUPPE-WORKBENCH (8c.3), AG-11-GRUPPE i Precision Athletics.
 * Skallet og rammen er portert (AG11Gruppe); gruppas årsplan er uendret.
 * Opprinnelig (8c.3): gruppens EGEN årsplan på samme
 * canvas som spillerens (WorkbenchAarsplan gjenbrukt 1:1 — Anders:
 * gruppen har egen periodisering, spillerne beholder individuelle planer).
 * Perioder-paletten står i venstre kolonne; gruppens faste tider vises
 * under canvaset (lesevisning — timeplanen redigeres på gruppe-detalj).
 */

import { editableGroupWhere } from "@/lib/workbench/group-scope";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { GroupContextShell } from "@/components/admin/precision/grupper/GroupContextShell";
import { AG11Gruppe } from "@/components/admin/precision/AG11Gruppe";
import { TL_SCOPE } from "@/components/workbench/wb-tl-scope";
import { GruppeAarsplanKlient } from "./gruppe-aarsplan-klient";
import { coachLagreGruppePeriode, coachSlettGruppePeriode, coachRullUtGruppeAarsplan } from "@/lib/workbench/gruppe-periode-actions";
import { parseSessionBudget } from "@/lib/workbench/perioder";
import { dagNavnKort } from "@/lib/uke-helpers";
import { osloPlanDato } from "@/lib/workbench/plan-kontekst";
import { RullUtMalPanel } from "@/components/admin/v2/RullUtMalPanel";
import { GruppeMalPublisering } from "@/components/admin/v2/GruppeMalPublisering";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gruppe-workbench · AgencyOS" };

const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function GruppeWorkbenchPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ maned?: string; niva?: string; mal?: string }> }) {
  // G6: gruppe-workbench redigerer gruppens årsplan → EDIT_GROUP_PLANS.
  const user = await requireCapability(Capability.EDIT_GROUP_PLANS);
  const { id } = await params;
  const query = await searchParams;
  const month = query.maned && /^\d{4}-(0[1-9]|1[0-2])$/.test(query.maned) && Number(query.maned.slice(0, 4)) >= 1900 && Number(query.maned.slice(0, 4)) <= 9998 ? query.maned : osloPlanDato().slice(0, 7);

  const gruppe = await prisma.group.findFirst({
    where: { id, ...editableGroupWhere(user) },
    select: {
      id: true,
      name: true, slug: true, program: true,
      _count: { select: { members: { where: { endedAt: null } } } },
      schedules: { select: { startAt: true, endAt: true, location: true }, orderBy: { startAt: "asc" }, take: 6 },
    },
  });
  if (!gruppe) notFound();

  const blokker = await prisma.groupPeriodBlock.findMany({
    where: { groupId: id },
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      lPhase: true,
      startDate: true,
      endDate: true,
      focus: true,
      weeklyVolMin: true,
      weeklyVolMax: true,
      weeklySessionBudget: true,
    },
  });

  const seasonBlocks = blokker.map((b) => ({
    id: b.id,
    lPhase: b.lPhase,
    startDate: b.startDate.toISOString(),
    endDate: b.endDate.toISOString(),
    focus: b.focus,
    weeklyVolMin: b.weeklyVolMin,
    weeklyVolMax: b.weeklyVolMax,
    budsjett: parseSessionBudget(b.weeklySessionBudget),
  }));

  // Samme eierskap som /admin/grupper: en coach ser gruppene hun eier, admin alle.
  const grupper = await prisma.group.findMany({
    where: editableGroupWhere(user),
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const maler = await prisma.planTemplate.findMany({ where: { approved: true }, orderBy: { name: "asc" },
    select: { id: true, name: true, varighetUker: true, _count: { select: { sessions: true } } } });
  const gruppeokter = await prisma.workbenchSession.findMany({ where: { groupId: id, origin: "GROUP", sourceGroupSessionId: null,
    id: { startsWith: "wb-group-" }, date: { gte: new Date(`${osloPlanDato()}T00:00:00Z`) }, status: { in: ["DRAFT","SCHEDULED","PUBLISHED"] } },
    orderBy: [{ date: "asc" },{ startMinute: "asc" }], take: 101,
    select: { id: true, title: true, date: true, startMinute: true, durationMinutes: true, status: true } });

  return (
    <GroupContextShell group={gruppe} user={user}>
      <AG11Gruppe
        key={`${gruppe.id}:${month}:${query.niva}`}
        initialMonth={month}
        initialMode={query.niva === "maned" ? "maned" : "aar"}
        gruppe={{ id: gruppe.id, navn: gruppe.name, medlemmer: gruppe._count.members }}
        grupper={grupper.map((g) => ({ id: g.id, navn: g.name }))}
        malUtrulling={<><RullUtMalPanel groupId={gruppe.id} maler={maler.map(m => ({ ...m, sessionCount: m._count.sessions }))} initialTemplateId={query.mal} /><GruppeMalPublisering groupId={gruppe.id} rows={gruppeokter.slice(0,100).map(s => ({ ...s, date: s.date.toISOString().slice(0,10) }))} flere={gruppeokter.length > 100} /></>}
        faste={gruppe.schedules.map((s, i) => ({
          id: String(i),
          dag: dagNavnKort(s.startAt),
          tid: `${OSLO_TID.format(s.startAt)}–${OSLO_TID.format(s.endAt)}`,
          sted: s.location,
        }))}
        aarsplan={
          <div style={TL_SCOPE}>
            <GruppeAarsplanKlient
              gruppeNavn={gruppe.name}
              medlemmer={gruppe._count.members}
              seasonBlocks={seasonBlocks}
              onLagre={coachLagreGruppePeriode.bind(null, gruppe.id)}
              onSlett={coachSlettGruppePeriode.bind(null, gruppe.id)}
              onRullUt={coachRullUtGruppeAarsplan.bind(null, gruppe.id)}
            />
          </div>
        }
      />
    </GroupContextShell>
  );
}
