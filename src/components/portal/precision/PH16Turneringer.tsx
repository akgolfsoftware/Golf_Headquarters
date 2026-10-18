"use client";

/**
 * Stats › Resultater › Turneringer i nytt design (pakke 13, vedtak 16.10.2026 §STATS-RESTEN punkt 1).
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «turneringer». Stil: playerhq-ny-statsresten.css.
 * Turneringene vises én gang: kurven øverst og lista under, inne i Resultater. /portal/analysere/turneringer sender hit.
 *
 * Avvik:
 *   - Kurven er Min kurve (hentMinKurve): bare fullstendige turneringsresultater, til par per runde. Båndet for
 *     beste og verste runde tegnes bare der rundene summerer til turneringens til par.
 *   - «Beste runde» er laveste brutto blant turneringsrundene i sesongen fra resultatlista.
 *   - Feltstørrelse («av 60») lagres ikke; plasseringen står alene, eller «—» når den ikke er publisert.
 *   - Banenavn finnes ikke på turneringsresultatene; søket leter i turneringsnavn og klasse.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { motParDesimal, motParTekst, type ResultatTurnering, type TurnKurveData } from "@/lib/portal-analyse/resultater-data";
import "@/styles/playerhq-ny-statsresten.css";

const W = 340;
const H = 140;
const X0 = 34;
/** Koordinat med én desimal i SVG-stien. */
const r1 = (n: number) => Math.round(n * 10) / 10;

