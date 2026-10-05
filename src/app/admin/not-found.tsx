/**
 * 404 for /admin-treet. Samme Precision-ramme som SY-01, med
 * cockpit og innlogging som veier tilbake.
 */

import type { Metadata } from "next";
import { IkkeFunnet } from "@/components/system/ikke-funnet";

export const metadata: Metadata = {
  title: "Side ikke funnet — AgencyOS",
};

export default function AdminNotFound() {
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
