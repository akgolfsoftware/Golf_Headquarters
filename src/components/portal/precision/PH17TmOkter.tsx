"use client";

/**
 * PH-17 TrackMan: alle økter — nytt design (pakke 6, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, skjerm «trackman». Stil: playerhq-ny-stats.css.
 *
 * Avvik:
 *   - Akse-filteret er tatt ut. TrackMan-økter har ingen kobling til økta i Plan (åpent hos Anders),
 *     så aksen på kortet er TEK når slagene er koblet til teknisk plan og SLAG ellers.
 *   - Øktene har ikke eget navn eller varighet i basen. Navnet er oppgaven i teknisk plan, ellers køllene.
 *   - Hastighet settes ikke av importen. «Alle» er derfor første valg i Utvikling over tid,
 *     og hastigheten står bare på kortet når slagene har den.
 *   - Øktkortene har ikke bilde: bildene venter på bildeplanen (PR #1253).
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  TM_PARAM, TM_PERIODE_NAVN, formaterTm, tmFilterSok, tmParam,
  type TmFilter, type TmHast, type TmParamKey, type TmUtviklingPunkt,
} from "@/lib/portal-analyse/trackman-stats";
import { TmFilterLinje } from "./PH17TmFilter";
import { TmTilbake, tmDag, tmKortDag } from "./PH17TmFelles";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";

export type TmOktKort = {
  id: string;
  dato: string;
  navn: string;
  akse: "tek" | "slag";
  antall: number;
  koller: string[];
  sted: string | null;
  hast: string | null;
};

export type PH17TmOkterData = {
  filter: TmFilter;
  okter: TmOktKort[];
  /** Tellende slag i øktene som passer filteret. */
  slag: number;
  /** Køller med slag i øktene som passer filteret. */
  koller: number;
  /** Køllene i perioden, for filteret og utviklingsgrafen. */
  kolleValg: string[];
  utvikling: TmUtviklingPunkt[];
  /** Har spilleren TrackMan-økter i det hele tatt (uavhengig av filteret)? */
  harOkter: boolean;
};

