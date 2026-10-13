"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { assertCapability } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { canEditGroup, canWriteMemberPlans, editableGroupWhere } from "./group-scope";
import { lastBankOvelse } from "./bank-referanser";
import { exerciseToSourceItem, omraadeKodeTilTrainingArea } from "./sources-map";
import { AkFormelSchema } from "@/lib/domain/workbench/schemas";
import { addDays } from "@/lib/domain/workbench/operations";
import { osloPlanDato } from "./plan-kontekst";
import { osloInstant } from "@/lib/jarvis/dagen";
import { MalUtrullingSchema, malStartuke, malGruppetid, type MalUtrullingInput, type MalUtrullingPreview, type MalUtrullingOkt } from "./template-rollout-kontrakt";
import type { ScheduledTemplateSession } from "./map-template-week";
import { groupPublicationSnapshot } from "./group-publication-snapshot";

type Viewer = { id: string; role: string };
type Db = Pick<Prisma.TransactionClient, "group" | "planTemplate" | "workbenchSession" | "workbenchDrill" | "exerciseDefinition" | "positionTask" | "$executeRaw">;
const Id = z.string().min(1).max(200);
const Dose = z.object({ exerciseId: Id, sets: z.number().int().min(1).max(1000).optional(), reps: z.number().int().min(1).max(10000).optional(), durationMinutes: z.number().int().min(1).max(720).optional(), notes: z.string().max(5000).nullish() }).passthrough();
const MalOkt = z.object({ id: Id, title: z.string().trim().min(1).max(200), ukeNr: z.number().int().min(1).max(52), dagNr: z.number().int().min(1).max(7), varighetMin: z.number().int().min(5).max(720), pyramidArea: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]), drillsJson: z.unknown(), focus: z.string().nullish(), notes: z.string().nullish() });
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
class MalFeil extends Error {}
const feil = (error: unknown) => ({ ok: false as const, error: error instanceof MalFeil ? error.message : "Ingen utrulling er bekreftet. Kontroller valgene og prøv igjen." });
function revalidate(groupId?: string) { revalidatePath("/portal", "layout"); revalidatePath("/admin/plan"); if (groupId) revalidatePath(`/admin/grupper/${groupId}/workbench`); }
async function coach() { const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] }); await assertCapability(user, Capability.EDIT_GROUP_PLANS); return user; }
function gyldigeId(...ids: string[]) { if (ids.some(id => !Id.safeParse(id).success)) throw new MalFeil("Ugyldig gruppe eller mal."); }

export type AppliedTemplateSession = ScheduledTemplateSession & { sessionId: string };

/** Bare grupper coachen faktisk kan redigere. Ingen spillerprofiler eller personlige planer leses. */
export async function hentMalUtrullingGrupper() {
  const viewer = await coach();
  const rows = await prisma.group.findMany({ where: editableGroupWhere(viewer), select: { id: true, name: true }, orderBy: { name: "asc" } });
  return rows;
}
export async function hentMalUtrullingGruppe(groupId: string) {
  const viewer = await coach();
  if (!Id.safeParse(groupId).success || !(await canEditGroup(viewer, groupId))) return { ok: false as const, error: "Gruppen er ikke tilgjengelig." };
  const group = await prisma.group.findFirst({ where: { id: groupId, ...editableGroupWhere(viewer) },
    select: { id: true, name: true, members: { where: { endedAt: null, role: "PLAYER", user: { role: "PLAYER", deletedAt: null } }, select: { userId: true, user: { select: { name: true } } }, orderBy: { userId: "asc" } },
      schedules: { select: { id: true, title: true, startAt: true, endAt: true, recurring: true, kind: true }, orderBy: { startAt: "asc" } } } });
  if (!group) return { ok: false as const, error: "Gruppen er ikke tilgjengelig." };
  return { ok: true as const, data: { recipients: group.members.map(m => ({ id: m.userId, name: m.user.name ?? "Spiller" })),
    schedules: group.schedules.map(s => ({ ...s, startAt: s.startAt.toISOString(), endAt: s.endAt.toISOString() })) } };
}

