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
      tekst="Vi mistet forbindelsen. Alt du har registrert på denne enheten er lagret lokalt, og sendes inn automatisk når nettet er tilbake."
      linjer={[
        { label: "Dagens økt", verdi: "lagret lokalt" },
        { label: "Slagregistrering", verdi: "virker" },
        { label: "Plan og analyse", verdi: "krever nett" },
      ]}
      primar={{ label: "Prøv igjen", href: "/offline" }}
      sekundar={{ label: "Fortsett økta", href: "/portal" }}
    />
  );
}
