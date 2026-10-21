"use client";

/**
 * Hull i nytt design (PlayerHQ pakke 13, Stats resten, godkjent av Anders 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «hull». Stil: playerhq-ny-statsresten-omrade.css.
 * To visninger: Soner (SG fra tee til hull og trening per sone) og Hull for hull (varmekart over 18 hull og siste runde).
 *
 * Avvik:
 *   - SG sammenlignes med PGA Tour, ikke Kategori B: referansen per A–K-kategori er ikke satt (som Stats). Merket «Estimat».
 *   - «Mest fra 100–150 m» står ikke i uthevingen; Ett område (sonen åpner den) viser avstanden.
 *   - Trening per sone er gjennomførte Workbench-økter merket med treningsområdet, siste 30 dager. Økter uten
 *     treningsområde telles ikke.
 *   - Varmekartet regnes for banen med flest runder (minst 3). Forklaringen nevner de dyreste hullene, ikke hvorfor.
 *   - Ett hull uten data på banen står med «—».
 */
import Link from "next/link";
import { useState } from "react";
import { Crosshair } from "lucide-react";
import { TmTilbake } from "./PH17TmFelles";
import { formaterVarighet } from "@/lib/format-tall";
import { formaterDesimal, formaterSg } from "@/lib/portal-analyse/ph16-stats-data";
import { MIN_RUNDER_PAA_BANEN, SG_GRUPPE_INFO, type HullData } from "@/lib/portal-analyse/omrade-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsdybde.css";
import "@/styles/playerhq-ny-statsresten-omrade.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke7-skra.css";

type Visning = "soner" | "hull";

/** «+2», «−1», «0». */
const motPar = (n: number) => (n === 0 ? "0" : n > 0 ? `+${n}` : `−${Math.abs(n)}`);

function varmeKlasse(v: number): string {
  if (v < -0.05) return "under";
  if (v < 0.25) return "rundt";
  if (v < 0.5) return "over";
  return "mye";
}

