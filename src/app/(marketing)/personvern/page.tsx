/**
 * Marketing Personvern (v2, retning C). Offentlig: ingen auth-guard.
 * Juridisk tekst uendret fra tidligere (mlegacy)/personvern, kun v2-ramme.
 */

import type { Metadata } from "next";
import { MarkedPersonvernV2 } from "@/components/marketing/v2/MarkedPersonvernV2";

export const metadata: Metadata = {
  title: "Personvern · AK Golf",
  description: "Personvernerklæring for AK Golf-plattformen.",
};

export default function PersonvernPage() {
  return <MarkedPersonvernV2 />;
}
