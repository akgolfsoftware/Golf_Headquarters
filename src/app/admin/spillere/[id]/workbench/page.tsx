/**
 * AgencyOS — Coach-Workbench (/admin/spillere/[id]/workbench), v2-design
 * (retning C).
 *
 * Auth + dataloader gjenbrukt 1:1 fra den forrige (legacy) siden:
 * requirePortalUser (ADMIN/COACH) + roster fra Prisma + loadWorkbenchContext,
 * inkl. ukeoffset via ?uke=. Spiller-id kommer fra ruten (params.id) —
 * notFound() hvis spilleren eller workbench-konteksten ikke finnes.
 *
 * Server component.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadWorkbenchContext } from "@/lib/workbench/load-context";
import { parseWeekOffset } from "@/lib/workbench/session-move-math";
import { publishWorkbenchPlan, hentPubliserDiff } from "@/lib/workbench/publish-actions";
import { coachApplyWorkbenchTemplate } from "@/lib/workbench/apply-template-actions";
import {
  coachAddWorkbenchSession,
  coachMoveWorkbenchSession,
  coachUpdateWorkbenchSession,
  coachRemoveWorkbenchSession,
  coachDuplicateWeek,
  coachDuplicateSession,
  coachHentNotater,
  coachLagreNotat,
  coachLagrePeriode,
  coachSlettPeriode,
} from "@/lib/workbench/session-actions";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import type { WorkbenchV2Actions } from "@/components/portal/v2/WorkbenchV2";
import {
  CoachWorkbenchMount,
  type CoachRosterPlayer,
} from "@/components/admin/v2/CoachWorkbenchMount";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ uke?: string }>;
};

export default async function CoachWorkbenchPage({ params, searchParams }: Props) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const coachName = user.name ?? "Anders Kristiansen";
  const { id } = await params;
  const weekOffset = parseWeekOffset((await searchParams).uke);

  // I0: selvbetjent spiller kan ikke åpnes i coach-workbench (porten).
  const spiller = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(user), { id }] },
    select: { name: true },
  });
  if (!spiller) notFound();

  const ctx = await loadWorkbenchContext(id, weekOffset);
  if (ctx === null) notFound();

  const rosterRows = await prisma.user
    .findMany({
      where: { AND: [coachScopedPlayerWhere(user), { deletedAt: null }] }, // I0: kun coachede spillere (PLATFORM_ONLY er usynlig i AgencyOS).
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 400,
    })
    .catch(() => []);
  const players: CoachRosterPlayer[] = rosterRows.map((p) => ({
    id: p.id,
    navn: p.name ?? "Uten navn",
  }));

  // 8c.3: gruppevelger — gruppens egen workbench/årsplan.
  const grupper = await prisma.group.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const actions: WorkbenchV2Actions = {
    addSession: coachAddWorkbenchSession.bind(null, id),
    moveSession: coachMoveWorkbenchSession.bind(null, id),
    updateSession: coachUpdateWorkbenchSession.bind(null, id),
    applyTemplate: coachApplyWorkbenchTemplate.bind(null, id),
    removeSession: coachRemoveWorkbenchSession.bind(null, id),
    publish: publishWorkbenchPlan.bind(null, id),
    publishDiff: hentPubliserDiff.bind(null, id),
    duplicateWeek: coachDuplicateWeek.bind(null, id),
    duplicateSession: coachDuplicateSession.bind(null, id),
    coachNotat: {
      hent: coachHentNotater.bind(null, id),
      lagre: coachLagreNotat.bind(null, id),
    },
    lagrePeriode: coachLagrePeriode.bind(null, id),
    slettPeriode: coachSlettPeriode.bind(null, id),
  };

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={coachName}>
      <CoachWorkbenchMount
        players={players}
        groups={grupper}
        currentPlayerId={id}
        playerName={spiller.name ?? "Uten navn"}
        coachName={coachName}
        data={ctx.data}
        insights={ctx.insights ?? null}
        planStatus={ctx.planStatus ?? null}
        actions={actions}
      />
    </V2Shell>
  );
}
