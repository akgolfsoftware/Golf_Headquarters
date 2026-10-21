"use client";

/**
 * PH-17 Trening i nytt design (pakke 6, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, malen «trening». Stil: playerhq-ny-statsdybde.css.
 *
 * Avvik:
 *   - Perioden er siste fire uker, samme regel som etterlevelse i resten av appen. Valgene «Grunnperiode» og
 *     «Sesong» i filteret er tatt ut; filteret har akse og sted.
 *   - Planen per akse er planlagte minutter på øktene i Plan med passert sluttid, ikke periodens fordeling
 *     (periodene fordeler ikke timer per akse ennå, jf. §PLANNIVÅENE HENGER SAMMEN).
 *   - «Mengde mot Strokes Gained» og «Læringssteg i TEK» regnes ikke ut ennå: kortene står med «—» og sier hvorfor.
 *   - Øverste tall er gjennomført tid; «% av plan» er etterlevelsen.
 *   - Økter logget i etterkant (pakke 13) teller i tiden per akse og sted, men ikke i «% av plan» eller underskuddet.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-17-TR.
 */
import Link from "next/link";
import { useRef, useState } from "react";
import { SlidersHorizontal, Target, X } from "lucide-react";
import { TmTilbake } from "./PH17TmFelles";
import { formaterVarighet } from "@/lib/format-tall";
import { sorterPyramideOvenfra } from "@/lib/pyramide";
import { byggTrening, treningSteder, TRENING_AKSER, type LoggetOkt, type TreningAkse, type TreningFilter, type TreningOkt } from "@/lib/portal-analyse/trening-stats";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsdybde.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke7-skra.css";

export type PH17TreningData = {
  okter: TreningOkt[];
  /** Økter logget i etterkant, samme vindu. Teller i tiden, aldri mot planen. */
  logget?: LoggetOkt[];
  /** ISO-tid «nå», slik at server og klient regner likt. */
  naa: string;
  /** «7. sep.–4. okt.» */
  periode: string;
  /** TrackMan siste fire uker. null når spilleren ikke har økter. */
  tm: { okter: number; slag: number } | null;
};

const TOM: TreningFilter = { akse: [], sted: [] };
const veksle = <T,>(xs: T[], x: T) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);
const UNDERSKUDD_MIN = 60;

