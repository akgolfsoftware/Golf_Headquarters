"use client";
/* Rediger profil (AG-08) har Precision-laster; sida har AgencyOSSkall selv. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return <AgencyOSSkall navn="Coach"><div className="pa-side"><LasterTilstand text="Henter profilen …" /></div></AgencyOSSkall>;
}
