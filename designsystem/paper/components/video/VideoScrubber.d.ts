/**
 * Videoscrubberen for svinganalyse: native range med blekk-spor og
 * markørfelt for PositionMarker-barn (~3 skjermer — S10 Videoanalyse,
 * teknisk plan). Kontrollert — konsumenten eier avspillingen. IKKE Slider
 * (skjemaverdi) — dette er tidsnavigasjon i video.
 */
export interface VideoScrubberProps {
  /** Bildenummer eller ms — konsumentens enhet */
  value?: number;
  max?: number;
  onChange?: (v: number) => void;
  /** «bilde 214» eller «0:07,1» — går også i aria-valuetext */
  currentLabel?: string;
  endLabel?: string;
  /** PositionMarker-noder — plasseres i feltet over sporet */
  markers?: React.ReactNode;
  compact?: boolean;
  dataOdId?: string;
}
