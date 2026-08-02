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
import { isMinor } from "@/lib/auth/minor";
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
  /**
   * Hvorfor avvist. Lagres ALDRI når interaksjonen gjelder en mindreårig —
   * porten står i denne modulen, ikke hos kalleren.
   */
  begrunnelse?: string;
};

/**
 * Avgjør om fritekst kan lagres for en interaksjon.
 *
 * Porten lå tidligere som et `mindreaarig`-flagg hvert kallsted måtte sette
 * riktig. Det var en felle: flagget sto hardkodet til `false` overalt fordi
 * ingen flate lagret fritekst ennå. Nå slås det opp her, én gang, mot
 * interaksjonens egen spiller — da kan det ikke settes feil.
 *
 * Ved tvil lagres ingenting: mangler brukeren, eller feiler oppslaget, faller
 * vi til «behandle som mindreårig».
 */
async function kanLagreFritekst(interaksjonId: string): Promise<boolean> {
  try {
    const rad = await prisma.aiInteraksjon.findUnique({
      where: { id: interaksjonId },
      select: { userId: true },
    });
    // Ingen spiller knyttet til interaksjonen (f.eks. stall-brede agenter):
    // ingen mindreårig kan identifiseres, og friteksten er om systemet.
    if (!rad?.userId) return true;

    const bruker = await prisma.user.findUnique({
      where: { id: rad.userId },
      select: { dateOfBirth: true, requiresGuardianConsent: true },
    });
    if (!bruker) return false;
    return !isMinor(bruker.dateOfBirth) && !bruker.requiresGuardianConsent;
  } catch (err) {
    console.error("[agenticos] kunne ikke avgjøre mindreårig-status", err);
    return false;
  }
}

/**
 * Sett utfallet på en interaksjon. Dette er læringssignalet: koblingen mellom
 * «hvilken prompt ble brukt» og «var svaret godt nok til å bli brukt».
 */
export async function settUtfall(input: UtfallInput): Promise<void> {
  const oenskerTekst = (input.begrunnelse ?? "").trim();
  const begrunnelse =
    oenskerTekst && (await kanLagreFritekst(input.interaksjonId))
      ? oenskerTekst.slice(0, 1000)
      : null;

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
}): Promise<void> {
  // Bevisst uten `begrunnelse`: dette er en updateMany som kan treffe flere
  // rader, og GDPR-porten må avgjøres per interaksjon. Trengs fritekst her,
  // hent radene først og bruk settUtfall per id.
  try {
    await prisma.aiInteraksjon.updateMany({
      where: { referanseId: input.referanseId, utfall: "PENDING" },
      data: {
        utfall: input.utfall,
        rating: input.rating ?? null,
        resolvedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("[agenticos] kunne ikke sette utfall for referanse", err);
  }
}
