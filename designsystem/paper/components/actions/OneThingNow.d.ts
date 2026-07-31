export interface OneThingNowProps {
  /** Mono-etikett med puls, default «Én ting nå» */
  label?: string;
  /** Jobben — display-tittel */
  title?: string;
  /** Beskrivelse (prosa, --muted) */
  children?: React.ReactNode;
  /** Knapper — blekk-primær + ghost, ALDRI oransje-fylte */
  actions?: React.ReactNode;
  dataOdId?: string;
}
