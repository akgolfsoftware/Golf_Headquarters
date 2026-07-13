/* Skjerm-speilet skeleton (P4): samme layout som GjorV2 —
   hode · runde-kort · KPI-rad · øvelsesliste · (neste økt | avslutt-flyt).
   Dekker /portal/gjennomfore og /portal/gjennomfore/[id]. */

import { V2Laster } from "@/components/v2/feil-laste";

export default function Loading() {
  return <V2Laster variant="gjor" />;
}
