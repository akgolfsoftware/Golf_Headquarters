/**
 * AgencyOS — Workbench (coach-variant).
 *
 * Samme motor som spilleren (WorkbenchV2) — se .claude/rules/beslutninger.md
 * §WORKBENCH-MOTOREN (15.09.2026): spillerens WorkbenchV2 er DEN ENE
 * Workbench-motoren, coach får den med stall-velger + gruppevelger oppå
 * (CoachWorkbenchMount). Den gamle uke-only WorkbenchUke er erstattet her.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { loadWorkbenchContext } from "@/lib/workbench/load-context";
import { parseWeekOffset } from "@/lib/workbench/session-move-math";
import { lesPreferences } from "@/lib/preferences";
import { hentSpillerSteder } from "@/lib/workbench/spiller-steder";
import { CoachWorkbenchMount } from "@/components/admin/v2/CoachWorkbenchMount";
import type { WorkbenchV2Actions } from "@/components/portal/v2/WorkbenchV2";
import {
  coachAddWorkbenchSession,
  coachMoveWorkbenchSession,
  coachUpdateWorkbenchSession,
  coachRemoveWorkbenchSession,
  coachDuplicateWeek,
  coachLagrePeriode,
  coachSlettPeriode,
  coachDuplicateSession,
  coachHentNotater,
  coachLagreNotat,
} from "@/lib/workbench/session-actions";
import { publishWorkbenchPlan, hentPubliserDiff } from "@/lib/workbench/publish-actions";
import { coachApplyWorkbenchTemplate } from "@/lib/workbench/apply-template-actions";
import { coachSokTekniskOppgaver } from "@/lib/workbench/teknisk-oppgave-sok";
import { coachBekreftTurneringEntry } from "@/lib/workbench/turnering-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ playerId: string }>;
  searchParams: Promise<{ uke?: string }>;
};

export default async function CoachWorkbenchPage({ params, searchParams }: Props) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { playerId } = await params;
  const sp = await searchParams;

  const spiller = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(user), { id: playerId }] },
    select: { id: true, name: true },
  });
  if (!spiller) notFound();

  const [roster, groups] = await Promise.all([
    prisma.user.findMany({
      where: coachScopedPlayerWhere(user),
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.group.findMany({
      where: user.role === "COACH" ? { coachId: user.id } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const weekOffset = parseWeekOffset(sp.uke);
  const [ctx, { wbMode }, steder] = await Promise.all([
    loadWorkbenchContext(playerId, weekOffset, { viewer: "coach" }),
    Promise.resolve(lesPreferences(user)),
    hentSpillerSteder(playerId),
  ]);

  const actions: WorkbenchV2Actions = {
    addSession: coachAddWorkbenchSession.bind(null, playerId),
    moveSession: coachMoveWorkbenchSession.bind(null, playerId),
    updateSession: coachUpdateWorkbenchSession.bind(null, playerId),
    removeSession: coachRemoveWorkbenchSession.bind(null, playerId),
    // 8c.5: publish/publishDiff tar playerId som første argument for coach —
    // samme funksjon som spillerens (den binder undefined der i stedet).
    publish: publishWorkbenchPlan.bind(null, playerId),
    publishDiff: hentPubliserDiff.bind(null, playerId),
    duplicateWeek: coachDuplicateWeek.bind(null, playerId),
    duplicateSession: coachDuplicateSession.bind(null, playerId),
    lagrePeriode: coachLagrePeriode.bind(null, playerId),
    slettPeriode: coachSlettPeriode.bind(null, playerId),
    applyTemplate: (templateId: string) => coachApplyWorkbenchTemplate(playerId, templateId),
    searchTeknisk: coachSokTekniskOppgaver.bind(null, playerId),
    bekreftTurnering: coachBekreftTurneringEntry.bind(null, playerId),
    coachNotat: {
      hent: coachHentNotater.bind(null, playerId),
      lagre: coachLagreNotat.bind(null, playerId),
    },
    // acceptPlan/rejectPlan og suggestWeek/applySuggestion er spiller-eksklusive
    // (jf. kommentarene i WorkbenchV2Sheets.tsx) — utelatt her skjuler knappene.
  };

  return (
    <V2Shell bredde="full" aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? undefined}>
      <CoachWorkbenchMount
        players={roster.map((p) => ({ id: p.id, navn: p.name ?? "Ukjent" }))}
        groups={groups}
        currentPlayerId={playerId}
        playerName={spiller.name ?? "Ukjent"}
        coachName={user.name ?? "Coach"}
        data={ctx?.data}
        insights={ctx?.insights ?? null}
        planStatus={ctx?.planStatus ?? null}
        actions={actions}
        wbMode={wbMode}
        steder={steder}
      />
    </V2Shell>
  );
}
