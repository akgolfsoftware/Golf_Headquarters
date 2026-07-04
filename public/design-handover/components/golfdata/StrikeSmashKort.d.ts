import * as React from "react";

export interface StrikeSone {
  /** Andel av slagene i sonen (0–1). Under 0,005 regnes sonen som tom → «—». */
  andel: number;
  /** Snitt smash factor i sonen. null = ingen data. */
  smash: number | null;
}

export interface StrikeSmashKortProps {
  /** Kølla målingen gjelder, f.eks. "Driver". */
  kolle?: string;
  /** NØYAKTIG 9 soner, radvis fra øverst-hæl → nederst-tå (3×3). */
  soner?: StrikeSone[];
  /** Ideal smash for kølla (driver ≈ 1,50). Dømmer sonefargene. Default 1.5. */
  idealSmash?: number;
  /** Datagrunnlag — alltid synlig, f.eks. "86 slag · TrackMan". */
  grunnlag?: string;
  /** Klarspråk-dom, f.eks. «Lav hæl-treff koster 0,06 smash — tee ballen høyere.» */
  dom?: string;
  /** Progressiv dybde — én kodevei: nybegynner (panelene) · ovet (+dom/ideal) · elite (+andel-% per sone). Default "ovet". */
  nivaa?: "nybegynner" | "ovet" | "elite";
  loading?: boolean;
  /** Tomtilstand = onboarding, aldri blank. */
  tomt?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * StrikeSmashKort — treffpunkt-heatmap på køllebladet (nøytral blekk-tetthet)
 * side ved side med smash factor per sone dømt mot ideal (--up/--warning/--down).
 * Tomme soner vises ærlig som «—».
 */
export declare function StrikeSmashKort(props: StrikeSmashKortProps): JSX.Element;
