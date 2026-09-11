"use server";

/**
 * Server actions for IUP-samtalen (WANG).
 *
 * Samtalen gjør to ting i én operasjon: evaluerer perioden som avsluttes, og
 * avtaler fokusområdene for den neste. Begge deler skrives til
 * `group_period_goals`, som er kilden elevens årsplan leser fra.
 *
 * Dette er vurderinger om mindreårige elever. Samme ressursgrense brukes ved
 * lesing og lagring, og hver lagring havner i revisjonsloggen.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import {
  hentWangElevGruppeId,
  WangDataUtilgjengeligError,
} from "@/app/team-wang/_data/wang-tilgang";

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
  const bruker = await getCurrentUser();
  if (!bruker) {
    return { ok: false, feil: "Du må logge inn på nytt før du kan lagre." };
  }

  const parsed = Input.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      feil: "Ugyldige verdier. Sjekk at vurderingene er mellom 1 og 5.",
    };
  }
  const { elevId, evalueringer, nestePeriodeId, nyeFokus } = parsed.data;

  let gruppeId: string | null;
  try {
    gruppeId = await hentWangElevGruppeId(bruker, elevId);
  } catch (error) {
    if (error instanceof WangDataUtilgjengeligError) {
      return { ok: false, feil: "Kunne ikke kontrollere tilgangen akkurat nå. Prøv igjen." };
    }
    throw error;
  }
  if (!gruppeId) {
    return { ok: false, feil: "Du har ikke tilgang til denne elevens IUP." };
  }

  try {
    const evalueringsIder = evalueringer.map((e) => e.id);
    const maal = evalueringsIder.length
      ? await prisma.groupPeriodGoal.findMany({
          where: { userId: elevId, id: { in: evalueringsIder } },
          select: { id: true, periodBlockId: true },
        })
      : [];
    if (maal.length !== new Set(evalueringsIder).size || maal.length !== evalueringsIder.length) {
      return { ok: false, feil: "Fant ikke alle fokusområdene på denne eleven." };
    }

    const periodeIder = new Set([nestePeriodeId, ...maal.map((m) => m.periodBlockId)]);
    const antallPerioderIGruppen = await prisma.groupPeriodBlock.count({
      where: { id: { in: [...periodeIder] }, groupId: gruppeId },
    });
    if (antallPerioderIGruppen !== periodeIder.size) {
      return { ok: false, feil: "Fant ikke alle periodene i WANG-gruppen." };
    }

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
    actorId: bruker.id,
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
