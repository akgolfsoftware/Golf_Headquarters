import * as React from "react";

export interface FjellKategori {
  /** Kategori-id A–K (A = beste, første i lista = apex). */
  id: string;
  /** Nivånavn, f.eks. "World Elite". */
  niva: string;
  /** Tour-linje i forhåndsvisningen (mono caps). */
  tours?: string;
  /** Spillere/beskrivelse i forhåndsvisningen. */
  spillere?: string;
  score?: string;
  hcp?: string;
  /** Timer/uke som visningsstreng («30»). */
  timerUke?: string;
  bane?: { cr?: string; slope?: string };
  /** Markørposisjon i prosent av panelet (A øverst til høyre, K nederst til venstre). */
  mx: number;
  my: number;
}

export interface KategoriFjellProps {
  /** Kategoriene A→K (A først = apex, større markør m/ signalfarge). */
  kategorier: FjellKategori[];
  /** Foto-URL (fjellet). Utelatt → forest-gradient fallback. */
  bilde?: string;
  /** «Se full profil»-CTA i forhåndsvisningen. Utelatt → ingen CTA. */
  onAapneProfil?: (id: string) => void;
  /** Etikett øverst/nederst. Default «Topp 50 i verden» / «Foten — junior». */
  toppEtikett?: string;
  fotEtikett?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * KategoriFjell — «reisen opp fjellet»: foto-hero med kategori-markører og
 * forhåndsvisningskort. Mørk innfelling (class="dark") — lime-signal lovlig her
 * på begge sidetemaer; foto ligger bak mørk gradient (bildekart-kontrakten).
 * Ingen dekorative loops — apex markeres med størrelse + signalfarge.
 */
export declare function KategoriFjell(props: KategoriFjellProps): JSX.Element;
