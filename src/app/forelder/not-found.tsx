/**
 * 404 for /forelder-treet — Paper. Fasit: designsystem/paper/fase2/system/
 * system-tilstander.html (§404), via delt <IkkeFunnet>. Erstatter den
 * gamle athletic/golfdata-baserte 404-en — lukker P4.
 */

import type { Metadata } from "next";
import { IkkeFunnet } from "@/components/system/ikke-funnet";

export const metadata: Metadata = {
  title: "Side ikke funnet — AK Golf HQ",
};

export default function ForelderNotFound() {
  return (
    <IkkeFunnet
      hjemHref="/forelder"
      knappTekst="Tilbake til oversikten"
      beskrivelse="Sjekk URLen eller gå tilbake til foreldre-oversikten."
      sekundarKnappTekst="Logg inn på nytt"
      sekundarHref="/auth/login"
    />
  );
}
