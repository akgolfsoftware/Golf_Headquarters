"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { requireSpillerActionUser } from "@/lib/auth/action-guards";
import { assertCapability } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import { AkFormelLeseSchema } from "@/lib/domain/workbench/schemas";
import { tilDatoKolonne } from "./wb-map";
import { canEditGroup } from "./group-scope";
import { lastPlanKalenderBlokker } from "./plan-kalender-data";
import {
  datoIOslo,
  samlingsInvitasjonId,
  samlingsOktKopiId,
  SamlingsprogramSchema,
  type Samlingsprogram,
  hashSamlingsprogram,
} from "./samlingsinvitasjon-kontrakt";

const ACTION_TYPE = "WORKBENCH_GATHERING_INVITE";
const IdInput = z.object({ id: z.string().min(1).max(200) });
const SvarInput = z.object({
  id: z.string().min(1).max(200),
  beslutning: z.enum(["ACCEPTED", "REJECTED"]),
});

type Tx = Prisma.TransactionClient;

async function trener() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await assertCapability(user, Capability.EDIT_GROUP_PLANS);
  return user;
}

function hash(value: string) { return createHash("sha256").update(value).digest("hex"); }

function mapProgramSession(row: {
  id: string; updatedAt: Date; date: Date; startMinute: number; durationMinutes: number; title: string;
  pyramid: string; blockType: string; environment: string | null; practiceType: string | null;
  skillArea: string | null; pressureLevel: string | null; pPosisjoner: string[];
  location: string | null; maalsetning: string | null;
  drills: Array<{
    id: string; title: string; description: string | null; durationMinutes: number; akFormel: unknown;
    techniqueFocus: string | null; sortOrder: number; sourceId: string | null; exerciseId: string | null;
    positionTaskId: string | null; repType: string | null; repAntall: number | null; repMinutter: number | null;
    repSett: number | null; repReps: number | null;
    planRepsUtenBall: number | null; planRepsLavFart: number | null; planRepsAuto: number | null;
  }>;
}) {
  return {
    sourceSessionId: row.id,
    updatedAt: row.updatedAt.toISOString(),
    date: row.date.toISOString().slice(0, 10),
    startMinute: row.startMinute,
    durationMinutes: row.durationMinutes,
    title: row.title,
    pyramid: row.pyramid,
    blockType: row.blockType,
    environment: row.environment,
    practiceType: row.practiceType,
    skillArea: row.skillArea,
    pressureLevel: row.pressureLevel,
    pPosisjoner: row.pPosisjoner,
    location: row.location,
    maalsetning: row.maalsetning,
    drills: [...row.drills].sort((a, b) => a.sortOrder - b.sortOrder).map(drill => ({
      id: drill.id,
      title: drill.title,
      description: drill.description,
      durationMinutes: drill.durationMinutes,
      // Valider lesingen, men ta vare på alle historiske JSON-felt.
      akFormel: AkFormelLeseSchema.passthrough().parse(drill.akFormel),
      techniqueFocus: drill.techniqueFocus,
      sortOrder: drill.sortOrder,
      sourceId: drill.sourceId,
      exerciseId: drill.exerciseId,
      positionTaskId: drill.positionTaskId,
      repType: drill.repType,
      repAntall: drill.repAntall,
      repMinutter: drill.repMinutter,
      repSett: drill.repSett,
      repReps: drill.repReps,
      planRepsUtenBall: drill.planRepsUtenBall,
      planRepsLavFart: drill.planRepsLavFart,
      planRepsAuto: drill.planRepsAuto,
    })),
  };
}

