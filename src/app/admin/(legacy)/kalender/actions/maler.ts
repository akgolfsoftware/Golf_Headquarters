"use server";

// Server actions for DrillMal og OktMal (gjenbrukbare bibliotek-elementer).
// Lar coach lagre økter som maler og raskt kopiere dem inn på spillere/datoer.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  PyramidAreaSchema,
  PeriodeTypeSchema,
  PracticeTypeSchema,
} from "@/lib/portal/training/ak-taxonomy";
import type { OktMal, PyramidArea, PracticeType, PeriodeType } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Skjemaer
// ---------------------------------------------------------------------------

const OktMalDrillSchema = z.object({
  sortOrder: z.number().int().min(0),
  pyramide: PyramidAreaSchema,
  navn: z.string().min(1).max(120),
  durationMinutes: z.number().int().min(1).max(300),
  omraade: z.string().nullable().optional(),
  lFase: z.enum(["L_KROPP", "L_ARM", "L_KOLLE", "L_BALL", "L_AUTO"]).nullable().optional(),
  csNivaa: z.enum(["CS50", "CS60", "CS70", "CS80", "CS90", "CS100"]).nullable().optional(),
});

const OpprettOktMalSchema = z.object({
  navn: z.string().min(1).max(120),
  beskrivelse: z.string().max(1000).nullable().optional(),
  kategori: z.string().min(1).max(60),
  pyramide: PyramidAreaSchema,
  periodeType: PeriodeTypeSchema.nullable().optional(),
  kategoriAK: z.string().max(60).nullable().optional(),
  durationMinutes: z.number().int().min(1).max(600),
  practiceType: PracticeTypeSchema,
  erFavoritt: z.boolean().optional(),
  erGlobal: z.boolean().optional(),
  notat: z.string().max(1000).nullable().optional(),
  driller: z.array(OktMalDrillSchema).default([]),
});

const KopierFraMalSchema = z.object({
  malId: z.string().cuid(),
  planId: z.string().cuid(),
  datoer: z.array(z.coerce.date()).min(1).max(50),
});

// ---------------------------------------------------------------------------
// Returtyper
// ---------------------------------------------------------------------------

export type OktMalResultat = { ok: true; mal: OktMal } | { ok: false; feil: string };
export type SlettResultat = { ok: true } | { ok: false; feil: string };
export type KopierResultat =
  | { ok: true; antallOpprettet: number }
  | { ok: false; feil: string };

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function opprettOktMal(
  input: z.input<typeof OpprettOktMalSchema>,
): Promise<OktMalResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = OpprettOktMalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  const mal = await prisma.oktMal.create({
    data: {
      coachId: bruker.id,
      navn: data.navn,
      beskrivelse: data.beskrivelse ?? null,
      kategori: data.kategori,
      pyramide: data.pyramide as PyramidArea,
      periodeType: (data.periodeType ?? null) as PeriodeType | null,
      kategoriAK: data.kategoriAK ?? null,
      durationMinutes: data.durationMinutes,
      practiceType: data.practiceType as PracticeType,
      erFavoritt: data.erFavoritt ?? false,
      erGlobal: data.erGlobal ?? false,
      notat: data.notat ?? null,
      driller: {
        create: data.driller.map((d) => ({
          sortOrder: d.sortOrder,
          pyramide: d.pyramide as PyramidArea,
          navn: d.navn,
          durationMinutes: d.durationMinutes,
          omraade: d.omraade ?? null,
          lFase: d.lFase ?? null,
          csNivaa: d.csNivaa ?? null,
        })),
      },
    },
  });

  await audit({
    actorId: bruker.id,
    action: "okt_mal.create",
    target: mal.id,
    metadata: { navn: data.navn, antallDriller: data.driller.length },
  });
  revalidatePath("/admin/kalender");
  return { ok: true, mal };
}

export async function kopierFraMal(input: z.input<typeof KopierFraMalSchema>): Promise<KopierResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = KopierFraMalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  const mal = await prisma.oktMal.findUnique({
    where: { id: data.malId },
    include: { driller: { orderBy: { sortOrder: "asc" } } },
  });
  if (!mal) return { ok: false, feil: "Mal finnes ikke" };

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: data.planId },
    select: { userId: true, createdById: true },
  });
  if (!plan) return { ok: false, feil: "Plan finnes ikke" };

  const coachId = plan.createdById ?? bruker.id;
  let antallOpprettet = 0;

  // Vi kjører sekvensielt for å kunne lage drill-rader per session med id-tilkobling.
  for (const startTime of data.datoer) {
    const endTime = new Date(startTime.getTime() + mal.durationMinutes * 60 * 1000);
    const okt = await prisma.trainingSessionV2.create({
      data: {
        title: mal.navn,
        studentId: plan.userId,
        coachId,
        startTime,
        endTime,
        miljo: "M2",
        practiceType: mal.practiceType,
        notes: mal.notat,
        isCoachCreated: true,
        generertFra: "MAL",
        generertFraId: mal.id,
        drills: {
          create: mal.driller.map((d) => ({
            sortOrder: d.sortOrder,
            name: d.navn,
            durationMinutes: d.durationMinutes,
            pyramide: d.pyramide,
            omraade: d.omraade,
            lFase: d.lFase,
            csNivaa: d.csNivaa,
          })),
        },
      },
    });
    antallOpprettet += 1;
    void okt;
  }

  // Tell opp bruktAntall + sett sistBrukt
  await prisma.oktMal.update({
    where: { id: data.malId },
    data: {
      bruktAntall: { increment: antallOpprettet },
      sistBrukt: new Date(),
    },
  });

  await audit({
    actorId: bruker.id,
    action: "okt_mal.copy",
    target: data.malId,
    metadata: { antallOpprettet, planId: data.planId },
  });
  revalidatePath("/admin/kalender");
  return { ok: true, antallOpprettet };
}

export async function slettOktMal(id: string): Promise<SlettResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  try {
    await prisma.oktMal.delete({ where: { id } });
    await audit({
      actorId: bruker.id,
      action: "okt_mal.delete",
      target: id,
    });
    revalidatePath("/admin/kalender");
    return { ok: true };
  } catch (err) {
    console.error("[maler.slettOktMal]", err);
    return { ok: false, feil: "Kunne ikke slette mal" };
  }
}

export async function hentOktMaler(coachId?: string) {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return prisma.oktMal.findMany({
    where: {
      OR: [
        { coachId: coachId ?? bruker.id },
        { erGlobal: true },
      ],
    },
    include: { driller: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ erFavoritt: "desc" }, { sistBrukt: "desc" }, { navn: "asc" }],
  });
}
