import * as React from "react";

/** Ett slag fra en TrackMan-økt (normalisert). */
export interface TrackmanSlag {
  /** Kølle-id, f.eks. "6i", "52w" — må matche en serie i `koller`. */
  kolle: string;
  /** Carry i meter. */
  carry: number;
  /** Sideavvik i meter — negativ = venstre, positiv = høyre. */
  side: number;
}

export interface TrackmanKolle {
  id: string;
  /** Visningsnavn, f.eks. "6-jern". */
  navn: string;
}

export interface DispersionPlotProps { /** Vis Skeleton mens data lastes. */ loading?: boolean;
  slag: TrackmanSlag[];
  /** Seriedefinisjon (maks 5). Utledes av `slag` om utelatt. */
  koller?: TrackmanKolle[];
  /** Tegn konsistens-ellipse (1,5σ) per synlig kølle. Default true. */
  ellipse?: boolean;
  /** Plot-høyde i px. Default 280. */
  hoyde?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Dispersion-plot — carry × side, sett ovenfra (skyteskive-look).
 * Prikker fargekodet + formkodet per kølle (fargeblind-sikkert); klikkbar
 * legend isolerer serier; hover/fokus gir tooltip per slag.
 * Konsistens-ellipsen er innsikten — lime når én kølle er isolert.
 * Skjermleser får tekstsammendrag per kølle.
 */
export declare function DispersionPlot(props: DispersionPlotProps): JSX.Element;
