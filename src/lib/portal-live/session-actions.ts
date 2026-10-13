"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { startSession as startWb } from "@/lib/workbench/wb-actions";
import { mutateSessionExecution } from "@/lib/workbench/wb-session-life-actions";
import { initialSessionExecution, readSessionExecution, sealSessionSnapshot, transitionSessionExecution } from "@/lib/workbench/wb-session-life";
import { startSession as startV2, logDrillReps, completeSession as completeV2 } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";
import { fullforWbLiveOkt, lagreWbOvelse, lagreWbOvelseVideo } from "./wb-live-actions";
import { isAwaitingGuardianConsent } from "@/lib/auth/minor";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSignedUrl } from "@/lib/storage/supabase-storage";
import { storedVideoHeaderMatches } from "@/lib/storage/video-content";
import { canAttachLiveVideo } from "./video-access";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZES, STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { LiveSessionIdSchema, loadAuthorizedLiveSource, type LiveSource } from "./session-source";
import { LiveDrillProgressSchema, LiveProgressListSchema, LiveReflectionSchema, readPrecisionProgress, type LiveDrillProgress } from "./session-progress";
import type { LiveDrillReps } from "@/lib/offline-queue/live-drill-kladd";

type Resultat = { ok: true } | { ok: false; error: string };
type RuteResultat = { ok: true; href: string } | { ok: false; error: string };
const ObjectSchema = z.record(z.string(), z.json());
const DurationSchema = z.number().int().min(0).max(43200).optional();
const FullLogSchema = z.object({ drillId: z.string().min(1).max(100), repsTotal: z.number().int().min(0).max(5000),
  repsWithoutBall: z.number().int().min(0).max(5000), repsLowSpeed: z.number().int().min(0).max(5000),
  repsAutomatic: z.number().int().min(0).max(5000), repsHit: z.number().int().min(0).max(5000),
  notes: z.string().max(1000).optional(), status: z.enum(["active", "queued", "done"]), actualDurationSec: DurationSchema, quantityOnly: z.boolean().optional() }).strict();
const FullLogsSchema = z.array(FullLogSchema).max(100);
const VideoSchema = z.object({ drillId: z.string().min(1).max(100), storagePath: z.string().min(1).max(500), videoUrl: z.string().url().max(2000).optional() }).strict();
function jsonSnapshot(value: unknown): Prisma.InputJsonObject {
  // Prisma-json lagrer ikke undefined; valider det faktiske serialiserte objektet.
  return ObjectSchema.parse(JSON.parse(JSON.stringify(value)));
}

function rawSnapshot(source: LiveSource) { return source.kind === "v2" ? source.row.completedSummary : source.row.liveSnapshot; }
function safeSnapshot(source: LiveSource): Prisma.InputJsonObject {
  const raw = rawSnapshot(source);
  const parsed = ObjectSchema.safeParse(raw ?? {});
  if (!parsed.success || (parsed.data.execution !== undefined && !readSessionExecution(parsed.data))) throw new Error("Ukjent gjennomføringsversjon.");
  if (parsed.data.precisionLive !== undefined && !LiveProgressListSchema.safeParse(parsed.data.precisionLive).success) throw new Error("Ukjent gjennomføringsversjon.");
  return parsed.data;
}
function active(source: LiveSource) {
  return source.kind === "workbench" ? source.row.status === "IN_PROGRESS" && !source.row.isTemplate && !source.row.hiddenByPlayer && !source.row.needsPlayerApproval && source.row.approvalStatus !== "REJECTED"
    : source.kind === "v2" ? source.row.status === "IN_PROGRESS" : source.row.status === "ACTIVE" || source.row.status === "PAUSED";
}
function revalidate(sessionId: string) {
  revalidatePath("/portal"); revalidatePath("/portal/planlegge"); revalidatePath(`/portal/live/${sessionId}`, "layout");
}
async function writeSnapshot(source: LiveSource, snapshot: Prisma.InputJsonValue) {
  const where = { id: source.row.id, status: source.row.status, updatedAt: source.row.updatedAt };
  const result = source.kind === "v2" ? await prisma.trainingSessionV2.updateMany({ where: { ...where, status: source.row.status }, data: { completedSummary: snapshot } })
    : source.kind === "plan" ? await prisma.trainingPlanSession.updateMany({ where: { ...where, status: source.row.status }, data: { liveSnapshot: snapshot } })
      : await prisma.workbenchSession.updateMany({ where, data: { liveSnapshot: snapshot } });
  if (result.count !== 1) throw new Error("Økten ble endret samtidig.");
}
function errorResult(): { ok: false; error: string } { return { ok: false, error: "Ikke lagret. Kontroller tilgang og øktstatus, og prøv igjen." }; }

