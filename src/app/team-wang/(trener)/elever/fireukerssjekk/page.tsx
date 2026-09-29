import type { Metadata } from "next";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { meStil as s } from "@/app/team-wang/_components/wang-meldinger-elever/felles";
import { WangDemoMerknad, WangKort, WangLenke, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";
import { wangHref } from "@/lib/wang/wang-ruter";

/**
 * WANG-45 Fireukerssjekk. Rute: /team-wang/elever/fireukerssjekk. Tegning: «WANG Golf Elevprofil.dc.html» #sjekk.
 * Elevens innlevering (prosessmål, målsetninger, Team Norways utviklingssjekk)
 * og samtalen etterpå har ingen modell ennå. Skjermen viser en ærlig tom
 * tilstand og oppdikter ingen svar.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Fireukerssjekk — WANG Golf", robots: { index: false, follow: false } };

export default async function WangFireukerssjekkSide() {
  const { bruker, erDemo } = await krevWangTrener();
  return (
    <WangSide>
      <WangSidehode
        skjermId="WANG-45"
        undertittel={bruker.name?.trim() || bruker.email}
        tittel="Fireukerssjekk"
        ingress="Svarene fra PlayerHQ, med Team Norways utviklingssjekk på elevens nivå. Ta samtale ved behov og logg det dere avtalte."
      />
      {erDemo ? <WangDemoMerknad /> : null}
      <WangKort>
        <WangTom
          tittel="Ingen fireukerssjekk levert ennå."
          tekst="Eleven leverer fireukerssjekken i PlayerHQ hver fjerde uke. Innleveringen og samtaleloggen er ikke på plass ennå, så svarene kan ikke vises her."
          handling={<WangLenke href={wangHref("WANG-07")}>Se elevene</WangLenke>}
        />
      </WangKort>
      <p className={s.fot}>Fireukerssjekken erstatter halvårsevalueringen. Samtale tas ved behov og logges med det dere avtalte.</p>
    </WangSide>
  );
}
