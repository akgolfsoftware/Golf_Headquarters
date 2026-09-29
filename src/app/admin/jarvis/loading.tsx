"use client";

/* AG-19 Jarvis har eget Precision-laster-uttrykk (samme mønster som AG-06/AG-07). */

import { LasterTilstand } from "@/components/precision/pa";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";

export default function Loading() {
  return <AgencyOSSkall navn="Coach"><div className="pa-side"><LasterTilstand text="Henter agentkøen …" /></div></AgencyOSSkall>;
}
