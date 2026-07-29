"use server";

/**
 * Server actions for AgencyOS · Innstillinger · Periodenavn.
 *
 * Et periodenavn (TrainingPeriod.name, fritekst — f.eks. "Sommersamling") som
 * ikke gjenkjennes av den hardkodede ordboken i periode-navn.ts blir aldri
 * validert mot CANON (se periode-navn.ts sin egen begrunnelse). Denne siden
 * lar en coach koble navnet til en periodetype uten kodeendring, lagret i
 * PeriodeNavnMapping — mønsteret speiler periode-fordeling/actions.ts.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PeriodeType } from "@/generated/prisma/client";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { normaliserNavn, ukjenteNavn } from "@/lib/portal/training/periode-navn";
import { PERIODE_LABEL, type PeriodeNavnOversikt } from "./labels";

const PATH = "/admin/settings/periode-navn";

/** Last gjeldende mappinger + navn som fortsatt ikke er gjenkjent. */
export async function hentPeriodeNavnOversikt(): Promise<PeriodeNavnOversikt> {
  await requireCoachActionUser();

  const [lagrede, perioder] = await Promise.all([
    prisma.periodeNavnMapping.findMany({ orderBy: { navn: "asc" } }),
    prisma.trainingPeriod.findMany({ select: { name: true } }),
  ]);

  const ekstra: Record<string, PeriodeType> = {};
  for (const r of lagrede) ekstra[normaliserNavn(r.navn)] = r.periodeType as PeriodeType;

  const distinkteNavn = [...new Set(perioder.map((p) => p.name))];

  return {
    lagrede: lagrede.map((r) => ({
      navn: r.navn,
      periodeType: r.periodeType as PeriodeType,
      periodeTypeLabel: PERIODE_LABEL[r.periodeType as PeriodeType],
    })),
    ukjente: ukjenteNavn(distinkteNavn, ekstra),
  };
}

const lagreSchema = z.object({
  navn: z.string().trim().min(1).max(100),
  periodeType: z.enum(["GRUNN", "SPESIALISERING", "TURNERING", "EVALUERING", "FERIE"]),
});

export type LagrePeriodeNavnInput = z.input<typeof lagreSchema>;

/** Koble et periodenavn til en periodetype (upsert på normalisert navn). */
export async function leggTilPeriodeNavnMapping(input: LagrePeriodeNavnInput) {
  const user = await requireCoachActionUser();
  const { navn, periodeType } = lagreSchema.parse(input);
  const normalisert = normaliserNavn(navn);

  await prisma.periodeNavnMapping.upsert({
    where: { navn: normalisert },
    create: { navn: normalisert, periodeType, oppdatertAvId: user.id },
    update: { periodeType, oppdatertAvId: user.id },
  });

  await audit({
    actorId: user.id,
    action: "periode_navn_mapping.lagret",
    target: `PeriodeNavnMapping:${normalisert}`,
    metadata: { periodeType },
  });

  revalidatePath(PATH);
  return { ok: true as const };
}

/** Fjern en lagret mapping — navnet blir «ukjent» igjen. */
export async function slettPeriodeNavnMapping(navn: string) {
  const user = await requireCoachActionUser();
  const normalisert = normaliserNavn(navn);

  await prisma.periodeNavnMapping.deleteMany({ where: { navn: normalisert } });

  await audit({
    actorId: user.id,
    action: "periode_navn_mapping.slettet",
    target: `PeriodeNavnMapping:${normalisert}`,
  });

  revalidatePath(PATH);
  return { ok: true as const };
}
