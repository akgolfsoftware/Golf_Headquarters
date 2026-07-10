/**
 * Marketing: PlayerHQ-produktside (M2, retning C). OFFENTLIG flate: ingen
 * auth-guard, ingen dataloader (markedsside).
 *
 * MarkedPlayerHQV2 leverer sin egen dark-scope + fluid marketing-chrome
 * (MRamme = MNav + innhold + MFot) — bevisst UTEN V2Shell, siden markedssidene
 * har egen chrome. Ekte copy + 1:1 med ui_kits/v2/marketing.jsx → PlayerHQSide.
 */

import type { Metadata } from "next";
import { MarkedPlayerHQV2 } from "@/components/marketing/v2/MarkedPlayerHQV2";

export const metadata: Metadata = {
  title: "PlayerHQ · AK Golf",
  description:
    "PlayerHQ forteller deg hva du taper mest på og hva du skal trene. Strokes gained, TrackMan, plan og AI-caddie i samme app. Gratis i én måned, deretter 299 kr per måned.",
};

export default function PlayerHQSidePage() {
  return <MarkedPlayerHQV2 />;
}