const STI = "/portal/analysere/trackman";
const tusen = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export function PH17TmOkter({ data }: { data: PH17TmOkterData }) {
  const { filter } = data;
  const sok = tmFilterSok(filter);

  return (
    <div className="phn">
      <TmTilbake href="/portal/analysere?del=tren" tekst="Trening" />
      <div className="phn-topp">
        <div className="phn-dato">Stats · Trening · TrackMan</div>
        <h1 className="phn-tittel">TrackMan</h1>
        <div className="phn-hoved">
          <strong>{data.okter.length ? tusen(data.slag) : "—"}</strong>
          <span className="phn-forklar">slag · {TM_PERIODE_NAVN[filter.periode].toLowerCase()}{filter.ekstreme ? "" : ", uten ekstreme slag"}</span>
        </div>
      </div>

      {data.harOkter ? (
        <>
          <TmFilterLinje filter={filter} sti={STI} koller={data.kolleValg} />
          <div className="phn-to-kol">
            <div className="phn-kol">
              <section className="phn-seksjon">
                <div className="phn-sek-topp"><h2>Økter</h2><span className="phn-kilde">{data.okter.length} {data.okter.length === 1 ? "økt" : "økter"}</span></div>
                <div className="phn-okt-liste">
                  {data.okter.length ? data.okter.map((o, i) => (
                    <Link key={o.id} href={`${STI}/${o.id}${sok}`} className={`phn-okt ${o.akse} phn-inn`} style={{ animationDelay: `${i * 40}ms` }}>
                      <span className="phn-okt-tekst">
                        <span className="phn-okt-s">{o.akse.toUpperCase()} · {tmDag(o.dato).toUpperCase()}</span>
                        <span className="phn-navn">{o.navn}</span>
                        <span className="phn-okt-info">
                          <span>{o.antall} slag</span>
                          <span>{o.koller.length > 3 ? `${o.koller.length} køller` : o.koller.join(", ")}</span>
                          {o.sted && <span>{o.sted}</span>}
                          {o.hast && <span>{o.hast}</span>}
                        </span>
                      </span>
                    </Link>
                  )) : (
                    <div className="phn-kort dempet">
                      <b className="phn-undertittel">Ingen økter passer filteret</b>
                      <p className="phn-forklar">Fjern en brikke eller velg en lengre periode.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
            <div className="phn-kol">
              <Link className="phn-tm-kort" href={`${STI}/koller${sok}`}>
                <span><b>Alle køller</b><span>Snitt for alle tall, gapping og utstyr</span></span>
                <strong>{data.koller || "—"}<small>køller</small></strong>
              </Link>
              <Utvikling punkter={data.utvikling} koller={data.kolleValg} />
            </div>
          </div>
        </>
      ) : (
        <section className="phn-kort dempet">
          <h2>Ingen TrackMan-økter ennå</h2>
          <p className="phn-forklar">Når en TrackMan-økt er lagt inn, ser du slagene, spredningen og alle tallene her.</p>
        </section>
      )}
    </div>
  );
}

type HastValg = "alle" | TmHast;
const HAST_VALG: { id: HastValg; navn: string }[] = [
  { id: "alle", navn: "Alle" }, { id: "FULL", navn: "Full hastighet" }, { id: "LAV", navn: "Lav hastighet" },
];

function Utvikling({ punkter, koller }: { punkter: TmUtviklingPunkt[]; koller: string[] }) {
  const [kolle, setKolle] = useState(koller[0] ?? "");
  const [key, setKey] = useState<TmParamKey>("cs");
  const [hast, setHast] = useState<HastValg>("alle");
  const p = tmParam(key);
  const pkt = useMemo(
    () => punkter.filter((x) => x.kolle === kolle && (hast === "alle" || x.hast === hast) && x.snitt[key] != null)
      .map((x) => ({ dato: x.dato, v: x.snitt[key] as number })),
    [punkter, kolle, hast, key],
  );
  const hastTekst = hast === "alle" ? "alle hastigheter" : hast === "FULL" ? "full hastighet" : "lav hastighet";
  const uten = (s: string) => s.replace(/ (mph|m|rpm)$/, "");

  let graf: React.ReactNode;
  let tekst: string;
  if (pkt.length < 2) {
    graf = (
      <>
        <rect x="10" y="20" width="300" height="120" rx="8" fill="var(--phn-sand-100)" />
        <text x="160" y="84" textAnchor="middle" className="gt" style={{ fontSize: 13, fill: "var(--phn-g800)" }}>
          {pkt.length ? `Bare én økt: ${formaterTm(p, pkt[0].v)}` : "Ingen økter"}
        </text>
      </>
    );
    tekst = `${kolle || "Ingen kølle"} · ${hastTekst} · trenger minst to økter for å vise utvikling.`;
  } else {
    const vs = pkt.map((x) => x.v);
    const mn = Math.min(...vs), mx = Math.max(...vs), sp = mx - mn || Math.abs(mx) * 0.05 || 1;
    const X = (i: number) => 40 + i * (250 / (pkt.length - 1));
    const Y = (v: number) => 130 - ((v - mn) / sp) * 90;
    const d = pkt.map((x, i) => `${X(i)},${Y(x.v)}`);
    graf = (
      <>
        <line x1="30" x2="300" y1="130" y2="130" stroke="var(--phn-sand-300)" />
        <line x1="30" x2="300" y1="40" y2="40" stroke="var(--phn-sand-300)" />
        <text x="26" y="44" textAnchor="end" className="gt">{uten(formaterTm(p, mx))}</text>
        <text x="26" y="134" textAnchor="end" className="gt">{uten(formaterTm(p, mn))}</text>
        <path d={`M${d.join(" L")} L${X(pkt.length - 1)},130 L40,130 Z`} fill="var(--phn-slag)" opacity=".18" />
        <path className="phn-tegn" d={`M${d.join(" L")}`} fill="none" stroke="var(--phn-slag)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {pkt.map((x, i) => (
          <g key={x.dato}>
            <circle cx={X(i)} cy={Y(x.v)} r="4.5" fill="var(--phn-slag)" />
            <text x={X(i)} y={(Y(x.v) - 10)} textAnchor="middle" className="gt" style={{ fill: "var(--phn-slag-ink)", fontWeight: 600 }}>{uten(formaterTm(p, x.v))}</text>
            <text x={X(i)} y="152" textAnchor="middle" className="gt">{tmKortDag(x.dato)}</text>
          </g>
        ))}
      </>
    );
    tekst = `${kolle} · ${p.navn} · ${hastTekst} · snitt per økt · ${pkt.length} økter`;
  }

  return (
    <section className="phn-kort">
      <div className="phn-sek-topp"><h2>Utvikling over tid</h2></div>
      <div className="phn-to-felt">
        <label className="phn-felt">Kølle
          <select value={kolle} onChange={(e) => setKolle(e.target.value)}>
            {koller.length ? koller.map((k) => <option key={k}>{k}</option>) : <option value="">—</option>}
          </select>
        </label>
        <label className="phn-felt">Tall
          <select value={key} onChange={(e) => setKey(e.target.value as TmParamKey)}>
            {TM_PARAM.map((x) => <option key={x.key} value={x.key}>{x.navn}</option>)}
          </select>
        </label>
      </div>
      <div className="phn-valg" role="group" aria-label="Hastighet">
        {HAST_VALG.map((h) => (
          <button key={h.id} type="button" aria-pressed={hast === h.id} onClick={() => setHast(h.id)}>{h.navn}</button>
        ))}
      </div>
      <svg className="phn-graf" viewBox="0 0 320 170" role="img"
        aria-label={pkt.length ? `${p.navn} med ${kolle} per økt: ${pkt.map((x) => `${tmKortDag(x.dato)} ${formaterTm(p, x.v)}`).join(", ")}` : `Ingen målinger av ${p.navn} med ${kolle}`}>
        {graf}
      </svg>
      <p className="phn-kilde">{tekst}</p>
    </section>
  );
}
