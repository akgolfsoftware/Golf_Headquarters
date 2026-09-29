/**
 * AgencyOS — GRUPPE-WORKBENCH (8c.3), AG-11-GRUPPE i Precision Athletics.
 * Skallet og rammen er portert (AG11Gruppe); gruppas årsplan er uendret.
 * Opprinnelig (8c.3): gruppens EGEN årsplan på samme
 * canvas som spillerens (WorkbenchAarsplan gjenbrukt 1:1 — Anders:
 * gruppen har egen periodisering, spillerne beholder individuelle planer).
 * Perioder-paletten står i venstre kolonne; gruppens faste tider vises
 * under canvaset (lesevisning — timeplanen redigeres på gruppe-detalj).
 */

import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG11Gruppe } from "@/components/admin/precision/AG11Gruppe";
import { TL_SCOPE } from "@/components/workbench/wb-tl-scope";
import { GruppeAarsplanKlient } from "./gruppe-aarsplan-klient";
import { coachLagreGruppePeriode, coachSlettGruppePeriode, coachRullUtGruppeAarsplan } from "@/lib/workbench/gruppe-periode-actions";
import { parseSessionBudget } from "@/lib/workbench/perioder";
import { dagNavnKort } from "@/lib/uke-helpers";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gruppe-workbench · AgencyOS" };

const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function GruppeWorkbenchPage({ params }: { params: Promise<{ id: string }> }) {
  // G6: gruppe-workbench redigerer gruppens årsplan → EDIT_GROUP_PLANS.
  const user = await requireCapability(Capability.EDIT_GROUP_PLANS);
  const { id } = await params;

  const gruppe = await prisma.group.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
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
    where: user.role === "COACH" ? { coachId: user.id } : {},
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG11Gruppe
        gruppe={{ id: gruppe.id, navn: gruppe.name, medlemmer: gruppe._count.members }}
        grupper={grupper.map((g) => ({ id: g.id, navn: g.name }))}
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
    </AgencyOSSkall>
  );
}
