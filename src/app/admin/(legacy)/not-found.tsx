/**
 * 404 for ruter under /admin/(legacy) — Paper, samme mønster som
 * src/app/admin/not-found.tsx. (legacy) er en rutegruppe (parentes-pakket,
 * forsvinner fra URL-en) og eier sin egen not-found-grense i Next.js'
 * nærmeste-ancestor-mønster — duplisert fil, ikke duplisert design.
 */

import type { Metadata } from "next";
import { IkkeFunnet } from "@/components/system/ikke-funnet";

export const metadata: Metadata = {
  title: "Side ikke funnet — AgencyOS",
};

export default function AdminLegacyNotFound() {
  return (
    <IkkeFunnet
      hjemHref="/admin/agencyos"
      knappTekst="Til cockpit"
      beskrivelse="Sjekk URLen eller gå tilbake til AgencyOS-oversikten."
      sekundarKnappTekst="Logg inn på nytt"
      sekundarHref="/auth/login"
    />
  );
}
