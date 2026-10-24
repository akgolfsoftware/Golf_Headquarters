import "server-only";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { planActionAvvisSpor, planActionOkSpor } from "@/lib/agents/plan-action-spor";
import { AK_PROFIL_SCOPE, AK_PROFIL_VERSJON } from "./ak-profil-regler";
import { akProfilGruppeWhere, medAkProfiler, AK_PROFIL_TRANSAKSJON } from "./ak-profil-lesing";
import { laasBrukere } from "./ak-analyse-laas";

type Viewer = { id: string; role: string };
type Tx = Prisma.TransactionClient;
const id = z.string().trim().min(1).max(200);
const deling = z.object({ gruppeId: id, scope: z.literal(AK_PROFIL_SCOPE), tekstVersjon: z.literal(AK_PROFIL_VERSJON) });
const forslag = z.object({ forklaring: z.string().min(1).max(2000), deling });
const avvist = () => new Error("forbidden");

/** Hele denne familien må gjennom den nye porten, også gamle/misformede rader. */
export function erAkTreningsobservasjon(action: { agentName?: string; actionType: string }) {
  return action.agentName === "training-gap" || ["COACH_REVIEW", "TRAINING_GAP"].includes(action.actionType);
}

function forslagWhere(viewer: Viewer, gruppeId: string, scope: Prisma.UserWhereInput): Prisma.PlanActionWhereInput {
  return { coachId: viewer.id, agentName: "training-gap", actionType: "COACH_REVIEW", user: scope,
    AND: [
      { suggestion: { path: ["deling", "gruppeId"], equals: gruppeId } },
      { suggestion: { path: ["deling", "scope"], equals: AK_PROFIL_SCOPE } },
      { suggestion: { path: ["deling", "tekstVersjon"], equals: AK_PROFIL_VERSJON } },
    ],
  };
}

/** Familien leses separat under fersk deling, aldri gjennom den gamle medlemskøen. */
export const UTEN_AK_TRENINGSOBSERVASJON: Prisma.PlanActionWhereInput = {
  NOT: { OR: [{ agentName: "training-gap" }, { actionType: { in: ["COACH_REVIEW", "TRAINING_GAP"] } }] },
};

const lesSelect = { id: true, userId: true, planId: true, provenance: true, actionType: true, status: true, createdAt: true, updatedAt: true, agentName: true, sjekkpunkt: true, suggestion: true,
  user: { select: { id: true, name: true } } } as const;
type LestForslag = Prisma.PlanActionGetPayload<{ select: typeof lesSelect }>;

type Lesevalg = {
  maksRader?: number;
  status?: "PENDING" | readonly ("ACCEPTED" | "REJECTED")[];
  endretSiden?: Date;
  rekkefolge?: "eldst" | "endret";
  godkjentAvViewerSiden?: Date;
};

/** Begrens først etter sammenslåing, med stabil rekkefølge ved like tidspunkt. */
export function begrensForslagsliste<T extends { id: string; createdAt: Date }>(rader: T[], maks: number, eldst = false): T[] {
  return rader.sort((a, b) => (eldst ? 1 : -1) * (a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id))).slice(0, maks);
}

/** Listen, alle tellere og eldste forslag har samme mottaker- og delingsfilter. */
export async function hentAkTreningsobservasjoner(viewer: Viewer, valg: Lesevalg = {}) {
  const maksRader = Math.min(60, Math.max(0, valg.maksRader ?? 10));
  const syvDagerSiden = new Date(Date.now() - 7 * 86_400_000);
  const resultat = { planActions: [] as LestForslag[], pendingCount: 0, acceptedCount: 0, rejectedCount: 0,
    accepted7d: 0, rejected7d: 0, godkjentAvViewer: 0, eldstePending: null as { createdAt: Date; user: { name: string | null } } | null };
  if (!["COACH", "ADMIN"].includes(viewer.role)) return resultat;
  const grupper = await prisma.group.findMany({ where: { ...akProfilGruppeWhere(), coachId: viewer.id }, select: { id: true }, orderBy: { id: "asc" } });
  for (const gruppe of grupper) {
    const lest = await medAkProfiler(viewer, async (tx, scope) => {
      if (!await tx.group.findFirst({ where: { id: gruppe.id, coachId: viewer.id }, select: { id: true } })) return null;
      const where = forslagWhere(viewer, gruppe.id, scope);
      const [planActions, pendingCount, acceptedCount, rejectedCount, eldstePending, accepted7d, rejected7d, godkjentAvViewer] = await Promise.all([
        tx.planAction.findMany({ where: { ...where,
          ...(valg.status ? { status: typeof valg.status === "string" ? valg.status : { in: [...valg.status] } } : {}),
          ...(valg.endretSiden ? { updatedAt: { gte: valg.endretSiden } } : {}),
        }, select: lesSelect,
          orderBy: valg.rekkefolge === "endret" ? [{ updatedAt: "desc" }, { id: "desc" }]
            : [{ createdAt: valg.rekkefolge === "eldst" ? "asc" : "desc" }, { id: valg.rekkefolge === "eldst" ? "asc" : "desc" }],
          take: maksRader }),
        tx.planAction.count({ where: { ...where, status: "PENDING" } }),
        tx.planAction.count({ where: { ...where, status: "ACCEPTED" } }),
        tx.planAction.count({ where: { ...where, status: "REJECTED" } }),
        tx.planAction.findFirst({ where: { ...where, status: "PENDING" }, select: { createdAt: true, user: { select: { name: true } } }, orderBy: { createdAt: "asc" } }),
        tx.planAction.count({ where: { ...where, status: "ACCEPTED", decidedAt: { gte: syvDagerSiden } } }),
        tx.planAction.count({ where: { ...where, status: "REJECTED", decidedAt: { gte: syvDagerSiden } } }),
        valg.godkjentAvViewerSiden ? tx.planAction.count({ where: { ...where, status: "ACCEPTED",
          decidedAt: { gte: valg.godkjentAvViewerSiden }, decidedById: viewer.id } }) : 0,
      ]);
      return { planActions, pendingCount, acceptedCount, rejectedCount, eldstePending, accepted7d, rejected7d, godkjentAvViewer };
    }, "handling", { gruppeId: gruppe.id });
    if (!lest) continue;
    resultat.planActions.push(...lest.planActions);
    resultat.godkjentAvViewer += lest.godkjentAvViewer;
    resultat.accepted7d += lest.accepted7d; resultat.rejected7d += lest.rejected7d;
    resultat.pendingCount += lest.pendingCount; resultat.acceptedCount += lest.acceptedCount; resultat.rejectedCount += lest.rejectedCount;
    if (lest.eldstePending && (!resultat.eldstePending || lest.eldstePending.createdAt < resultat.eldstePending.createdAt)) resultat.eldstePending = lest.eldstePending;
  }
  resultat.planActions = valg.rekkefolge === "endret"
    ? resultat.planActions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime() || b.id.localeCompare(a.id)).slice(0, maksRader)
    : begrensForslagsliste(resultat.planActions, maksRader, valg.rekkefolge === "eldst");
  return resultat;
}

