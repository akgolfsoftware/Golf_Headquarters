"use client";

/* AG-06 i Precision Athletics har eget laster-uttrykk. Undersidene
   (ny, [id]) er ikke portert og beholder V2Laster. */

import { usePathname } from "next/navigation";
import { V2Laster } from "@/components/v2/laster";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return usePathname() === "/admin/bookinger"
    ? <AgencyOSSkall navn=""><div className="pa-side"><LasterTilstand text="Henter bookinger …" /></div></AgencyOSSkall>
    : <V2Laster variant="bookinger" />;
}
