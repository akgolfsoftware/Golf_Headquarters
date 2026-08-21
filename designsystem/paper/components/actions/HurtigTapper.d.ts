/**
 * +5/+10/+25-rad under hovedtapperne i live-økta. Rent tillegg til +1 —
 * for høyreps-drills der femten enkelttrykk er unødvendig friksjon.
 */
export interface HurtigTapperProps {
  /** Stegene som vises, i rekkefølge. Standard [5, 10, 25]. */
  steg?: number[];
  onTapp?: (steg: number) => void;
  disabled?: boolean;
  dataOdId?: string;
}
export declare function HurtigTapper(props: HurtigTapperProps): JSX.Element;
