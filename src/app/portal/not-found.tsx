/**
 * 404 for /portal-treet — Paper. Fasit: designsystem/paper/fase2/system/
 * system-tilstander.html (§404), via delt <IkkeFunnet>. Erstatter den
 * forrige Banner+T-tokens-varianten — samme innhold, nå på samme delte
 * systemtilstand-komponent som resten av appen (lukker P4).
 */

import type { Metadata } from "next";
import { IkkeFunnet } from "@/components/system/ikke-funnet";

export const metadata: Metadata = {
  title: "Side ikke funnet — PlayerHQ",
};

export default function PortalNotFound() {
  return (
    <IkkeFunnet
      hjemHref="/portal"
      knappTekst="Tilbake til hjem"
      beskrivelse="Adressen kan være flyttet eller feilskrevet. Sjekk URLen eller gå tilbake til portalen."
      sekundarKnappTekst="Logg inn på nytt"
      sekundarHref="/auth/login"
    />
  );
}
