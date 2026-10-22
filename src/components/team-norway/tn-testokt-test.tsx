"use client";

import Link from "next/link";
import { useCallback } from "react";

import { PH15TnTest } from "@/components/portal/precision/PH15TnTest";
import { saveTnTestForSpiller } from "@/app/team-norway/tn-testokt-actions";
import type { TnProtocol } from "@/lib/portal-tester/tn-catalog";
import type { TnInitial } from "@/lib/portal-tester/use-tn-draft";
import type { TnSaveInput } from "@/lib/portal-tester/tn-session";
import type { TnResult } from "@/lib/portal-tester/tn-scoring";

/**
 * Ett steg i trenerens testøkt (utkast 3, «Ett slag om gangen» og «Gate-test med store knapper»): spillerens
 * testskjerm (PH15TnTest) med trenerens lagring for spilleren. Utkastet lagres på telefonen per slag (useTnDraft)
 * og sendes når nettet er tilbake. «Tilbake» er pause: utkastet står, og løpet fortsetter fra samme adresse.
 */
export function TnTestoktTest({ spillerId, protocol, initial, lagretResultat, sessionId, kontekst, pauseHref, nesteHref, nesteTekst }: {
  spillerId: string;
  protocol: TnProtocol;
  initial?: TnInitial;
  lagretResultat?: TnResult;
  sessionId: string;
  kontekst: string;
  /** Oppsummeringen av løpet. Der kan hver test åpnes igjen. */
  pauseHref: string;
  nesteHref: string;
  nesteTekst: string;
}) {
  const lagre = useCallback((input: TnSaveInput) => saveTnTestForSpiller({ ...input, spillerId }), [spillerId]);
  return (
    <PH15TnTest
      protocol={protocol}
      initial={initial}
      savedResult={lagretResultat}
      localSessionId={initial ? undefined : sessionId}
      kontekst={kontekst}
      trener={{
        lagre,
        tilbake: { href: pauseHref, tekst: "Pause" },
        etterLukket: <Link className="phn-knapp pri" href={nesteHref}>{nesteTekst}</Link>,
      }}
    />
  );
}
