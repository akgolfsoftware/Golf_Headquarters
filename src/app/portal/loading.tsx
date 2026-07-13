/* Skjerm-speilet skeleton (P4): samme layout som HjemV2 —
   hode m/avatar+CTA · dagstripe · (SG-hero+trend | dagens plan) · snarveier · KPI-rad.
   Fungerer også som fallback for /portal-underruter uten egen loading.tsx
   (Next.js nærmeste-ancestor-mønster). */

import { V2Laster } from "@/components/v2/feil-laste";

export default function Loading() {
  return <V2Laster variant="hjem" />;
}