export function PH17Trening({ data }: { data: PH17TreningData }) {
  const naa = new Date(data.naa);
  const [filter, setFilter] = useState<TreningFilter>(TOM);
  const [utkast, setUtkast] = useState<TreningFilter>(TOM);
  const ark = useRef<HTMLDialogElement>(null);
  const logget = data.logget ?? [];
  const s = byggTrening(data.okter, naa, filter, logget);
  const steder = treningSteder(data.okter, logget);
  const maks = Math.max(1, ...s.akser.flatMap((a) => [a.gjortMin, a.planMin]));
  const under = [...s.akser].sort((a, b) => (b.planMin - b.planGjortMin) - (a.planMin - a.planGjortMin))[0];
  const stedMaks = Math.max(1, ...s.sted.map((x) => x.min));
  const harData = data.okter.length > 0 || logget.length > 0;

  return (
    <div className="phn phn-skra">
    <SkraTopp
      lav
      etikett="Stats"
      bilde="/images/playerhq/slag-simulator.jpg" bildePosisjon="50% 50%"
      overlinje={<>Stats · Trening</>}
      tittel={<>Trening</>}
      handling={<span className="skra-tilbake"><TmTilbake href="/portal/analysere" tekst="Stats" /></span>}
    />
    <SkraFlyt lav>
      <section className="phn-kort">
        <div className="phn-hoved">
          <strong>{s.planMin || s.loggetMin ? <Tid min={s.gjortMin} /> : "—"}</strong>
          {s.pct != null && <span className="phn-trend">{s.pct} % av plan</span>}
        </div>
      </section>

      {!harData ? (
        <section className="phn-kort dempet">
          <h2>Ingen trening registrert ennå</h2>
          <p className="phn-forklar">Når du har gjennomført en økt, ser du tiden mot planen og hvor du trener.</p>
          <div className="phn-knapper">
            <Link className="phn-knapp pri" href="/portal/planlegge/workbench">Åpne Workbench</Link>
            <Link className="phn-knapp sek" href="/portal/trening/logg">Logg økt</Link>
          </div>
        </section>
      ) : (
        <>
          <div className="phn-filterlinje">
            <button type="button" className="phn-knapp sek" aria-haspopup="dialog" onClick={() => { setUtkast(filter); ark.current?.showModal(); }}>
              <SlidersHorizontal className="phn-ikon" aria-hidden />Filter
            </button>
            <span className="phn-brikke fast">Siste 4 uker</span>
            {[...filter.akse, ...filter.sted].map((x) => (
              <button key={x} type="button" className="phn-brikke" aria-label={`Fjern ${x}`}
                onClick={() => setFilter({ akse: filter.akse.filter((a) => a !== x), sted: filter.sted.filter((y) => y !== x) })}>
                {x}<X className="phn-ikon" aria-hidden />
              </button>
            ))}
          </div>

          <div className="phn-to-kol">
            <div className="phn-kol">
              <section className="phn-kort">
                <div className="phn-sek-topp"><h2>Pyramiden mot planen</h2><span className="phn-kilde">Gjennomført · plan</span></div>
                <div className="phn-pyr">
                  {sorterPyramideOvenfra(s.akser, (a) => a.akse).map((a) => {
                    const k = a.akse.toLowerCase();
                    return (
                      <div key={a.akse} className="phn-pyr-rad">
                        <div className="phn-pyr-topp"><b className={k}>{a.akse}</b><span>{formaterVarighet(a.gjortMin)} · {a.planMin ? formaterVarighet(a.planMin) : "ikke i planen"}</span></div>
                        <div className="phn-pyr-bar" role="img" aria-label={`${a.akse}: ${formaterVarighet(a.gjortMin)} gjennomført av ${a.planMin ? formaterVarighet(a.planMin) : "ingen plan"}`}>
                          <span className={`akse-${k}`} style={{ width: `${Math.round(a.gjortMin / maks * 1000) / 10}%` }} />
                          {a.planMin > 0 && <i style={{ left: `calc(${Math.round(a.planMin / maks * 1000) / 10}% - 1px)` }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {under && under.planMin - under.planGjortMin >= UNDERSKUDD_MIN && (
                  <div className={`phn-uthev ${under.akse.toLowerCase()}`}>
                    <Target className="phn-ikon" aria-hidden />
                    <span><b>{under.akse} er {formaterVarighet(under.planMin - under.planGjortMin)} under planen.</b> Gjennomført {formaterVarighet(under.planGjortMin)} av {formaterVarighet(under.planMin)}.</span>
                  </div>
                )}
                <p className="phn-kilde">
                  Gjennomført tid · {data.periode} · plan fra øktene i Plan
                  {s.loggetMin > 0 ? ` · ${formaterVarighet(s.loggetMin)} logget i etterkant teller i tiden, ikke mot planen` : ""}
                </p>
              </section>

              <section className="phn-kort dempet">
                <div className="phn-sek-topp"><h2>Mengde mot Strokes Gained</h2><span className="phn-sd-estimat">Estimat</span></div>
                <div className="phn-hoved"><strong>—</strong></div>
                <p className="phn-forklar">Sammenhengen mellom timer trent per område og Strokes Gained regnes ikke ut ennå. Den kommer når treningstid og runder slag for slag kobles per område.</p>
              </section>
            </div>

            <div className="phn-kol">
              <Link className="phn-tm-kort" href="/portal/analysere/trackman">
                <span><b>TrackMan</b><span>{data.tm ? `${data.tm.okter} ${data.tm.okter === 1 ? "økt" : "økter"} siste 4 uker · spredning, gapping og utstyr` : "Ingen økter siste 4 uker"}</span></span>
                <strong>{data.tm?.slag ? data.tm.slag : "—"}<small>slag</small></strong>
              </Link>
              <section className="phn-kort">
                <div className="phn-sek-topp"><h2>Hvor du trener</h2></div>
                {s.sted.length ? (
                  <div className="phn-sted">
                    {s.sted.map((x) => (
                      <div key={x.navn} className="phn-sted-rad">
                        <span>{x.navn}</span><span className="v">{formaterVarighet(x.min)}</span>
                        <span className="phn-stolpe" aria-hidden><span style={{ width: `${Math.round(x.min / stedMaks * 1000) / 10}%` }} /></span>
                      </div>
                    ))}
                  </div>
                ) : <p className="phn-forklar">Ingen gjennomførte økter i perioden{filter.akse.length || filter.sted.length ? " med dette filteret" : ""}.</p>}
                <p className="phn-kilde">Sted fra øktene i Plan · {data.periode}</p>
              </section>
              <section className="phn-kort dempet">
                <div className="phn-sek-topp"><h2>Læringssteg i TEK</h2></div>
                <div className="phn-hoved"><strong>—</strong></div>
                <p className="phn-forklar">Tid per motorikk (Uten ball, Lav hastighet, Automatikk) regnes ikke ut fra øktene ennå.</p>
              </section>
            </div>
          </div>
        </>
      )}

      <dialog ref={ark} className="phn-ark" aria-labelledby="tr-filter-tittel">
        <div className="phn-ark-kropp">
          <div className="phn-ark-topp">
            <h2 id="tr-filter-tittel">Filter</h2>
            <button type="button" className="phn-lukk" onClick={() => ark.current?.close()} aria-label="Lukk"><X className="phn-ikon" aria-hidden /></button>
          </div>
          <div className="phn-felt" role="group" aria-label="Akse">
            <span className="phn-etikett">Akse</span>
            <div className="phn-velg-brikker">
              {TRENING_AKSER.map((a) => <button key={a} type="button" aria-pressed={utkast.akse.includes(a)} onClick={() => setUtkast({ ...utkast, akse: veksle<TreningAkse>(utkast.akse, a) })}>{a}</button>)}
            </div>
          </div>
          {steder.length > 0 && (
            <div className="phn-felt" role="group" aria-label="Sted">
              <span className="phn-etikett">Sted</span>
              <div className="phn-velg-brikker">
                {steder.map((x) => <button key={x} type="button" aria-pressed={utkast.sted.includes(x)} onClick={() => setUtkast({ ...utkast, sted: veksle(utkast.sted, x) })}>{x}</button>)}
              </div>
            </div>
          )}
          <div className="phn-knapper">
            <button type="button" className="phn-knapp pri" onClick={() => { setFilter(utkast); ark.current?.close(); }}>Vis</button>
            <button type="button" className="phn-knapp sek" onClick={() => setUtkast(TOM)}>Nullstill</button>
          </div>
        </div>
      </dialog>
    </SkraFlyt>
    </div>
  );
}

/** «48 t 10 min» med timer som stort tall. */
function Tid({ min }: { min: number }) {
  const t = Math.floor(min / 60), m = Math.round(min % 60);
  if (!t) return <>{m}<small>min</small></>;
  return <>{t}<small>t{m ? ` ${m} min` : ""}</small></>;
}