async function mal(templateId: string, viewer: Viewer, db: Db) {
  const source = await db.planTemplate.findFirst({ where: { id: templateId, OR: [{ approved: true }, { byCoachId: viewer.id }] }, include: { sessions: { orderBy: [{ ukeNr: "asc" }, { dagNr: "asc" }, { id: "asc" }] } } });
  if (!source) throw new MalFeil("Malen er ikke tilgjengelig.");
  const parsed = z.array(MalOkt).max(1000).safeParse(source.sessions);
  if (!parsed.success || !parsed.data.length) throw new MalFeil("Malen mangler gyldige økter. Åpne og kontroller malen først.");
  return { source, sessions: parsed.data };
}

async function driller(source: z.infer<typeof MalOkt>, viewer: Viewer, playerId: string, db: Db) {
  const parsed = z.array(Dose).max(100).safeParse(source.drillsJson ?? []);
  if (!parsed.success) throw new MalFeil(`Øvelseslisten i «${source.title}» må kontrolleres i malen.`);
  const result = [];
  const revisions = [];
  for (const [index, dose] of parsed.data.entries()) {
    const exercise = await lastBankOvelse(dose.exerciseId, viewer, playerId, db);
    if (!exercise) throw new MalFeil("En maløvelse kan ikke deles med alle valgte mottakere. Kontroller banken eller mottakerne.");
    const item = exerciseToSourceItem(exercise);
    const formel = AkFormelSchema.safeParse({ ...item.drill?.akFormel, ...(exercise.omraadeKode ? { area: omraadeKodeTilTrainingArea(exercise.omraadeKode) } : {}),
      ...(exercise.motorikk ? { motorikk: exercise.motorikk } : {}), ...(exercise.belastning ? { belastning: exercise.belastning } : {}), ...(exercise.press ? { press: exercise.press } : {}) });
    if (!formel.success) throw new MalFeil("Maløvelsens AK-formel kan ikke leses.");
    result.push({ title: exercise.name, description: [exercise.description, dose.notes].filter(Boolean).join("\n\n") || null,
      durationMinutes: dose.durationMinutes ?? exercise.durationMin ?? Math.max(1, Math.floor(source.varighetMin / Math.max(1, parsed.data.length))),
      akFormel: formel.data satisfies Prisma.InputJsonObject, sourceId: `drill:${exercise.id}`, exerciseId: exercise.id, sortOrder: index,
      repType: dose.sets && dose.reps ? "SETT_REPS" : null, repSett: dose.sets ?? null, repReps: dose.reps ?? null });
    revisions.push({ id: exercise.id, updatedAt: exercise.updatedAt.toISOString(), content: result.at(-1) });
  }
  return { data: result, revisions };
}

