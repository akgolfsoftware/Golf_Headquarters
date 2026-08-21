/**
 * 7-dagers flervalgsrad for foretrukne treningsdager. Skrevet for
 * onboarding-tillegget (manifest playerhq-onboarding-tillegg, 20.08.2026),
 * gjenbrukbar overalt en spiller velger ukedager.
 *
 * Dagkodene er norske forkortelser (MAN…SON) — ikke ISO-vekedag-tall.
 */
export type Dagkode = "MAN" | "TIR" | "ONS" | "TOR" | "FRE" | "LOR" | "SON";
export interface DagVelgerProps {
  valgt?: Dagkode[];
  onChange?: (valgt: Dagkode[]) => void;
  dataOdId?: string;
}
export declare function DagVelger(props: DagVelgerProps): JSX.Element;
