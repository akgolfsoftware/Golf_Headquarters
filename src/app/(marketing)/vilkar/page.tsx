/**
 * Marketing Vilkår (v2, retning C). Offentlig: ingen auth-guard.
 * Juridisk tekst uendret fra tidligere (mlegacy)/vilkar, kun v2-ramme.
 */

import type { Metadata } from "next";
import { MarkedVilkarV2 } from "@/components/marketing/v2/MarkedVilkarV2";

export const metadata: Metadata = {
  title: "Vilkår · AK Golf",
  description: "Brukervilkår for AK Golf-plattformen.",
};

export default function VilkarPage() {
  return <MarkedVilkarV2 />;
}
