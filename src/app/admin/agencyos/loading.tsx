/* Skjerm-speilet skeleton (P4): samme layout som konsollen (KonsollChat,
   tidl. CockpitV2 — slettet) — hode m/avatar · 4 KPI-fliser · kø · innboks ·
   (dagens timer | stall-uka). */

import { V2Laster } from "@/components/v2/feil-laste";

export default function Loading() {
  return <V2Laster variant="cockpit" />;
}
