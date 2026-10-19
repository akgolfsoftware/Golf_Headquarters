/**
 * Tour-dekning: hva Data Golf faktisk har per tour. Antall runder, år, andel med SG total og andel
 * med alle fire kategoriene. Viser ærlig hvilke tourer som aldri vil ha kategori-SG eller fordelinger.
 */
import { formaterProsent, formaterTall } from "@/lib/format-tall";
import { byggTourDekning, type DgVisning, type TourDekningRad } from "@/lib/datagolf/visning";
import { DgRamme } from "./DgRamme";

function Stolpe({ andel, merke }: { andel: number; merke: string }) {
  return <span className="dgk-stolpe" role="img" aria-label={merke}><i style={{ width: `${Math.max(0, Math.min(1, andel)) * 100}%` }} /></span>;
}

export function TourDekning({ resultat, tittel = "Dekning per tour" }: { resultat: DgVisning<readonly TourDekningRad[]>; tittel?: string }) {
  const rader = resultat.tilstand === "klar" ? byggTourDekning(resultat.data) : [];
  const tilstand = resultat.tilstand === "klar" && !rader.length ? "tom" : resultat.tilstand;
  const totalt = rader.reduce((s, r) => s + r.antallRunder, 0);
  return <DgRamme tittel={tittel} tilstand={tilstand} kilde={rader.length ? `${rader.length} tourer · ${formaterTall(totalt, 0)} brutto-runder` : undefined}
    tomTittel="Ingen runder importert" lasteHoyder={[56, 56, 56, 56]}>
    {rader.length > 0 && <>
      <div className="dgk-dekning" role="list">
        {rader.map(r => <div key={r.tour} className="dgk-dekning-rad" role="listitem">
          <span className="dgk-dekning-navn"><b>{r.navn}</b>
            <span className="kilde">{r.fraAar && r.tilAar ? (r.fraAar === r.tilAar ? r.fraAar : `${r.fraAar}–${r.tilAar}`) : "—"} · <span className="mono">{formaterTall(r.antallRunder, 0)}</span> runder</span></span>
          <span className="dgk-dekning-mal">
            <span className="kilde">SG total <span className="mono">{formaterProsent(r.totalAndel * 100)}</span></span>
            <Stolpe andel={r.totalAndel} merke={`SG total ${formaterProsent(r.totalAndel * 100)}`} />
          </span>
          <span className="dgk-dekning-mal">
            <span className="kilde">Kategori-SG <span className="mono">{r.kategoriForventet ? formaterProsent(r.kategoriAndel * 100) : "—"}</span></span>
            {r.kategoriForventet ? <Stolpe andel={r.kategoriAndel} merke={`Kategori-SG ${formaterProsent(r.kategoriAndel * 100)}`} /> : <span className="kilde">finnes ikke</span>}
          </span>
          <span className="kilde dgk-dekning-fordeling">{r.fordelingFinnes ? "Fordelinger finnes" : "Ingen fordelinger"}</span>
        </div>)}
      </div>
      <p className="kilde">Kategori-SG (OTT, APP, ARG, PUTT) leveres bare for PGA Tour og LIV. Spillerfordelinger finnes bare for PGA Tour og DP World Tour.</p>
    </>}
  </DgRamme>;
}
