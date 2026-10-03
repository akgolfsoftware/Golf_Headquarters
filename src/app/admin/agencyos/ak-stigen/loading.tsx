/* Precision-laster (AG-16b). */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return <AgencyOSSkall navn="Coach"><div className="pa-side"><LasterTilstand text="Henter AK-stigen …" /></div></AgencyOSSkall>;
}
