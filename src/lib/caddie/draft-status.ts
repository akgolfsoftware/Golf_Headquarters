// Én vei for å avgjøre et CaddieDraft.
//
// Bakgrunn: `CaddieDraft.interaksjonId` kobler et utkast til AgenticOS-loggen,
// men koblingen er verdiløs hvis noen setter status uten å melde utfallet
// tilbake. Det skjedde: drill-forslagssiden oppdaterte status fire steder uten
// å kalle settUtfall, så de forslagene ble stående PENDING i AiInteraksjon og
// godkjenningsraten per promptversjon ble systematisk for lav.
//
// Løsningen er ikke å huske å kalle to funksjoner, men å gjøre det til én
// operasjon. Sett ALDRI `caddieDraft.status` direkte — bruk denne.

import "server-only";
import { prisma } from "@/lib/prisma";
import { settUtfall } from "@/lib/agenticos/logg";

export type DraftUtfall = "APPROVED" | "REJECTED";

const TIL_AGENTICOS: Record<DraftUtfall, "GODKJENT" | "AVVIST"> = {
  APPROVED: "GODKJENT",
  REJECTED: "AVVIST",
};

/**
 * Marker et utkast som avgjort og meld utfallet til AgenticOS-loggen.
 *
 * `interaksjonId` er nullbar: utkast fra før 2026-08-02, og utkast produsert av
 * agenter som ennå ikke logger, har ingen. Da hoppes loggdelen over.
 *
 * Én tur kan produsere flere utkast som behandles hver for seg. `settUtfall`
 * rører kun rader som fortsatt står PENDING, så det første utkastet som
 * avgjøres setter turens utfall — en senere godkjenning overskriver ikke en
 * tidligere avvisning.
 */
export async function avgjorDraft(input: {
  draftId: string;
  interaksjonId: string | null;
  status: DraftUtfall;
  /** Gjelder utkastet en mindreårig? Styrer om fritekst kan lagres. */
  mindreaarig?: boolean;
}): Promise<void> {
  await prisma.caddieDraft.update({
    where: { id: input.draftId },
    data: { status: input.status, resolvedAt: new Date() },
  });

  if (!input.interaksjonId) return;

  await settUtfall({
    interaksjonId: input.interaksjonId,
    utfall: TIL_AGENTICOS[input.status],
    mindreaarig: input.mindreaarig ?? false,
  });
}

/**
 * Samme som `avgjorDraft`, men når kalleren kjenner `toolCallId` i stedet for
 * rad-id-en. Brukes når et forslag godkjennes direkte i chatten — da finnes
 * bare tool-call-referansen.
 *
 * Slår opp utkastet først for å få tak i `interaksjonId`; uten det oppslaget
 * ville utfallet ikke nådd loggen. Er ingen PENDING-rad å finne, er det ikke en
 * feil: forslaget kan være behandlet fra køen allerede.
 */
export async function avgjorDraftViaToolCall(input: {
  userId: string;
  toolCallId: string;
  status: DraftUtfall;
  mindreaarig?: boolean;
}): Promise<void> {
  const draft = await prisma.caddieDraft.findFirst({
    where: { userId: input.userId, toolCallId: input.toolCallId, status: "PENDING" },
    select: { id: true, interaksjonId: true },
  });
  if (!draft) return;

  await avgjorDraft({
    draftId: draft.id,
    interaksjonId: draft.interaksjonId,
    status: input.status,
    mindreaarig: input.mindreaarig,
  });
}
