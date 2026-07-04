import * as React from "react";
import { AarsModell } from "./TidsPyramide";

export interface StigeKategori {
  /** Kategori-id A–K. FØRSTE element i lista er apex (A = beste, kanon). */
  id: string;
  /** Nivånavn, f.eks. "World Elite". */
  niva: string;
  /** Spillere/beskrivelse (én linje i raden, full tekst i profilen). */
  spillere?: string;
  /** Tour-linje (mono caps), f.eks. "PGA TOUR · DP WORLD TOUR". */
  tours?: string;
  /** Snittscore-intervall som visningsstreng, f.eks. "68–70". */
  score?: string;
  hcp?: string;
  alder?: string;
  /** Banevanskelighet. */
  bane?: { cr?: string; slope?: string; oppsett?: string; arenaer?: string };
  /** Timer/uke som visningsstreng («30»). */
  timerUke?: string;
  /** Årsmodell (timer/år per pyramide-akse) → TidsPyramide. */
  aar?: AarsModell;
  /** Forventet SG-profil vs scratch → SgKategoriBar. */
  sg?: { ott: number; app: number; arg: number; putt: number };
  /** Forventet testnivå (visningsstrenger). */
  tester?: { kolle?: string; ball?: string; cmj?: string; sprint?: string };
  /** Markørposisjon for KategoriFjell (deles gjerne i samme array). */
  mx?: number;
  my?: number;
}

export interface KategoriStigeProps {
  /** Kategoriene A→K, beste først. */
  kategorier: StigeKategori[];
  /** Kontrollert åpen kategori-id (null = alle lukket). Utelatt = intern state (default 'A'). */
  aapen?: string | null;
  onAapne?: (id: string | null) => void;
  /** Seksjonsskiller før gitte id-er. Default A–D / E–K. */
  seksjoner?: { ved: string; label: string }[];
  /** Vis «ALLE TALL ER ESTIMAT»-merket (ærlighet — default true). */
  estimat?: boolean;
  loading?: boolean;
  /** Tomtilstand = onboarding, aldri blank. */
  tomt?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * KategoriStige — A–K-stigen (A = beste) som interaktiv tabell med full profil
 * per kategori i 4 bånd: Nivå & bane, Anbefalt tidsfordeling (TidsPyramide),
 * Forventet SG-profil (SgKategoriBar) og Forventet testnivå. Én åpen om gangen.
 */
export declare function KategoriStige(props: KategoriStigeProps): JSX.Element;
