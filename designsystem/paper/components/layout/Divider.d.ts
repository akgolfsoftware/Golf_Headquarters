export interface DividerProps {
  /** Mono-etikett midt i linjen. Uten den er det en ren strek */
  label?: string;
  /** Etikettens plassering. "start" er standard for seksjonsskift i lister */
  align?: "center" | "start";
  spacing?: "normal" | "tight" | "flush";
  /** Loddrett skille mellom to kolonner i samme rad */
  vertical?: boolean;
  dataOdId?: string;
}
