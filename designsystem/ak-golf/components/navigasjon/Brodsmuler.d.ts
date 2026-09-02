/**
 * Brodsmuler — hvor du er, i mono-caps. Skilletegnet er en skråstrek i mono,
 * aldri en pil eller et chevron-ikon.
 */
export interface Smule { tekst: string; href?: string }
export interface BrodsmulerProps {
  smuler?: Smule[];
  style?: React.CSSProperties;
}
export function Brodsmuler(props: BrodsmulerProps): JSX.Element;
