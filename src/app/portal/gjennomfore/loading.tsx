/* v2-skjelett for /portal/gjennomfore og /portal/gjennomfore/[id]. */

import { V2Laster } from "@/components/v2/feil-laste";

export default function Loading() {
  return <V2Laster variant="dashboard" />;
}
