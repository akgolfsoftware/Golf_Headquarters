import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return <AgencyOSSkall navn=""><div className="pa-side"><LasterTilstand text="Henter kommunikasjon …" /></div></AgencyOSSkall>;
}