/** Kun databasehandlinger. Ingen generell executor, planendring eller ekstern utsending. */
export async function behandleAkTreningsobservasjon(viewer: Viewer, actionId: unknown,
  valg: "ACCEPTED" | "REJECTED" | "QUESTION", tekst?: string) {
  const actionKey = id.parse(actionId);
  const note = z.string().trim().max(500).optional().parse(tekst) || undefined;
  if (valg === "QUESTION" && (!note || note.length < 3)) throw new Error("spørsmål-påkrevd");
  // Bare autorisasjonsmetadata før adgang: ikke les hele forslaget eller navn.
  const [ruting] = await prisma.$queryRaw<Array<{ userId: string; coachId: string | null; gruppeId: string | null }>>`
    SELECT "userId", "coachId", suggestion #>> '{deling,gruppeId}' AS "gruppeId"
    FROM plan_actions WHERE id = ${actionKey}`;
  if (!ruting) throw avvist();
  const egen = ruting.userId === viewer.id;
  if (!egen && (ruting.coachId !== viewer.id || !ruting.gruppeId)) throw avvist();

  const behandle = async (tx: Tx, scope?: Prisma.UserWhereInput) => {
    await tx.$queryRaw`SELECT id FROM plan_actions WHERE id = ${actionKey} FOR UPDATE`;
    const action = await tx.planAction.findFirst({ where: { id: actionKey,
      ...(egen ? { userId: viewer.id } : forslagWhere(viewer, ruting.gruppeId!, scope!)),
    }, select: { id: true, userId: true, actionType: true, agentName: true, suggestion: true, status: true } });
    if (!action || !erAkTreningsobservasjon(action)) throw avvist();
    // Gamle observasjoner får ikke oppgradert gruppetilknytning. Eieren kan
    // fortsatt behandle sin gamle TRAINING_GAP uten å legge til en økt.
    const gammelEgen = egen && action.actionType === "TRAINING_GAP" && action.agentName === "training-gap";
    if (!gammelEgen && (action.agentName !== "training-gap" || action.actionType !== "COACH_REVIEW" || !forslag.safeParse(action.suggestion).success)) throw avvist();
    if (action.status !== "PENDING") return { status: "UNCHANGED" as const, applied: false };
    if (valg === "QUESTION") {
      if (egen) throw avvist();
      await tx.planAction.update({ where: { id: action.id }, data: { decisionNote: note } });
      await tx.notification.create({ data: { userId: action.userId, type: "approval_question", title: "Coach trenger mer info",
        body: note!.slice(0, 280), link: "/portal/agent-pipeline" } });
      return { status: "UNCHANGED" as const, applied: false, questionRecorded: true as const };
    }
    await tx.planAction.update({ where: { id: action.id }, data: { status: valg, decidedAt: new Date(), decidedById: viewer.id,
      ...(valg === "REJECTED" ? { rejectReason: note } : { decisionNote: note }) } });
    await tx.agentRun.create({ data: valg === "REJECTED"
      ? planActionAvvisSpor({ actionId: action.id, actionType: action.actionType, userId: action.userId })
      : planActionOkSpor({ actionId: action.id, actionType: action.actionType, userId: action.userId, applied: true }) });
    return { status: valg, applied: valg === "ACCEPTED" };
  };
  if (egen) {
    if (!["PLAYER", "COACH", "ADMIN"].includes(viewer.role)) throw avvist();
    return prisma.$transaction(async tx => {
      await laasBrukere(tx, [viewer.id]);
      if (!await tx.user.findFirst({ where: { id: viewer.id, deletedAt: null, role: viewer.role as "PLAYER" | "COACH" | "ADMIN" }, select: { id: true } })) throw avvist();
      return behandle(tx);
    }, AK_PROFIL_TRANSAKSJON);
  }
  const resultat = await medAkProfiler(viewer, async (tx, scope) => {
    if (!await tx.group.findFirst({ where: { id: ruting.gruppeId!, coachId: viewer.id }, select: { id: true } })) throw avvist();
    return behandle(tx, scope);
  }, "handling", { gruppeId: ruting.gruppeId! });
  if (!resultat) throw avvist();
  return resultat;
}
