import type { Metadata } from "next";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangDemoMerknad, WangKnapp, WangKort, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";

/**
 * WANG-21 Dokumenter. Rute: /team-wang/meldinger/dokumenter. Tegning: «WANG Golf Batch 7.dc.html» #dokumenter.
 * `Document` i databasen er per bruker, ikke per gruppe, og har verken type,
 * gruppevalg eller deling. Det finnes ingen WANG-dokumentmodell ennå, så lista
 * er tom og opplasting er låst (se rapporten).
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dokumenter — WANG Golf", robots: { index: false, follow: false } };

export default async function WangDokumenterSide() {
  const { gruppe, erDemo } = await krevWangTrener();
  return (
    <WangSide>
      <WangSidehode
        skjermId="WANG-21"
        undertittel={gruppe.name}
        tittel="Dokumenter"
        handling={<WangKnapp disabled>Last opp dokument</WangKnapp>}
      />
      {erDemo ? <WangDemoMerknad /> : null}
      <WangKort>
        <WangTom
          tittel="Ingen dokumenter delt ennå."
          tekst="Årsplaner, reglement og møtereferater for gruppa vises her. Opplasting og deling med elever og foresatte er ikke på plass ennå."
        />
      </WangKort>
    </WangSide>
  );
}
