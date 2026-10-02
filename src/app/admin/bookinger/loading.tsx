"use client";

/* AG-06 i Precision Athletics: laster-uttrykket gjelder også undersidene
   (ny og [id]), som er portert 29.09.2026. */

import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return <AgencyOSSkall navn=""><div className="pa-side"><LasterTilstand text="Henter bookinger …" /></div></AgencyOSSkall>;
}
