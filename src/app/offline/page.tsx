import type { Metadata } from "next";
import { PrecisionTilstand } from "@/components/system/precision-tilstand";

export const metadata: Metadata = {
  title: "Du er offline",
  description: "Sjekk nettforbindelsen din og prøv igjen.",
};

/**
 * /offline — SY01Offline. Serwist ruter hit ved manglende nettverk.
 * Produktteksten om lokal lagring er beholdt. Tegningens «3 endringer
 * venter» og «sist synket» er demodata og er ikke innført.
 */
export default function OfflinePage() {
  return (
    <PrecisionTilstand
      kicker="Offline"
      tittel="Du er uten nett"
      tekst="Du er uten nett. Live-utkast som er lagret på denne enheten, sendes når forbindelsen er tilbake. Kontroller lagringstilstanden i økta. Andre skjemaer og nye data kan kreve nett."
      linjer={[
        { label: "Live-utkast", verdi: "beholdes etter bekreftet lokal lagring" },
        { label: "Slagregistrering", verdi: "tilgjengelig i en allerede lastet økt" },
        { label: "Plan og analyse", verdi: "krever nett" },
      ]}
      primar={{ label: "Åpne appen", href: "/portal" }}
      sekundar={{ label: "Til forsiden", href: "/" }}
    />
  );
}