export function PH16dHull({ data, start = "soner" }: { data: HullData; start?: Visning }) {
  const [visning, setVisning] = useState<Visning>(start);
  const svak = data.svakest ? data.soner.find((s) => s.g === data.svakest) : null;
  const harSg = data.soner.some((s) => s.v != null);

  return (
    <div className="phn phn-skra">
    <SkraTopp
      lav
      etikett="Stats"
      bilde="/images/playerhq/spill-bane.jpg" bildePosisjon="50% 50%"
      overlinje={<>Stats{data.kategori ? ` · Kategori ${data.kategori}` : ""}</>}
      tittel={<>Hull</>}
      handling={<span className="skra-tilbake"><TmTilbake href="/portal/analysere" tekst="Stats" /></span>}
    />
    <SkraFlyt lav>
      <div className="phn-valg" role="group" aria-label="Visning">
          <button type="button" aria-pressed={visning === "soner"} onClick={() => setVisning("soner")}>Soner</button>
          <button type="button" aria-pressed={visning === "hull"} onClick={() => setVisning("hull")}>Hull for hull</button>
        </div>

      {visning === "soner" ? (
        <div className="phn-to-kol">
          <div className="phn-om-kol">
            <section className="phn-kort">
              <div className="phn-sek-topp"><h2>Fra tee til hull</h2><span className="phn-kilde">SG per runde mot PGA Tour <span className="phn-om-merke">Estimat</span></span></div>
              <div className="phn-om-sonekjede">
                {data.soner.map((s) => {
                  const info = SG_GRUPPE_INFO[s.g];
                  return (
                    <Link key={s.g} href={`/portal/statistikk/${info.slug}`} className={`phn-om-sone${s.g === data.svakest ? " svak" : ""}`}
                      aria-label={`${info.navn}, ${s.v == null ? "ingen tall" : `${formaterSg(s.v)} slag per runde`}${s.forelopig ? ", foreløpig" : ""}. Åpne området.`}>
                      <span>{info.navn}{s.forelopig && <> <span className="phn-om-merke">Foreløpig</span></>}</span>
                      <b>{formaterSg(s.v)}</b>
                    </Link>
                  );
                })}
              </div>
              {svak && svak.v != null ? (
                <div className="phn-uthev slag"><Crosshair className="phn-ikon" aria-hidden /><span><b>{SG_GRUPPE_INFO[svak.g].navn} taper mest</b>, {formaterDesimal(Math.abs(svak.v), 1)} slag per runde.</span></div>
              ) : !harSg ? (
                <p className="phn-forklar">Registrer minst 4 runder slag for slag, så ser du hvor på hullet du vinner og taper slag.</p>
              ) : null}
              <p className="phn-kilde">{data.sgGrunnlag.antall ? `${data.sgGrunnlag.antall} runder slag for slag${data.sgGrunnlag.periode ? ` · ${data.sgGrunnlag.periode}` : ""}` : "Ingen runder slag for slag ennå"} · snitt av siste 10</p>
            </section>
          </div>
          <aside className="phn-om-kol">
            <section className="phn-kort">
              <div className="phn-sek-topp"><h2>Trening per sone</h2><span className="phn-kilde">Siste 30 dager</span></div>
              {data.trening && Object.values(data.trening).some((t) => t.okter > 0) ? (
                <ul className="phn-om-liste">
                  {data.soner.map((s) => {
                    const t = data.trening![s.g];
                    const flest = Math.max(...Object.values(data.trening!).map((x) => x.min));
                    return (
                      <li key={s.g}>
                        <span>{SG_GRUPPE_INFO[s.g].navn}</span>
                        <b>{t.okter ? formaterVarighet(t.min) : "—"}</b>
                        <span className="phn-kilde">{t.okter} {t.okter === 1 ? "økt" : "økter"}{t.okter && t.min === flest ? " · mest av alle" : ""}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : <p className="phn-forklar">Ingen gjennomførte økter med treningsområde de siste 30 dagene.</p>}
              <p className="phn-kilde">Gjennomført tid fra planen · {data.treningPeriode}</p>
            </section>
          </aside>
        </div>
      ) : (
        <div className="phn-to-kol">
          <div className="phn-om-kol">
            <section className="phn-kort">
              <div className="phn-sek-topp"><h2>Snitt mot par per hull</h2>{data.varme && <span className="phn-kilde">{data.varme.bane} · {data.varme.runder} runder</span>}</div>
              {data.varme ? (
                <>
                  <div className="phn-om-varme">
                    {Array.from({ length: Math.max(18, ...data.varme.hull.map((h) => h.nr)) }, (_, i) => i + 1).map((nr) => {
                      const h = data.varme!.hull.find((x) => x.nr === nr);
                      if (!h) return <span key={nr} className="ingen" aria-label={`Hull ${nr}, ingen data`}><small>{nr}</small>—</span>;
                      return (
                        <span key={nr} className={varmeKlasse(h.snitt)} aria-label={`Hull ${nr}${h.par ? `, par ${h.par}` : ""}, snitt ${formaterSg(h.snitt)} mot par`}>
                          <small>{nr}</small>{formaterSg(h.snitt)}
                        </span>
                      );
                    })}
                  </div>
                  <div className="phn-lg-rad">
                    <span className="phn-lg"><i style={{ background: "var(--phn-green-50)", border: "1px solid var(--phn-green-700)" }} />Under par</span>
                    <span className="phn-lg"><i style={{ background: "var(--phn-sand-150)" }} />Rundt par</span>
                    <span className="phn-lg"><i style={{ background: "var(--phn-slag)" }} />Over par</span>
                  </div>
                  {data.varme.dyrest.length > 0 && (
                    <p className="phn-forklar">{data.varme.dyrest.length === 1 ? `Hull ${data.varme.dyrest[0]} koster mest.` : `Hull ${data.varme.dyrest[0]} og ${data.varme.dyrest[1]} koster mest.`}</p>
                  )}
                  <p className="phn-kilde">Brutto · hullscore fra {data.varme.runder} runder{data.varme.periode ? ` · ${data.varme.periode}` : ""} · varmekartet krever minst {MIN_RUNDER_PAA_BANEN} runder på banen</p>
                </>
              ) : (
                <p className="phn-forklar">
                  Varmekartet krever minst {MIN_RUNDER_PAA_BANEN} runder med hullscore på samme bane.
                  {data.runderMedHull ? ` Du har ${data.runderMedHull} ${data.runderMedHull === 1 ? "runde" : "runder"} med hullscore, men ikke ${MIN_RUNDER_PAA_BANEN} på én bane ennå.` : ""}
                </p>
              )}
            </section>
          </div>
          <aside className="phn-om-kol">
            <section className="phn-kort">
              <div className="phn-sek-topp"><h2>Siste runde</h2>{data.siste && <span className="phn-kilde">{data.siste.dato} · {data.siste.bane}</span>}</div>
              {data.siste ? (
                <>
                  <div className="phn-om-tre-tall">
                    <span><b>{data.siste.brutto}</b>brutto</span>
                    <span><b>{motPar(data.siste.motPar)}</b>mot par</span>
                    <span><b>{data.siste.hull.length ? formaterDesimal(data.siste.hull.reduce((a, h) => a + h.slag, 0) / data.siste.hull.length, 2) : "—"}</b>snitt per hull</span>
                  </div>
                  <table className="phn-om-hulltab">
                    <thead><tr><th scope="col">Hull</th><th scope="col">Par</th><th scope="col">Score</th><th scope="col">Mot par</th></tr></thead>
                    <tbody>
                      {data.siste.hull.map((h) => (
                        <tr key={h.nr}><td>{h.nr}</td><td>{h.par}</td><td className={h.slag < h.par ? "birdie" : undefined}>{h.slag}</td><td>{motPar(h.slag - h.par)}</td></tr>
                      ))}
                      <tr className="sum">
                        <td>Sum</td>
                        <td>{data.siste.hull.reduce((a, h) => a + h.par, 0)}</td>
                        <td>{data.siste.hull.reduce((a, h) => a + h.slag, 0)}</td>
                        <td>{motPar(data.siste.motPar)}</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              ) : (
                <>
                  <p className="phn-forklar">Ingen runder med hullscore ennå.</p>
                  <div className="phn-knapper"><Link className="phn-knapp sek" href="/portal/mal/runder/ny">Registrer runde</Link></div>
                </>
              )}
            </section>
          </aside>
        </div>
      )}
    </SkraFlyt>
    </div>
  );
}
