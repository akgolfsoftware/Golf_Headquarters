"use server";

/**
 * Server actions for Workbench Plan A · Sprint 3.
 * Persisterer perioder, samlinger, fasiliteter og plan-varianter.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { dateForDayIndex, executeSessionMove, weekRefDate } from "@/lib/workbench/session-move";
import { deleteV2ForPlanSession, upsertV2ForPlanSession } from "@/lib/workbench/v2-sync";
import { sanitizeAkFormel, type AkFormelInput } from "@/lib/workbench/ak-formel";

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

export async function listPlanSessions() {
  const user = await requirePortalUser();
  const rows = await prisma.planSession.findMany({
    where: { userId: user.id },
    orderBy: [{ week: "asc" }, { day: "asc" }],
  });
  // Ingen mock-seed — tom plan viser empty-state (ekte data, ikke falske økter).
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
// TRENINGSPLAN (TrainingPlan)
// ============================================================================

const createTrainingPlanSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd").max(120),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ugyldig dato"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ugyldig dato")
    .nullable()
    .optional(),
});

export async function createTrainingPlan(formData: FormData): Promise<{
  ok: boolean;
  planId?: string;
  error?: string;
}> {
  const user = await requirePortalUser();

  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: formData.get("endDate") ? String(formData.get("endDate")) : null,
  };

  const parsed = createTrainingPlanSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig inndata" };
  }

  const { name, startDate, endDate } = parsed.data;

  const plan = await prisma.trainingPlan.create({
    data: {
      userId: user.id,
      name,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status: "DRAFT",
      isActive: false,
    },
    select: { id: true },
  });

  revalidatePath("/portal/planlegge/workbench");
  return { ok: true, planId: plan.id };
}

export async function listTrainingPlans() {
  const user = await requirePortalUser();
  return prisma.trainingPlan.findMany({
    where: { userId: user.id },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    take: 10,
    select: {
      id: true,
      name: true,
      status: true,
      isActive: true,
      startDate: true,
      endDate: true,
      _count: { select: { sessions: true } },
    },
  });
}

// ============================================================================
// TRENINGSØKT (TrainingPlanSession)
// ============================================================================

const createTrainingPlanSessionSchema = z.object({
  planId: z.string().min(1),
  title: z.string().min(1, "Tittel er påkrevd").max(120),
  scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Ugyldig dato/tid"),
  durationMin: z.coerce.number().int().min(5).max(480),
  pyramidArea: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]),
  environment: z
    .enum(["RANGE", "BANE", "STUDIO", "HJEM", "SIMULATOR", "GYM"])
    .nullable()
    .optional(),
});

export async function createTrainingPlanSession(formData: FormData): Promise<{
  ok: boolean;
  sessionId?: string;
  error?: string;
}> {
  const user = await requirePortalUser();

  const raw = {
    planId: String(formData.get("planId") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
    durationMin: formData.get("durationMin"),
    pyramidArea: String(formData.get("pyramidArea") ?? ""),
    environment: formData.get("environment") ? String(formData.get("environment")) : null,
  };

  const parsed = createTrainingPlanSessionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig inndata" };
  }

  const { planId, title, scheduledAt, durationMin, pyramidArea, environment } = parsed.data;

  // Sjekk at planen tilhører innlogget bruker
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: { id: true, userId: true },
  });
  if (!plan || plan.userId !== user.id) {
    return { ok: false, error: "Plan ikke funnet" };
  }

  const ak = sanitizeAkFormel({
    lFase: (formData.get("lFase") as string) || null,
    miljo: (formData.get("miljo") as string) || null,
    csNivaa: (formData.get("csNivaa") as string) || null,
    pressureLevel: (formData.get("pressureLevel") as string) || null,
    pPosisjoner: formData.getAll("pPosisjoner").map(String),
  });
  const session = await prisma.trainingPlanSession.create({
    data: {
      planId,
      title,
      scheduledAt: new Date(scheduledAt),
      durationMin,
      pyramidArea,
      environment: environment ?? null,
      lFase: ak.lFase,
      miljo: ak.miljo,
      csNivaa: ak.csNivaa,
      pressureLevel: ak.pressureLevel,
      pPosisjoner: ak.pPosisjoner,
      status: "PLANNED",
    },
    select: { id: true },
  });

  revalidatePath("/portal/planlegge/workbench");
  return { ok: true, sessionId: session.id };
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

// ============================================================================
// WORKBENCH DRAG-DROP-PERSISTERING (spiller, inneværende uke)
// ============================================================================
//
// WorkbenchHybrid rendrer inneværende ukes TrainingPlanSession-er (mandag–fredag).
// Disse tre handlingene lagrer drag-drop: flytt en økt til en annen dag, legg til
// en ny økt på en dag, og slett en valgt økt. Dag-indeks 0 = mandag i inneværende
// uke; klokkeslettet beholdes ved flytting. Kun innlogget spillers egne økter
// (eierskap sjekkes via plan.userId).

const PYRAMID_AREAS = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
type WbPyramidArea = (typeof PYRAMID_AREAS)[number];

export async function moveWorkbenchSession(
  sessionId: string,
  dayIndex: number,
  weekOffset = 0,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requirePortalUser();
  const result = await executeSessionMove(prisma, {
    sessionId,
    playerId: user.id,
    dayIndex,
    refDate: weekRefDate(weekOffset),
  });
  if (!result.ok) return result;
  revalidatePath("/portal/planlegge/workbench");
  return { ok: true };
}

export async function addWorkbenchSession(input: {
  dayIndex: number;
  title: string;
  durMin: number;
  area: WbPyramidArea;
  hour: number;
  minute: number;
  weekOffset?: number;
  /** AK-formel fra palette-malen / valgt økt (renses server-side). */
  akFormel?: AkFormelInput;
}): Promise<{ ok: boolean; sessionId?: string; error?: string }> {
  const user = await requirePortalUser();
  if (input.dayIndex < 0 || input.dayIndex > 6) return { ok: false, error: "Ugyldig dag" };
  const area = PYRAMID_AREAS.includes(input.area) ? input.area : "TEK";

  // Heng økta på spillerens nyeste/aktive plan, eller opprett en hvis ingen finnes.
  let plan = await prisma.trainingPlan.findFirst({
    where: { userId: user.id },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    select: { id: true },
  });
  if (!plan) {
    plan = await prisma.trainingPlan.create({
      data: {
        userId: user.id,
        name: "Min plan",
        startDate: new Date(),
        status: "ACTIVE",
        isActive: true,
      },
      select: { id: true },
    });
  }

  const ak = sanitizeAkFormel(input.akFormel);
  const created = await prisma.trainingPlanSession.create({
    data: {
      planId: plan.id,
      title: input.title.trim().slice(0, 120) || "Ny økt",
      scheduledAt: dateForDayIndex(
        input.dayIndex,
        input.hour,
        input.minute,
        weekRefDate(input.weekOffset ?? 0),
      ),
      durationMin: Math.max(5, Math.min(480, Math.round(input.durMin))),
      pyramidArea: area,
      lFase: ak.lFase,
      miljo: ak.miljo,
      csNivaa: ak.csNivaa,
      pressureLevel: ak.pressureLevel,
      pPosisjoner: ak.pPosisjoner,
      status: "PLANNED",
    },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      durationMin: true,
      pyramidArea: true,
    },
  });

  await upsertV2ForPlanSession({
    planSessionId: created.id,
    playerId: user.id,
    title: created.title,
    scheduledAt: created.scheduledAt,
    durationMin: created.durationMin,
    pyramidArea: created.pyramidArea,
    miljo: ak.miljo,
  });

  revalidatePath("/portal/planlegge/workbench");
  return { ok: true, sessionId: created.id };
}

export async function removeWorkbenchSession(
  sessionId: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requirePortalUser();
  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { id: true, plan: { select: { userId: true } } },
  });
  if (!session || session.plan.userId !== user.id) {
    return { ok: false, error: "Økt ikke funnet" };
  }
  await deleteV2ForPlanSession(sessionId);
  await prisma.trainingPlanSession.delete({ where: { id: sessionId } });
  revalidatePath("/portal/planlegge/workbench");
  return { ok: true };
}
