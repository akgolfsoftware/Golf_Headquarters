"use client";

/* AG-16a (gruppedetalj og timeplan) har eget laster-uttrykk. Årsplan og
   skoledata er ikke portert og beholder V2Laster. Workbench har egen loading. */

import { usePathname } from "next/navigation";
import { V2Laster } from "@/components/v2/laster";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  const sti = usePathname();
  return /^\/admin\/grupper\/[^/]+(\/timeplan)?$/.test(sti)
    ? <AgencyOSSkall navn=""><div className="pa-side"><LasterTilstand text={sti.endsWith("/timeplan") ? "Henter timeplan …" : "Henter gruppen …"} /></div></AgencyOSSkall>
    : <V2Laster variant="liste" />;
}
