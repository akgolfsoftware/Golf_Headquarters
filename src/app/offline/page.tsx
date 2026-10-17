import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { PrecisionTilstand } from "@/components/system/precision-tilstand";

export const metadata: Metadata = {
  title: "Du er uten nett",
  description: "Sjekk nettforbindelsen din og prøv igjen.",
};

/**
 * /offline — SY-01 Frakoblet i nytt design. Serwist ruter hit ved manglende nettverk.
 * Avvik: tegningens «3 slag venter på å sendes» er demodata og vises ikke; siden er
 * forhåndslagret og kjenner ikke køen.
 */
export default function OfflinePage() {
  return (
    <PrecisionTilstand
      kicker="Frakoblet"
      ikon={
        <span className="ikonboks" style={{ width: 64, height: 64, borderRadius: 16 }}>
          <WifiOff className="ikon" style={{ width: 30, height: 30 }} aria-hidden="true" />
        </span>
      }
      tittel="Du er uten nett"
      tekst="Slag og økter du registrerer nå, lagres på telefonen og sendes når nettet er tilbake."
      primar={{ label: "Prøv igjen", href: "/offline" }}
      sekundar={{ label: "Fortsett økta", href: "/portal" }}
    />
  );
}
