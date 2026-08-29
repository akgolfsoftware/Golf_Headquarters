/* Skjerm-speilet skeleton (B1): dagstripe (7 piller) + to ukekort. Dekker
   også /portal/planlegge/bygger uten egen loading.tsx (Next.js nærmeste-
   ancestor) — /workbench har sin egen (uendret). */

import { V2Laster } from "@/components/v2/feil-laste";

export default function Loading() {
  return <V2Laster variant="plan" />;
}
