import * as React from "react";

export interface AarsModell {
  /** Timer/år per pyramide-akse (KANONISK 5). */
  fys: number;
  tek: number;
  slag: number;
  spill: number;
  turn: number;
  /** Total timer/år. */
  total: number;
  /** Turnerings-nedbryting: uker × runder × timer per runde (rh som visningsstreng, «5,25»). */
  tw?: number;
  rd?: number;
  rh?: string;
}

export interface TidsPyramideProps {
  /** Årsmodellen som fordeles. Mangler den, vises ærlig tomtilstand. */
  aarsmodell?: AarsModell;
  /** Timer per uke som visningsstreng (totallinjen), f.eks. "30". */
  perUke?: string;
  /** Kontrollert valgt akse ('fys'|'tek'|'slag'|'spill'|'turn'). Utelatt = intern state (default 'turn'). */
  valgt?: "fys" | "tek" | "slag" | "spill" | "turn";
  onVelg?: (akse: string) => void;
  /** Overstyr notat-tekst per akse. */
  notat?: Partial<Record<"fys" | "tek" | "slag" | "spill" | "turn", string>>;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TidsPyramide — anbefalt tidsfordeling (timer/år) over de 5 pyramide-aksene,
 * KANONISK apex→base (TURN øverst, FYS fundament). Klikkbart nivå →
 * anbefalingskort med timer, %, note og turnerings-nedbryting.
 * Akse-etiketter i gutter via --axis-*-text; barene bærer ingen tekst.
 */
export declare function TidsPyramide(props: TidsPyramideProps): JSX.Element;
