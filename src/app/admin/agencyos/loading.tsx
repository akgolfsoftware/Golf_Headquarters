/* Generisk skjelett (P4) — ikke oppdatert til Train-lock-cockpiten (T2,
   26.08.2026). Ingen dc.html-fasit for en laster-tilstand er levert for
   AG-01/AG-02, så variant="cockpit" (Paper-speilet) beholdes uendret. */

import { V2Laster } from "@/components/v2/feil-laste";

export default function Loading() {
  return <V2Laster variant="cockpit" />;
}
