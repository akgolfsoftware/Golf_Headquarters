import type { Metadata } from "next";
import { PaperTilstand, PaperIkon } from "@/components/system/side-tilstand";

export const metadata: Metadata = {
  title: "Tjenesten er utilgjengelig · AK Golf",
  description: "Vi fikk ikke bekreftet tilgangen din. Prøv igjen om litt.",
  robots: { index: false, follow: false },
};

/**
 * Vises når abonnement/gruppetilgang ikke kunne hentes.
 * Ingen Prisma/auth her — ellers loop når databasen fortsatt er nede.
 */
export default function TjenesteUtilgjengeligPage() {
  return (
    <PaperTilstand
      dataSlug="system-tjeneste-utilgjengelig"
      ikon={PaperIkon.teknisk}
      tittel="Vi fikk ikke bekreftet tilgangen din"
      tekst="Tjenesten svarte ikke akkurat nå. Dette er ikke et betalingskrav, og ingenting på kontoen er endret. Prøv igjen om litt."
      virkerLabel="Imens"
      virkerLinjer={[
        { label: "Innloggingen din", verdi: "beholdt" },
        { label: "Abonnement og tilgang", verdi: "uendret" },
        { label: "Betaling", verdi: "ikke krevd" },
      ]}
      knapper={[
        { label: "Prøv igjen", href: "/portal", primary: true },
        { label: "Til forsiden", href: "/" },
      ]}
      kode="503 · tilgang kunne ikke hentes"
    />
  );
}
