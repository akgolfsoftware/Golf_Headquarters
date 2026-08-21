/**
 * 1–5-vurderingsrad med SVG-stjerner. Spillerens egen vurdering (fokus,
 * gjennomføring, mestring) — aldri en karakter systemet setter.
 *
 * Fylt stjerne er --fg, aldri --accent — oransje er reservert «Én ting nå».
 * Ingen minsteverdi, ingen validering (manifest playerhq-live-summary,
 * 20.08.2026).
 */
export interface StjerneRadProps {
  /** Synlig etikett over raden, f.eks. "Fokus". */
  label?: string;
  /** 0–5. 0 = ingen valgt ennå. */
  verdi?: number;
  onChange?: (verdi: number) => void;
  dataOdId?: string;
}
export declare function StjerneRad(props: StjerneRadProps): JSX.Element;
