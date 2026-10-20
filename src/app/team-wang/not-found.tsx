import type { Metadata } from "next";

import { WangSystemside } from "@/components/wang/WangSystemside";

export const metadata: Metadata = {
  title: "Siden finnes ikke — WANG Toppidrett Fredrikstad Golf",
  robots: { index: false, follow: false },
};

/**
 * 404 under /team-wang/* i wang.no-stilen (designløftet 20.10.2026, canvas rad 12): samme ramme som de andre
 * systemsidene, uten trenermeny. Ingen data og ingen tilgangssjekk; AK Golfs 404 gjelder ikke her.
 */
export default function TeamWangIkkeFunnet() {
  return (
    <WangSystemside
      merke="WANG Toppidrett"
      stort="404"
      tittel="Siden finnes ikke"
      handlinger={[
        { tekst: "Til trenerflaten", href: "/team-wang/coach", primar: true },
        { tekst: "Til fellessiden", href: "/team-wang" },
      ]}
    >
      <p className="wg-system-tekst">Adressen kan være skrevet feil, eller siden er flyttet.</p>
    </WangSystemside>
  );
}
