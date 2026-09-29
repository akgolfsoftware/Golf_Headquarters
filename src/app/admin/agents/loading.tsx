"use client";

/* AG-19 kjøringsdetalj (/admin/agents/[agentId]) har Precision-laster; selve listesiden er en redirect. */

import { usePathname } from "next/navigation";
import { V2Laster } from "@/components/v2/laster";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return usePathname().startsWith("/admin/agents/")
    ? <AgencyOSSkall navn="Coach"><div className="pa-side"><LasterTilstand text="Henter agenten …" /></div></AgencyOSSkall>
    : <V2Laster variant="liste" />;
}
