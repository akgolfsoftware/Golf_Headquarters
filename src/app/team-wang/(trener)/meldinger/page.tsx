import type { Metadata } from "next";
import { Lock } from "lucide-react";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { hentGruppeElever, tellForesatte } from "@/app/team-wang/_data/wang-elever-data";
import { Laas, meStil as s } from "@/app/team-wang/_components/wang-meldinger-elever/felles";
import { WangDemoMerknad, WangFeil, WangKnapp, WangKort, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";

/**
 * WANG-13 Gruppeposter. Rute: /team-wang/meldinger. Tegning: «WANG Golf Batch 5.dc.html» #poster.
 *
 * Mottakerlinja er ekte (elever og godkjente foresatte i gruppa). Selve postene
 * har ingen WANG-modell: TnPost er Team Norways tabell, og enkeltposter der
 * leses uten gruppefilter, så den brukes ikke her. Skjemaet vises, men kan ikke
 * publisere før lagringen finnes (se rapporten).
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gruppeposter — WANG Golf", robots: { index: false, follow: false } };

export default async function WangMeldingerSide() {
  const { gruppe, erDemo } = await krevWangTrener();
  const hode = (
    <WangSidehode
      skjermId="WANG-13"
      undertittel={`${gruppe.name} · Golf`}
      tittel="Gruppeposter"
      handling={<Laas>Kun innlogget · lesekvittering ser bare du</Laas>}
    />
  );

  let mottakere;
  try {
    const elever = await hentGruppeElever(gruppe.id, new Date());
    mottakere = { elever: elever.length, foresatte: await tellForesatte(elever.map((e) => e.id)) };
  } catch {
    return (
      <WangSide>
        {hode}
        <WangFeil tekst="Fikk ikke hentet gruppa. Last siden på nytt om litt." />
      </WangSide>
    );
  }

  return (
    <WangSide>
      {hode}
      {erDemo ? <WangDemoMerknad /> : null}
      <div className={s.feed}>
        <WangKort>
          <form className={s.skjemaKort} aria-describedby="wang13-ikke-koblet">
            <h2 className={s.h2}>Ny gruppepost</h2>
            <label className={s.etikett}>
              Gruppe
              <select className={s.felt} disabled defaultValue={gruppe.id}>
                <option value={gruppe.id}>{gruppe.name}</option>
              </select>
            </label>
            <div className={s.infoBoks}>
              <p className={s.tall} style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                {gruppe.name} · {mottakere.elever} {mottakere.elever === 1 ? "elev" : "elever"} · {mottakere.foresatte} {mottakere.foresatte === 1 ? "foresatt" : "foresatte"}
              </p>
              <p className={s.merknad}>
                <Lock size={14} strokeWidth={1.5} aria-hidden="true" />
                Foresatte til mindreårige får alltid gruppeposten.
              </p>
            </div>
            <label className={s.etikett}>
              Tekst
              <textarea className={s.omraadeTekst} rows={4} placeholder="Hva må gruppa vite?" disabled />
            </label>
            <p id="wang13-ikke-koblet" className={s.fot} style={{ fontSize: 14 }}>
              Gruppeposter kan ikke publiseres herfra ennå. Lagring av poster, vedlegg og lesekvittering er ikke på plass.
            </p>
            <div className={s.knapperHoyre}>
              <WangKnapp disabled>Lagre utkast</WangKnapp>
              <WangKnapp variant="primar" disabled>Publiser</WangKnapp>
            </div>
            <p className={s.merknad}>Ingen svarfelt under postene. Spørsmål går som post til treneren (WANG-14).</p>
          </form>
        </WangKort>
        <WangKort>
          <WangTom tittel="Ingen poster i gruppa ennå." tekst="Postene vises her, nyeste først, med lesekvittering som bare du ser." />
        </WangKort>
      </div>
    </WangSide>
  );
}
