/**
 * Kondisjonssegmenter i live-økta: pågående segment (type + sone + klokke),
 * segmentbytte, og logg over avsluttede segmenter med varighet.
 *
 * Tid, ikke reps, er størrelsen som logges — skiller kondisjons-drills fra
 * golf-/FYS-drills (manifest playerhq-live-okt, 20.08.2026).
 */
export interface SoneSegment {
  typ: "Oppvarming" | "Drag" | "Hvile";
  sone: 1 | 2 | 3 | 4 | 5;
}
export interface AvsluttetSoneSegment extends SoneSegment {
  /** Ferdig formatert varighet, f.eks. "12 min". */
  varighetLabel: string;
}
export interface SoneSegmentLoggerProps {
  /** Pågående segment. `undefined` = ingen aktiv (mellom segmenter eller ikke startet). */
  navaerende?: SoneSegment;
  /** Klokkeslett/varighet for pågående segment, ferdig formatert (f.eks. "04:12"). */
  klokkeLabel?: string;
  onByttType?: (typ: SoneSegment["typ"]) => void;
  onByttSone?: (sone: SoneSegment["sone"]) => void;
  logg?: AvsluttetSoneSegment[];
  dataOdId?: string;
}
export declare function SoneSegmentLogger(props: SoneSegmentLoggerProps): JSX.Element;
