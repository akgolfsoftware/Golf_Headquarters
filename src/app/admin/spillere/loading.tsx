"use client";
/* AG-07 Stall har Precision-laster; underrutene uten egen loading.tsx beholder V2Laster. */
import { usePathname } from "next/navigation";
import { V2Laster } from "@/components/v2/laster";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return usePathname() === "/admin/spillere"
    ? <AgencyOSSkall navn="Coach"><div className="pa-side"><LasterTilstand text="Henter stallen …" /></div></AgencyOSSkall>
    : <V2Laster variant="stall" />;
}
