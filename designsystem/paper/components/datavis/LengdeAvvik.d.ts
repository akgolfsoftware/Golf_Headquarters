/**
 * Divergerende lengdeavvik rundt null — carry mot mål per kølle, avstand mot
 * pin (~5 skjermer). IKKE GappingChart (absolutte lengder per kølle) og IKKE
 * DispersionMap (2D-spredning) — dette er 1D-avvik fra et MÅL. Avvik er
 * retning, ikke moral: begge sider --mid; kun flaggede rader tones --dn.
 */
export interface LengdeAvvikRad {
  /** «Driver», «J7», «Wedge 56» */
  label: string;
  /** Avvik i meter: + = langt, − = kort */
  value: number;
  /** ALLTID med enhet og retning: «+6 m langt» */
  display: string;
  /** Utenfor toleranse — satt av konsumenten, aldri regnet her */
  flagged?: boolean;
}
export interface LengdeAvvikProps {
  rows: LengdeAvvikRad[];
  /** Skalatak for |avvik|; default største */
  maxAbs?: number;
  kortLabel?: string;
  langtLabel?: string;
  dense?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  ariaLabel?: string;
  dataOdId?: string;
}
