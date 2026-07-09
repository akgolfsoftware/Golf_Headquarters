/**
 * v2-forhåndsvisning — Marketing Priser (M4, retning C). Offentlig: ingen
 * auth-guard (markedsflate). Egen top-level route-group (v2preview) som IKKE
 * arver PortalShell. Marketing har egen chrome (MRamme) i komponenten.
 */

import type { Metadata } from "next";
import { MarkedPriserV2 } from "@/components/marketing/v2/MarkedPriserV2";

export const metadata: Metadata = {
  title: "Priser · AK Golf",
  description:
    "Én app, to måter å ha den på. Gratis via prøveperiode, coaching-pakke eller gruppe, ellers 299 kr/mnd. Coaching-pakker kjøpes separat.",
};

export default function V2PriserPreviewPage() {
  return <MarkedPriserV2 />;
}
