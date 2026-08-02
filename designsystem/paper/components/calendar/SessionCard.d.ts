/**
 * Øktkortet: ukelerretet i Workbench, kalenderen og profilens Plan-fane.
 *
 * Kortet er ETT klikkbart element som åpner økt-editoren. Hengelås, rrule og
 * deltakertelling er informasjon, ikke knapper — derfor ett treffmål for hele
 * kortet. Drag, resize og tastaturflytting hører til Workbench (oppførsel),
 * ikke til biblioteket (anatomi) — samme skille som TimeGrid.
 */
export interface SessionCardProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  /** "09:00–10:30" eller "09:00". Mono, tabulære siffer. */
  time?: string;
  /** Pyramideområde. Styrer venstrekantens farge. */
  area?: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  title: React.ReactNode;
  /** AK-formelen, f.eks. TEK_TEE_L-BALL_CS60_M2_PR2. Mono, brytes aldri i to ord. */
  formula?: string;
  /** "90 min" — vises i bunnlinjen. */
  duration?: string;
  /** Deltakertelling. Vises kun ved > 1 (delt økt). */
  participants?: number;
  /** Låst anker: kan ikke flyttes av planleggeren. */
  locked?: boolean;
  /** Gjentakende (rrule). */
  recurring?: boolean;
  /** Utkast — Caddie-forslag som ikke er lagt inn ennå. */
  draft?: boolean;
  selected?: boolean;
  /** Skjuler formel og bunnlinje. For tette lerret og måneds-visning. */
  compact?: boolean;
  /** Kort mono-tillegg i bunnlinjen: fasilitet, coach. */
  note?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  dataOdId?: string;
}
export declare function SessionCard(props: SessionCardProps): JSX.Element;
