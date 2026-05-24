"use server";

/**
 * Server actions for FYS-plan-modulen.
 *
 * Alle actions verifiserer at brukeren har tilgang til planen (eier eller coach/admin).
 * Penger lagres aldri her, men logging av belastning er kritisk for spillerprogresjon —
 * derfor zod-validering på alle inputs.
 *
 * Per plan Del 31 (FYS-plan modul, 2026-05-24).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import type { Ukedag } from "@/generated/prisma/client";

// ---------- Schemas ----------

const UkedagSchema = z.enum(["MAN", "TIR", "ONS", "TOR", "FRE", "LOR", "SON"]);

const OpprettPlanSchema = z.object({
  navn: z.string().min(1, "Navn er påkrevd").max(120),
  startDato: z.coerce.date(),
  sluttDato: z.coerce.date().optional(),
  notater: z.string().max(2000).optional(),
});

const LeggTilUkeSchema = z.object({
  planId: z.string().min(1),
  ukeNr: z.number().int().min(1).max(52),
  label: z.string().min(1).max(120),
});

const LeggTilOktSchema = z.object({
  ukeId: z.string().min(1),
  navn: z.string().min(1).max(120),
  dag: UkedagSchema.optional(),
  estimertMinutter: z.number().int().min(1).max(600).optional(),
});

const LeggTilOvelseRadSchema = z.object({
  oktId: z.string().min(1),
  exerciseId: z.string().optional(),
  navn: z.string().min(1).max(160),
  sett: z.number().int().min(1).max(20).default(3),
  repsMin: z.number().int().min(1).max(100).optional(),
  repsMax: z.number().int().min(1).max(100).optional(),
  hvile: z.number().int().min(0).max(900).optional(),
  belastningPst: z.number().int().min(0).max(150).optional(),
  rir: z.number().int().min(0).max(10).optional(),
  muskelgruppe: z.string().max(80).optional(),
});

const LoggFullfortOktSchema = z.object({
  oktId: z.string().min(1),
  rader: z
    .array(
      z.object({
        radId: z.string().min(1),
        loggSett: z.number().int().min(0).max(20).optional(),
        loggRepsPerSett: z.string().max(120).optional(),
        loggBelastningKg: z.number().min(0).max(500).optional(),
        loggRir: z.number().int().min(0).max(10).optional(),
        notat: z.string().max(500).optional(),
      }),
    )
    .min(1),
});

// ---------- Auth-helpers ----------

async function ensurePlanAccess(planId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Ikke innlogget");

  const plan = await prisma.fysiskPlan.findUnique({
    where: { id: planId },
    select: { userId: true, opprettetAvId: true },
  });
  if (!plan) throw new Error("Plan ikke funnet");

  const isOwner = plan.userId === user.id || plan.opprettetAvId === user.id;
  const isCoachOrAdmin = user.role === "COACH" || user.role === "ADMIN";
  if (!isOwner && !isCoachOrAdmin) throw new Error("Ingen tilgang");

  return { user, plan };
}

async function ensureUkeAccess(ukeId: string) {
  const uke = await prisma.fysUke.findUnique({
    where: { id: ukeId },
    select: { planId: true },
  });
  if (!uke) throw new Error("Uke ikke funnet");
  const { user } = await ensurePlanAccess(uke.planId);
  return { user, planId: uke.planId };
}

async function ensureOktAccess(oktId: string) {
  const okt = await prisma.fysOkt.findUnique({
    where: { id: oktId },
    select: { uke: { select: { planId: true } } },
  });
  if (!okt) throw new Error("Økt ikke funnet");
  const { user } = await ensurePlanAccess(okt.uke.planId);
  return { user, planId: okt.uke.planId };
}

// ---------- Actions ----------

export async function opprettPlan(input: z.input<typeof OpprettPlanSchema>) {
  const data = OpprettPlanSchema.parse(input);
  const user = await getCurrentUser();
  if (!user) throw new Error("Ikke innlogget");

  const plan = await prisma.fysiskPlan.create({
    data: {
      userId: user.id,
      opprettetAvId: user.id,
      navn: data.navn,
      startDato: data.startDato,
      sluttDato: data.sluttDato,
      notater: data.notater,
    },
  });

  revalidatePath("/portal/tren/fys-plan");
  return { id: plan.id };
}

export async function leggTilUke(input: z.input<typeof LeggTilUkeSchema>) {
  const data = LeggTilUkeSchema.parse(input);
  await ensurePlanAccess(data.planId);

  const lastSort = await prisma.fysUke.findFirst({
    where: { planId: data.planId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const uke = await prisma.fysUke.create({
    data: {
      planId: data.planId,
      ukeNr: data.ukeNr,
      label: data.label,
      sortOrder: (lastSort?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/portal/tren/fys-plan/${data.planId}`);
  return { id: uke.id };
}

export async function leggTilOkt(input: z.input<typeof LeggTilOktSchema>) {
  const data = LeggTilOktSchema.parse(input);
  const { planId } = await ensureUkeAccess(data.ukeId);

  const lastSort = await prisma.fysOkt.findFirst({
    where: { ukeId: data.ukeId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const okt = await prisma.fysOkt.create({
    data: {
      ukeId: data.ukeId,
      navn: data.navn,
      dag: (data.dag ?? null) as Ukedag | null,
      estimertMinutter: data.estimertMinutter,
      sortOrder: (lastSort?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/portal/tren/fys-plan/${planId}`);
  return { id: okt.id };
}

export async function leggTilOvelseRad(
  input: z.input<typeof LeggTilOvelseRadSchema>,
) {
  const data = LeggTilOvelseRadSchema.parse(input);
  const { planId } = await ensureOktAccess(data.oktId);

  const lastSort = await prisma.fysOvelseRad.findFirst({
    where: { oktId: data.oktId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const rad = await prisma.fysOvelseRad.create({
    data: {
      oktId: data.oktId,
      exerciseId: data.exerciseId,
      navn: data.navn,
      sett: data.sett,
      repsMin: data.repsMin,
      repsMax: data.repsMax,
      hvile: data.hvile,
      belastningPst: data.belastningPst,
      rir: data.rir,
      muskelgruppe: data.muskelgruppe,
      sortOrder: (lastSort?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/portal/tren/fys-plan/${planId}`);
  return { id: rad.id };
}

export async function loggFullfortOkt(
  input: z.input<typeof LoggFullfortOktSchema>,
) {
  const data = LoggFullfortOktSchema.parse(input);
  const { planId } = await ensureOktAccess(data.oktId);

  // Verifiser at alle rader hører til økten (forhindrer cross-okt manipulasjon)
  const radIds = data.rader.map((r) => r.radId);
  const eksisterende = await prisma.fysOvelseRad.findMany({
    where: { id: { in: radIds }, oktId: data.oktId },
    select: { id: true },
  });
  if (eksisterende.length !== radIds.length) {
    throw new Error("En eller flere rader hører ikke til denne økten");
  }

  await prisma.$transaction(
    data.rader.map((r) =>
      prisma.fysOvelseRad.update({
        where: { id: r.radId },
        data: {
          loggSett: r.loggSett,
          loggRepsPerSett: r.loggRepsPerSett,
          loggBelastningKg: r.loggBelastningKg,
          loggRir: r.loggRir,
          notat: r.notat,
        },
      }),
    ),
  );

  revalidatePath(`/portal/tren/fys-plan/${planId}`);
  return { ok: true };
}
