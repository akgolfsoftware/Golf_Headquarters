"use client";
/* Spiller 360 (AG-08) og de porterte undersidene har Precision-laster; resten beholder V2Laster. */
import { usePathname } from "next/navigation";
import { V2Laster } from "@/components/v2/laster";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

const PORTERT = /^\/admin\/spillere\/[^/]+(\/(turnering-kobling|plan\/[^/]+\/for-og-na))?$/;

export default function Loading() {
  return PORTERT.test(usePathname() ?? "")
    ? <AgencyOSSkall navn="Coach"><div className="pa-side"><LasterTilstand text="Henter spilleren …" /></div></AgencyOSSkall>
    : <V2Laster variant="kort" />;
}
