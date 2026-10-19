/**
 * PlayerHQ (/playerhq) i «AK Golf Precision Athletics». OFFENTLIG: ingen auth-guard.
 * Skallet eies av `(marketing)/layout.tsx`.
 */
import type { Metadata } from "next";

import { PlayerHQPrecision } from "@/components/marketing/ds-sider/PlayerHQPrecision";

export const metadata: Metadata = {
  title: "PlayerHQ · Hele treningen din. Ett sted.",
  description:
    "Appen som samler plan, økter, tester, runder og TrackMan-data, for spiller og coach. Gratis og Full.",
};

export default function PlayerHQPage() {
  return <PlayerHQPrecision />;
}
