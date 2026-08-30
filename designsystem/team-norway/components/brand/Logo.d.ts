export interface LogoProps {
  /** Høyde i px på selve merket. Aldri under 24px. */
  height?: number;
  /** På mørk flate settes merket på en hvit plate — logoen har ingen negativ versjon. */
  onDark?: boolean;
  /** 'never' dropper platen (kun hvis flaten allerede er hvit). */
  plate?: 'auto' | 'never';
  /** Overstyr filbanen når prosjektet ligger i en undermappe. */
  src?: string;
}
/** Offisiell logo. Rendres alltid fra fil — skal aldri gjenskapes, farges om, beskjæres eller settes i annen skrift. */
export declare function Logo(props: LogoProps): JSX.Element;