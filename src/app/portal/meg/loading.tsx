/* v2-skjelett for /portal/meg og undersider — kort-variant (meg-sidene).
   MERK: denne dekker også ~25 undersider uten egen loading.tsx (Next.js
   nærmeste-ancestor) — derfor "kort" (generisk), ikke B1s meg-spesifikke
   avatar-skjelett (variant="meg" i feil-laste.tsx), som er skrevet for
   PROFIL-siden alene og ville feilsittet på f.eks. innstillinger/helse. */

import { V2Laster } from "@/components/v2/feil-laste";

export default function Loading() {
  return <V2Laster variant="kort" />;
}
