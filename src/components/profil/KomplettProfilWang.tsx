import { WangSmaaTall } from "@/components/wang/wang-felles";
import type { ProfilVisning } from "@/lib/profil-kobling/visning";

/**
 * Komplett elevprofil i WANG, tegnet med WANGs egne klasser (wg-seksjon, wg-kort, wg-rad, WangSmaaTall) slik at
 * den ser ut som Turneringer og resten av elevsidene. Innholdet kommer ferdig formatert fra `byggProfilVisning`.
 */
function Tom({ tekst }: { tekst: string }) {
  return <div className="wg-kort" style={{ padding: "18px 20px" }}><p className="wg-forklar">{tekst}</p></div>;
}

export function KomplettProfilWang({ v }: { v: ProfilVisning }) {
  return (
    <>
      <WangSmaaTall tall={v.identitet.map((f) => ({ verdi: f.verdi, tekst: f.etikett.toLowerCase() }))} />

      <section className="wg-seksjon" aria-label="Offisielle resultater">
        <div className="wg-sek-topp"><h2>Offisielle resultater</h2><span className="wg-kilde">Brutto</span></div>
        {v.resultater.tom ? <Tom tekst={v.resultater.tom} /> : v.resultater.aar.map((a) => (
          <div key={a.aar} style={{ display: "grid", gap: 8 }}>
            <span className="wg-kilde">{a.aar}</span>
            <div className="wg-kort wg-rader">
              {a.rader.map((r) => (
                <div key={r.id} className="wg-rad wg-resultat-rad">
                  <b>{r.navn}</b>
                  <span className="wg-tall">{r.plass !== "—" ? `${r.plass}.` : "—"}</span>
                  <span className="wg-kilde">{[r.dato, r.klasse, r.kilde, r.slag !== "—" ? `${r.slag} slag` : null].filter(Boolean).join(" · ")}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="wg-seksjon" aria-label="Tester">
        <div className="wg-sek-topp"><h2>Tester eleven har registrert</h2></div>
        {v.tester.tom ? <Tom tekst={v.tester.tom} /> : (
          <div className="wg-kort wg-rader">
            {v.tester.rader.map((t) => (
              <div key={t.id} className="wg-rad wg-resultat-rad">
                <b>{t.navn}</b>
                <span className="wg-tall">{t.siste}</span>
                <span className="wg-kilde">{[t.omraade, t.dato, `${t.antall} ganger`].join(" · ")}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="wg-seksjon" aria-label="Runder og statistikk">
        <div className="wg-sek-topp"><h2>Runder og statistikk</h2></div>
        {v.runder.tom ? <Tom tekst={v.runder.tom} /> : <WangSmaaTall tall={v.runder.tall.map((t) => ({ verdi: t.verdi, tekst: t.etikett.toLowerCase() }))} />}
        <span className="wg-kilde">{v.runder.merknad}</span>
      </section>

      <section className="wg-seksjon" aria-label="IUP">
        <div className="wg-sek-topp"><h2>IUP</h2></div>
        {v.iup.tom && <Tom tekst={v.iup.tom} />}
        {v.iup.levert.length > 0 && (
          <div className="wg-kort wg-rader">
            {v.iup.levert.map((x) => (
              <div key={x.id} className="wg-rad wg-resultat-rad">
                <b>{x.svar}</b>
                <span className="wg-tall">{x.levert}</span>
                <span className="wg-kilde">{[x.periode, x.advarsel].filter(Boolean).join(" · ")}</span>
              </div>
            ))}
          </div>
        )}
        {v.iup.maaltall && (
          <>
            <span className="wg-kilde">{v.iup.maaltall.tittel}</span>
            <div className="wg-kort wg-rader">
              {v.iup.maaltall.rader.map((m) => (
                <div key={m.id} className="wg-rad wg-resultat-rad">
                  <b>{m.navn}</b>
                  <span className="wg-tall">{m.mal === "—" ? "—" : `Mål ${m.mal}`}</span>
                  <span className="wg-kilde">{`K1 ${m.kvartaler[0]} · K2 ${m.kvartaler[1]} · K3 ${m.kvartaler[2]} · K4 ${m.kvartaler[3]} · året ${m.aar}`}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
