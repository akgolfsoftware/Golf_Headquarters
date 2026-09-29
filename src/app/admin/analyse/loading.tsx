"use client";
/* AG-A03: /admin/analyse viser Precision-laster; underrutene beholder V2Laster. */
import { usePathname } from "next/navigation";
import { V2Laster } from "@/components/v2/laster";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return usePathname() === "/admin/analyse"
    ? <AgencyOSSkall navn="Coach"><div className="pa-side"><LasterTilstand text="Henter innsikten …" /></div></AgencyOSSkall>
    : <V2Laster variant="dashboard" />;
}
