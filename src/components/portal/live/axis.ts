/**
 * PlayerHQ · Live-økt — akse-farge-helper for forest-flate.
 *
 * På forest-bakgrunn vises akse-piller som lyse "tints" (hvit-alpha) med
 * pyramide-fargen som tekst. Verdiene refererer CSS-vars fra globals.css
 * (`--pyr-*`) — ingen hardkodede hex.
 */

import type { LiveAxis } from "@/lib/portal-live/types";

export const AXIS_SHORT: Record<LiveAxis, string> = {
  FYS: "FYS",
  TEK: "TEK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  TURN: "TURN",
};

/**
 * Inline-style for akse-pille på forest. Bruker pyramide-fargen som
 * dot/tekst og en svak hvit-tint som bakgrunn (god kontrast på forest).
 */
export function axisDotColor(axis: LiveAxis): string {
  switch (axis) {
    case "FYS":
      return "hsl(var(--accent))"; // forest-grønn ville druknet på forest → lime
    case "TEK":
      return "var(--pyr-tek)";
    case "SLAG":
      return "var(--pyr-slag)";
    case "SPILL":
      return "hsl(var(--accent))";
    case "TURN":
      return "var(--pyr-turn)";
  }
}
