/* Rot-fallback for /admin: alle admin-segmenter UTEN egen loading.tsx får
   denne (Next.js nærmeste-ancestor-mønster). Uten den fryser forrige skjerm
   til RSC-payloaden er ferdig — verst på mobil. Segmenter med skreddersydd
   skeleton (agencyos, kalender, spillere, …) beholder sine egne. */

import { V2Laster } from "@/components/v2/feil-laste";

export default function Loading() {
  return <V2Laster variant="kort" />;
}
