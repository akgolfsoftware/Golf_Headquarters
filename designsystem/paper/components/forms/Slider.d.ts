/**
 * Skyvekontroll med obligatorisk tallavlesning. For verdier der omtrentlig
 * er godt nok — ukevolum, intensitet, vekting. Presise tall er tallfelt.
 *
 * Etikett og hjelpetekst bor i FormField.
 */
export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange?: (value: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Enhet i avlesningen og i aria-valuetext: "t", "%", "m". */
  unit?: string;
  /** Mono-linje under: periodens min/maks, konsekvens av verdien. */
  note?: React.ReactNode;
  /** Overstyrer endepunktetikettene når skalaen ikke er tallene selv. */
  scale?: [string | number, string | number];
  /** Datasemantikk på avlesningen. Aldri dekor — kun når tallet ER opp/ned. */
  tone?: "up" | "dn";
  disabled?: boolean;
  dataOdId?: string;
}
export declare function Slider(props: SliderProps): JSX.Element;
