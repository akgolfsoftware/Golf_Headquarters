import * as React from "react";

export interface Hull {
  nr: number;
  par: number;
  score: number;
  /** SG for hullet i slag (fortegn). */
  sg?: number;
}
export interface Scoresammendrag { score: number; par: number; sg: number; }
export interface ScorekortProps {
  hull: Hull[];
  sammendrag?: Scoresammendrag;
  baseline?: string;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Scorekort — hull-for-hull med SG per hull + runde-sammendrag. Score farget mot
 * par (tall + fortegn bærer også), SG i --up/--down. Tomt = onboarding.
 */
export declare function Scorekort(props: ScorekortProps): JSX.Element;
