/**
 * 404 for /admin-treet — Paper. Fasit: designsystem/paper/fase2/system/
 * system-tilstander.html (§404), via delt <IkkeFunnet>. Erstatter den
 * gamle bespoke mørke 404-en (design-audit-funn 8, «hvit blits» i mørk
 * admin-chrome) — den bugen er lukket av tema-unifiseringen 2026-08-03
 * (html[data-v2-tema="dark"] er eneste mekanisme, og --p-*-tokene i
 * paper-tokens.css har egen mørk-blokk), så PaperTilstand rendrer nå
 * korrekt i begge temaer uten en egen mørk variant.
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
