"use server";

/**
 * Server actions for IUP-samtalen (WANG).
 *
 * Samtalen lagrer vurderingene av perioden som avsluttes og oppretter et
 * versjonert forslag for neste periodes fokus. Årsplanen endres først etter
 * spillerens godkjenning i PlayerHQ.
 *
 * Dette er vurderinger om mindreårige elever. Samme ressursgrense brukes ved
 * lesing og lagring, og hver lagring havner i revisjonsloggen.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { audit } from "@/lib/audit";
import {
  medWangElevData,
  WangDataUtilgjengeligError,
} from "@/app/team-wang/_data/wang-tilgang";
import { Prisma } from "@/generated/prisma/client";

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
  nestePeriodeNavn: z.string().trim().min(1).max(120),
  requestId: z.string().uuid(),
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
  const { elevId, evalueringer, nestePeriodeId, nestePeriodeNavn, requestId, nyeFokus } = parsed.data;

  if (bruker.role !== "COACH" && bruker.role !== "ADMIN") {
    return { ok: false, feil: "Du har ikke tilgang til denne elevens IUP." };
  }

  let lagret: { gruppeId: string; alleredeLagret: boolean } | null;
  try {
    lagret = await medWangElevData(bruker, elevId, async (tx, gruppeId) => {
      const evalueringsIder = evalueringer.map((e) => e.id);
      const maal = evalueringsIder.length
        ? await tx.groupPeriodGoal.findMany({ where: { userId: elevId, id: { in: evalueringsIder } }, select: { id: true, periodBlockId: true } })
        : [];
      if (maal.length !== new Set(evalueringsIder).size || maal.length !== evalueringsIder.length) return null;
      const periodeIder = new Set([nestePeriodeId, ...maal.map((m) => m.periodBlockId)]);
      const antall = await tx.groupPeriodBlock.count({ where: { id: { in: [...periodeIder] }, groupId: gruppeId } });
      if (antall !== periodeIder.size) return null;

      const actionId = `iup-focus-${requestId}`;
      const existing = await tx.planAction.findUnique({ where: { id: actionId }, select: { id: true, userId: true, coachId: true, actionType: true } });
      if (existing) {
        if (existing.userId !== elevId || existing.coachId !== bruker.id || existing.actionType !== "WORKBENCH_COACH_PROPOSAL") return null;
        return { gruppeId, alleredeLagret: true };
      }
      const before = await tx.groupPeriodGoal.findMany({
        where: { userId: elevId, periodBlockId: nestePeriodeId },
        orderBy: { id: "asc" },
        select: { id: true, periodBlockId: true, akse: true, tittel: true, egentidMinUke: true, maalemetode: true,
          status: true, egenvurdering: true, trenervurdering: true, kommentar: true, updatedAt: true },
      });
      const suggestion = {
        versjon: 1, kind: "IUP_FOCUS", organisasjon: "WANG", periodBlockId: nestePeriodeId, periodName: nestePeriodeNavn,
        expected: before.map((row) => ({ ...row, updatedAt: row.updatedAt.toISOString() })),
        etter: nyeFokus, begrunnelse: "Nye fokusområder fra IUP-samtalen.",
      } satisfies Prisma.InputJsonObject;
      await tx.planAction.create({ data: {
        id: actionId, userId: elevId, coachId: bruker.id, actionType: "WORKBENCH_COACH_PROPOSAL", suggestion,
        status: "PENDING", agentName: "WANG_COACH",
      } });
      await Promise.all(evalueringer.map((e) => tx.groupPeriodGoal.update({
        where: { id: e.id }, data: { egenvurdering: e.egenvurdering, trenervurdering: e.trenervurdering, status: e.status, kommentar: e.kommentar },
      })));
      return { gruppeId, alleredeLagret: false };
    });
  } catch (error) {
    if (error instanceof WangDataUtilgjengeligError) {
      return { ok: false, feil: "Kunne ikke kontrollere tilgangen akkurat nå. Prøv igjen." };
    }
    throw error;
  }
  if (!lagret) {
    return { ok: false, feil: "Du har ikke tilgang til denne elevens IUP." };
  }

  await audit({
    actorId: bruker.id,
    action: "wang.iup.lagret",
    target: elevId,
    metadata: {
      evaluerte: evalueringer.length,
      nyeFokusomraaderSomForslag: nyeFokus.length,
      nestePeriodeId,
      alleredeLagret: lagret.alleredeLagret,
    },
  });

  revalidatePath("/team-wang");
  revalidatePath(`/team-wang/coach/iup/${elevId}`);
  revalidatePath("/portal");
  return { ok: true };
}
