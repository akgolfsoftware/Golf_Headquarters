"use server";
import { randomUUID } from "node:crypto";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { FlyttPlanOktSchema, KopierPlanOktSchema, type FlyttPlanOktInput, type KopierPlanOktInput } from "./plan-handlinger-kontrakt";
import { planTilgang, revaliderPlan } from "./plan-tilgang";
import { tilDatoKolonne, fraDatoKolonne } from "./wb-map";
import { canReadOwnGroupCopy } from "./group-scope";
import { signerPlanAngre, lesPlanAngre, planAngreTilgjengelig } from "./plan-angre-token";
import type { WbRow } from "./wb-map";
import { lockedBlockOverlap } from "./locked-blocks";
import { addDays } from "@/lib/domain/workbench/operations";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
const STALE = "Økten er endret eller utilgjengelig. Last inn på nytt før du prøver igjen.";
function lesbar(row: WbRow | null, actorId: string): row is WbRow {
  return Boolean(row && !(row.groupId && !row.sourceGroupSessionId && /^wb-group-[a-f0-9]{64}$/.test(row.id)) && (actorId !== row.playerId || canReadOwnGroupCopy(row)));
}
function flyttbar(row: WbRow) {
  return ["DRAFT", "SCHEDULED", "PUBLISHED"].includes(row.status) && row.actualMinutes === null && row.perceivedEffort === null && row.liveSnapshot === null && !row.isTemplate;
}
async function kollisjoner(tx: Prisma.TransactionClient, playerId: string, exclude: string, date: string, start: number, duration: number) {
  const rows = await tx.workbenchSession.findMany({ where: { playerId, id: { not: exclude }, date: tilDatoKolonne(date), isTemplate: false, status: { notIn: ["CANCELLED", "SKIPPED", "ABANDONED"] } }, select: { startMinute: true, durationMinutes: true } });
  const range = { startAt: { lt: tilDatoKolonne(addDays(date, 1)) }, OR: [{ endAt: { gt: tilDatoKolonne(date) } }, { recurring: "WEEKLY" }] };
  const personal = await tx.playerBusyBlock.findMany({ where: { userId: playerId, ...range },
    select: { id: true, title: true, startAt: true, endAt: true, recurring: true, isPrivate: true, kind: true } });
  const groups = await tx.groupSchedule.findMany({ where: { ...range,
    group: { arkivertAt: null, members: { some: { ...aktivtSpillerMedlemskapWhere(), userId: playerId } } } },
    select: { id: true, title: true, startAt: true, endAt: true, recurring: true, kind: true } });
  const day = tilDatoKolonne(date);
  const tournaments = await tx.workbenchTournamentPlan.findMany({ where: { playerId, status: { notIn: ["WITHDRAWN", "ARCHIVED"] },
    OR: [{ startDate: { lte: day }, endDate: { gte: day } }, { travelStartDate: { lte: day }, travelEndDate: { gte: day } }] },
    select: { id: true, title: true, startDate: true, endDate: true, travelStartDate: true, travelEndDate: true } });
  const timed = lockedBlockOverlap(date, start, duration, [...personal,
    ...groups.map(row => ({ ...row, isPrivate: false, kind: row.kind ?? "SAMLING" }))]);
  const allDay = tournaments.reduce((count, row) => count
    + Number(row.startDate <= day && row.endDate >= day)
    + Number(row.travelStartDate !== null && row.travelEndDate !== null && row.travelStartDate <= day && row.travelEndDate >= day), 0);
  return rows.filter(r => r.startMinute < start + duration && start < r.startMinute + r.durationMinutes).length
    + timed + allDay;
}
export async function flyttWorkbenchPlanOkt(input: FlyttPlanOktInput) {
  const p = FlyttPlanOktSchema.safeParse(input); if (!p.success) return { ok: false as const, error: p.error.issues[0]?.message ?? "Ugyldig flytting." };
  const v = p.data, actor = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] }), viewer = await planTilgang(v.playerId);
  if (!viewer || viewer.id !== actor.id) return { ok: false as const, error: "Ingen tilgang." };
  if (viewer.id !== v.playerId) return { ok: false as const, error: "Treneren kan sende et forslag som kopi. Den opprinnelige økten flyttes bare av spilleren." };
  if (!planAngreTilgjengelig()) return { ok: false as const, error: "Angre er ikke tilgjengelig i dette miljøet. Handlingen er ikke lagret." };
  try {
    const result = await prisma.$transaction(async tx => {
      const row = await tx.workbenchSession.findFirst({ where: { id: v.sessionId, playerId: v.playerId }, include: { drills: true } });
      if (!lesbar(row, viewer.id) || row.updatedAt.toISOString() !== v.expectedUpdatedAt) return { ok: false as const, error: STALE };
      if (!flyttbar(row)) return { ok: false as const, error: "Gjennomføring, maler og historikk flyttes ikke. Lag en utkastkopi." };
      const before = { date: fraDatoKolonne(row.date), startMinute: row.startMinute, durationMinutes: row.durationMinutes, status: row.status, localOverride: row.localOverride };
      const conflicts = await kollisjoner(tx, v.playerId, row.id, v.date, v.startMinute, v.durationMinutes);
      const updatedAt = new Date(Math.max(Date.now(), row.updatedAt.getTime() + 1));
      const lock = await tx.workbenchSession.updateMany({ where: { id: row.id, playerId: v.playerId, updatedAt: row.updatedAt, status: row.status, actualMinutes: null, perceivedEffort: null },
        data: { date: tilDatoKolonne(v.date), startMinute: v.startMinute, durationMinutes: v.durationMinutes, updatedAt,
          ...(conflicts ? { status: "DRAFT" } : {}), ...(row.sourceGroupSessionId ? { localOverride: true } : {}) } });
      if (lock.count !== 1) throw new Error(STALE);
      const undo = signerPlanAngre({ version: 1, actorId: viewer.id, playerId: v.playerId, expires: Date.now() + 15 * 60000, rows: [{ id: row.id, updatedAt: updatedAt.toISOString() }],
        before });
      return { ok: true as const, undo, ids: [row.id], conflicts, draft: Boolean(conflicts) };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (result.ok) revaliderPlan(v.playerId); return result;
  } catch { return { ok: false as const, error: "Flyttingen kunne ikke lagres. Økten er bevart; last inn på nytt." }; }
}
export async function kopierWorkbenchPlanOkt(input: KopierPlanOktInput) {
  const p = KopierPlanOktSchema.safeParse(input); if (!p.success) return { ok: false as const, error: p.error.issues[0]?.message ?? "Ugyldig kopiering." };
  const v = p.data, actor = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] }), viewer = await planTilgang(v.playerId);
  if (!viewer || viewer.id !== actor.id) return { ok: false as const, error: "Ingen tilgang." };
  if (!planAngreTilgjengelig()) return { ok: false as const, error: "Angre er ikke tilgjengelig i dette miljøet. Handlingen er ikke lagret." };
  try {
    const result = await prisma.$transaction(async tx => {
      const row = await tx.workbenchSession.findFirst({ where: { id: v.sessionId, playerId: v.playerId }, include: { drills: true } });
      if (!lesbar(row, viewer.id) || row.updatedAt.toISOString() !== v.expectedUpdatedAt) return { ok: false as const, error: STALE };
      if (v.startMinute + row.durationMinutes > 1440) return { ok: false as const, error: "Økten må avsluttes innen samme kalenderdag." };
      const locked = await tx.workbenchSession.updateMany({ where: { id: row.id, playerId: v.playerId, updatedAt: row.updatedAt, status: row.status }, data: { updatedAt: row.updatedAt } });
      if (locked.count !== 1) throw new Error(STALE);
      const created = [], seriesId = v.dates.length > 1 ? randomUUID() : null;
      let conflicts = 0;
      for (const [i, date] of v.dates.entries()) {
        conflicts += await kollisjoner(tx, v.playerId, "", date, v.startMinute, row.durationMinutes);
        const copy = await tx.workbenchSession.create({ data: {
          playerId: v.playerId, coachId: viewer.id, date: tilDatoKolonne(date), startMinute: v.startMinute, durationMinutes: row.durationMinutes,
          title: row.title, pyramid: row.pyramid, blockType: row.blockType, environment: row.environment, practiceType: row.practiceType,
          location: row.location, notes: row.notes, rationale: row.rationale, skillArea: row.skillArea, pressureLevel: row.pressureLevel,
          pPosisjoner: row.pPosisjoner, maalsetning: row.maalsetning, lFase: row.lFase, miljo: row.miljo, csNivaa: row.csNivaa,
          status: "DRAFT", origin: viewer.id === v.playerId ? "PLAYER" : "COACH", createdBy: viewer.id,
          needsPlayerApproval: viewer.id !== v.playerId, approvalStatus: viewer.id === v.playerId ? null : "PENDING",
          seriesId, seriesIndex: seriesId ? i : null,
          drills: { create: row.drills.map(d => ({ title: d.title, description: d.description, durationMinutes: d.durationMinutes, akFormel: d.akFormel === null ? Prisma.JsonNull : d.akFormel,
            techniqueFocus: d.techniqueFocus, sourceId: d.sourceId, sortOrder: d.sortOrder, exerciseId: d.exerciseId, positionTaskId: d.positionTaskId,
            repType: d.repType, repAntall: d.repAntall, repMinutter: d.repMinutter, repSett: d.repSett, repReps: d.repReps,
            planRepsUtenBall: d.planRepsUtenBall, planRepsLavFart: d.planRepsLavFart, planRepsAuto: d.planRepsAuto })) },
        }, select: { id: true, updatedAt: true } });
        created.push({ id: copy.id, updatedAt: copy.updatedAt.toISOString() });
      }
      const undo = signerPlanAngre({ version: 1, actorId: viewer.id, playerId: v.playerId, expires: Date.now() + 15 * 60000, rows: created });
      return { ok: true as const, ids: created.map(r => r.id), undo, conflicts, draft: true };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (result.ok) revaliderPlan(v.playerId); return result;
  } catch { return { ok: false as const, error: "Kopieringen kunne ikke lagres. Originalen er bevart; last inn på nytt." }; }
}
export async function angreWorkbenchPlanHandling(token: string) {
  if (typeof token !== "string" || token.length > 20000) return { ok: false as const, error: "Ugyldig angrehandling." };
  // Token avgrenses deretter både til aktøren og spillertilgangen på nytt.
  const viewer = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const payload = lesPlanAngre(token, viewer.id);
  if (!payload || !await planTilgang(payload.playerId)) return { ok: false as const, error: "Angre er utløpt eller utilgjengelig." };
  try {
    const result = await prisma.$transaction(async tx => {
      for (const reference of payload.rows) {
        const row = await tx.workbenchSession.findFirst({ where: { id: reference.id, playerId: payload.playerId }, include: { drills: true } });
        if (!lesbar(row, viewer.id) || !flyttbar(row) || row.updatedAt.toISOString() !== reference.updatedAt) throw new Error(STALE);
        const updatedAt = new Date(Math.max(Date.now(), row.updatedAt.getTime() + 1));
        const data = payload.before ? { ...payload.before, date: tilDatoKolonne(payload.before.date), updatedAt } : { status: "CANCELLED", updatedAt };
        const write = await tx.workbenchSession.updateMany({ where: { id: row.id, playerId: payload.playerId, updatedAt: row.updatedAt, status: row.status, actualMinutes: null, perceivedEffort: null }, data });
        if (write.count !== 1) throw new Error(STALE);
      }
      return { ok: true as const };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (result.ok) revaliderPlan(payload.playerId); return result;
  } catch { return { ok: false as const, error: "Angre kunne ikke utføres. En økt er endret eller startet; dataene er bevart." }; }
}
