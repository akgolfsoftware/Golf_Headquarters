/**
 * Posisjonsmarkøren: P-etikett plassert prosentvis på en relativ forelder
 * (scrubberens markørfelt eller et stillbilde) (~3 skjermer). Fargeløs —
 * P-vokabular; aktiv = blekkfylt. IKKE PPositionRail (hele skalaen) —
 * markøren er ETT punkt.
 */
export interface PositionMarkerProps {
  /** «P6» — også title */
  label: string;
  /** Posisjon 0–100 på forelderen */
  pct?: number;
  active?: boolean;
  /** Gjør markøren klikkbar (hopp til posisjonen) */
  onSelect?: () => void;
  dataOdId?: string;
}
