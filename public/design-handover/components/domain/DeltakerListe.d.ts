import * as React from "react";

export interface Deltaker {
  navn: string;
  initialer?: string;
  status?: "tilstede" | "invitert" | "avslatt" | "kanskje";
}
export interface DeltakerListeProps {
  deltakere: Deltaker[];
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * DeltakerListe — deltakere i gruppeøkt/Live Session m/ oppmøtestatus (ord + prikk,
 * ikke bare farge). Tomt = invitér-onboarding.
 */
export declare function DeltakerListe(props: DeltakerListeProps): JSX.Element;
