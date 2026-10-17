import type { Metadata } from "next";
import { PrecisionTilstand } from "@/components/system/precision-tilstand";
import { VEDLIKEHOLD_TELEFON, VEDLIKEHOLD_TELEFON_LENKE } from "@/lib/vedlikehold";

/**
 * /vedlikehold — SY-01 Vedlikehold i nytt design (gfgk-system.html). Proxy-en rewriter stengte ruter hit.
 * Avvik: tegningens «Startet 22:00 · Ventet ferdig 23:00» finnes ikke som data. I stedet vises de ekte
 * kanalene (telefon og e-post), som før.
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
      tittel="AK Golf HQ oppdateres"
      tekst="Vi gjør en planlagt oppdatering. Ingenting du har lagret, blir borte. Skal du booke coaching i mellomtiden, ringer du oss."
      linjer={[
        { label: "Booking av coaching", verdi: VEDLIKEHOLD_TELEFON },
        { label: "Spørsmål på e-post", verdi: "post@akgolf.no" },
      ]}
      primar={{ label: `Ring ${VEDLIKEHOLD_TELEFON}`, href: VEDLIKEHOLD_TELEFON_LENKE }}
      sekundar={{ label: "Sjekk på nytt", href: "/" }}
    />
  );
}