/** Starter riktig modell. Bare den innloggede spilleren får starte sin gjennomføring. */
export async function startLiveOkt(sessionId: string): Promise<RuteResultat> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  if (!LiveSessionIdSchema.safeParse(sessionId).success) return errorResult();
  try {
    const source = await loadAuthorizedLiveSource(sessionId);
    if (source.ownerId !== user.id && !(source.kind === "v2" && source.row.participants.some((p) => p.userId === user.id && ["ACCEPTED", "ATTENDED"].includes(p.status)))) return errorResult();
    if (source.row.status === "COMPLETED") return { ok: true, href: `/portal/live/${sessionId}/summary` };
    if (source.kind === "workbench") {
      if (!active(source)) { const result = await startWb(sessionId); if (!result.ok) return result; }
    } else if (source.kind === "v2") {
      const result = await startV2(sessionId);
      if (result.state !== "active") return result.state === "completed" ? { ok: true, href: result.redirectTo } : errorResult();
      const refreshed = await loadAuthorizedLiveSource(sessionId);
      const raw = safeSnapshot(refreshed);
      if (!readSessionExecution(raw)) {
        const now = new Date().toISOString();
        await writeSnapshot(refreshed, jsonSnapshot({ ...raw, startedAtISO: now, totalSec: 0, execution: initialSessionExecution(now) }));
      }
    } else if (source.row.status === "PLANNED") {
      const now = new Date().toISOString(); const raw = safeSnapshot(source);
      const result = await prisma.trainingPlanSession.updateMany({ where: { id: sessionId, status: "PLANNED", updatedAt: source.row.updatedAt },
        data: { status: "ACTIVE", liveSnapshot: jsonSnapshot({ ...raw, startedAtISO: now, totalSec: 0, updatedAtISO: now, precisionLive: [], execution: initialSessionExecution(now) }) } });
      if (result.count !== 1) return errorResult();
    } else if (!active(source)) return errorResult();
    revalidate(sessionId);
    return { ok: true, href: `/portal/live/${sessionId}/active` };
  } catch { return errorResult(); }
}