async function forbered(groupId: string, templateId: string, input: MalUtrullingInput, viewer: Viewer, db: Db) {
  gyldigeId(groupId, templateId);
  const parsed = MalUtrullingSchema.safeParse(input);
  if (!parsed.success) throw new MalFeil("Kontroller startuke, antall uker og mottakere.");
  const valg = parsed.data;
  if (!(await canEditGroup(viewer, groupId, db))) throw new MalFeil("Gruppen er ikke tilgjengelig.");
  const group = await db.group.findFirst({ where: { id: groupId, ...editableGroupWhere(viewer) }, include: {
    members: { where: { endedAt: null, role: "PLAYER", user: { role: "PLAYER", deletedAt: null } }, select: { userId: true, joinedAt: true, user: { select: { name: true } } }, orderBy: { userId: "asc" } },
    schedules: { orderBy: { id: "asc" } } } });
  if (!group) throw new MalFeil("Gruppen er ikke tilgjengelig.");
  const { source: template, sessions } = await mal(templateId, viewer, db);
  if (!template.approved) throw new MalFeil("Godkjenn malen før utrulling til gruppen.");
  if (valg.uker > template.varighetUker || sessions.some(s => s.ukeNr > template.varighetUker)) throw new MalFeil("Antall uker må stemme med malens lagrede varighet.");
  const selectedSessions = sessions.filter(s => s.ukeNr <= valg.uker);
  if (!selectedSessions.length) throw new MalFeil("Malen har ingen økter i de valgte ukene.");
  const members = group.members.filter(m => !valg.recipientIds || valg.recipientIds.includes(m.userId));
  if (!members.length || (valg.recipientIds && new Set(valg.recipientIds).size !== members.length)) throw new MalFeil("Velg aktive spillere fra denne gruppen.");
  if (valg.mode === "GRUPPEUTKAST" && members.length !== group.members.length) throw new MalFeil("Gruppeutkast gjelder gruppen samlet. Bruk personlige forslag for et mindre utvalg.");
  const personalWriteScope = await canWriteMemberPlans(viewer, groupId, db);
  const weekStart = malStartuke(valg);
  const schedules = group.schedules.filter(s => !valg.groupScheduleIds || valg.groupScheduleIds.includes(s.id));
  if (valg.groupScheduleIds && new Set(valg.groupScheduleIds).size !== schedules.length) throw new MalFeil("Gruppetidene er ikke tilgjengelige.");
  const sessionsOut: MalUtrullingOkt[] = [];
  const definitions = [];
  const cursors = new Map<string, number>();
  for (const s of selectedSessions) {
    const weekIndex = s.ukeNr - 1;
    const date = addDays(weekStart, weekIndex * 7 + s.dagNr - 1);
    if (date < osloPlanDato()) throw new MalFeil("Utrulling gjelder kommende økter. Velg en ny startuke.");
    let startMinute = cursors.get(date) ?? valg.startMinute;
    let location: string | null = null;
    if (valg.mode === "GRUPPEUTKAST") {
      const slots = malGruppetid(date, schedules);
      if (slots.length !== 1) throw new MalFeil(slots.length ? `Velg én registrert gruppetid for ${date}.` : `Ingen registrert gruppetid passer ${date}. Samlinger bruker egen invitasjonsflyt.`);
      startMinute = cursors.get(date) ?? slots[0].startMinute; location = slots[0].location;
      if (startMinute + s.varighetMin > slots[0].endMinute) throw new MalFeil(`Malinnholdet får ikke plass i gruppetiden ${date}.`);
    }
    if (startMinute + s.varighetMin > 1440) throw new MalFeil("Malinnholdet går over midnatt. Endre starttid eller malen.");
    cursors.set(date, startMinute + s.varighetMin);
    sessionsOut.push({ sourceId: s.id, date, startMinute, durationMinutes: s.varighetMin, title: s.title, pyramid: s.pyramidArea, location, notes: s.notes ?? null, focus: s.focus ?? null, drillCount: z.array(Dose).parse(s.drillsJson ?? []).length });
    definitions.push(s);
  }
  if (members.length * sessionsOut.length > 5000) throw new MalFeil("Velg færre uker eller mottakere i denne utrullingen.");
  if (valg.mode === "GRUPPEUTKAST" && sessionsOut.length > 100) throw new MalFeil("Publisering støtter inntil 100 gruppeøkter om gangen. Del programmet i flere utrullinger.");
  const plans: { id: string; row: MalUtrullingOkt; playerId: string; drills: Awaited<ReturnType<typeof driller>>["data"]; recipients: string[] }[] = [];
  const revisions = [];
  for (const [i, row] of sessionsOut.entries()) {
    const start = osloInstant(Number(row.date.slice(0,4)), Number(row.date.slice(5,7)), Number(row.date.slice(8,10)), Math.floor(row.startMinute/60), row.startMinute%60);
    const recipients = members.filter(m => m.joinedAt < start);
    if (!recipients.length) throw new MalFeil("Ingen valgte spillere er innmeldt før økten starter.");
    const recipientDrills = [];
    for (const member of recipients) {
      const drills = await driller(definitions[i], viewer, member.userId, db);
      revisions.push({ playerId: member.userId, sourceId: row.sourceId, revisions: drills.revisions });
      recipientDrills.push({ member, drills: drills.data });
    }
    if (valg.mode === "GRUPPEUTKAST") {
      const id = `wb-group-${hash({ groupId, templateId, sourceId: row.sourceId, date: row.date })}`;
      plans.push({ id, row, playerId: viewer.id, drills: recipientDrills[0].drills, recipients: recipients.map(m => m.userId) });
    } else for (const r of recipientDrills) plans.push({ id: `wb-template-${hash({ groupId, templateId, sourceId: row.sourceId, date: row.date, playerId: r.member.userId })}`, row, playerId: r.member.userId, drills: r.drills, recipients: [r.member.userId] });
  }
  const existing = await db.workbenchSession.findMany({ where: { id: { in: plans.map(p => p.id) } }, select: { id: true } });
  const existingIds = new Set(existing.map(s => s.id));
  const fingerprint = hash({ actor: viewer.id, groupId, templateId, templateRevision: template.updatedAt.toISOString(),
    mode: valg.mode, weekStart, rows: sessionsOut, members: members.map(m => ({ id: m.userId, joinedAt: m.joinedAt.toISOString() })),
    schedules: valg.mode === "GRUPPEUTKAST" ? schedules.map(s => ({ id: s.id, startAt: s.startAt.toISOString(), endAt: s.endAt.toISOString(), recurring: s.recurring, updatedAt: s.updatedAt.toISOString() })) : [],
    personalWriteScope, revisions });
  const preview: MalUtrullingPreview = { fingerprint, mode: valg.mode, weekStart, template: { id: template.id, name: template.name }, group: { id: group.id, name: group.name }, personalWriteScope,
    recipients: members.map(m => ({ id: m.userId, name: m.user.name ?? "Spiller", sessionCount: plans.filter(p => p.recipients.includes(m.userId)).length })),
    schedules: group.schedules.map(s => ({ id: s.id, title: s.title, startAt: s.startAt.toISOString(), endAt: s.endAt.toISOString(), recurring: s.recurring })),
    sessions: sessionsOut, newCount: plans.filter(p => !existingIds.has(p.id)).length, existingCount: existingIds.size };
  return { preview, plans, group };
}