async function lastProgram(tx: Tx, scheduleId: string) {
  const schedule = await tx.groupSchedule.findFirst({
    where: { id: scheduleId, kind: { in: ["SAMLING", "HELDAGSSAMLING"] }, recurring: { not: "WEEKLY" }, endAt: { gte: new Date() } },
    select: { id: true, groupId: true, title: true, description: true, location: true, startAt: true, endAt: true, kind: true, updatedAt: true },
  });
  if (!schedule) return null;
  const fra = datoIOslo(schedule.startAt);
  const til = datoIOslo(schedule.endAt);
  const sessions = await tx.workbenchSession.findMany({
    where: { groupId: schedule.groupId, origin: "GROUP", sourceGroupSessionId: null,
      id: { startsWith: "wb-group-" }, isTemplate: false,
      status: { in: ["DRAFT", "SCHEDULED", "PUBLISHED"] },
      date: { gte: tilDatoKolonne(fra), lte: tilDatoKolonne(til) } },
    include: { drills: true }, orderBy: [{ date: "asc" }, { startMinute: "asc" }, { id: "asc" }], take: 100,
  });
  if (sessions.length === 0) return null;
  const base = {
    versjon: 1 as const,
    samling: {
      id: schedule.id, groupId: schedule.groupId, tittel: schedule.title,
      beskrivelse: schedule.description, sted: schedule.location,
      fra: schedule.startAt.toISOString(), til: schedule.endAt.toISOString(),
      kind: schedule.kind as "SAMLING" | "HELDAGSSAMLING", updatedAt: schedule.updatedAt.toISOString(),
    },
    okter: sessions.map(mapProgramSession),
  };
  const parsed = SamlingsprogramSchema.safeParse({ ...base, oktversjon: hashSamlingsprogram(base) });
  if (!parsed.success) return null;
  return { schedule, sessions, program: parsed.data };
}

function toJson(program: Samlingsprogram): Prisma.InputJsonObject {
  return JSON.parse(JSON.stringify(program)) as Prisma.InputJsonObject;
}

function revalidate(groupId: string, scheduleId: string) {
  revalidatePath(`/team-norway/samlinger/${scheduleId}`);
  revalidatePath(`/admin/grupper/${groupId}/workbench`);
  revalidatePath("/team-wang/coach");
  revalidatePath("/portal/planlegge/workbench");
  revalidatePath("/portal", "layout");
}

