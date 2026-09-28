import { SkjermRamme } from "@/components/team-norway/skjermer/felles";
import { TnSkjermhode, TnFlate, TnMangler } from "@/components/team-norway/tn-flate";
import { TN_RUTER } from "@/components/team-norway/tn-ruter";
import { krevTnTrenerflate } from "@/lib/domain/tn-flate-tilgang";

export const metadata = {
  title: "Team Norway Golf · Kartlegging",
  description: "Testdata fra WANG-skolene: hvem som har levert, og alle resultater.",
};

/**
 * Kartlegging (tegningens id «kartlegging», uten TN-kode). Midlertidig side så
 * menylenken ikke gir 404. Skjermagenten bygger den ekte skjermen her.
 */
export default async function TnKartleggingPage() {
  const { bruker, kontekst } = await krevTnTrenerflate();
  return (
    <SkjermRamme aktiv="kartlegging" brukerNavn={bruker.name} kontekst={kontekst}>
      <TnSkjermhode rute={TN_RUTER.kartlegging} tittel="Kartlegging" ingress="Testdata fra alle WANG-skolene: hvem som har levert, og alle resultater." />
      <TnFlate>
        <TnMangler>Skjermen er ikke bygget ennå.</TnMangler>
      </TnFlate>
    </SkjermRamme>
  );
}
