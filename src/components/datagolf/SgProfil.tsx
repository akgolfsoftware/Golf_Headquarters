/**
 * SG-profil per kategori: snitt strokes gained for OTT, APP, ARG og PUTT, med SG total øverst.
 * Kategoriene finnes bare for PGA og LIV; for andre tourer vises bare total og en forklaring.
 * Hvert tall har antall runder det er regnet over. Manglende tall er «—», aldri 0.
 */
import { formaterFortegn, formaterProsent } from "@/lib/format-tall";
import { beregnSgProfil, type DgSgRunde, type DgVisning } from "@/lib/datagolf/visning";
import { DgRamme } from "./DgRamme";

function Rad({ navn, lang, snitt, antall, maks }: { navn: string; lang: string; snitt: number | null; antall: number; maks: number }) {
  const bredde = snitt === null ? 0 : Math.min(50, (Math.abs(snitt) / maks) * 50);
  const positiv = (snitt ?? 0) >= 0;
  return <div className="dgk-sg-rad" role="listitem">
    <span className="dgk-sg-navn"><b>{navn}</b><span className="kilde">{lang}</span></span>
    <span className="dgk-sg-spor" aria-hidden>
      {snitt !== null && <i className={positiv ? "pos" : "neg"} style={positiv ? { left: "50%", width: `${bredde}%` } : { right: "50%", width: `${bredde}%` }} />}
    </span>
    <span className="dgk-sg-tall mono">{formaterFortegn(snitt, 2)}</span>
    <span className="dgk-sg-n kilde">{antall ? `${antall} runder` : "ingen runder"}</span>
  </div>;
}

export function SgProfil({ resultat, tittel = "SG-profil" }: { resultat: DgVisning<readonly DgSgRunde[]>; tittel?: string }) {
  const klar = resultat.tilstand === "klar";
  const p = klar ? beregnSgProfil(resultat.data) : null;
  const maks = p ? Math.max(1, ...[p.total, ...p.kategorier].map(k => Math.abs(k.snitt ?? 0))) : 1;
  return <DgRamme tittel={tittel} tilstand={resultat.tilstand} kilde={p ? `Snitt over ${p.antallRunder} brutto-runder` : undefined}
    tomTittel="Ingen runder med SG" lasteHoyder={[48, 48, 48, 48, 48]}>
    {p && <>
      <div className="dgk-sg" role="list" aria-label="Strokes gained per kategori">
        <Rad navn="Total" lang="Alle slag" snitt={p.total.snitt} antall={p.total.antall} maks={maks} />
        {p.kategorier.map(k => <Rad key={k.kode} navn={k.navn} lang={k.lang} snitt={k.snitt} antall={k.antall} maks={maks} />)}
      </div>
      {!p.harKategoriData
        ? <p className="forklar">Kategori-SG finnes bare for PGA Tour og LIV. Denne spilleren har bare SG total i Data Golf.</p>
        : p.kategoriAndel !== null && p.kategoriAndel < 1 && <p className="kilde">{formaterProsent(p.kategoriAndel * 100)} av rundene har alle fire kategoriene. Snittene regnes bare over rundene som har tallet.</p>}
    </>}
  </DgRamme>;
}
