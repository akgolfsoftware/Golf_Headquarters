"use client";
/* Ny spiller (AG-07-NY) har Precision-laster; sida har AgencyOSSkall selv. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return <AgencyOSSkall navn="Coach"><div className="pa-side"><LasterTilstand text="Åpner skjemaet …" /></div></AgencyOSSkall>;
}
