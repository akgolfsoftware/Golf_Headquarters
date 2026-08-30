/* v2-skjelett for /portal/planlegge (Plan-fanen, B1 «Plan laster»):
   dagstripe + ukekort. Manglet egen loading.tsx før PX-7 — falt tilbake på
   /portal/loading.tsx (Hjem-skjelettet), som ikke matcher Plan-layouten. */

import { V2Laster } from "@/components/v2/feil-laste";

export default function Loading() {
  return <V2Laster variant="plan" />;
}
