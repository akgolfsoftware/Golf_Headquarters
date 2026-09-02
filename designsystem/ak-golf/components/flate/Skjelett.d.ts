/**
 * Skjelett — plassen noe kommer til å ta. Senket flate, rolig puls, stille
 * under redusert bevegelse. Sett aria-busy på beholderen rundt.
 */
export interface SkjelettProps {
  form?: 'linje' | 'tittel' | 'tall' | 'blokk' | 'bilde' | 'rund';
  bredde?: number | string;
  hoyde?: number | string;
  /** Antall linjer når form er «linje». Siste linje blir kortere. */
  linjer?: number;
  style?: React.CSSProperties;
}
export function Skjelett(props: SkjelettProps): JSX.Element;
