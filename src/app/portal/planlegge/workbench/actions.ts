"use server";

/**
 * Server actions for Workbench Plan A · Sprint 3.
 * Persisterer perioder, samlinger, fasiliteter og plan-varianter.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

// ============================================================================
// PERIODE
// ============================================================================

export async function createPeriod(formData: FormData) {
  const user = await requirePortalUser();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const weeks = Number(formData.get("weeks") ?? 6);

  if (!name) throw new Error("Navn er påkrevd");

  // Finn eller opprett aktiv TechnicalPlan
  let plan = await prisma.technicalPlan.findFirst({
    where: { userId: user.id, status: "ACTIVE", isDraft: false },
    orderBy: { createdAt: "desc" },
  });
  if (!plan) {
    plan = await prisma.technicalPlan.create({
      data: {
        userId: user.id,
        opprettetAvId: user.id,
        navn: "Min plan",
        status: "ACTIVE",
        planVariant: "A",
        startDato: new Date(),
      },
    });
  }

  // PeriodBlock-modellen finnes ikke nødvendigvis ennå —
  // logger som plan-audit i mellomtiden.
  await prisma.technicalPlanAudit.create({
    data: {
      planId: plan.id,
      actorId: user.id,
      action: "PERIOD_CREATED",
      payload: { name, type, weeks } as object,
    },
  });

  revalidatePath("/portal/planlegge/workbench");
  return { ok: true, name };
}

// ============================================================================
// TRENINGSSAMLING
// ============================================================================

export async function createTrainingCamp(formData: FormData) {
  const user = await requirePortalUser();
  const name = String(formData.get("name") ?? "").trim();
  const startDate = new Date(String(formData.get("startDate") ?? ""));
  const endDate = new Date(String(formData.get("endDate") ?? ""));
  const partner = String(formData.get("partner") ?? "");
  const location = (formData.get("location") as string) || null;

  if (!name) throw new Error("Navn er påkrevd");
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error("Ugyldig dato");
  }

  await prisma.trainingCamp.create({
    data: {
      userId: user.id,
      name,
      startDate,
      endDate,
      partner: partner || null,
      location,
    },
  });

  revalidatePath("/portal/planlegge/workbench");
  return { ok: true };
}

export async function listTrainingCamps() {
  const user = await requirePortalUser();
  return prisma.trainingCamp.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "asc" },
  });
}

// ============================================================================
// PLAN A/B
// ============================================================================

export async function setActivePlanVariant(planId: string) {
  const user = await requirePortalUser();

  const plan = await prisma.technicalPlan.findUnique({ where: { id: planId } });
  if (!plan || plan.userId !== user.id) {
    redirect("/portal/planlegge/workbench");
  }

  // Sett alle planer for brukeren til ARCHIVED, så aktiver valgt
  await prisma.technicalPlan.updateMany({
    where: { userId: user.id, status: "ACTIVE" },
    data: { status: "ARCHIVED" },
  });
  await prisma.technicalPlan.update({
    where: { id: planId },
    data: { status: "ACTIVE", isDraft: false },
  });

  revalidatePath("/portal/planlegge/workbench");
  return { ok: true };
}

export async function listUserPlans() {
  const user = await requirePortalUser();
  return prisma.technicalPlan.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 5,
  });
}

// ============================================================================
// PLAN SESSIONS — drag-drop-persistering (Sprint 6)
// ============================================================================

import { WBP_SESSIONS } from "@/components/portal-planlegge/workbench/types";

export async function listPlanSessions() {
  const user = await requirePortalUser();
  const rows = await prisma.planSession.findMany({
    where: { userId: user.id },
    orderBy: [{ week: "asc" }, { day: "asc" }],
  });
  // Seed med mock-data hvis bruker ikke har noen sessions
  if (rows.length === 0) {
    await prisma.planSession.createMany({
      data: WBP_SESSIONS.map((s) => ({
        userId: user.id,
        week: s.week,
        day: s.day,
        span: s.span,
        axis: s.axis,
        title: s.title,
        meta: s.meta,
        done: s.done ?? false,
        isNow: s.now ?? false,
        isPeak: s.peak ?? false,
      })),
    });
    return prisma.planSession.findMany({
      where: { userId: user.id },
      orderBy: [{ week: "asc" }, { day: "asc" }],
    });
  }
  return rows;
}

export async function moveSessionAction(
  sessionId: string,
  toAxis: string,
  toWeek: number,
  toDay: number,
) {
  const user = await requirePortalUser();
  const sess = await prisma.planSession.findUnique({ where: { id: sessionId } });
  if (!sess || sess.userId !== user.id) {
    throw new Error("Session ikke funnet");
  }
  await prisma.planSession.update({
    where: { id: sessionId },
    data: { axis: toAxis, week: toWeek, day: toDay },
  });
  revalidatePath("/portal/planlegge/workbench");
  return { ok: true };
}

// ============================================================================
// AI — Caddie (Sprint 6: stub-impl med toast-fallback)
// ============================================================================

export async function generateWeekWithCaddie(periodId: string, weekNumber: number) {
  await requirePortalUser();
  // TODO: ekte Anthropic API-kall når ANTHROPIC_API_KEY er konfigurert
  // For nå returnerer vi en stub-respons
  void periodId;
  void weekNumber;
  return {
    ok: true,
    message:
      "Caddie-integrasjon kommer post-launch. Krever ANTHROPIC_API_KEY i prod-miljø.",
  };
}

// ============================================================================
// FASILITETER
// ============================================================================

type FacilityState = {
  range: boolean;
  putting: boolean;
  shortgame: boolean;
  trackman: boolean;
  course9: boolean;
  course18: boolean;
  gym: boolean;
  yoga: boolean;
  pool: boolean;
  video: boolean;
};

export async function saveFacilities(state: FacilityState) {
  const user = await requirePortalUser();
  await prisma.facilityPrefs.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...state },
    update: state,
  });
  revalidatePath("/portal/planlegge/workbench");
  return { ok: true };
}

export async function loadFacilities(): Promise<FacilityState> {
  const user = await requirePortalUser();
  const prefs = await prisma.facilityPrefs.findUnique({
    where: { userId: user.id },
  });
  if (!prefs) {
    return {
      range: true,
      putting: true,
      shortgame: true,
      trackman: true,
      course9: false,
      course18: true,
      gym: true,
      yoga: false,
      pool: false,
      video: true,
    };
  }
  return {
    range: prefs.range,
    putting: prefs.putting,
    shortgame: prefs.shortgame,
    trackman: prefs.trackman,
    course9: prefs.course9,
    course18: prefs.course18,
    gym: prefs.gym,
    yoga: prefs.yoga,
    pool: prefs.pool,
    video: prefs.video,
  };
}
