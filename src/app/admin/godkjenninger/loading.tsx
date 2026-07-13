/* Skjerm-speilet skeleton (P4): samme layout som AdminGodkjenningerV2 —
   hode m/ingress · filter · seksjoner per spiller med sak-kort og knappepar. */

import { V2Laster } from "@/components/v2/feil-laste";

export default function Loading() {
  return <V2Laster variant="godkjenninger" />;
}
