import * as React from 'react';

/** One column in a protocol definition. */
export interface ProtocolColumn {
  key: string;
  label: string;
  /** preset = fixed by protocol; input = filled during test (green cells); computed = derived */
  kind: 'preset' | 'input' | 'computed';
  input?: 'number' | 'choice';
  options?: string[];
  unit?: string;
}

/** A Team Norway test protocol (see protocol-definitions.js for the full set). */
export interface TestProtocol {
  id: string;
  name: string;
  group: 'Golfslag' | 'Teknikk';
  description: string;
  columns: ProtocolColumn[];
  rows: Record<string, string | number>[];
  /** Protokoller med kjønnsvarianter (banelengder / mål-avstander). */
  rowsByGender?: { gutter: Record<string, string | number>[]; jenter: Record<string, string | number>[] };
  totals?: { label: string; column: string; compute: 'sum' | 'avg' | 'spread' }[];
}

/**
 * Data-driven scorecard for the Team Norway test protocols.
 */
export interface ProtocolScorecardProps {
  /** Protocol object, or pass protocolId instead. */
  protocol?: TestProtocol | string;
  /** Id from protocol-definitions.js, e.g. "8-ball-variation", "naerspill-gate". */
  protocolId?: string;
  /** entry = card rows w/ touch inputs; compact = dense table; print = paper-like read-only */
  variant?: 'entry' | 'compact' | 'print';
  /** Klasse — velger banelengder/mål-avstander der protokollen har begge (default 'gutter'). */
  gender?: 'gutter' | 'jenter';
  /** Controlled values: { [rowIndex]: { [columnKey]: value } }. Omit for internal state. */
  values?: Record<number, Record<string, string>>;
  onChange?: (next: Record<number, Record<string, string>>, rowIdx: number, key: string, value: string) => void;
  /** Player name shown in header (pass '' to show an empty labelled slot). */
  player?: string;
  /** Date shown in header. */
  date?: string;
  /** Truncate to N rows with a "+N flere" note (for previews). */
  maxRows?: number;
  /** Autolagrer utkast i localStorage under denne nøkkelen og viser «Fullfør test». */
  sessionKey?: string;
  /** Vis fullfør-linjen (vitne + lagre) uten autolagring. */
  completable?: boolean;
  /** Kalles med den lagrede økten når «Fullfør test» trykkes. */
  onComplete?: (session: object) => void;
  style?: React.CSSProperties;
}

export declare function ProtocolScorecard(props: ProtocolScorecardProps): React.ReactElement;
