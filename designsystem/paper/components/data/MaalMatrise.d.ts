/**
 * Rutenett motorikk × miljø for den tekniske utviklingsplanen. Hver celle
 * viser reps gjennomført av mål; «—» er "ikke planlagt", aldri en sperre.
 *
 * Kolonneaksen kalles MILJØ i UI — ordet "belastning" skal aldri vises for
 * spilleren (manifest playerhq-teknisk-plan, 20.08.2026). Nådd mål farges
 * --up (grønn), aldri --accent — oransje er reservert «Én ting nå».
 */
export interface MaalMatriseCelle {
  motorikk: string;
  miljo: string;
  gjort: number;
  /** Mål-antall. Utelates cellen fra `celler`, vises "—" (ikke planlagt). */
  mal?: number;
}
export interface MaalMatriseProps {
  /** Radetiketter, i visningsrekkefølge (motorikk-trinn: UTEN_BALL/LAV_HAST/AUTO el. konkret liste). */
  motorikk: string[];
  /** Kolonneetiketter (miljø: ALENE/OBSERVERT/KONKURRANSE/TURNERING el. konkret liste). */
  miljo: string[];
  celler?: MaalMatriseCelle[];
  dataOdId?: string;
}
export declare function MaalMatrise(props: MaalMatriseProps): JSX.Element;
