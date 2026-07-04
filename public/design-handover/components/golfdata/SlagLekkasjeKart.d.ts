import * as React from "react";

export interface LekkasjeBaand {
  /** Stabil id — sendes tilbake i onVelgBaand. */
  id: string;
  /** Visningsnavn: «Tee-slag», «Innspill 150–100 m», «Putting 0–6 ft» (putting ALLTID i fot). */
  label: string;
  /** SG per runde for båndet (negativ = tap). Farger heat + tall via --down/--up. */
  sg: number;
  /** Antall slag i datagrunnlaget for båndet (vises under label). */
  slag?: number;
}

export interface SlagLekkasjeKartProps {
  /** Avstandsbåndene, øverst→nederst (tee → innspill → nærspill → putt). */
  baand: LekkasjeBaand[];
  /** Navngitt baseline — ALLTID vist. F.eks. "Broadie scratch" / "Kat. A-snitt". */
  baseline?: string;
  /** Datagrunnlag, f.eks. "14 runder" — vises i baseline-linjen. */
  grunnlag?: string;
  /** Dommen over kartet. Default «Hvor slagene forsvinner». */
  tittel?: string;
  /** Markert bånd (analytikerkjeden åpen for dette båndet). */
  valgtId?: string;
  /** Klikk på bånd → åpne analytikerkjeden (DiagnoseKort). Uten handler er radene ikke trykkbare. */
  onVelgBaand?: (baand: LekkasjeBaand) => void;
  /** Progressiv dybde — én kodevei: nybegynner (kun kart) · ovet (+antall/hint) · elite (+sum-linje). Default "ovet". */
  nivaa?: "nybegynner" | "ovet" | "elite";
  loading?: boolean;
  /** Tomtilstand = onboarding, aldri blank. */
  tomt?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SlagLekkasjeKart — heatmap over avstandsbånd farget etter SG-tap mot navngitt
 * baseline. Hele raden er trykkbar (≥44px, én kolonne — fungerer på 390px) og
 * åpner analytikerkjeden. Tap/gevinst = --down/--up (aldri lime).
 */
export declare function SlagLekkasjeKart(props: SlagLekkasjeKartProps): JSX.Element;
