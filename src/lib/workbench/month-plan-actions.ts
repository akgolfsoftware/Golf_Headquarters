"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { Prisma, type MonthlyPlan, type UserRole } from "@/generated/prisma/client";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachLesetilgangTilSpiller } from "@/lib/auth/coached";
import { canUser } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { canEditGroup } from "./group-scope";
import { osloDatoOgMinutt } from "./min-calendar";
import { EvaluateMonthSchema, MonthDetailsSchema, MonthEvaluationSchema, MonthKeySchema, ReplyMonthSchema, SaveMonthSchema, monthEnded, type MonthKey, type MonthPlanView, type MonthResult } from "@/lib/domain/month-plan";

type Viewer = { id: string; role: UserRole };
type Access = Pick<MonthPlanView, "canEdit" | "canPropose" | "canRespond" | "evaluationRole">;
type Db = Pick<Prisma.TransactionClient, "monthlyPlan" | "group">;
const DENIED = "Du har ikke tilgang til denne månedsplanen.";
const CONFLICT = "Månedsplanen er endret siden du åpnet den. Hent den på nytt før du lagrer.";
class MonthError extends Error {}

function where(key: MonthKey): Prisma.MonthlyPlanWhereUniqueInput {
  return key.owner.kind === "player"
    ? { playerId_year_month: { playerId: key.owner.playerId, year: key.year, month: key.month } }
    : { groupId_year_month: { groupId: key.owner.groupId, year: key.year, month: key.month } };
}
async function access(viewer: Viewer, key: MonthKey, db: Db): Promise<Access | null> {
  if (key.owner.kind === "player") {
    if (viewer.id === key.owner.playerId) return { canEdit: true, canPropose: false, canRespond: true, evaluationRole: "spiller" };
    if (!["COACH", "ADMIN"].includes(viewer.role) || !(await harCoachLesetilgangTilSpiller(viewer, key.owner.playerId))) return null;
    const edit = await canUser(viewer, Capability.EDIT_PLAYER_PLAN);
    return { canEdit: false, canPropose: edit, canRespond: false, evaluationRole: edit ? "coach" : null };
  }
  const group = await db.group.findFirst({ where: { id: key.owner.groupId, arkivertAt: null,
    ...(viewer.role === "ADMIN" ? {} : { OR: [{ coachId: viewer.id }, { members: { some: { userId: viewer.id, endedAt: null } } }] }),
  }, select: { id: true } });
  if (!group) return null;
  const editable = await canUser(viewer, Capability.EDIT_GROUP_PLANS) && await canEditGroup(viewer, key.owner.groupId, db);
  return { canEdit: editable, canPropose: false, canRespond: false, evaluationRole: editable ? "coach" : null };
}
function view(row: MonthlyPlan | null, key: MonthKey, permissions: Access): MonthPlanView {
  const details = row?.details == null ? null : MonthDetailsSchema.safeParse(row.details);
  const proposed = row?.proposedDetails == null ? null : MonthDetailsSchema.safeParse(row.proposedDetails);
  const playerEval = row?.playerEvaluation == null ? null : MonthEvaluationSchema.safeParse(row.playerEvaluation);
  const coachEval = row?.coachEvaluation == null ? null : MonthEvaluationSchema.safeParse(row.coachEvaluation);
  if ((details && !details.success) || (proposed && !proposed.success) || (playerEval && !playerEval.success) || (coachEval && !coachEval.success)) throw new MonthError("Månedsplanen kunne ikke leses. Innholdet må kontrolleres før det kan endres.");
  return { ...key, ...permissions, id: row?.id ?? null, revision: row?.revision ?? 0, activeRevision: row?.activeRevision ?? 0,
    details: details?.success ? details.data : null, proposedDetails: proposed?.success ? proposed.data : null,
    proposalStale: Boolean(row?.proposedDetails && row.proposalBaseActiveRevision !== row.activeRevision),
    playerEvaluation: playerEval?.success ? playerEval.data : null, coachEvaluation: coachEval?.success ? coachEval.data : null,
    ended: monthEnded(key.year, key.month, osloDatoOgMinutt(new Date()).date),
  };
}
function failure(error: unknown): MonthResult {
  return { ok: false, error: error instanceof MonthError ? error.message : "Månedsplanen kunne ikke lagres eller hentes. Prøv igjen." };
}
function refresh(key: MonthKey) {
  revalidatePath("/portal/planlegge/workbench");
  if (key.owner.kind === "player") revalidatePath(`/admin/workbench/${key.owner.playerId}`);
  else { revalidatePath(`/admin/grupper/${key.owner.groupId}`); revalidatePath("/wang", "layout"); revalidatePath("/team-norway", "layout"); }
}
type Change = MonthKey & { expectedRevision: number; requestId: string };
type ContentChange = Pick<Prisma.MonthlyPlanUncheckedCreateInput, "details" | "proposedDetails" | "proposedBy" | "proposalBaseActiveRevision" | "activeRevision" | "playerEvaluation" | "coachEvaluation">;
async function change(viewer: Viewer, input: Change, operation: string, payload: unknown, edit: (row: MonthlyPlan | null, permissions: Access) => ContentChange): Promise<MonthResult> {
  const hash = createHash("sha256").update(JSON.stringify({ operation, ...input, payload })).digest("hex");
  try {
    const result = await prisma.$transaction(async (db) => {
      const permissions = await access(viewer, input, db);
      if (!permissions) throw new MonthError(DENIED);
      const row = await db.monthlyPlan.findUnique({ where: where(input) });
      // A failed response can be retried with the same request, without a second write.
      if (row?.lastRequestId === input.requestId && row.updatedBy === viewer.id) {
        if (row.lastRequestHash !== hash) throw new MonthError("Denne lagringen inneholder endringer. Åpne skjemaet på nytt.");
        return view(row, input, permissions);
      }
      if ((row?.revision ?? 0) !== input.expectedRevision) throw new MonthError(CONFLICT);
      const update = edit(row, permissions);
      const audit = { revision: input.expectedRevision + 1, updatedBy: viewer.id, lastRequestId: input.requestId, lastRequestHash: hash, updatedAt: new Date() };
      let saved: MonthlyPlan;
      if (row) {
        const changed = await db.monthlyPlan.updateMany({ where: { id: row.id, revision: input.expectedRevision }, data: { ...update, ...audit } });
        if (changed.count !== 1) throw new MonthError(CONFLICT);
        saved = await db.monthlyPlan.findUniqueOrThrow({ where: { id: row.id } });
      } else {
        saved = await db.monthlyPlan.create({ data: { ...update, ...audit, year: input.year, month: input.month,
          playerId: input.owner.kind === "player" ? input.owner.playerId : null,
          groupId: input.owner.kind === "group" ? input.owner.groupId : null, createdBy: viewer.id,
        } });
      }
      return view(saved, input, permissions);
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    refresh(input);
    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2034"].includes(error.code)) return { ok: false, error: CONFLICT };
    return failure(error);
  }
}

export async function hentMaanedsplan(input: unknown): Promise<MonthResult> {
  const viewer = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = MonthKeySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Velg spiller eller gruppe og en gyldig måned." };
  try {
    const permissions = await access(viewer, parsed.data, prisma);
    if (!permissions) return { ok: false, error: DENIED };
    const row = await prisma.monthlyPlan.findUnique({ where: where(parsed.data) });
    return { ok: true, data: view(row, parsed.data, permissions) };
  } catch (error) { return failure(error); }
}

export async function lagreMaanedsplan(input: unknown): Promise<MonthResult> {
  const viewer = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = SaveMonthSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Kontroller fokus, målsetninger, mengde og prioriteringer før du lagrer." };
  const { details, ...key } = parsed.data;
  return change(viewer, key, "save", details, (row, permissions) => {
    if (permissions.canEdit) return { details: details as Prisma.InputJsonObject, activeRevision: (row?.activeRevision ?? 0) + 1 };
    if (permissions.canPropose) return { proposedDetails: details as Prisma.InputJsonObject, proposedBy: viewer.id, proposalBaseActiveRevision: row?.activeRevision ?? 0 };
    throw new MonthError(DENIED);
  });
}

export async function svarMaanedsplanForslag(input: unknown): Promise<MonthResult> {
  const viewer = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = ReplyMonthSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Åpne forslaget på nytt før du svarer." };
  const { accept, ...key } = parsed.data;
  return change(viewer, key, "reply", accept, (row, permissions) => {
    if (!permissions.canRespond || !row?.proposedDetails) throw new MonthError("Du har ikke et forslag å svare på.");
    if (accept && row.proposalBaseActiveRevision !== row.activeRevision) throw new MonthError("Din månedsplan er endret etter forslaget. Be coachen sende et oppdatert forslag.");
    const proposed = MonthDetailsSchema.parse(row.proposedDetails);
    return { ...(accept ? { details: proposed as Prisma.InputJsonObject, activeRevision: row.activeRevision + 1 } : {}),
      proposedDetails: Prisma.DbNull, proposedBy: null, proposalBaseActiveRevision: null };
  });
}

export async function evaluerMaanedsplan(input: unknown): Promise<MonthResult> {
  const viewer = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = EvaluateMonthSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Velg en vurdering fra 1 til 5 og skriv maksimalt 600 tegn." };
  const { score, text, ...key } = parsed.data;
  return change(viewer, key, "evaluate", { score, text }, (_row, permissions) => {
    if (!permissions.evaluationRole) throw new MonthError(DENIED);
    if (!monthEnded(key.year, key.month, osloDatoOgMinutt(new Date()).date)) throw new MonthError("Måneden kan evalueres når den er avsluttet.");
    const evaluation = { score, text, authorId: viewer.id, savedAt: new Date().toISOString() };
    return permissions.evaluationRole === "spiller" ? { playerEvaluation: evaluation } : { coachEvaluation: evaluation };
  });
}
