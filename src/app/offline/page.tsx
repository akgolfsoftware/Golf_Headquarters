import type { Metadata } from "next";
import { PaperTilstand, PaperIkon } from "@/components/system/paper-tilstand";

export const metadata: Metadata = {
  title: "Du er offline",
  description: "Sjekk nettforbindelsen din og prøv igjen.",
};

/**
 * /offline — Paper. Fasit: designsystem/paper/fase2/system/
 * system-tilstander.html (§offline). Serwist ruter hit ved manglende
 * nettverk (se serwist.config.mjs). Ren presentasjon — ingen live
 * synk-status her ennå, kun de generiske «virker fortsatt»-linjene fra
 * fasiten.
 */
export default function OfflinePage() {
  return (
    <PaperTilstand
      dataSlug="system-offline"
      ikon={PaperIkon.offline}
      tittel="Du er uten nett"
      tekst="Vi mistet forbindelsen. Alt du har registrert på denne enheten er lagret lokalt, og sendes inn automatisk når nettet er tilbake."
      virkerLabel="Virker fortsatt"
      virkerLinjer={[
        { label: "Dagens økt", verdi: "lagret lokalt" },
        { label: "Slagregistrering", verdi: "virker" },
        { label: "Plan og analyse", verdi: "krever nett" },
      ]}
      knapper={[
        { label: "Prøv igjen", href: "/offline", primary: true },
        { label: "Fortsett økta", href: "/portal" },
      ]}
    />
  );
}