export async function forhaandsvisMalUtrulling(groupId: string, templateId: string, input: MalUtrullingInput = {}) {
  const viewer = await coach();
  try { return { ok: true as const, data: (await forbered(groupId, templateId, input, viewer, prisma)).preview }; } catch (error) { return feil(error); }
}

/** Faktiske gruppeoriginaler og aktive mottakere før egen publiseringsbekreftelse. */
export async function forhaandsvisMalGruppePublisering(groupId: string, sessionIds: string[]) {
  const viewer = await coach();
  try {
    gyldigeId(groupId);
    const ids = z.array(Id).min(1).max(100).parse(sessionIds);
    if (new Set(ids).size !== ids.length || !(await canEditGroup(viewer, groupId))) throw new MalFeil("Gruppeutvalget er ikke tilgjengelig.");
    const [sources, members, schedules] = await Promise.all([
      prisma.workbenchSession.findMany({ where: { id: { in: ids }, groupId, origin: "GROUP", sourceGroupSessionId: null }, include: { drills: true } }),
      prisma.groupMember.findMany({ where: { groupId, endedAt: null, role: "PLAYER", user: { role: "PLAYER", deletedAt: null } }, select: { userId: true, joinedAt: true, user: { select: { name: true } } } }),
      prisma.groupSchedule.findMany({ where: { groupId }, select: { id: true, startAt: true, endAt: true, recurring: true, kind: true, updatedAt: true, location: true } }),
    ]);
    if (sources.length !== ids.length || sources.some(s => s.playerId !== s.coachId || !/^wb-group-[a-f0-9]{64}$/.test(s.id) || !["DRAFT","SCHEDULED","PUBLISHED"].includes(s.status))) throw new MalFeil("Kun fremtidige gruppeutkast og publiserte gruppeoriginaler kan velges.");
    const eligible = new Map<string, { id: string; name: string; sessions: number }>();
    for (const source of sources) {
      const date = source.date.toISOString().slice(0,10);
      if (date < osloPlanDato()) throw new MalFeil("Historiske gruppeøkter publiseres ikke fra malutrulling.");
      const windows = malGruppetid(date, schedules);
      if (!windows.some(w => source.startMinute >= w.startMinute && source.startMinute + source.durationMinutes <= w.endMinute)) throw new MalFeil("Gruppeøkten må ligge innen registrert gruppetid. Samlinger bruker invitasjonsflyten.");
      const start = osloInstant(source.date.getUTCFullYear(),source.date.getUTCMonth()+1,source.date.getUTCDate(),Math.floor(source.startMinute/60),source.startMinute%60);
      for (const member of members.filter(m => m.joinedAt < start)) {
        for (const drill of source.drills) if (drill.exerciseId && !(await lastBankOvelse(drill.exerciseId, viewer, member.userId))) throw new MalFeil("En øvelse kan ikke deles med alle aktive mottakere.");
        const current = eligible.get(member.userId);
        eligible.set(member.userId,{id:member.userId,name:member.user.name ?? "Spiller",sessions:(current?.sessions ?? 0)+1});
      }
    }
    return { ok: true as const, data: { expected: groupPublicationSnapshot(sources,members,schedules),
      sources: sources.map(s => ({ id:s.id,title:s.title,date:s.date.toISOString().slice(0,10),startMinute:s.startMinute,durationMinutes:s.durationMinutes,status:s.status,drills:s.drills.map(d=>({title:d.title,durationMinutes:d.durationMinutes})),notes:s.notes })),
      recipients:[...eligible.values()] } };
  } catch(error) { return feil(error); }
}