async function saveProgress(source: LiveSource, logs: LiveDrillProgress[], detailed?: LiveDrillReps[], totalSec?: number) {
  if (!active(source)) throw new Error("Økta er ikke i gang.");
  if (logs.some((l) => !source.row.drills.some((d) => d.id === l.drillId))) throw new Error("Øvelsen hører ikke til økta.");
  const raw = safeSnapshot(source);
  const progress = readPrecisionProgress(raw);
  for (const log of logs) {
    const index = progress.findIndex((p) => p.drillId === log.drillId);
    const merged = LiveDrillProgressSchema.parse({ ...(index >= 0 ? progress[index] : {}), ...Object.fromEntries(Object.entries(log).filter(([, value]) => value !== undefined)) });
    if (index >= 0) progress[index] = merged; else progress.push(merged);
    if (source.kind === "workbench") {
      const result = await lagreWbOvelse(source.row.id, { drillId: log.drillId, reps: log.reps, ...(log.kommentar !== undefined ? { kommentar: log.kommentar } : {}) });
      if (!result.ok) throw new Error(result.error);
    } else if (source.kind === "v2") {
      const existing = await prisma.drillLogV2.findFirst({ where: { drillId: log.drillId, loggedBy: source.viewer.id }, orderBy: { loggedAt: "desc" } });
      const detail = detailed?.find((d) => d.drillId === log.drillId && !d.quantityOnly);
      // Enkel PH05-telling endrer totalen. Eldre detaljlogger bevares som kilde;
      // en mengde alene er aldri bevis på treff, lav fart eller automatikk.
      const result = await logDrillReps({ sessionId: source.row.id, drillId: log.drillId, repsTotal: log.reps,
        repsWithoutBall: detail?.repsWithoutBall ?? existing?.repsWithoutBall ?? 0, repsLowSpeed: detail?.repsLowSpeed ?? existing?.repsLowSpeed ?? 0,
        repsAutomatic: detail?.repsAutomatic ?? existing?.repsAutomatic ?? 0, repsHit: detail?.repsHit ?? existing?.repsHit ?? 0,
        notes: log.kommentar ?? existing?.notes ?? undefined, actualDurationSec: log.elapsedSec });
      if (!result.ok) throw new Error("Kunne ikke lagre øvelsen.");
    }
  }
  // Underhandlinger kan ha skrevet en ny versjon. Les igjen før versjonsvakt.
  const refreshed = await loadAuthorizedLiveSource(source.row.id);
  if (!active(refreshed)) throw new Error("Økta er avsluttet.");
  const current = safeSnapshot(refreshed);
  const newer = readPrecisionProgress(current).filter((p) => !logs.some((l) => l.drillId === p.drillId));
  const execution = readSessionExecution(current);
  // Den avgrensede enhetsklokka registrerer aktiv tid, også ved pause uten nett.
  // Veggklokketid mens enheten ventet på nett er aldri registrert treningstid.
  const measured = totalSec !== undefined && execution ? { ...execution, accumulatedSec: totalSec, runningSinceISO: execution.phase === "ACTIVE" ? new Date().toISOString() : null } : execution;
  await writeSnapshot(refreshed, jsonSnapshot({ ...current, ...(totalSec !== undefined ? { totalSec: measured?.accumulatedSec ?? totalSec } : {}), ...(measured ? { execution: measured } : {}),
    precisionLive: [...newer, ...progress.filter((p) => logs.some((l) => l.drillId === p.drillId))] }));
}

/** Offline-køens komplette gamle loggformat bevares for V2. */
export async function lagreLiveDrillSnapshot(sessionId: string, input: unknown, totalSec?: number, paused?: boolean): Promise<Resultat> {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = FullLogsSchema.safeParse(input);
  if (!parsed.success || !LiveSessionIdSchema.safeParse(sessionId).success || !DurationSchema.safeParse(totalSec).success || !z.boolean().optional().safeParse(paused).success || new Set(parsed.data.map((d) => d.drillId)).size !== parsed.data.length) return { ok: false, error: "Ugyldig registrering." };
  const logs = parsed.data.map((d) => ({ drillId: d.drillId, reps: d.repsTotal, elapsedSec: d.actualDurationSec, status: d.status, kommentar: d.notes }));
  try {
    if (paused !== undefined) {
      const phase = await changePhase(sessionId, paused ? "PAUSE" : "RESUME");
      if (!phase.ok) return phase;
    }
    await saveProgress(await loadAuthorizedLiveSource(sessionId), logs, parsed.data, totalSec);
    revalidate(sessionId); return { ok: true };
  }
  catch { return errorResult(); }
}

