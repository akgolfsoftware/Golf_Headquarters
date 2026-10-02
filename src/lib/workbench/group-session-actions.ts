"use server";

import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { assertCapability } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { canEditGroup } from "./group-scope";
import { AkFormelSchema, AkFormelLeseSchema, IsoDateSchema, PyramidAreaSchema, EnvironmentSchema } from "@/lib/domain/workbench/schemas";
import { hentBankReferanser } from "./bank-referanser";
import { bevarHistoriskeDrillfelt, FORMEL_FELT, gyldigFormelEndring } from "./drill-formel-bevaring";
import { mapSession, tilDatoKolonne } from "./wb-map";
import { osloInstant } from "@/lib/jarvis/dagen";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import type { WbResultat } from "./wb-actions";

const Id = z.string().min(1).max(200);
const GroupSelection = z.object({ groupId: Id, sessionIds: z.array(Id).min(1).max(100) });
const GroupContent = z.object({
  groupId: Id, requestId: z.uuid().optional(), sessionId: Id.optional(),
  expectedUpdatedAt: z.iso.datetime().optional(),
  date: IsoDateSchema, startMinute: z.number().int().min(0).max(1439),
  durationMinutes: z.number().int().min(15).max(720),
  title: z.string().trim().min(1).max(200), pyramid: PyramidAreaSchema,
  environment: EnvironmentSchema.nullish(), notes: z.string().max(5000).nullish(),
  drills: z.array(z.object({
    id: Id.optional(), sourceId: Id.optional(), exerciseId: Id.optional(), positionTaskId: Id.optional(),
    title: z.string().trim().min(1).max(200), description: z.string().max(5000).nullish(),
    durationMinutes: z.number().int().min(1).max(600), akFormel: AkFormelLeseSchema,
    techniqueFocus: z.string().max(200).nullish(),
  })).max(100),
}).refine(value => Boolean(value.requestId) !== Boolean(value.sessionId), "Oppgi enten ny forespørsel eller eksisterende økt");

