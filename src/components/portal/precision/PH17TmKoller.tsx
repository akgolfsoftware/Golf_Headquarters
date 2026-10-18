/**
 * PH-17 TrackMan: alle køller — nytt design (pakke 6, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, skjerm «koller». Stil: playerhq-ny-stats.css.
 *
 * Avvik:
 *   - Gapping regnes fra full hastighet. Importen setter ikke hastighet på slagene, så slag
 *     uten hastighet tas med og telles i kildelinja. Lav hastighet holdes alltid utenfor.
 *   - «Kort gap» er ikke merket: grensen er ikke bestemt (åpent hos Anders).
 *   - Utstyrshelse viser bare målt endring i Spin Rate, uten «Sjekk» eller «Bra»: hva Anders
 *     vil ha her er åpent. Lie og loft er ikke målt i appen og står som «—».
 */
import {
  TM_PERIODE_NAVN, formaterTm, tmFilterSok, tmParam, tmTall,
  type TmFilter, type TmGapRad, type TmKolleRad, type TmUtstyrEndring,
} from "@/lib/portal-analyse/trackman-stats";
import { TmFilterLinje } from "./PH17TmFilter";
import { TmAlleTall, TmTilbake, tmKortDag } from "./PH17TmFelles";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";

export type PH17TmKollerData = {
  filter: TmFilter;
  rader: TmKolleRad[];
  gapping: { rader: TmGapRad[]; antall: number; utenHast: number };
  utstyr: TmUtstyrEndring[];
  kolleValg: string[];
};

const STI = "/portal/analysere/trackman";

export function PH17TmKoller({ data }: { data: PH17TmKollerData }) {
  const { filter, rader, gapping } = data;
  const hast = filter.hast.length ? filter.hast.join(" og ").toLowerCase() + " hastighet" : "alle hastigheter";
  const maks = Math.max(1, ...gapping.rader.map((g) => g.carry));

  return (
    <div className="phn">
      <TmTilbake href={`${STI}${tmFilterSok(filter)}`} tekst="TrackMan" />
      <div className="phn-topp">
        <div className="phn-dato">Stats · TrackMan</div>
        <h1 className="phn-tittel">Alle køller</h1>
        <div className="phn-hoved">
          <strong>{rader.length || "—"}</strong>
          <span className="phn-forklar">køller med slag · {TM_PERIODE_NAVN[filter.periode].toLowerCase()} · {hast}</span>
        </div>
      </div>
      <TmFilterLinje filter={filter} sti={`${STI}/koller`} koller={data.kolleValg} />
      <div className="phn-to-kol">
        <div className="phn-kol">
          <div className="phn-kolle-liste">
            {rader.length ? rader.map((r, i) => (
              <details key={r.kolle} className="phn-kolle-kort phn-inn" style={{ animationDelay: `${i * 30}ms` }}>
                <summary>
                  <span className="phn-kk-topp"><b>{r.kolle}</b><span className="phn-kilde">{r.antall} slag · {r.okter} {r.okter === 1 ? "økt" : "økter"}</span></span>
                  <span className="phn-kk-rad">
                    <span className="phn-kk-carry">{r.snitt.carry == null ? "—" : Math.round(r.snitt.carry)}<small>m carry</small></span>
                    <span className="phn-kk-tre">
                      <span>{r.spredning == null ? "—" : `±${Math.round(r.spredning)} m`}<small>Spredning</small></span>
                      <span>{r.snitt.cs == null ? "—" : tmTall(r.snitt.cs, 1)}<small>Club Speed</small></span>
                      <span>{formaterTm(tmParam("smash"), r.snitt.smash)}<small>Smash</small></span>
                    </span>
                  </span>
                  <span className="phn-kk-mer">Alle tall</span>
                </summary>
                <TmAlleTall verdier={r.snitt} />
              </details>
            )) : (
              <div className="phn-kort dempet">
                <b className="phn-undertittel">Ingen slag i perioden</b>
                <p className="phn-forklar">Fjern en brikke eller velg en lengre periode.</p>
              </div>
            )}
          </div>
        </div>
        <div className="phn-kol">
          <section className="phn-kort">
            <div className="phn-sek-topp"><h2>Gapping</h2><span className="phn-kilde">Carry, snitt</span></div>
            {gapping.rader.length ? (
              <div className="phn-gap-liste">
                {gapping.rader.map((g) => (
                  <div key={g.kolle} style={{ display: "grid", gap: 6 }}>
                    {g.gapFraForrige != null && (
                      <div className="phn-gap-mellom"><span /><span>↕ {Math.round(g.gapFraForrige)} m</span></div>
                    )}
                    <div className="phn-gap-rad">
                      <span>{g.kolle}</span>
                      <span className="phn-stolpe"><span style={{ width: `${((g.carry / maks) * 100)}%` }} /></span>
                      <span className="v">{Math.round(g.carry)} m</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="phn-forklar">— Ingen slag med carry i full hastighet i perioden.</p>}
            <p className="phn-kilde">
              TrackMan · full hastighet · {TM_PERIODE_NAVN[filter.periode].toLowerCase()} · {gapping.antall} slag
              {gapping.utenHast ? ` (${gapping.utenHast} uten registrert hastighet er tatt med)` : ""}
            </p>
          </section>
          <section className="phn-kort">
            <div className="phn-sek-topp"><h2>Utstyrshelse</h2></div>
            <div>
              {data.utstyr.map((u) => (
                <div className="phn-helse" key={u.kolle}>
                  <span>
                    <strong>{u.kolle}: Spin Rate {formaterTm(tmParam("spin"), u.til - u.fra).replace(/^(?!−)/, "+")} siden {tmKortDag(u.fraDato)}</strong>
                    <small>Fra {formaterTm(tmParam("spin"), u.fra)} til {formaterTm(tmParam("spin"), u.til)}, snitt i første og siste økt.</small>
                  </span>
                  <span className="phn-pille noy">Målt</span>
                </div>
              ))}
              <div className="phn-helse">
                <span>
                  <strong>Lie og loft</strong>
                  <small>— Ikke målt. Be coachen sjekke jernene neste gang.</small>
                </span>
                <span className="phn-pille noy">Ukjent</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