/** Kobler bare en faktisk opplastet fil i spillerens private lagringsområde. */
export async function lagreLiveOvelseVideo(sessionId: string, input: unknown): Promise<Resultat> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  if (isAwaitingGuardianConsent(user)) return { ok: false, error: "Video krever samtykke fra forelder." };
  const parsed = VideoSchema.safeParse(input);
  if (!parsed.success || !LiveSessionIdSchema.safeParse(sessionId).success) return { ok: false, error: "Ugyldig video." };
  const path = parsed.data.storagePath;
  if (!path.startsWith(`${user.id}/`) || path.includes("..") || path.includes("\\") || path.includes("%")) return { ok: false, error: "Ugyldig video." };
  try {
    const source = await loadAuthorizedLiveSource(sessionId);
    if (!canAttachLiveVideo(source, user.id, parsed.data.drillId)) return errorResult();
    const bucket = STORAGE_BUCKETS.PLAYER_SWING_VIDEOS;
    const file = await supabaseAdmin().storage.from(bucket).info(path);
    const contentType = file.data?.contentType ?? file.data?.metadata?.mimetype;
    const size = file.data?.size ?? file.data?.metadata?.size;
    if (file.error || !file.data || file.data.name !== path || typeof contentType !== "string" || !ALLOWED_MIME_TYPES[bucket].includes(contentType)
      || typeof size !== "number" || !Number.isFinite(size) || size <= 0 || size > MAX_FILE_SIZES[bucket]) return { ok: false, error: "Videoen finnes ikke som en gyldig opplastet fil." };
    // Klientens URL er ingen kilde. Serveren signerer sin kontrollerte lagringssti.
    const videoUrl = await getSignedUrl(bucket, path);
    const existing = await prisma.playerSwingVideo.findFirst({ where: { userId: user.id, storagePath: path, liveSessionId: sessionId, drillId: parsed.data.drillId }, select: { id: true } });
    if (existing) return { ok: true };
    if (!(await storedVideoHeaderMatches(videoUrl, contentType, size))) return { ok: false, error: "Filinnholdet er ikke en støttet video. Velg originalvideoen og prøv igjen." };
    if (source.kind === "workbench") return lagreWbOvelseVideo(sessionId, { drillId: parsed.data.drillId, storagePath: path, videoUrl });
    await prisma.playerSwingVideo.create({ data: { userId: user.id, videoUrl, storagePath: path, liveSessionId: sessionId,
      liveSessionKind: source.kind === "v2" ? "session-v2" : "plan-session", drillId: parsed.data.drillId, status: "PROCESSING",
      consentVerified: !user.requiresGuardianConsent || Boolean(user.guardianConsentGivenAt), analysis: { create: { status: "PENDING" } } } });
    revalidate(sessionId); return { ok: true };
  } catch { return { ok: false, error: "Videoen ble ikke koblet til øvelsen. Prøv igjen." }; }
}

/** Absolutt telling gjør retry trygg. Identitet og modell kommer fra serveren. */
export async function lagreLiveOvelse(sessionId: string, input: unknown): Promise<Resultat> {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = LiveDrillProgressSchema.safeParse(input);
  if (!parsed.success || !LiveSessionIdSchema.safeParse(sessionId).success) return { ok: false, error: "Ugyldig registrering." };
  try { await saveProgress(await loadAuthorizedLiveSource(sessionId), [parsed.data]); revalidate(sessionId); return { ok: true }; }
  catch { return errorResult(); }
}

async function changePhase(sessionId: string, action: "PAUSE" | "RESUME"): Promise<Resultat> {
  const source = await loadAuthorizedLiveSource(sessionId);
  if (!active(source)) return errorResult();
  const raw = safeSnapshot(source);
  const execution = readSessionExecution(raw);
  if (execution?.phase === (action === "PAUSE" ? "PAUSED" : "ACTIVE")) return { ok: true };
  const command = { sessionId, action, expectedUpdatedAt: source.row.updatedAt.toISOString(), requestId: crypto.randomUUID() };
  if (source.kind === "workbench") {
    const result = await mutateSessionExecution(command); if (!result.ok) return result;
  } else {
    const next = transitionSessionExecution(command, { status: "IN_PROGRESS", actualMinutes: null, perceivedEffort: null, liveSnapshot: raw }, source.viewer.id, new Date().toISOString());
    if (!next.retry) {
      const where = { id: sessionId, status: source.row.status, updatedAt: source.row.updatedAt };
      const result = source.kind === "v2" ? await prisma.trainingSessionV2.updateMany({ where: { ...where, status: source.row.status }, data: { completedSummary: next.snapshot as Prisma.InputJsonObject } })
        : await prisma.trainingPlanSession.updateMany({ where: { ...where, status: source.row.status }, data: { status: action === "PAUSE" ? "PAUSED" : "ACTIVE", liveSnapshot: next.snapshot as Prisma.InputJsonObject } });
      if (result.count !== 1) return errorResult();
    }
  }
  revalidate(sessionId); return { ok: true };
}
export async function pauseLiveOkt(sessionId: string): Promise<Resultat> {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  if (!LiveSessionIdSchema.safeParse(sessionId).success) return errorResult();
  try { return await changePhase(sessionId, "PAUSE"); } catch { return errorResult(); }
}
export async function resumeLiveOkt(sessionId: string): Promise<Resultat> {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  if (!LiveSessionIdSchema.safeParse(sessionId).success) return errorResult();
  try { return await changePhase(sessionId, "RESUME"); } catch { return errorResult(); }
}

