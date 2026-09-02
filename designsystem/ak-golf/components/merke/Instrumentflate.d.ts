/**
 * Instrumentflate — rutenettet som tekstur under innhold. 56 px ruter, 24 px i
 * kort og på små flater. Teksturen skal kunne fjernes uten at flaten slutter å
 * virke; bærer den informasjon, hører den hjemme som et ekte diagram.
 */
export interface InstrumentflateProps {
  /** 24 px ruter i stedet for 56 — for kort og små flater. */
  tett?: boolean;
  /** Bruker styrken for mørk flate. */
  mork?: boolean;
  /** Setter et 11 px kryss i to hjørner. Ett kryss er presisjon; fire er en ramme. */
  kryss?: boolean;
  styrke?: number;
  som?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Instrumentflate(props: InstrumentflateProps): JSX.Element;
