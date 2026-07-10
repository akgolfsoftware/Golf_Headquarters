"use server";

// Server actions for AI-mal-bygger wizard (`/portal/mal/bygger`).
//
// Tynne wrappers: kjernene bor i src/lib/plan-builder/ (delt med v2-flaten
// /portal/planlegge/bygger). Auth skjer her; liben er bruker-parameterisert.
//
// Flyt:
//  1) hentByggerKontekst — spillerens kategori, lPhase og turneringer.
//  2) anbefalMal — matcher (kategori, lPhase) mot PlanTemplate.
//  3) genererPlanForslag — kaller lib/ai-plan/generate.ts, logger AiPlanGeneration.
//  4) lagrePlan — TrainingPlan + sessions + drills (+ V2-speiling i liben).
//
// Tier-gating: GRATIS kan se forslag, men ikke lagre. PRO har full tilgang.

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
// NB: ingen type-re-eksporter her — Turbopack feiler på ikke-funksjons-
// eksporter i "use server"-filer. Typene importeres fra @/lib/plan-builder.
import {
  hentByggerKontekstCore,
  anbefalMalCore,
  genererPlanForslagCore,
  lagrePlanForslagCore,
  sendTilGodkjenningCore,
  type ByggerMaltype,
  type ByggerKontekst,
  type AnbefalingerResultat,
  type GenerertForslag,
  type LagrePlanInput,
  type LagrePlanResultat,
} from "@/lib/plan-builder";

export async function hentByggerKontekst(): Promise<ByggerKontekst> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  return hentByggerKontekstCore(user);
}

export async function anbefalMal(input: {
  maltype: ByggerMaltype;
  turneringId?: string | null;
}): Promise<AnbefalingerResultat> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  return anbefalMalCore(user, input);
}

export async function genererPlanForslag(input: {
  maltype: ByggerMaltype;
  turneringId?: string | null;
  egendefinertTekst?: string;
  valgtTemplateId?: string | null;
}): Promise<GenerertForslag> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  return genererPlanForslagCore(user, input);
}

export async function lagrePlan(input: LagrePlanInput): Promise<LagrePlanResultat> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  const resultat = await lagrePlanForslagCore(user, input);
  revalidatePath("/portal/mal");
  return resultat;
}

export async function sendTilGodkjenning(planId: string): Promise<{ ok: true }> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  const resultat = await sendTilGodkjenningCore(user.id, planId);
  revalidatePath("/portal/mal");
  return resultat;
}
