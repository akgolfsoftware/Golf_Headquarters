"use server";

/**
 * AG-11-AR: opprett årsplan for en spiller (coach). Veilederen «Opprett årsplan»
 * i Workbench. Skriver bare til eksisterende kolonner (SeasonPlan.name/notes,
 * PeriodBlock) og endrer ikke databaseskjemaet. Start og slutt fra skjema, og
 * hvem som opprettet planen, krever nye felt: se db_forslag i PR-en.
 * Tilgangsporten er den samme som i coachLagrePeriode.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { erCoachetSpiller, harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { ettAarSenere } from "@/lib/workbench/arsplan-view";

const OpprettSchema = z.object({
  aar: z.number().int().min(2000).max(2100),
  navn: z.string().trim().min(1).max(120),
  sammendrag: z.string().trim().max(1000).optional(),
  utgangspunkt: z.enum(["tom", "fjor"]),
});

export type OpprettArsplanInput = z.infer<typeof OpprettSchema>;
export type OpprettArsplanResultat = { ok: boolean; perioder?: number; error?: string };

/** YYYY-MM-DD → UTC-midnatt (aldri lokal tid, se gotchas §Tid og datoer). */
function utcDag(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export async function coachOpprettArsplan(playerId: string, rawInput: unknown): Promise<OpprettArsplanResultat> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!(await erCoachetSpiller(playerId))) return { ok: false, error: "Ingen tilgang" };
  if (!(await harCoachTilgangTilSpiller(coach, playerId))) return { ok: false, error: "Du har ikke tilgang til denne spilleren." };

  const parsed = OpprettSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Ugyldig input til årsplanen" };
  const { aar, navn, sammendrag, utgangspunkt } = parsed.data;

  const finnes = await prisma.seasonPlan.findFirst({ where: { userId: playerId, year: aar }, select: { id: true } });
  if (finnes) return { ok: false, error: `Det finnes allerede en årsplan for ${aar}. Legg til perioder i den, eller slett periodene først.` };

  const fjor = utgangspunkt === "fjor"
    ? await prisma.seasonPlan.findFirst({
        where: { userId: playerId, year: aar - 1 },
        select: { periodBlocks: { orderBy: { startDate: "asc" } } },
      })
    : null;
  if (utgangspunkt === "fjor" && (!fjor || fjor.periodBlocks.length === 0)) return { ok: false, error: `Fant ingen perioder i ${aar - 1} å kopiere.` };

  const perioder = fjor?.periodBlocks ?? [];
  await prisma.$transaction(async (tx) => {
    const plan = await tx.seasonPlan.create({
      data: { userId: playerId, year: aar, name: navn, notes: sammendrag || null, startDate: utcDag(`${aar}-01-01`), endDate: utcDag(`${aar}-12-31`) },
      select: { id: true },
    });
    for (const b of perioder) {
      await tx.periodBlock.create({
        data: {
          seasonPlanId: plan.id,
          lPhase: b.lPhase,
          startDate: utcDag(ettAarSenere(b.startDate.toISOString().slice(0, 10))),
          endDate: utcDag(ettAarSenere(b.endDate.toISOString().slice(0, 10))),
          focus: b.focus,
          weeklyVolMin: b.weeklyVolMin,
          weeklyVolMax: b.weeklyVolMax,
          // JSON-feltet kopieres uendret; null må være Prisma.DbNull bare ved update.
          ...(b.weeklySessionBudget != null ? { weeklySessionBudget: b.weeklySessionBudget } : {}),
          notes: b.notes,
        },
      });
    }
  });

  revalidatePath(`/admin/workbench/${playerId}`);
  revalidatePath(`/admin/spillere/${playerId}/workbench`);
  return { ok: true, perioder: perioder.length };
}