/** Én atomisk utrulling. Personlige rader er alltid forslag; eksisterende innhold endres aldri. */
export async function coachApplyTemplateToGroup(groupId: string, templateId: string, input: MalUtrullingInput = {}) {
  const viewer = await coach();
  try {
    const parsed = MalUtrullingSchema.safeParse(input);
    if (!parsed.success || !parsed.data.expectedFingerprint) throw new MalFeil("Vis og bekreft den konkrete utrullingen først.");
    const result = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`malutrulling:${groupId}:${templateId}`}))`;
      const prepared = await forbered(groupId, templateId, input, viewer, tx);
      if (prepared.preview.fingerprint !== parsed.data.expectedFingerprint) throw new MalFeil("Malen, mottakerne eller gruppetidene er endret. Vis en ny forhåndsvisning.");
      let created = 0, existing = 0;
      const sessionIds: string[] = [];
      for (const plan of [...prepared.plans].sort((a,b) => a.id.localeCompare(b.id))) {
        const current = await tx.workbenchSession.findUnique({ where: { id: plan.id }, select: { id: true, playerId: true, coachId: true, groupId: true, sourceGroupSessionId: true, origin: true } });
        if (current) {
          if (prepared.preview.mode !== "GRUPPEUTKAST" && (current.playerId !== plan.playerId || current.groupId || current.sourceGroupSessionId)) throw new MalFeil("Tidligere utrulling kan ikke kobles til dette utvalget.");
          if (prepared.preview.mode === "GRUPPEUTKAST" && (current.groupId !== groupId || current.playerId !== current.coachId || current.sourceGroupSessionId || current.origin !== "GROUP")) throw new MalFeil("Tidligere gruppeøkt kan ikke kobles til denne utrullingen.");
          existing++; sessionIds.push(current.id); continue;
        }
        const isGroup = prepared.preview.mode === "GRUPPEUTKAST";
        const origin = isGroup ? "GROUP" : prepared.group.slug === "team-norway" ? "TEAM_NORWAY" : prepared.group.program === "WANG_TOPPIDRETT" || prepared.group.program === "WANG_UNG" ? "WANG" : "COACH";
        await tx.workbenchSession.create({ data: { id: plan.id, playerId: plan.playerId, coachId: viewer.id, createdBy: viewer.id, groupId: isGroup ? groupId : null,
          date: new Date(`${plan.row.date}T00:00:00Z`), startMinute: plan.row.startMinute, durationMinutes: plan.row.durationMinutes, title: plan.row.title, pyramid: plan.row.pyramid,
          blockType: "OEKT", origin, location: plan.row.location, notes: plan.row.notes, rationale: plan.row.focus,
          status: isGroup ? "DRAFT" : "PUBLISHED", needsPlayerApproval: !isGroup, approvalStatus: isGroup ? null : "PENDING",
          publishedAt: isGroup ? null : new Date(), publishedBy: isGroup ? null : viewer.id } });
        for (const [i, drill] of plan.drills.entries()) await tx.workbenchDrill.create({ data: { ...drill, id: `${plan.id}-drill-${i}`, sessionId: plan.id } });
        created++; sessionIds.push(plan.id);
      }
      if (created) await tx.planTemplate.update({ where: { id: templateId }, data: { usageCount: { increment: 1 } } });
      return { ok: true as const, mode: prepared.preview.mode, spillere: prepared.preview.recipients.length, okterOpprettet: created, eksisterende: existing, sessionIds };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 });
    revalidate(groupId); return result;
  } catch (error) { return feil(error); }
}

/** Egen bruk og enkeltspiller bruker også kanonisk Workbench, uten legacy/M2-skriving. */
async function applyTemplateCore(templateId: string, playerId: string, viewer: Viewer, weekNr: number) {
  try {
    if (!Id.safeParse(templateId).success || !Id.safeParse(playerId).success || !Number.isInteger(weekNr) || weekNr < 1 || weekNr > 52) throw new MalFeil("Ugyldig maluke.");
    const result = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`personmal:${playerId}:${templateId}`}))`;
      const source = await mal(templateId, viewer, tx);
      const rows = source.sessions.filter(s => s.ukeNr === weekNr);
      if (!rows.length) throw new MalFeil("Malen har ingen økter i denne uka.");
      const start = malStartuke(MalUtrullingSchema.parse({ startWeekOffset: 1 }));
      const applied: AppliedTemplateSession[] = [];
      for (const row of rows) {
        const date = addDays(start, row.dagNr - 1);
        const id = `wb-template-${hash({ templateId, sourceId: row.id, playerId, date })}`;
        if (await tx.workbenchSession.findUnique({ where: { id }, select: { id: true } })) continue;
        const drills = await driller(row, viewer, playerId, tx), proposal = viewer.id !== playerId;
        await tx.workbenchSession.create({ data: { id, playerId, coachId: viewer.id, createdBy: viewer.id, date: new Date(`${date}T00:00:00Z`), startMinute: 540, durationMinutes: row.varighetMin, title: row.title, pyramid: row.pyramidArea, blockType: "OEKT", origin: proposal ? "COACH" : "PLAYER", notes: row.notes, rationale: row.focus, status: proposal ? "PUBLISHED" : "DRAFT", needsPlayerApproval: proposal, approvalStatus: proposal ? "PENDING" : null, publishedAt: proposal ? new Date() : null, publishedBy: proposal ? viewer.id : null } });
        for (const [i, drill] of drills.data.entries()) await tx.workbenchDrill.create({ data: { ...drill, id: `${id}-drill-${i}`, sessionId: id } });
        applied.push({ sessionId: id, dayIndex: row.dagNr - 1, dayKey: ["man","tir","ons","tor","fre","lor","son"][row.dagNr - 1] as ScheduledTemplateSession["dayKey"], hour: 9, minute: 0, title: row.title, durMin: row.varighetMin, area: row.pyramidArea });
      }
      if (applied.length) await tx.planTemplate.update({ where: { id: templateId }, data: { usageCount: { increment: 1 } } });
      return { ok: true as const, sessions: applied };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    revalidate(); return result;
  } catch (error) { return feil(error); }
}
export async function applyWorkbenchTemplate(templateId: string, weekNr = 1) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  return applyTemplateCore(templateId, user.id, user, weekNr);
}
export async function coachApplyWorkbenchTemplate(playerId: string, templateId: string, weekNr = 1) {
  const viewer = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await assertCapability(viewer, Capability.EDIT_PLAYER_PLAN);
  if (!(await harCoachTilgangTilSpiller(viewer, playerId))) return { ok: false as const, error: "Du har ikke tilgang til denne spilleren." };
  return applyTemplateCore(templateId, playerId, viewer, weekNr);
}
