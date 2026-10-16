"use client";
/* AG-RD-01 Rundeanalyse: Precision-laster. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return <AgencyOSSkall navn="Coach"><div className="pa-side"><LasterTilstand text="Henter runder …" /></div></AgencyOSSkall>;
}
