/* Fallback-skjelett for /portal og underruter uten egen loading.tsx
   (Next.js nærmeste-ancestor-mønster). Dashboard-variant matcher
   spiller-oversikten på /portal. */

import { V2Laster } from "@/components/v2/feil-laste";

export default function Loading() {
  return <V2Laster variant="dashboard" />;
}
