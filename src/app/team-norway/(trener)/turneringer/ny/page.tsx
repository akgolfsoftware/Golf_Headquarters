import { SkjermRamme } from "@/components/team-norway/skjermer/felles";
import { Primarlenke, TomTilstand } from "@/components/team-norway/tn-daglig-spillere/ui";
import { TnFlate, TnSkjermhode } from "@/components/team-norway/tn-flate";
import { TN_RUTER } from "@/components/team-norway/tn-ruter";
import { krevTnTrenerflate } from "@/lib/domain/tn-flate-tilgang";

export const metadata = {
  title: "Ny turnering · Team Norway Golf",
  description: "Hvordan en turnering kommer inn i trenerflaten.",
};

/**
 * TN-07, «Legg inn turnering». Tidligere lagret skjemaet turneringen på den
 * innloggede SPILLERENS plan. Trenerflaten er bare for Sportssjef og Trener
 * (domenesperren), så skjemaet ville lagret turneringen på trenerens egen plan.
 * Siden forklarer i stedet hvor turneringene kommer fra.
 */
export default async function TnNyTurneringPage() {
  const { bruker, kontekst } = await krevTnTrenerflate();
  return (
    <SkjermRamme aktiv="turneringer" brukerNavn={bruker.name} kontekst={kontekst}>
      <TnSkjermhode rute={`${TN_RUTER.turneringer}/ny`} tittel="Legg inn turnering" ingress="Turneringer kommer fra spillernes planer i PlayerHQ og fra resultatene i AK Golf Pipeline." />
      <TnFlate>
        <TomTilstand tittel="Spilleren legger inn turneringen">
          En turnering som ikke finnes i katalogen, legger spilleren inn selv i PlayerHQ under Turneringer. Den vises her så snart den står på planen. Resultater hentes fra AK Golf Pipeline etter siste runde.
        </TomTilstand>
        <Primarlenke href={TN_RUTER.turneringer}>Til turneringene</Primarlenke>
      </TnFlate>
    </SkjermRamme>
  );
}
