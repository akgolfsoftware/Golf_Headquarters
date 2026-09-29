import { redirect } from "next/navigation";

import { SkjermRamme } from "@/components/team-norway/skjermer/felles";
import { Primarlenke, TomTilstand } from "@/components/team-norway/tn-daglig-spillere/ui";
import { TnFlate, TnSkjermhode } from "@/components/team-norway/tn-flate";
import { TN_RUTER, tnSpillerHref } from "@/components/team-norway/tn-ruter";
import { hentTnSpillere } from "@/lib/domain/tn-arbeidsflate";
import { krevTnTrenerflate } from "@/lib/domain/tn-flate-tilgang";

/**
 * TN-02 Spillerprofil — inngangen fra menyen. Åpner første spiller i gruppen;
 * i profilen byttes spiller med velgeren øverst (tegningens ppSel). Uten
 * spillere vises tegningens tomme tilstand.
 */
export default async function TnSpillerInngang() {
  const { bruker, kontekst } = await krevTnTrenerflate();
  const spillere = await hentTnSpillere(bruker);
  const forste = spillere?.rader[0];
  if (forste) redirect(tnSpillerHref(forste.id));
  return (
    <SkjermRamme aktiv="spiller" brukerNavn={bruker.name} kontekst={kontekst}>
      <TnSkjermhode rute={TN_RUTER.spiller} tittel="Spillerprofil" ingress="Det spilleren har i PlayerHQ: plan, stats, tester, IUP, samtaler og turneringer." />
      <TnFlate>
        <TomTilstand tittel="Ingen spillere i gruppen">Du ser en spiller når hen er aktivt medlem av gruppen. Under 16 år må en forelder godkjenne.</TomTilstand>
        <Primarlenke href={TN_RUTER.tilgang}>Se tilgang</Primarlenke>
      </TnFlate>
    </SkjermRamme>
  );
}
