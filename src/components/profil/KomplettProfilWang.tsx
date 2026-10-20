import Link from "next/link";

import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import type { ProfilVisning } from "@/lib/profil-kobling/visning";

/**
 * Komplett elevprofil i WANG (designløftet 20.10.2026, canvas «WANG nøkkelskjermer» rad 8). Innholdet kommer ferdig
 * formatert fra `byggProfilVisning`; Strokes Gained tegnes i tillegg som søyler rundt null fra de rå tallene, med
 * samme skala begge veier og «vunnet»/«tapt» i ord. To kolonner på PC, én på mobil.
 */
export type WangSgOmraade = { navn: string; verdi: number | null };

function Tom({ tekst }: { tekst: string }) {
  return <div className="wg-kort" style={{ padding: "18px 20px" }}><p className="wg-forklar">{tekst}</p></div>;
}


function SgSoyler({ omraader }: { omraader: WangSgOmraade[] }) {
  const med = omraader.filter((o): o is { navn: string; verdi: number } => o.verdi != null);
  if (med.length === 0) return null;
  // Symmetrisk skala: største utslag rundet opp til nærmeste 0,25, minst 0,5.
  const maks = Math.max(0.5, Math.ceil(Math.max(...med.map((o) => Math.abs(o.verdi))) * 4) / 4);
  const skala = formaterTall(maks, 2);
  return (
    <div className="wg-sg">
      <p className="wg-sg-tittel">Strokes Gained per runde</p>
      {omraader.map((o) => {
        const bredde = o.verdi == null ? 0 : (Math.abs(o.verdi) / maks) * 50;
        return (
          <div key={o.navn} className="wg-sg-rad">
            <b>{o.navn}</b>
            <span
              className="wg-sg-spor"
              role="img"
              aria-label={o.verdi == null ? `${o.navn}: mangler` : `${o.navn} ${formaterFortegn(o.verdi)} slag`}
            >
              <i className="wg-sg-null" />
              {o.verdi != null ? (
                <i
                  className={o.verdi >= 0 ? "wg-sg-pluss" : "wg-sg-minus"}
                  style={{ width: `${bredde}%` }}
                />
              ) : null}
            </span>
            <span className="wg-sg-verdi">
              {o.verdi == null ? "—" : formaterFortegn(o.verdi)}
              {o.verdi != null ? <small> {o.verdi >= 0 ? "vunnet" : "tapt"}</small> : null}
            </span>
          </div>
        );
      })}
      <div className="wg-sg-rad wg-sg-akse" aria-hidden="true"><span /><span className="wg-sg-akse-tall"><span>−{skala}</span><span>0</span><span>+{skala}</span></span><span /></div>
    </div>
  );
}

export function KomplettProfilWang({
  v,
  sg = [],
  lenker = {},
}: {
  v: ProfilVisning;
  sg?: WangSgOmraade[];
  lenker?: { turneringer?: string; tester?: string; iup?: string };
}) {
  const antallTurneringer = v.resultater.aar.reduce((sum, a) => sum + a.rader.length, 0);
  const smaa = v.runder.tall.filter((t) => ["Runder", "Snitt brutto", "SG totalt"].includes(t.etikett));

  const resultater = (
    <section className="wg-seksjon" aria-label="Offisielle resultater">
      <div className="wg-sek-topp"><h2>Offisielle resultater</h2><span className="wg-kilde">Brutto</span></div>
      {v.resultater.tom ? <Tom tekst={v.resultater.tom} /> : v.resultater.aar.map((a) => (
        <div key={a.aar} className="wg-profil-aar">
          <span className="wg-profil-etikett">{a.aar}</span>
          <div className="wg-kort wg-rader">
            {a.rader.map((r) => (
              <div key={r.id} className="wg-rad wg-profil-res">
                <b>{r.navn}</b>
                <strong className="wg-profil-plass">{/^\d+$/.test(r.plass) ? `${r.plass}.` : r.plass}</strong>
                <span className="wg-kilde">{[r.dato, r.klasse, r.kilde, r.slag !== "—" ? `${r.slag} slag` : null].filter(Boolean).join(" · ")}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {lenker.turneringer && antallTurneringer > 0 ? (
        <Link href={lenker.turneringer} className="wg-les-mer">Alle {antallTurneringer} turneringer →</Link>
      ) : null}
    </section>
  );

  const tester = (
    <section className="wg-seksjon" aria-label="Tester">
      <div className="wg-sek-topp"><h2>Tester</h2></div>
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
      {lenker.tester ? <Link href={lenker.tester} className="wg-les-mer">Alle tester →</Link> : null}
    </section>
  );

  const runder = (
    <section className="wg-seksjon" aria-label="Runder og statistikk">
      <div className="wg-sek-topp"><h2>Runder og statistikk</h2><span className="wg-kilde">Siste 12 måneder</span></div>
      {v.runder.tom ? <Tom tekst={v.runder.tom} /> : (
        <div className="wg-kort wg-profil-runder">
          <dl className="wg-profil-smaa">
            {smaa.map((t) => (
              <div key={t.etikett}><dt>{t.etikett === "SG totalt" ? t.etikett : t.etikett.toLowerCase()}</dt><dd>{t.verdi}</dd></div>
            ))}
          </dl>
          <SgSoyler omraader={sg} />
        </div>
      )}
      <span className="wg-kilde">{v.runder.merknad}</span>
    </section>
  );

  const iup = (
    <section className="wg-seksjon" aria-label="IUP">
      <div className="wg-sek-topp"><h2>IUP</h2><span className="wg-kilde">Utkast vises aldri</span></div>
      {v.iup.tom && <Tom tekst={v.iup.tom} />}
      {v.iup.levert.length > 0 && (
        <div className="wg-kort wg-rader">
          {v.iup.levert.map((x) => (
            <div key={x.id} className="wg-rad wg-resultat-rad">
              <b>{x.svar}</b>
              <span className="wg-profil-levert">Levert {x.levert}</span>
              <span className="wg-kilde">{[x.periode, x.advarsel].filter(Boolean).join(" · ")}</span>
            </div>
          ))}
        </div>
      )}
      {v.iup.maaltall && (
        <>
          <span className="wg-profil-etikett">{v.iup.maaltall.tittel}</span>
          <div className="wg-kort">
            <table className="wg-profil-tabell">
              <thead>
                <tr><th scope="col">Mål</th><th scope="col">K1</th><th scope="col">K2</th><th scope="col">K3</th><th scope="col">K4</th><th scope="col">Året</th></tr>
              </thead>
              <tbody>
                {v.iup.maaltall.rader.map((m) => (
                  <tr key={m.id}>
                    <th scope="row">{m.navn}<small>{m.mal === "—" ? "Mål —" : `Mål ${m.mal}`}</small></th>
                    {m.kvartaler.map((k, i) => <td key={i}>{k}</td>)}
                    <td>{m.aar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {lenker.iup ? <Link href={lenker.iup} className="wg-les-mer">Åpne IUP-samtale →</Link> : null}
    </section>
  );

  return (
    <div className="wg-profil-grid">
      <div className="wg-profil-kol">{resultater}{tester}</div>
      <div className="wg-profil-kol">{runder}{iup}</div>
    </div>
  );
}
