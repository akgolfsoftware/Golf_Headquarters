/* P4: portal-legacy deler nå v2-skeletonen (V2Laster) — samme mørke
   pulse-paneler som resten av appen, ikke gamle grå firkanter. */

import { V2Laster } from "@/components/v2/feil-laste";

export default function PortalLoading() {
  return <V2Laster variant="dashboard" />;
}
