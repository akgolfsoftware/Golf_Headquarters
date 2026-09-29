"use client";

/* AG-05 i Precision Athletics: laster-uttrykket gjelder også undersidene
   (hendelse/ny, hendelse/[id]), som er portert 29.09.2026. */

import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return <AgencyOSSkall navn=""><div className="pa-side"><LasterTilstand text="Henter kalenderen …" /></div></AgencyOSSkall>;
}
