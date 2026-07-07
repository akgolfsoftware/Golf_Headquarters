import * as React from 'react';

/** En fullført testøkt (se scorecards/session-store.js). */
export interface ProtocolSession {
  id: string;
  protocolId: string;
  protocolName: string;
  group?: string;
  player?: string;
  date?: string;
  gender?: 'gutter' | 'jenter';
  witness?: string;
  values: Record<number, Record<string, string>>;
  totals?: { label: string; value: string | null }[];
  completedAt: string;
}

/**
 * Fullførte testøkter som kort-grid. Leser session-store (localStorage)
 * selv når `sessions` ikke er satt.
 */
export interface SessionHistoryListProps {
  /** Statisk liste (f.eks. demo). Utelat for å lese lagrede økter. */
  sessions?: ProtocolSession[];
  onSelect?: (session: ProtocolSession) => void;
  /** Vis slett-knapp per økt (default false). */
  deletable?: boolean;
  emptyText?: string;
  /** Maks antall kort. */
  max?: number;
  style?: React.CSSProperties;
}

export declare function SessionHistoryList(props: SessionHistoryListProps): React.ReactElement;
