import * as React from "react";

export interface OppgaveKortProps {
  /** Oppgavetittel, f.eks. "Face-to-path CS60". */
  tittel: string;
  /** Klarspråk-beskrivelse — hva spilleren skal gjøre. */
  beskrivelse?: React.ReactNode;
  /** Koblet drill/øvelse-navn (lenke til biblioteket). */
  drill?: string;
  /** Volum/dose, f.eks. "3×/uke" eller "40 baller". */
  dose?: string;
  /** Frist som visningsstreng, f.eks. "fredag 20.6". */
  frist?: string;
  /** Status. forfalt = frist passert uten innlevering. */
  status?: "venter" | "innlevert" | "godkjent" | "forfalt";
  /** Krever videoinnlevering (badge). */
  videoKrav?: boolean;
  /** Pyramide-akse for fargeprikk. */
  akse?: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  /** Læringstrinn-etikett (spillerspråk), f.eks. "Trinn 3 · Kølle". */
  trinn?: string;
  /** Primærhandling (coach: «Godkjenn» / spiller: «Marker gjort»). */
  onPrimaer?: () => void;
  primaerTekst?: string;
  /** Sekundær (åpne innlevering / se drill). */
  onSekundaer?: () => void;
  sekundaerTekst?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Oppgave-kort — arbeidsoppgave fra en fysisk coaching-time som lukker
 * lekse-loopen (time → oppgave → PlayerHQ → innlevering → godkjenning →
 * teller i GJENNOMFØRING). Status er semantisk (aldri farge alene);
 * forfalt varsler, sperrer aldri (kanon).
 */
export declare function OppgaveKort(props: OppgaveKortProps): JSX.Element;
