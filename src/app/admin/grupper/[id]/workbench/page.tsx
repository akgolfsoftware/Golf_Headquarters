/**
 * AgencyOS — GRUPPE-WORKBENCH, AG-11-GRUPPE og AG-11-GRUPPE-AR i nytt design
 * (pakke 4, natt 17.10.2026). Visningen er AG11GruppeNy.
 *
 * Som før: gruppens EGEN årsplan (group_period_blocks) med perioder som lagres
 * og slettes via coachLagreGruppePeriode/coachSlettGruppePeriode, og rulles ut
 * til medlemmene med coachRullUtGruppeAarsplan (Anders: gruppen har egen
 * periodisering, spillerne beholder individuelle planer). De faste tidene vises
 * under (lesevisning — timeplanen redigeres på gruppe-detalj).
 * Nytt: medlemslista med «Egen» for medlemmer som har perioder utenom gruppas
 * i samme tidsrom, lest fra deres PeriodBlock (sourceGroupId ≠ gruppa).
 */

import { editableGroupWhere, canWriteMemberPlans } from "@/lib/workbench/group-scope";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG11GruppeNy, type GruppeMedlem } from "@/components/admin/precision/AG11GruppeNy";
import { PERIODE_NAVN, type PeriodeArkPeriode } from "@/components/admin/precision/AG11PeriodeArk";
import { coachLagreGruppePeriode, coachSlettGruppePeriode, coachRullUtGruppeAarsplan } from "@/lib/workbench/gruppe-periode-actions";
import { parseAxisMinutes } from "@/lib/workbench/perioder";
import { dagNavnKort } from "@/lib/uke-helpers";
import { isoWeekNumber } from "@/lib/domain/workbench/operations";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gruppe-workbench · AgencyOS" };

const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  hour: "2-digit",
  minute: "2-digit",
});
const iso = (d: Date) => d.toISOString().slice(0, 10);

export default async function GruppeWorkbenchPage({ params }: { params: Promise<{ id: string }> }) {
  // G6: gruppe-workbench redigerer gruppens årsplan → EDIT_GROUP_PLANS.
  const user = await requireCapability(Capability.EDIT_GROUP_PLANS);
  const { id } = await params;

  const gruppe = await prisma.group.findFirst({
    where: { id, ...editableGroupWhere(user) },
    select: {
      id: true,
      name: true,
      _count: { select: { members: { where: { endedAt: null } } } },
      schedules: { select: { startAt: true, endAt: true, location: true }, orderBy: { startAt: "asc" }, take: 6 },
    },
  });
  if (!gruppe) notFound();

  const [blokker, medlemmerRad, grupper, kanRulleUt] = await Promise.all([
    prisma.groupPeriodBlock.findMany({
      where: { groupId: id },
      orderBy: { startDate: "asc" },
      select: { id: true, lPhase: true, startDate: true, endDate: true, focus: true, notes: true, axisMinutes: true, axisMinutesLight: true },
    }),
    prisma.groupMember.findMany({
      where: { groupId: id, role: "PLAYER", endedAt: null, user: { role: "PLAYER", deletedAt: null } },
      select: { userId: true, user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    // Samme eierskap som /admin/grupper: en coach ser gruppene hun eier, admin alle.
    prisma.group.findMany({
      where: user.role === "COACH" ? { coachId: user.id } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    canWriteMemberPlans(user, id),
  ]);

  const perioder: PeriodeArkPeriode[] = blokker.map((b) => ({
    id: b.id, type: b.lPhase, startDate: iso(b.startDate), endDate: iso(b.endDate), focus: b.focus, notat: b.notes,
    axisMinutes: parseAxisMinutes(b.axisMinutes), axisMinutesLight: parseAxisMinutes(b.axisMinutesLight),
  }));

  // «Egen»: perioder medlemmet har i gruppas tidsrom som ikke kommer fra denne gruppa.
  const fra = blokker[0]?.startDate, til = blokker[blokker.length - 1]?.endDate;
  const egne = fra && til && medlemmerRad.length > 0
    ? await prisma.periodBlock.findMany({
      where: { seasonPlan: { userId: { in: medlemmerRad.map((m) => m.userId) } }, startDate: { lte: til }, endDate: { gte: fra }, OR: [{ sourceGroupId: null }, { sourceGroupId: { not: id } }] },
      select: { lPhase: true, startDate: true, seasonPlan: { select: { userId: true } } },
      orderBy: { startDate: "asc" },
    })
    : [];
  const medlemmer: GruppeMedlem[] = medlemmerRad.map((m) => {
    const egen = egne.find((e) => e.seasonPlan.userId === m.userId);
    return { id: m.userId, navn: m.user.name ?? "Ukjent", egen: egen ? `Egen ${PERIODE_NAVN[egen.lPhase]} fra uke ${isoWeekNumber(iso(egen.startDate))}` : null };
  });

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG11GruppeNy
        gruppe={{ id: gruppe.id, navn: gruppe.name, medlemmer: gruppe._count.members }}
        grupper={grupper.map((g) => ({ id: g.id, navn: g.name }))}
        perioder={perioder}
        medlemmer={medlemmer}
        kanRulleUt={kanRulleUt}
        faste={gruppe.schedules.map((s, i) => ({
          id: String(i),
          dag: dagNavnKort(s.startAt),
          tid: `${OSLO_TID.format(s.startAt)}–${OSLO_TID.format(s.endAt)}`,
          sted: s.location,
        }))}
        onLagre={coachLagreGruppePeriode.bind(null, gruppe.id)}
        onSlett={coachSlettGruppePeriode.bind(null, gruppe.id)}
        onRullUt={coachRullUtGruppeAarsplan.bind(null, gruppe.id)}
      />
    </AgencyOSSkall>
  );
}
