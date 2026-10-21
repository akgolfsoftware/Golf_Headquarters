import type { ReactNode } from "react";

import { TnFlate } from "./tn-flate";
import { TnSpillerFaner, type TnSpillerFane } from "./tn-shell";
import { TnSkraKort, TnSkraTopp } from "./tn-skra-topp";

/**
 * Toppen på IUP-fanene (Post, Profil, Analyse, Fireukerssjekk, Turneringsplan): lav Skrå-topp med
 * navnet på fanen, og faneraden i første kort over kanten. Resten av fanens innhold er `children`
 * og ligger i samme kortrekke. Oversikt og Tester har egne topper med hovedtall og bruker ikke denne.
 */
export function TnIupTopp({
  spillerId,
  spillerNavn,
  aktiv,
  kanAdministrere,
  overlinje,
  tittel,
  ingress,
  children,
}: {
  spillerId: string;
  spillerNavn: string;
  aktiv: TnSpillerFane;
  kanAdministrere: boolean;
  overlinje: string;
  tittel: string;
  ingress?: string;
  children?: ReactNode;
}) {
  return (
    <>
      <TnSkraTopp lav bilde="tee-hand" etikett={`${tittel} for ${spillerNavn}`} overlinje={overlinje} tittel={tittel} ingress={ingress} />
      <TnSkraKort lav>
        <TnFlate>
          <TnSpillerFaner spillerId={spillerId} spillerNavn={spillerNavn} aktiv={aktiv} kanAdministrere={kanAdministrere} />
        </TnFlate>
        {children}
      </TnSkraKort>
    </>
  );
}
