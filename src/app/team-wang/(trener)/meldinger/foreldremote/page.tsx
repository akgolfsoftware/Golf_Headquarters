import type { Metadata } from "next";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { Laas, meStil as s } from "@/app/team-wang/_components/wang-meldinger-elever/felles";
import { WangDemoMerknad, WangKort, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";

/**
 * WANG-15 Foreldremøte. Rute: /team-wang/meldinger/foreldremote. Tegning: «WANG Golf Batch 5.dc.html» #mote.
 * Møter, agenda, svar fra hjemmene, oppmøte og referat har ingen modell ennå.
 * Trenerens del av tegningen er lesing; svaroversikt og oppmøte eies av skolen.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Foreldremøte — WANG Golf", robots: { index: false, follow: false } };

export default async function WangForeldremoteSide() {
  const { gruppe, erDemo } = await krevWangTrener();
  return (
    <WangSide>
      <WangSidehode skjermId="WANG-15" undertittel={gruppe.name} tittel="Foreldremøte" handling={<Laas>Kun innlogget</Laas>} />
      {erDemo ? <WangDemoMerknad /> : null}
      <div className={s.split}>
        <WangKort>
          <WangTom
            tittel="Ingen foreldremøter lagt inn."
            tekst="Foreldremøter med tid, sted, agenda, dokumenter og referat kan ikke føres her ennå. Når de er på plass, vises de her."
          />
        </WangKort>
        <WangKort polstret>
          <p className={s.brod16} style={{ margin: 0 }}>Svaroversikt og oppmøte ser bare sportssjef og kontaktlærer ved skolen.</p>
        </WangKort>
      </div>
    </WangSide>
  );
}
