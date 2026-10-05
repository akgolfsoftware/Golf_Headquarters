import type { Metadata } from "next";
import { PrecisionTilstand } from "@/components/system/precision-tilstand";
import { VEDLIKEHOLD_TELEFON, VEDLIKEHOLD_TELEFON_LENKE } from "@/lib/vedlikehold";

/**
 * /vedlikehold — SY01Vedlikehold. Proxy-en rewriter stengte ruter hit.
 * Telefon og e-post er de ekte kanalene. Tegningens klokkeslett
 * 04:00–06:00 er ikke innført.
 */

export const metadata: Metadata = {
  title: "Vi oppdaterer akkurat nå — AK Golf Academy",
  description: `AK Golf HQ er nede for vedlikehold. Coaching bookes på telefon ${VEDLIKEHOLD_TELEFON}.`,
  robots: { index: false, follow: false },
};

export default function VedlikeholdPage() {
  return (
    <PrecisionTilstand
      kicker="Vedlikehold"
      tittel="Vi oppdaterer akkurat nå"
      tekst="AK Golf HQ er nede for vedlikehold. Alt kommer tilbake som det var — du trenger ikke gjøre noe. Skal du booke coaching i mellomtiden, ringer du oss."
      kode="503 · planlagt vedlikehold"
      linjer={[
        { label: "Booking av coaching", verdi: VEDLIKEHOLD_TELEFON },
        { label: "Spørsmål på e-post", verdi: "post@akgolf.no" },
        { label: "Nettsiden og appen", verdi: "tilbake snart" },
      ]}
      primar={{ label: `Ring ${VEDLIKEHOLD_TELEFON}`, href: VEDLIKEHOLD_TELEFON_LENKE }}
      sekundar={{ label: "Sjekk om vi er oppe", href: "/" }}
    />
  );
}
