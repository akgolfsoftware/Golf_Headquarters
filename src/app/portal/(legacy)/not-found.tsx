/**
 * 404 for ruter under /portal/(legacy) — Paper, samme mønster som
 * src/app/portal/not-found.tsx. (legacy) er en rutegruppe (parentes-pakket,
 * forsvinner fra URL-en) og eier sin egen not-found-grense i Next.js'
 * nærmeste-ancestor-mønster — duplisert fil, ikke duplisert design.
 */

import type { Metadata } from "next";
import { IkkeFunnet } from "@/components/system/ikke-funnet";

export const metadata: Metadata = {
  title: "Side ikke funnet — PlayerHQ",
};

export default function PortalLegacyNotFound() {
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