function Kurve({ punkter, valgt }: { punkter: TurnKurveData["punkter"]; valgt: TurnKurveData["valgt"] }) {
  const verdier = punkter.flatMap((p) => [p.snitt, p.beste ?? p.snitt, p.verste ?? p.snitt]);
  const lo = Math.min(0, Math.floor(Math.min(...verdier)));
  const hi = Math.max(lo + 3, Math.ceil(Math.max(...verdier)));
  const y = (v: number) => 10 + ((hi - v) / (hi - lo)) * (H - 20);
  const x = (i: number) => X0 + (i * (W - X0 - 10)) / Math.max(punkter.length - 1, 1);
  const steg = Math.max(1, Math.ceil((hi - lo) / 4));
  const linjer: number[] = [];
  for (let g = Math.ceil(lo / steg) * steg; g <= hi; g += steg) linjer.push(g);
  const medBaand = punkter.map((p, i) => ({ ...p, i })).filter((p) => p.beste != null && p.verste != null);
  const baand = medBaand.length > 1
    ? `M${medBaand.map((p) => `${r1(x(p.i))},${r1(y(p.beste!))}`).join(" L")} L${[...medBaand].reverse().map((p) => `${r1(x(p.i))},${r1(y(p.verste!))}`).join(" L")} Z`
    : null;
  const forste = punkter[0];
  const siste = punkter[punkter.length - 1];
  const etikett = `Til par per turnering${valgt === "alle" ? "" : ` i ${valgt}`}, fra ${motParDesimal(forste?.snitt ?? null)} ${forste?.dato ?? ""} til ${motParDesimal(siste?.snitt ?? null)} ${siste?.dato ?? ""}`;
  return (
    <svg className="phn-kurve" viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-label={etikett}>
      {linjer.map((g) => (
        <g key={g}>
          <line x1={X0} x2={W} y1={y(g)} y2={y(g)} stroke={g === 0 ? "var(--phn-g600)" : "var(--phn-sand-300)"} strokeDasharray={g === 0 ? "4 3" : undefined} />
          <text x={X0 - 6} y={y(g) + 4} textAnchor="end">{g === 0 ? "Par" : g > 0 ? `+${g}` : `−${Math.abs(g)}`}</text>
        </g>
      ))}
      {baand && <path d={baand} fill="var(--phn-turn)" opacity={0.15} />}
      {punkter.length > 1 && (
        <path d={`M${punkter.map((p, i) => `${r1(x(i))},${r1(y(p.snitt))}`).join(" L")}`} fill="none" stroke="var(--phn-turn)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {punkter.map((p, i) => <circle key={p.id} cx={x(i)} cy={y(p.snitt)} r={i === punkter.length - 1 ? 5 : 3.5} fill="var(--phn-turn)" />)}
      {forste && <text x={x(0)} y={H + 16} textAnchor="start">{forste.dato}</text>}
      {siste && punkter.length > 1 && <text x={x(punkter.length - 1)} y={H + 16} textAnchor="end">{siste.dato}</text>}
    </svg>
  );
}

export function PH16Turneringer({ kurve, turneringer, koblet }: { kurve: TurnKurveData; turneringer: ResultatTurnering[]; koblet: boolean }) {
  const [sok, setSok] = useState("");
  const iSesong = useMemo(() => turneringer.filter((t) => kurve.valgt === "alle" || t.aar === kurve.valgt), [turneringer, kurve.valgt]);
  const q = sok.trim().toLowerCase();
  const vis = iSesong.filter((t) => !q || `${t.navn} ${t.klasse ?? ""}`.toLowerCase().includes(q));
  const brutto = iSesong.flatMap((t) => t.runder.map((r) => r.brutto).filter((b): b is number => b != null));
  const beste = brutto.length ? Math.min(...brutto) : null;
  const endring = kurve.snittPerRunde != null && kurve.forrige ? Math.round((kurve.forrige.snitt - kurve.snittPerRunde) * 10) / 10 : null;
  const sesonger = kurve.sesonger.slice(0, 2);
  const href = (s: number | "alle") => `/portal/analysere/resultater?vis=turneringer&sesong=${s}`;

  return (
    <div className="phn-kol">
      {sesonger.length > 0 && (
        <nav className="phn-valg" aria-label="Sesong">
          {sesonger.map((s) => <Link key={s} href={href(s)} aria-current={kurve.valgt === s ? "page" : undefined}>{s}</Link>)}
          <Link href={href("alle")} aria-current={kurve.valgt === "alle" ? "page" : undefined}>Alle</Link>
        </nav>
      )}
      <div className="phn-to-kol">
        <div className="phn-kol">
          <section className="phn-kort">
            <div className="phn-hoved">
              <strong>{motParDesimal(kurve.snittPerRunde)}</strong>
              {endring != null && endring !== 0 && kurve.forrige && (
                <span className={`phn-trend ${endring > 0 ? "opp" : "ned"}`}>
                  {endring > 0 ? <TrendingUp className="phn-ikon" aria-hidden /> : <TrendingDown className="phn-ikon" aria-hidden />}
                  {motParDesimal(Math.abs(endring)).replace("+", "")} {endring > 0 ? "bedre" : "dårligere"} enn {kurve.forrige.sesong}
                </span>
              )}
            </div>
            <p className="phn-forklar">
              Snitt til par per runde i turnering.{kurve.antallTurneringer ? ` ${kurve.antallTurneringer} ${kurve.antallTurneringer === 1 ? "turnering" : "turneringer"}, ${kurve.antallRunder} ${kurve.antallRunder === 1 ? "runde" : "runder"}.` : ""}
            </p>
            {kurve.punkter.length > 0 ? (
              <>
                <Kurve punkter={kurve.punkter} valgt={kurve.valgt} />
                <div className="phn-lg-rad">
                  <span className="phn-lg"><i style={{ background: "var(--phn-turn)", height: 3 }} />Snitt per turnering</span>
                  <span className="phn-lg"><i style={{ background: "var(--phn-turn)", opacity: 0.15 }} />Beste til verste runde</span>
                </div>
              </>
            ) : <p className="phn-sr-datanote">{kurve.tomGrunn || "Ingen turneringer i kurven ennå."}</p>}
            <div className="phn-sr-tre">
              <span><b>{kurve.antallTurneringer || "—"}</b>turneringer</span>
              <span><b>{kurve.antallRunder || "—"}</b>runder</span>
              <span><b>{beste ?? "—"}</b>beste runde</span>
            </div>
            <p className="phn-kilde">Brutto · GolfBox via AK Golf{kurve.oppdatert ? ` · oppdatert ${kurve.oppdatert}` : ""}</p>
          </section>
        </div>
        <section className="phn-seksjon">
          <div className="phn-sek-topp"><h2>Turneringene</h2><span className="phn-kilde">Trykk for rundene</span></div>
          {iSesong.length > 0 && (
            <input className="phn-sr-sok" type="search" placeholder="Søk etter turnering eller klasse" aria-label="Søk etter turnering eller klasse" value={sok} onChange={(e) => setSok(e.target.value)} />
          )}
          {vis.length ? (
            <div className="phn-turn-liste">
              {vis.map((t) => {
                return (
                  <details key={t.id} className="phn-turn-kort phn-sr-tk">
                    <summary>
                      <span className="phn-tk-plass"><b>{t.plass ? `${t.plass}.` : "—"}</b><small>{t.plass ? "Plassering" : t.plassTekst ?? "Ikke publisert"}</small></span>
                      <span className="phn-tk-midt"><strong>{t.navn}</strong><small>{[t.klasse, t.dato].filter(Boolean).join(" · ")}</small></span>
                      <span className="phn-tk-sum"><b>{motParTekst(t.motPar)}</b><small>{t.runder.length} {t.runder.length === 1 ? "runde" : "runder"}</small></span>
                    </summary>
                    <div className="phn-sr-runder">
                      {t.runder.map((r) => <span key={r.nr}>R{r.nr} {r.brutto ?? "—"}</span>)}
                      <span>Totalt {t.sum ?? "—"}</span>
                    </div>
                  </details>
                );
              })}
            </div>
          ) : (
            <p className="phn-forklar">
              {!koblet ? "Profilen din er ikke koblet til turneringsresultatene ennå. Coachen din kobler den." : q ? "Ingen turneringer passer søket." : "Ingen turneringer med resultat i denne sesongen."}
            </p>
          )}
          <p className="phn-kilde">Plassering slik arrangøren har publisert den, i klassen din.</p>
        </section>
      </div>
    </div>
  );
}
