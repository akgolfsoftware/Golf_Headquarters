"use server";

/**
 * Server actions for IUP-samtalen (WANG).
 *
 * Samtalen gjør to ting i én operasjon: evaluerer perioden som avsluttes, og
 * avtaler fokusområdene for den neste. Begge deler skrives til
 * `group_period_goals`, som er kilden elevens årsplan leser fra.
 *
 * Dette er vurderinger om mindreårige elever — kun coach/admin, og hver lagring
 * havner i revisjonsloggen.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const AKSE = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
const STATUS = z.enum(["IKKE_STARTET", "PAA_VEI", "NAADD"]);

const Evaluering = z.object({
  id: z.string().min(1),
  egenvurdering: z.number().int().min(1).max(5).nullable(),
  trenervurdering: z.number().int().min(1).max(5).nullable(),
  status: STATUS,
  kommentar: z.string().max(2000).nullable(),
});

const NyttFokus = z.object({
  akse: AKSE,
  tittel: z.string().min(1).max(200),
  egentidMinUke: z.number().int().min(0).max(2400),
  maalemetode: z.string().max(500).nullable(),
});

const Input = z.object({
  elevId: z.string().min(1),
  /** Perioden som avsluttes — radene som evalueres. */
  evalueringer: z.array(Evaluering).max(20),
  /** Perioden det avtales fokusområder for. */
  nestePeriodeId: z.string().min(1),
  nyeFokus: z.array(NyttFokus).max(10),
});

export type IupResultat = { ok: true } | { ok: false; feil: string };

export async function lagreIupSamtale(raw: unknown): Promise<IupResultat> {
  const coach = await requireCoachActionUser();

  const parsed = Input.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      feil: "Ugyldige verdier. Sjekk at vurderingene er mellom 1 og 5.",
    };
  }
  const { elevId, evalueringer, nestePeriodeId, nyeFokus } = parsed.data;

  // Radene som evalueres MÅ tilhøre eleven. Uten denne sjekken kan en id fra
  // en annen elev sendes inn direkte til actionen, forbi skjermen.
  if (evalueringer.length > 0) {
    const eide = await prisma.groupPeriodGoal.count({
      where: { userId: elevId, id: { in: evalueringer.map((e) => e.id) } },
    });
    if (eide !== evalueringer.length) {
      return {
        ok: false,
        feil: "Fant ikke alle fokusområdene på denne eleven.",
      };
    }
  }

  try {
    await prisma.$transaction([
      ...evalueringer.map((e) =>
        prisma.groupPeriodGoal.update({
          where: { id: e.id },
          data: {
            egenvurdering: e.egenvurdering,
            trenervurdering: e.trenervurdering,
            status: e.status,
            kommentar: e.kommentar,
          },
        }),
      ),
      // Fokusområdene for neste periode settes på nytt hver gang samtalen
      // lagres — samtalen ER kilden, og en fjernet rad skal forsvinne.
      prisma.groupPeriodGoal.deleteMany({
        where: { userId: elevId, periodBlockId: nestePeriodeId },
      }),
      prisma.groupPeriodGoal.createMany({
        data: nyeFokus.map((f) => ({
          userId: elevId,
          periodBlockId: nestePeriodeId,
          akse: f.akse,
          tittel: f.tittel,
          egentidMinUke: f.egentidMinUke,
          maalemetode: f.maalemetode,
        })),
      }),
    ]);
  } catch {
    return {
      ok: false,
      feil: "Kunne ikke lagre. Prøv igjen — ingenting er endret.",
    };
  }

  await audit({
    actorId: coach.id,
    action: "wang.iup.lagret",
    target: elevId,
    metadata: {
      evaluerte: evalueringer.length,
      nyeFokusomraader: nyeFokus.length,
      nestePeriodeId,
    },
  });

  revalidatePath("/team-wang");
  revalidatePath(`/team-wang/coach/iup/${elevId}`);
  return { ok: true };
}