function hash(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function sourceId(groupId: string, requestId: string): string { return `wb-group-${hash(`${groupId}:${requestId}`)}`; }
function copyId(source: string, player: string): string { return `wb-group-copy-${hash(`${source}:${player}`)}`; }

async function actor() {
  const viewer = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await assertCapability(viewer, Capability.EDIT_GROUP_PLANS);
  return viewer;
}

/** Coachens gruppegrunnlag; mottakernes individuelle data leses gjennom eksisterende spillervakter. */
export async function loadGroupWorkbenchSessions(groupId: string): Promise<WbResultat<WorkbenchSession[]>> {
  const viewer = await actor();
  if (!Id.safeParse(groupId).success || !(await canEditGroup(viewer, groupId))) {
    return { ok: false, error: "Fant ikke gruppen." };
  }
  const rows = await prisma.workbenchSession.findMany({ where: { groupId, origin: "GROUP", sourceGroupSessionId: null, id: { startsWith: "wb-group-" } },
    include: { drills: true }, orderBy: [{ date: "asc" }, { startMinute: "asc" }] });
  return { ok: true, data: rows.map(mapSession) };
}

function revalidate(groupId: string) {
  revalidatePath(`/admin/grupper/${groupId}/workbench`);
  revalidatePath("/portal", "layout");
}

/** Gruppens original eies av coachen, aldri av en tilfeldig spiller. Ingen spillerdata kopieres inn. */
export async function saveGroupWorkbenchSession(input: unknown): Promise<WbResultat<WorkbenchSession>> {
  const viewer = await actor();
  const parsed = GroupContent.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig gruppeøkt." };
  const value = parsed.data;
  try {
    const row = await prisma.$transaction(async tx => {
      if (!(await canEditGroup(viewer, value.groupId, tx))) throw new Error("scope");
      const id = value.sessionId ?? sourceId(value.groupId, value.requestId!);
      // Serialiser nye forsøk og redigering av samme original. Låsen lever bare i transaksjonen.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))`;
      const current = await tx.workbenchSession.findUnique({ where: { id } });
      if (value.sessionId && !current) throw new Error("missing");
      if (current && value.expectedUpdatedAt && current.updatedAt.toISOString() !== value.expectedUpdatedAt) throw new Error("stale");
      if (current && (current.groupId !== value.groupId || current.origin !== "GROUP" || current.sourceGroupSessionId
        || current.playerId !== current.coachId || !/^wb-group-[a-f0-9]{64}$/.test(current.id))) throw new Error("scope");
      const existing = await tx.workbenchDrill.findMany({ where: { sessionId: id }, orderBy: { sortOrder: "asc" } });
      const wantedDrills = [];
      const matchedIds: (string | undefined)[] = [];
      for (const [sortOrder, drill] of value.drills.entries()) {
        const old = drill.id ? existing.find(d => d.id === drill.id) : existing[sortOrder];
        if (drill.id && !old) throw new Error("drill-scope");
        if (old ? !gyldigFormelEndring(old.akFormel, drill.akFormel) : !AkFormelSchema.safeParse(drill.akFormel).success) throw new Error("formula");
        const incomingRef = { sourceId: drill.sourceId, exerciseId: drill.exerciseId, positionTaskId: drill.positionTaskId };
        if (old && Object.entries(incomingRef).some(([key, value]) => value !== undefined && value !== old[key as keyof typeof old])) throw new Error("reference-change");
        const refs = old ? { ok: true as const, data: { sourceId: old.sourceId, exerciseId: old.exerciseId, positionTaskId: old.positionTaskId } }
          : await hentBankReferanser(incomingRef, viewer, viewer.id, tx);
        if (!refs.ok) throw new Error("bank-scope");
        matchedIds.push(old?.id);
        wantedDrills.push({
          title: drill.title, description: drill.description ?? null, durationMinutes: drill.durationMinutes,
          akFormel: old ? JSON.parse(JSON.stringify(bevarHistoriskeDrillfelt(old.akFormel, drill.akFormel as Prisma.InputJsonObject, FORMEL_FELT))) as Prisma.InputJsonObject : drill.akFormel as Prisma.InputJsonObject,
          techniqueFocus: drill.techniqueFocus ?? null, sortOrder,
          sourceId: refs.data.sourceId ?? null, exerciseId: refs.data.exerciseId ?? null, positionTaskId: refs.data.positionTaskId ?? null,
          repType: old?.repType ?? null, repAntall: old?.repAntall ?? null, repMinutter: old?.repMinutter ?? null, repSett: old?.repSett ?? null, repReps: old?.repReps ?? null,
          planRepsUtenBall: old?.planRepsUtenBall ?? null, planRepsLavFart: old?.planRepsLavFart ?? null, planRepsAuto: old?.planRepsAuto ?? null,
        });
      }
      const matched = matchedIds.filter((id): id is string => id !== undefined);
      if (new Set(matched).size !== matched.length) throw new Error("duplicate-drill");
      const data = {
        date: tilDatoKolonne(value.date), startMinute: value.startMinute, durationMinutes: value.durationMinutes,
        title: value.title, pyramid: value.pyramid, environment: value.environment ?? null, notes: value.notes ?? null,
      };
      if (current && !["DRAFT", "SCHEDULED", "PUBLISHED"].includes(current.status)) throw new Error("status");
      const unchanged = current && isDeepStrictEqual(data, {
        date: current.date, startMinute: current.startMinute, durationMinutes: current.durationMinutes,
        title: current.title, pyramid: current.pyramid, environment: current.environment, notes: current.notes,
      }) && isDeepStrictEqual(wantedDrills, existing.map(drill => ({
        title: drill.title, description: drill.description, durationMinutes: drill.durationMinutes,
        akFormel: drill.akFormel, techniqueFocus: drill.techniqueFocus, sortOrder: drill.sortOrder,
        sourceId: drill.sourceId, exerciseId: drill.exerciseId, positionTaskId: drill.positionTaskId,
        repType: drill.repType, repAntall: drill.repAntall, repMinutter: drill.repMinutter, repSett: drill.repSett, repReps: drill.repReps,
        planRepsUtenBall: drill.planRepsUtenBall, planRepsLavFart: drill.planRepsLavFart, planRepsAuto: drill.planRepsAuto,
      })));
      if (unchanged) return tx.workbenchSession.findUniqueOrThrow({ where: { id }, include: { drills: true } });
      // Originalen blir et utkast ved endring; mottakernes tidligere publisering består til neste publisering.
      const source = current
        ? await tx.workbenchSession.update({ where: { id }, data: { ...data, status: "DRAFT" } })
        : await tx.workbenchSession.create({ data: { ...data, id, playerId: viewer.id, coachId: viewer.id,
          groupId: value.groupId, origin: "GROUP", createdBy: viewer.id, status: "DRAFT" } });
      const ids = [];
      for (const [index, drillData] of wantedDrills.entries()) {
        const drillId = matchedIds[index] ?? `${id}-drill-${hash(`${index}:${value.expectedUpdatedAt ?? value.requestId ?? current?.updatedAt.toISOString()}`)}`;
        ids.push(drillId);
        await tx.workbenchDrill.upsert({ where: { id: drillId }, create: { ...drillData, id: drillId, sessionId: source.id }, update: drillData });
      }
      await tx.workbenchDrill.deleteMany({ where: { sessionId: id, id: { notIn: ids } } });
      return tx.workbenchSession.findUniqueOrThrow({ where: { id }, include: { drills: true } });
    });
    revalidate(value.groupId);
    return { ok: true, data: mapSession(row) };
  } catch { return { ok: false, error: "Gruppeøkten ble ikke lagret. Kontroller tilgang og prøv igjen." }; }
}

/** Én atomisk publisering av original og mottakere. Nye forsøk gjenbruker samme økt- og øvelse-ID. */
export async function publishGroupWorkbenchSessions(input: unknown): Promise<WbResultat<WorkbenchSession[]>> {
  return changeGroupPublication(input, true);
}

/** Tilbaketrekking skjuler bare urørte, ikke-startede kopier; historikk og egne tilpasninger består. */
export async function withdrawGroupWorkbenchSessions(input: unknown): Promise<WbResultat<WorkbenchSession[]>> {
  return changeGroupPublication(input, false);
}

async function changeGroupPublication(input: unknown, publish: boolean): Promise<WbResultat<WorkbenchSession[]>> {
  const viewer = await actor();
  const parsed = GroupSelection.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig utvalg." };
  const { groupId } = parsed.data;
  const ids = [...new Set(parsed.data.sessionIds)].sort();
  try {
    const rows = await prisma.$transaction(async tx => {
      if (!(await canEditGroup(viewer, groupId, tx))) throw new Error("scope");
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`wb-group:${groupId}`}))`;
      for (const id of ids) await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))`;
      const sources = await tx.workbenchSession.findMany({ where: { id: { in: ids }, groupId,
        origin: "GROUP", sourceGroupSessionId: null }, include: { drills: true } });
      if (sources.length !== ids.length || sources.some(s => s.playerId !== s.coachId || !/^wb-group-[a-f0-9]{64}$/.test(s.id) || !["DRAFT", "SCHEDULED", "PUBLISHED"].includes(s.status))) throw new Error("selection");
      const members = await tx.groupMember.findMany({ where: { groupId, endedAt: null, role: "PLAYER",
        user: { role: "PLAYER", deletedAt: null } }, select: { userId: true, joinedAt: true } });
      const now = new Date();
      const result = [];
      for (const source of sources) {
        const copies = await tx.workbenchSession.findMany({ where: { sourceGroupSessionId: source.id, groupId }, include: { drills: true } });
        const start = osloInstant(source.date.getUTCFullYear(), source.date.getUTCMonth() + 1, source.date.getUTCDate(), Math.floor(source.startMinute / 60), source.startMinute % 60);
        const eligible = members.filter(m => start > m.joinedAt);
        const recipients = new Set(eligible.map(m => m.userId));
        // Utmeldte mister fremtidig lenket planinnhold ved neste publisering, uten historikktap.
        for (const copy of copies) {
          if (copy.localOverride || !["DRAFT", "SCHEDULED", "PUBLISHED"].includes(copy.status)) continue;
          if (!publish || !recipients.has(copy.playerId)) {
            await tx.workbenchSession.update({ where: { id: copy.id, updatedAt: copy.updatedAt },
              data: { status: "DRAFT", publishedAt: null, publishedBy: null } });
          }
        }
        if (publish) for (const member of eligible) {
          const copy = copies.find(c => c.playerId === member.userId);
          if (copy?.localOverride || (copy && !["DRAFT", "SCHEDULED", "PUBLISHED"].includes(copy.status))) continue;
          const id = copy?.id ?? copyId(source.id, member.userId);
          const content = { title: source.title, date: source.date, startMinute: source.startMinute,
            durationMinutes: source.durationMinutes, pyramid: source.pyramid, blockType: source.blockType,
            environment: source.environment, practiceType: source.practiceType, location: source.location,
            notes: source.notes, maalsetning: source.maalsetning, status: "PUBLISHED",
            publishedAt: now, publishedBy: viewer.id };
          if (copy) await tx.workbenchSession.update({ where: { id, updatedAt: copy.updatedAt }, data: content });
          else await tx.workbenchSession.create({ data: { ...content, id, playerId: member.userId, coachId: source.coachId,
            groupId, sourceGroupSessionId: source.id, origin: "GROUP", createdBy: viewer.id } });
          const drillIds = [];
          for (const drill of source.drills) {
            const drillId = `${id}-drill-${hash(drill.id)}`;
            drillIds.push(drillId);
            const data = { title: drill.title, description: drill.description, durationMinutes: drill.durationMinutes,
              // Rå autorisert original kopieres uten å strippe historiske JSON-/dosefelt.
              akFormel: drill.akFormel === null ? Prisma.JsonNull : drill.akFormel,
              techniqueFocus: drill.techniqueFocus, sortOrder: drill.sortOrder,
              sourceId: drill.sourceId, exerciseId: drill.exerciseId, positionTaskId: drill.positionTaskId,
              repType: drill.repType, repAntall: drill.repAntall, repMinutter: drill.repMinutter, repSett: drill.repSett, repReps: drill.repReps,
              planRepsUtenBall: drill.planRepsUtenBall, planRepsLavFart: drill.planRepsLavFart, planRepsAuto: drill.planRepsAuto };
            await tx.workbenchDrill.upsert({ where: { id: drillId }, create: { ...data, id: drillId, sessionId: id }, update: data });
          }
          await tx.workbenchDrill.deleteMany({ where: { sessionId: id, id: { notIn: drillIds } } });
        }
        result.push(await tx.workbenchSession.update({ where: { id: source.id, updatedAt: source.updatedAt },
          data: { status: publish ? "PUBLISHED" : "DRAFT", publishedAt: publish ? now : null, publishedBy: publish ? viewer.id : null },
          include: { drills: true } }));
      }
      return result;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 });
    revalidate(groupId);
    return { ok: true, data: rows.map(mapSession) };
  } catch { return { ok: false, error: "Ingen gruppeøkter ble endret. Kontroller tilgang og utvalg, og prøv igjen." }; }
}