export async function fullforLiveOkt(sessionId: string, input: unknown, durationSec?: number): Promise<RuteResultat> {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = LiveProgressListSchema.safeParse(input);
  if (!LiveSessionIdSchema.safeParse(sessionId).success || !parsed.success || !DurationSchema.safeParse(durationSec).success || new Set(parsed.data.map((l) => l.drillId)).size !== parsed.data.length) return { ok: false, error: "Ugyldig registrering." };
  try {
    let source = await loadAuthorizedLiveSource(sessionId);
    const href = `/portal/live/${sessionId}/summary`;
    if (source.row.status === "COMPLETED") return source.kind === "workbench" ? fullforWbLiveOkt(sessionId, parsed.data.map(({ drillId, reps, kommentar }) => ({ drillId, reps, ...(kommentar !== undefined ? { kommentar } : {}) }))) : { ok: true, href };
    await saveProgress(source, parsed.data, undefined, durationSec);
    source = await loadAuthorizedLiveSource(sessionId);
    if (source.kind === "workbench") return fullforWbLiveOkt(sessionId, parsed.data.map(({ drillId, reps, kommentar }) => ({ drillId, reps, ...(kommentar !== undefined ? { kommentar } : {}) })));
    if (source.kind === "v2") {
      const completed = await completeV2(sessionId, durationSec, parsed.data.filter((l) => l.status === "done").map((l) => l.drillId));
      return { ok: true, href: completed.href };
    }
    const raw = safeSnapshot(source); const now = new Date();
    const logs = readPrecisionProgress(raw); const execution = readSessionExecution(raw);
    const startedAt = typeof raw.startedAtISO === "string" && Number.isFinite(Date.parse(raw.startedAtISO)) ? new Date(raw.startedAtISO) : now;
    const final = sealSessionSnapshot(raw, "COMPLETED", now.toISOString());
    // Bare registrert tid fryses; planlagt varighet brukes aldri som faktisk tid.
    if (!execution && durationSec !== undefined) final.totalSec = durationSec;
    await prisma.$transaction(async (tx) => {
      const result = await tx.trainingPlanSession.updateMany({ where: { id: sessionId, status: source.row.status === "PAUSED" ? "PAUSED" : "ACTIVE", updatedAt: source.row.updatedAt }, data: { status: "COMPLETED", liveSnapshot: final as Prisma.InputJsonObject } });
      if (result.count !== 1) throw new Error("Økten ble endret samtidig.");
      await tx.trainingPlanSessionLog.upsert({ where: { sessionId }, create: { sessionId, startedAt, completedAt: now, totalReps: logs.reduce((sum, l) => sum + l.reps, 0), drillAggregates: logs }, update: { completedAt: now, totalReps: logs.reduce((sum, l) => sum + l.reps, 0), drillAggregates: logs } });
    });
    revalidate(sessionId); return { ok: true, href };
  } catch { return errorResult(); }
}

/** Privat svar lagres på spillerens økt, og publiseres bare når deling er valgt. */
export async function lagreLiveOppsummering(sessionId: string, input: unknown): Promise<Resultat> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  const parsed = LiveReflectionSchema.safeParse(input);
  if (!parsed.success || !LiveSessionIdSchema.safeParse(sessionId).success) return { ok: false, error: "Oppsummeringen kan ha inntil 2 000 tegn." };
  try {
    const source = await loadAuthorizedLiveSource(sessionId);
    if (source.ownerId !== user.id || source.row.status !== "COMPLETED") return errorResult();
    const raw = safeSnapshot(source);
    const note = parsed.data.note.trim();
    const reflection = { note, shareWithCoach: parsed.data.shareWithCoach, loggedAt: new Date().toISOString(), loggedBy: user.id };
    // Eldre coach-visninger leser dineOrd; privat tekst må ikke være i det feltet.
    const { dineOrd: _previousShared, ...rest } = raw;
    const shared = parsed.data.shareWithCoach && note ? { dineOrd: { tekst: note, loggedAt: reflection.loggedAt, loggedBy: user.id } } : {};
    await writeSnapshot(source, { ...rest, ...shared, playerReflection: reflection });
    revalidate(sessionId); return { ok: true };
  } catch { return errorResult(); }
}
