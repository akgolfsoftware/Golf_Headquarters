/* Lastetilstand for /portal/meg og undersidene i nytt design (PH-24, pakke 8 Meg).
   PH24MegLaster har ingen "use client" (CSP-nonce, se gotchas §Bygg og drift). */

import { PH24MegLaster } from "@/components/portal/precision/PH24MegLaster";

export default function Loading() {
  return <PH24MegLaster />;
}
