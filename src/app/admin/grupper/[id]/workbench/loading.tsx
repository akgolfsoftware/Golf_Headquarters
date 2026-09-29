"use client";

/* AG-11-GRUPPE i Precision Athletics: laster-tilstand i samme skall. */

import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return <AgencyOSSkall navn=""><div className="pa-side"><LasterTilstand text="Henter gruppas plan …" /></div></AgencyOSSkall>;
}
