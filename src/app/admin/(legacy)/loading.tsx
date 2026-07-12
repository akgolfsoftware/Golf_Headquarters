/* P4: legacy-flatene deler nå v2-skeletonen (V2Laster) — de gamle grå
   SkeletonCard-firkantene matchet ikke mørk v2-chrome og var «firkantene»
   brukeren så før innhold. Server Component. */

import { V2Laster } from "@/components/v2/feil-laste";

export default function AdminLoading() {
  return <V2Laster variant="dashboard" />;
}
