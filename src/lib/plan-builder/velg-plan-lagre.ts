/**
 * PH-12 Velg treningsplan: «Send til coach». Lagrer spillerens SMART-mål (Goal) og
 * en plan uten økter (TrainingPlan, status DRAFT, «Coach jobber på planen»).
 * Ingen AI og ingen schemaendring: fordelingen ligger i `targetAllocation`, resten
 * av det spilleren skrev (oppnåelig, relevant, timer per uke, mal) i `Goal.payload`.
 * Coachen bygger øktene i Workbench.
 * PENDING_PLAYER betyr «sendt til spiller», så den brukes ikke her; at spilleren har sendt
 * planen til coach ligger i `Goal.payload.sendtTilCoach` til en egen status finnes (forslag i PR).
 */
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { VELG_AKSER, fordelingSum, maalSetning, validerMaal } from "./velg-plan";

export const SendPlanSchema = z.object({
  malNavn: z.string().trim().min(1).max(120),
  malId: z.string().max(64).nullable(),
  maal: z.object({ s: z.string().max(300), m: z.string().max(300), a: z.string().max(500), r: z.string().max(500), t: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
  startDato: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  uker: z.number().int().min(2).max(52),
  timerPerUke: z.number().int().min(4).max(30),
  fordeling: z.object({ fys: z.number().int().min(0).max(100), tek: z.number().int().min(0).max(100), slag: z.number().int().min(0).max(100), spill: z.number().int().min(0).max(100), turn: z.number().int().min(0).max(100) }),
});
export type SendPlanInput = z.infer<typeof SendPlanSchema>;

/** Feil som er trygge å vise spilleren ordrett. Alt annet får en generell beskjed. */
export class SendPlanFeil extends Error {}

/** `nivaa` kommer fra resolveTilgang (user.tilgang.nivaa), ikke fra tier-feltet. */
export type SendPlanBruker = { id: string; nivaa: "FULL" | "TALENT" | "INGEN" };

export async function sendPlanTilCoachCore(user: SendPlanBruker, raw: SendPlanInput): Promise<{ planId: string; goalId: string }> {
  if (user.nivaa !== "FULL") throw new SendPlanFeil("Planen kan bare sendes med full tilgang til PlayerHQ. Du kan oppgradere under Meg.");
  const input = SendPlanSchema.parse(raw);
  if (Object.keys(validerMaal(input.maal)).length > 0) throw new SendPlanFeil("Målet mangler mål, tall eller dato.");
  if (fordelingSum(input.fordeling) !== 100) throw new SendPlanFeil("Fordelingen per akse må bli 100 %.");
  const start = new Date(`${input.startDato}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) throw new SendPlanFeil("Ugyldig startdato.");
  const slutt = new Date(start.getTime() + input.uker * 7 * 86400000);
  const tittel = maalSetning(input.maal);
  if (!tittel) throw new SendPlanFeil("Målet mangler.");

  const alloc = Object.fromEntries(VELG_AKSER.map((k) => [k.toUpperCase(), input.fordeling[k]]));
  return prisma.$transaction(async (tx) => {
    const plan = await tx.trainingPlan.create({
      data: { userId: user.id, name: input.malNavn, startDate: start, endDate: slutt, isActive: false, status: "DRAFT", targetAllocation: alloc },
      select: { id: true },
    });
    const goal = await tx.goal.create({
      data: {
        userId: user.id, type: "FREE_TEXT", category: "OUTCOME", title: tittel.slice(0, 500),
        targetDate: new Date(`${input.maal.t}T00:00:00.000Z`),
        payload: { kilde: "PH-12", sendtTilCoach: new Date().toISOString(), planId: plan.id, malId: input.malId, spesifikt: input.maal.s, malbart: input.maal.m, oppnaaelig: input.maal.a || null, relevant: input.maal.r || null, uker: input.uker, timerPerUke: input.timerPerUke },
      },
      select: { id: true },
    });
    return { planId: plan.id, goalId: goal.id };
  });
}
