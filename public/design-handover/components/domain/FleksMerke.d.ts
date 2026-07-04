import * as React from "react";

export interface FleksMerkeProps {
  /** Fleks-tilstand: "fleks" (kan flyttes fritt) · "laast" (fast tid/sted) · "flyttet" (brukt fleks — vis grunnkode). */
  tilstand?: "fleks" | "laast" | "flyttet";
  /** Grunnkode ved flyttet økt: SKADE/SYKDOM/REISE/JOBB/STUDIER/VÆR/ANNET. */
  grunnkode?: string;
  size?: "sm" | "md";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Fleks-merke — viser om en økt kan flyttes (fleks-flyten i Workbench).
 * «flyttet» viser grunnkoden som ble logget ved flyttingen.
 */
export declare function FleksMerke(props: FleksMerkeProps): JSX.Element;
