/**
 * Stepper — hvor i en flerstegsflyt brukeren er. Tre tilstander per steg:
 * gjennomført (blekkfylt + hake), gjeldende (blekkramme), kommende (dempet).
 *
 * Ren tilstandsvisning. Komponenten navigerer ikke, og inneholder verken
 * knapper eller lenker — se `.prompt.md`.
 *
 * Hva den IKKE er:
 * - `Pagination` = posisjon i et datasett. Sider har rekkefølge uten mening;
 *   steg har rekkefølge med mening.
 * - `ProgramLadder` = AK-stigen, en varig utviklingsmodell. Stepper er én
 *   flyt én gang.
 * - `ProgressBar` = kontinuerlig andel. Stepper er diskrete steg med navn.
 */
export interface StepperStep {
  id: string;
  label: string;
}

export interface StepperProps {
  steps: (StepperStep | string)[];
  /** 0-indeksert. Steg før dette er gjennomført, etter er kommende. */
  current: number;
  /** Skjuler etikettene — bare nummererte sirkler. */
  compact?: boolean;
  /** Tilgjengelig navn på `<ol>`. */
  label?: string;
  /** data-od-id, rolleprefiks nav- */
  dataOdId?: string;
}
