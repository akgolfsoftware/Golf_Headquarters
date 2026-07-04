import * as React from "react";

export interface AnbefalingsKortProps {
  /** HVORFOR — hva i dataene utløser forslaget. */
  hvorfor: React.ReactNode;
  /** HVA — den konkrete endringen/økten. */
  hva: React.ReactNode;
  /** FORVENTET EFFEKT — målbar forventning. */
  effekt: React.ReactNode;
  /** HVORFOR NÅ — timingen. */
  hvorforNaa: React.ReactNode;
  /** «Bruk forslag» — primærhandling (kanon). */
  onBruk?: () => void;
  onAvvis?: () => void;
  /** Valgfri «Juster»-tekstlenke. */
  onJuster?: () => void;
  /** Kontekst-chip i headeren, f.eks. "Uke 25 · Øyvind". */
  kontekst?: string;
  /** Tettere variant for innbygging i overstyringsdialog / fleks-flyt. */
  kompakt?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Anbefalings-kort — anbefalingskontrakten (kanon): hvert AI-forslag viser
 * Hvorfor / Hva / Forventet effekt / Hvorfor nå, med «Bruk forslag» som
 * primærhandling. Temanøytral. Brukes av ghost-økter, overstyringsdialogens
 * AI-fiks og fleks-flytens AI-vindu.
 */
export declare function AnbefalingsKort(props: AnbefalingsKortProps): JSX.Element;
