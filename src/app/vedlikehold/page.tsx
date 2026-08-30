import type { Metadata } from "next";

import { PaperTilstand, PaperIkon } from "@/components/system/side-tilstand";
import { VEDLIKEHOLD_TELEFON, VEDLIKEHOLD_TELEFON_LENKE } from "@/lib/vedlikehold";

/**
 * /vedlikehold — Paper. Fasit: designsystem/paper/fase2/system/
 * system-tilstander.html (§vedlikehold), via delt <PaperTilstand>.
 *
 * Proxy-en rewriter alle stengte ruter hit mens `VEDLIKEHOLD` står på
 * (se src/lib/vedlikehold.ts), så dette er den ENESTE flaten kundene
 * møter. Derfor bærer den også beskjeden om at coaching bookes på
 * telefon — det er hele grunnen til at skiltet henger ute.
 *
 * Ren presentasjon: ingen DB, ingen auth. Siden må kunne rendres selv om
 * det er databasen som er nede.
 */

export const metadata: Metadata = {
  title: "Vi oppdaterer akkurat nå — AK Golf Academy",
  description: `AK Golf HQ er nede for vedlikehold. Coaching bookes på telefon ${VEDLIKEHOLD_TELEFON}.`,
  robots: { index: false, follow: false },
};

export default function VedlikeholdPage() {
  return (
    <PaperTilstand
      dataSlug="system-vedlikehold"
      ikon={PaperIkon.vedlikehold}
      tittel="Vi oppdaterer akkurat nå"
      tekst="AK Golf HQ er nede for vedlikehold. Alt kommer tilbake som det var — du trenger ikke gjøre noe. Skal du booke coaching i mellomtiden, ringer du oss."
      virkerLabel="Virker fortsatt"
      virkerLinjer={[
        { label: "Booking av coaching", verdi: VEDLIKEHOLD_TELEFON },
        { label: "Spørsmål på e-post", verdi: "post@akgolf.no" },
        { label: "Nettsiden og appen", verdi: "tilbake snart" },
      ]}
      knapper={[
        { label: `Ring ${VEDLIKEHOLD_TELEFON}`, href: VEDLIKEHOLD_TELEFON_LENKE, primary: true },
        { label: "Sjekk om vi er oppe", href: "/" },
      ]}
      kode="503 · planlagt vedlikehold"
    />
  );
}
