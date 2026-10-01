"use client";

/* AG-04 Innboks i Precision Athletics: laster-tilstanden i samme skall. */

import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return (
    <AgencyOSSkall navn="">
      <div className="pa-side">
        <LasterTilstand text="Henter innboksen …" />
      </div>
    </AgencyOSSkall>
  );
}
