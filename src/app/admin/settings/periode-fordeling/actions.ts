"use server";

/**
 * Server actions for AgencyOS · Innstillinger · Periode-fordeling (fase 1,
 * godkjent 2026-07-18). Coach setter den globale pyramide-fordelingen (min/maks-%
 * per område) per periode manuelt; verdiene overstyrer de hardkodede defaultene
 * via resolveren i `periode-fordeling.ts`. Finnes ingen rad → default gjelder.
 *
 * Fordelingen er ANBEFALING, ikke sperre: den styrer hva invariantene varsler om,
 * aldri om trening kan gjennomføres (jf. grunnregelen «invarianter aldri sperrer»).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PeriodeType, PyramidArea } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { standardFordeling, type OmradeFordeling } from "@/lib/portal/training/periode-fordeling";

const PATH = "/admin/settings/periode-fordeling";

const PERIODE_LABEL: Record<PeriodeType, string> = {
  GRUNN: "Grunnperiode",
  SPESIALISERING: "Spesialisering",
  TURNERING: "Turneringsfase",
  EVALUERING: "Evaluering",
  FERIE: "Ferie",
};

const OMRADER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

export type PeriodeFordelingRad = {
  periodeType: PeriodeType;
  label: string;
  min: Record<PyramidArea, number>;
  max: Record<PyramidArea, number>;
  /** True hvis coach har lagret en overstyring (ellers vises default). */
  erOverstyrt: boolean;
};

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

/** Last gjeldende fordeling per periode: lagret om satt, ellers default. */
export async function hentPeriodeFordelinger(): Promise<PeriodeFordelingRad[]> {
  await krevCoach();
  const std = standardFordeling();
  const lagrede = await prisma.periodeFordeling.findMany();
  const perType = new Map(lagrede.map((r) => [r.periodeType, r]));

  return (Object.keys(std) as PeriodeType[]).map((t) => {
    const r = perType.get(t);
    if (r) {
      return {
        periodeType: t,
        label: PERIODE_LABEL[t],
        min: { FYS: r.minFys, TEK: r.minTek, SLAG: r.minSlag, SPILL: r.minSpill, TURN: r.minTurn },
        max: { FYS: r.maxFys, TEK: r.maxTek, SLAG: r.maxSlag, SPILL: r.maxSpill, TURN: r.maxTurn },
        erOverstyrt: true,
      };
    }
    return { periodeType: t, label: PERIODE_LABEL[t], min: std[t].min, max: std[t].max, erOverstyrt: false };
  });
}

const prosent = z.number().int().min(0).max(100);
const omradeSchema = z.object({
  FYS: prosent, TEK: prosent, SLAG: prosent, SPILL: prosent, TURN: prosent,
});
const lagreSchema = z.object({
  periodeType: z.enum(["GRUNN", "SPESIALISERING", "TURNERING", "EVALUERING", "FERIE"]),
  min: omradeSchema,
  max: omradeSchema,
});

export type LagrePeriodeInput = z.input<typeof lagreSchema>;

/** Lagre (upsert) fordelingen for én periode. Håndhever 0–100 og min ≤ maks. */
export async function lagrePeriodeFordeling(input: LagrePeriodeInput) {
  const user = await krevCoach();
  const { periodeType, min, max } = lagreSchema.parse(input);

  for (const omr of OMRADER) {
    if (min[omr] > max[omr]) {
      throw new Error(`${omr}: minimum (${min[omr]} %) kan ikke være større enn maksimum (${max[omr]} %).`);
    }
  }

  const data = {
    minFys: min.FYS, maxFys: max.FYS,
    minTek: min.TEK, maxTek: max.TEK,
    minSlag: min.SLAG, maxSlag: max.SLAG,
    minSpill: min.SPILL, maxSpill: max.SPILL,
    minTurn: min.TURN, maxTurn: max.TURN,
    oppdatertAvId: user.id,
  };

  await prisma.periodeFordeling.upsert({
    where: { periodeType },
    create: { periodeType, ...data },
    update: data,
  });

  await audit({
    actorId: user.id,
    action: "periode_fordeling.lagret",
    target: `PeriodeFordeling:${periodeType}`,
    metadata: { min, max },
  });

  revalidatePath(PATH);
  return { ok: true as const };
}

/** Tilbakestill én periode til default (sletter overstyringen). */
export async function tilbakestillPeriodeFordeling(periodeType: PeriodeType) {
  const user = await krevCoach();
  const t = lagreSchema.shape.periodeType.parse(periodeType);
  await prisma.periodeFordeling.deleteMany({ where: { periodeType: t } });
  await audit({ actorId: user.id, action: "periode_fordeling.tilbakestilt", target: `PeriodeFordeling:${t}` });
  revalidatePath(PATH);
  return { ok: true as const };
}
