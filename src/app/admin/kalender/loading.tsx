"use client";

/* AG-05 i Precision Athletics har eget laster-uttrykk. Undersidene
   (hendelse/ny, hendelse/[id], lag) er ikke portert og beholder V2Laster. */

import { usePathname } from "next/navigation";
import { V2Laster } from "@/components/v2/laster";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return usePathname() === "/admin/kalender"
    ? <AgencyOSSkall navn=""><div className="pa-side"><LasterTilstand text="Henter kalenderen …" /></div></AgencyOSSkall>
    : <V2Laster variant="liste" />;
}