/** Publiserer én programversjon og én in-app-invitasjon per aktiv spiller i den valgte gruppen. */
export async function publiserSamlingsprogram(input: unknown) {
  const user = await trener();
  const parsed = IdInput.safeParse(input);
  if (!parsed.success || !(await rateLimit({ key: `samlingsinvitasjon:publiser:${user.id}`, max: 10, windowMs: 60_000 })).ok) {
    return { ok: false as const, feil: "Samlingen kunne ikke publiseres. Kontroller valget og prøv igjen." };
  }
  try {
    const result = await prisma.$transaction(async tx => {
      const event = await lastProgram(tx, parsed.data.id);
      if (!event || !(await canEditGroup(user, event.schedule.groupId, tx))) return null;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`gathering:${event.schedule.id}`}))`;
      if (!(await canEditGroup(user, event.schedule.groupId, tx))) return null;
      // Les på nytt under låsen: parallell publisering gir ikke doble invitasjoner.
      const current = await lastProgram(tx, event.schedule.id);
      if (!current || current.program.oktversjon !== event.program.oktversjon) return null;
      const members = await tx.groupMember.findMany({
        where: { groupId: event.schedule.groupId, ...aktivtSpillerMedlemskapWhere(), user: { role: "PLAYER", deletedAt: null } },
        select: { userId: true },
      });
      const playerIds = [...new Set(members.map(row => row.userId))];
      if (playerIds.length === 0) return { schedule: event.schedule, inviteIds: [], newIds: [], invited: 0 };
      const inviteIds = playerIds.map(playerId => samlingsInvitasjonId(event.schedule.id, playerId, event.program.oktversjon));
      const existing = await tx.planAction.findMany({ where: { id: { in: inviteIds } }, select: { id: true } });
      const existingIds = new Set(existing.map(row => row.id));
      const newRows = playerIds.flatMap(playerId => {
        const id = samlingsInvitasjonId(event.schedule.id, playerId, event.program.oktversjon);
        return existingIds.has(id) ? [] : [{
          id, userId: playerId, coachId: user.id, actionType: ACTION_TYPE,
          suggestion: toJson(event.program), status: "PENDING", agentName: "GROUP_SCHEDULE",
        }];
      });
      if (newRows.length) {
        await tx.planAction.createMany({ data: newRows, skipDuplicates: true });
        await tx.notification.createMany({ data: newRows.map(row => ({
          userId: row.userId, type: "plan", title: "Invitasjon til samling",
          body: event.schedule.title, link: `/portal/samlinger?invitasjon=${encodeURIComponent(row.id)}`,
        })) });
      }
      // En ny versjon gjør gamle ubesvarte invitasjoner uaktuelle.
      const pending = await tx.planAction.findMany({
        where: { userId: { in: playerIds }, actionType: ACTION_TYPE, status: "PENDING", id: { notIn: inviteIds },
          suggestion: { path: ["samling", "id"], equals: event.schedule.id } },
        select: { id: true, suggestion: true },
      });
      const staleIds = pending.flatMap(row => {
        const old = SamlingsprogramSchema.safeParse(row.suggestion);
        return old.success && old.data.samling.id === event.schedule.id ? [row.id] : [];
      });
      if (staleIds.length) await tx.planAction.updateMany({
        where: { id: { in: staleIds }, status: "PENDING" },
        data: { status: "REVOKED", decidedAt: new Date(), decidedById: user.id },
      });
      const statuses = await tx.planAction.findMany({ where: { id: { in: inviteIds } }, select: { status: true } });
      return {
        schedule: event.schedule, inviteIds, newIds: newRows.map(row => row.id), invited: statuses.length,
        pending: statuses.filter(row => row.status === "PENDING").length,
        accepted: statuses.filter(row => row.status === "ACCEPTED").length,
        rejected: statuses.filter(row => row.status === "REJECTED").length,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 20_000 });
    if (!result) return { ok: false as const, feil: "Samlingen eller gruppeplanen er endret. Last inn på nytt." };
    revalidate(result.schedule.groupId, result.schedule.id);
    return { ok: true as const, inviterte: result.invited, nye: result.newIds.length,
      venter: result.pending, godtatt: result.accepted, avslatt: result.rejected };
  } catch {
    return { ok: false as const, feil: "Samlingen kunne ikke publiseres. Kontroller tilgang og prøv igjen." };
  }
}

/** Spilleren henter kun invitasjoner som er adressert til egen konto. */
export async function hentMineSamlingsinvitasjoner() {
  const player = await requireSpillerActionUser();
  const rows = await prisma.planAction.findMany({
    where: { userId: player.id, actionType: ACTION_TYPE, status: "PENDING" },
    orderBy: { createdAt: "desc" }, take: 20,
    select: { id: true, coachId: true, suggestion: true, createdAt: true },
  });
  const invites = rows.flatMap(row => {
    const parsed = SamlingsprogramSchema.safeParse(row.suggestion);
    return parsed.success ? [{ id: row.id, program: parsed.data, createdAt: row.createdAt.toISOString() }] : [];
  });
  if (!invites.length) return [];
  const groupIds = [...new Set(invites.map(row => row.program.samling.groupId))];
  const [memberships, activeGroups] = await Promise.all([
    prisma.groupMember.findMany({ where: { userId: player.id, groupId: { in: groupIds }, ...aktivtSpillerMedlemskapWhere() }, select: { groupId: true } }),
    prisma.group.findMany({ where: { id: { in: groupIds }, arkivertAt: null }, select: { id: true } }),
  ]);
  const active = new Set(activeGroups.map(row => row.id));
  const member = new Set(memberships.map(row => row.groupId));
  const eligible = invites.filter(row => active.has(row.program.samling.groupId) && member.has(row.program.samling.groupId));
  if (!eligible.length) return [];
  const sessionDates = [...new Set(eligible.flatMap(row => row.program.okter.map(session => session.date)))];
  const existingSessions = await prisma.workbenchSession.findMany({
    where: { playerId: player.id, date: { in: sessionDates.map(tilDatoKolonne) }, isTemplate: false,
      status: { notIn: ["CANCELLED", "SKIPPED", "ABANDONED"] } },
    select: { sourceGroupSessionId: true, date: true, startMinute: true, durationMinutes: true, title: true },
  });
  const weeks = [...new Set(sessionDates.map(weekStartFor))];
  const calendars = new Map(await Promise.all(weeks.map(async week => [week, await lastPlanKalenderBlokker(player.id, week, true)] as const)));
  return eligible.map(row => {
    const conflicts = row.program.okter.flatMap(session => {
      const date = new Date(`${session.date}T00:00:00.000Z`);
      const dayIndex = (date.getUTCDay() + 6) % 7;
      const blocks = (calendars.get(weekStartFor(session.date))?.[dayIndex] ?? [])
        .filter(block => block.id !== `group-${row.program.samling.id}`)
        .filter(block => block.startMinute < session.startMinute + session.durationMinutes && session.startMinute < block.startMinute + block.durationMinutes)
        .map(block => block.title);
      const planned = existingSessions.filter(existing => existing.date.toISOString().slice(0, 10) === session.date
        && existing.sourceGroupSessionId !== session.sourceSessionId
        && existing.startMinute < session.startMinute + session.durationMinutes
        && session.startMinute < existing.startMinute + existing.durationMinutes)
        .map(existing => existing.title);
      return [...new Set([...blocks, ...planned])].map(tittel => ({ sourceSessionId: session.sourceSessionId, tittel }));
    });
    return { ...row, konflikter: conflicts };
  });
}

function weekStartFor(date: string): string {
  const day = new Date(`${date}T00:00:00.000Z`);
  const offset = (day.getUTCDay() + 6) % 7;
  day.setUTCDate(day.getUTCDate() - offset);
  return day.toISOString().slice(0, 10);
}

/** Aksept lagrer hele programmet atomisk; avslag eller foreldet versjon endrer ingen økter. */
export async function svarPaSamlingsinvitasjon(input: unknown) {
  const player = await requireSpillerActionUser();
  const parsed = SvarInput.safeParse(input);
  if (!parsed.success || !(await rateLimit({ key: `samlingsinvitasjon:svar:${player.id}`, max: 30, windowMs: 60_000 })).ok) {
    return { ok: false as const, feil: "Invitasjonen kunne ikke behandles." };
  }
  const { id, beslutning } = parsed.data;
  try {
    const result = await prisma.$transaction(async tx => {
      const action = await tx.planAction.findFirst({ where: { id, userId: player.id, actionType: ACTION_TYPE, status: "PENDING" },
        select: { id: true, coachId: true, suggestion: true } });
      const invitation = action && SamlingsprogramSchema.safeParse(action.suggestion);
      if (!action || !invitation?.success) return { ok: false as const, feil: "Invitasjonen er ikke lenger tilgjengelig." };
      const program = invitation.data;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`gathering:${program.samling.id}`}))`;
      const membership = await tx.groupMember.findFirst({ where: {
        groupId: program.samling.groupId, userId: player.id, ...aktivtSpillerMedlemskapWhere(),
      }, select: { id: true } });
      const current = membership ? await lastProgram(tx, program.samling.id) : null;
      if (!membership || !current || current.program.oktversjon !== program.oktversjon) {
        await tx.planAction.updateMany({ where: { id: action.id, userId: player.id, status: "PENDING" }, data: {
          status: membership ? "CONFLICT" : "REVOKED", decidedAt: new Date(), decidedById: player.id,
        } });
        return { ok: false as const, feil: membership ? "Programmet er endret. Be treneren sende den nye versjonen." : "Du er ikke lenger med i gruppen." };
      }
      if (beslutning === "REJECTED") {
        const changed = await tx.planAction.updateMany({ where: { id: action.id, userId: player.id, status: "PENDING" }, data: {
          status: "REJECTED", decidedAt: new Date(), decidedById: player.id,
        } });
        return changed.count === 1 ? { ok: true as const, status: "REJECTED" as const, title: program.samling.tittel } : { ok: false as const, feil: "Invitasjonen er allerede besvart." };
      }

      const earlier = await tx.planAction.findMany({ where: { userId: player.id, actionType: ACTION_TYPE, status: "ACCEPTED" },
        select: { id: true, suggestion: true } });
      const previous = earlier.flatMap(row => {
        const prior = SamlingsprogramSchema.safeParse(row.suggestion);
        return prior.success && prior.data.samling.id === program.samling.id ? [{ id: row.id, program: prior.data }] : [];
      });
      const oldIds = previous.map(row => row.id);
      const wantedSources = new Set(program.okter.map(row => row.sourceSessionId));
      if (oldIds.length) {
        const oldSources = new Set(previous.flatMap(row => row.program.okter.map(session => session.sourceSessionId)));
        const removed = [...oldSources].filter(sourceId => !wantedSources.has(sourceId));
        if (removed.length) await tx.workbenchSession.updateMany({ where: {
          playerId: player.id, groupId: program.samling.groupId, sourceGroupSessionId: { in: removed },
          planActionId: { in: oldIds }, localOverride: false, status: { in: ["DRAFT", "SCHEDULED", "PUBLISHED"] },
        }, data: { status: "CANCELLED", publishedAt: null, publishedBy: null } });
      }

      const now = new Date();
      for (const session of current.sessions) {
        const id = samlingsOktKopiId(session.id, player.id);
        const existing = await tx.workbenchSession.findUnique({ where: { id }, select: {
          id: true, localOverride: true, hiddenByPlayer: true, status: true,
        } });
        if (existing && (existing.localOverride || existing.hiddenByPlayer || ["IN_PROGRESS", "COMPLETED", "CANCELLED", "SKIPPED", "ABANDONED"].includes(existing.status))) continue;
        const data = {
          playerId: player.id, coachId: session.coachId, groupId: program.samling.groupId,
          sourceGroupSessionId: session.id, date: session.date, startMinute: session.startMinute,
          durationMinutes: session.durationMinutes, title: session.title, pyramid: session.pyramid,
          blockType: session.blockType, environment: session.environment, practiceType: session.practiceType,
          skillArea: session.skillArea, pressureLevel: session.pressureLevel, pPosisjoner: session.pPosisjoner,
          location: session.location, maalsetning: session.maalsetning,
          status: "PUBLISHED", origin: "GROUP", needsPlayerApproval: false, approvalStatus: "ACCEPTED",
          localOverride: false, publishedAt: now, publishedBy: player.id, planActionId: action.id,
        };
        if (existing) await tx.workbenchSession.update({ where: { id }, data });
        else await tx.workbenchSession.create({ data: { ...data, id, createdBy: action.coachId ?? player.id } });

        const drillIds: string[] = [];
        for (const [index, drill] of session.drills.entries()) {
          const drillId = `${id}-drill-${hash(drill.id)}`;
          drillIds.push(drillId);
          const drillData = {
            title: drill.title, description: drill.description, durationMinutes: drill.durationMinutes,
            akFormel: drill.akFormel === null ? Prisma.JsonNull : drill.akFormel,
            techniqueFocus: drill.techniqueFocus, sortOrder: drill.sortOrder ?? index,
            sourceId: drill.sourceId, exerciseId: drill.exerciseId, positionTaskId: drill.positionTaskId,
            repType: drill.repType, repAntall: drill.repAntall, repMinutter: drill.repMinutter,
            repSett: drill.repSett, repReps: drill.repReps,
            planRepsUtenBall: drill.planRepsUtenBall, planRepsLavFart: drill.planRepsLavFart, planRepsAuto: drill.planRepsAuto,
          };
          await tx.workbenchDrill.upsert({ where: { id: drillId }, create: { ...drillData, id: drillId, sessionId: id }, update: drillData });
        }
        await tx.workbenchDrill.deleteMany({ where: { sessionId: id, id: { notIn: drillIds } } });
      }
      const changed = await tx.planAction.updateMany({ where: { id: action.id, userId: player.id, status: "PENDING" }, data: {
        status: "ACCEPTED", decidedAt: new Date(), decidedById: player.id,
      } });
      if (changed.count !== 1) throw new Error("gathering_invitation_already_decided");
      return { ok: true as const, status: "ACCEPTED" as const, title: program.samling.tittel };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 20_000 });
    revalidatePath("/portal/samlinger");
    revalidatePath("/portal/planlegge/workbench");
    revalidatePath("/portal");
    return result;
  } catch {
    return { ok: false as const, feil: "Invitasjonen kunne ikke lagres. Last inn på nytt og prøv igjen." };
  }
}

/** Kun tellere for treneren; ingen mottakerliste eller spillersvar eksponeres til andre grupper. */
export async function hentSamlingsinvitasjonsstatus(input: unknown) {
  const user = await trener();
  const parsed = IdInput.safeParse(input);
  if (!parsed.success) return null;
  const event = await prisma.$transaction(tx => lastProgram(tx, parsed.data.id));
  if (!event || !(await canEditGroup(user, event.schedule.groupId))) return null;
  const members = await prisma.groupMember.findMany({
    where: { groupId: event.schedule.groupId, ...aktivtSpillerMedlemskapWhere(), user: { role: "PLAYER", deletedAt: null } },
    select: { userId: true },
  });
  const ids = [...new Set(members.map(row => row.userId))].map(playerId => samlingsInvitasjonId(event.schedule.id, playerId, event.program.oktversjon));
  const matching = ids.length ? await prisma.planAction.findMany({ where: { id: { in: ids }, actionType: ACTION_TYPE }, select: { status: true } }) : [];
  return {
    invitert: matching.length,
    venter: matching.filter(row => row.status === "PENDING").length,
    godtatt: matching.filter(row => row.status === "ACCEPTED").length,
    avslatt: matching.filter(row => row.status === "REJECTED").length,
  };
}
