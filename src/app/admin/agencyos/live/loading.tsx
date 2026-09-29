import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return (
    <AgencyOSSkall navn="Coach">
      <div className="pa-side">
        <LasterTilstand text="Kobler til pågående økter …" />
      </div>
    </AgencyOSSkall>
  );
}
