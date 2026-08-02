// AgenticOS-loggen — eneste skrivevei til AiInteraksjon.
//
// Alle AI-flater skal skrive hit: Caddie, plangenerering, agent-forslag,
// godkjenningskøen. Før denne loggen lå utfallet spredt på PlanAction.status,
// CaddieDraft.status og AuditLog.metadata.rating, og kostnaden fantes bare på
// AiPlanGeneration — det var umulig å svare på hvilken promptversjon som fikk
// flest avvisninger, eller hva AI-en kostet per abonnent.
//
// GDPR: `begrunnelse` er eneste fritekstfelt og skrives ALDRI for en mindreårig.
// Porten står her, i skriveveien, ikke hos hver kaller.

import "server-only";
import { prisma } from "@/lib/prisma";
import type { GuardTreff } from "./guards";
import type { BygdPrompt } from "./prompt-bygger";
import type { Klassifisering, KontekstKilde, Utfall } from "./typer";

export type LoggInput = {
  prompt: BygdPrompt;
  klassifisering: Klassifisering;
  modell: string;
  tokensInn?: number;
  tokensUt?: number;
  kostUsd?: number;
  latencyMs?: number;
  kontekstKilder?: KontekstKilde[];
  guardTreff?: GuardTreff[];
  eskalert?: boolean;
  userId?: string | null;
  agentNavn?: string | null;
  referanseId?: string | null;
};

/**
 * Skriv én interaksjon. Best-effort: en feil her skal aldri velte svaret
 * brukeren venter på — vi logger og går videre.
 *
 * Returnerer id-en, slik at kalleren kan sette utfall senere når coachen
 * godkjenner eller avviser.
 */
export async function loggInteraksjon(input: LoggInput): Promise<string | null> {
  try {
    const rad = await prisma.aiInteraksjon.create({
      data: {
        promptId: input.prompt.promptId,
        promptVersjon: input.prompt.promptVersjon,
        intent: input.klassifisering.intent,
        domene: input.klassifisering.domene,
        rolle: input.klassifisering.rolle,
        modell: input.modell,
        tokensInn: input.tokensInn ?? null,
        tokensUt: input.tokensUt ?? null,
        kostUsd: input.kostUsd ?? null,
        latencyMs: input.latencyMs ?? null,
        kontekstKilder: input.kontekstKilder ?? input.prompt.kontekstKilder,
        guardTreff: (input.guardTreff ?? []).map((g) => g.guard),
        eskalert: input.eskalert ?? false,
        userId: input.userId ?? null,
        agentNavn: input.agentNavn ?? null,
        referanseId: input.referanseId ?? null,
      },
      select: { id: true },
    });
    return rad.id;
  } catch (err) {
    console.error("[agenticos] kunne ikke logge interaksjon", err);
    return null;
  }
}

export type UtfallInput = {
  interaksjonId: string;
  utfall: Utfall;
  rating?: 1 | -1;
  /** Hvorfor avvist. Ignoreres for mindreårige — se GDPR-merknaden øverst. */
  begrunnelse?: string;
  /** Gjelder interaksjonen en mindreårig spiller? Kalleren MÅ oppgi dette. */
  mindreaarig: boolean;
};

/**
 * Sett utfallet på en interaksjon. Dette er læringssignalet: koblingen mellom
 * «hvilken prompt ble brukt» og «var svaret godt nok til å bli brukt».
 */
export async function settUtfall(input: UtfallInput): Promise<void> {
  // Fritekst fra eller om mindreårige lagres ikke. Utfall og rating er koder og
  // tall, og er trygge.
  const begrunnelse = input.mindreaarig
    ? null
    : (input.begrunnelse?.trim().slice(0, 1000) || null);

  try {
    await prisma.aiInteraksjon.update({
      where: { id: input.interaksjonId },
      data: {
        utfall: input.utfall,
        rating: input.rating ?? null,
        begrunnelse,
        resolvedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("[agenticos] kunne ikke sette utfall", err);
  }
}

/**
 * Sett utfall via `referanseId` i stedet for interaksjons-id.
 *
 * Lar en flate lukke løkken uten å tre en ny id gjennom UI-laget: den kjenner
 * allerede sin egen referanse (AiPlanGeneration-id, PlanAction-id, CaddieDraft-id).
 * Oppdaterer kun rader som fortsatt står PENDING, så en godkjenning ikke
 * overskriver en tidligere avvisning.
 */
export async function settUtfallForReferanse(input: {
  referanseId: string;
  utfall: Utfall;
  rating?: 1 | -1;
  begrunnelse?: string;
  mindreaarig: boolean;
}): Promise<void> {
  const begrunnelse = input.mindreaarig
    ? null
    : (input.begrunnelse?.trim().slice(0, 1000) || null);

  try {
    await prisma.aiInteraksjon.updateMany({
      where: { referanseId: input.referanseId, utfall: "PENDING" },
      data: {
        utfall: input.utfall,
        rating: input.rating ?? null,
        begrunnelse,
        resolvedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("[agenticos] kunne ikke sette utfall for referanse", err);
  }
}
