/**
 * Priser (/priser) i «AK Golf Precision Athletics». OFFENTLIG: ingen auth-guard.
 * Prisene leses fra abonnementsdomenet og `ServiceType.priceOre`.
 */

import type { Metadata } from "next";
import { PriserPrecision } from "@/components/marketing/ds-sider/PriserPrecision";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Priser · AK Golf",
  description:
    "PlayerHQ Gratis og Full, enkelttimer og coaching-pakkene Performance og Performance Pro. Prisene står på siden.",
};

export default function PriserPage() {
  return <PriserPrecision />;
}
