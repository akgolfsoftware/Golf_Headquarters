"use client";

/**
 * PH-18 Stats › Snittscore · Runder — nytt design (pakke 5, godkjent av Anders 14.10.2026, utkast 2 med farge).
 * Fasit: docs/design-system/utkast-playerhq/runder.html, skjerm «runder». Stil: playerhq-ny-runder.css.
 * Bare brutto score. Snittet teller bare 18-hullsrunder med kjent par; ni hull teller ikke.
 *
 * Avvik:
 *   - «Under 72 gir Kategori B» og kategorien i snittkortet er tatt ut: kategorigrensene for snittscore finnes ikke i koden.
 *   - Trendmerket sammenligner med snittet forrige sesong bare når det finnes 18-hullsrunder året før; ellers vises det ikke.
 *   - Grafen viser sesongen med tellende runder. Under to runder vises ingen kurve.
 *   - Raden «Snitt per hull» viser slag per hull for par 3, 4 og 5 fra alle runder med hullscore. Uten hull med den paren: «—».
 *   - Kilden på raden er rundens registrerte kilde (Live føring, Etterregistrering, UpGame CSV …). GolfBox-runder har ingen egen kilde i basen og står uten.
 *   - Statistikk, Hull og Sesonger fra forrige versjon er beholdt under «Mer statistikk» (PH18RunderMer.tsx).
 *   - «Del runde» og scorekortet ligger på runden (PH-RD-08), ikke i lista.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-18.
 */

import Link from "next/link";
import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Play } from "lucide-react";
import { useHarRundeKladd } from "@/components/portal/runde-logg/fortsett-runde-cta";
import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import { lesRundeKilde, RUNDE_KILDE_META, RUNDE_SG_KILDE } from "@/lib/runde-logg/kontrakt";
import type { PH18Model, PH18Oversikt, PH18Runde } from "@/lib/portal-runder/ph18-data";
import { PH18MerStatistikk } from "./PH18RunderMer";
import { RunderFeil, Tilbake } from "./PHRunderFelles";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-runder.css";

export type PH18Props = {
  tilstand: "data" | "tom" | "feil";
  ukjentKode?: string;
  /** Beholdt for eldre lenker; Mer statistikk starter alltid på Statistikk. */
  startFane?: "runder" | "stat" | "hull" | "sesong";
  modell: PH18Model;
  registrerHref?: string;
  liveHref?: string;
  baseHref?: string;
  delHref?: (id: string) => string;
  detaljHref?: (id: string) => string;
};

type Filter = "alle" | "turnering" | "trening";
const FILTER: { id: Filter; navn: string }[] = [
  { id: "alle", navn: "Alle" }, { id: "turnering", navn: "Turnering" }, { id: "trening", navn: "Trening" },
];
const KORT_LISTE = 6;

const en = (v: number | null) => formaterTall(v, 1, true);
const to = (v: number | null) => formaterTall(v, 2, true);

function artNavn(art: string | null): string | null {
  return art === "turnering" ? "Turnering" : art === "trening" ? "Trening" : null;
}

function kildeNavn(r: PH18Runde): string | null {
  const k = lesRundeKilde(r.kilde);
  return k && k !== "ukjent" ? RUNDE_KILDE_META[k].label : null;
}

function Graf({ o }: { o: PH18Oversikt }) {
  const s = o.serie;
  if (s.length < 2) return <p className="phn-kilde">Kurven kommer når du har to tellende runder i sesongen.</p>;
  const alle = s.flatMap((x) => [x.score, x.glidende]);
  const min = Math.floor(Math.min(...alle)) - 1;
  const maks = Math.ceil(Math.max(...alle)) + 1;
  const X = (i: number) => 26 + (i * 286) / (s.length - 1);
  const Y = (v: number) => 10 + ((v - min) / (maks - min)) * 120;
  const linje = (f: (x: (typeof s)[number]) => number) => s.map((x, i) => `${i ? "L" : "M"}${Math.round(X(i) * 10) / 10},${Math.round(Y(f(x)) * 10) / 10}`).join(" ");
  const midt = Math.round((min + maks) / 2);
  const siste = s[s.length - 1];
  return (
    <svg className="phr-graf" viewBox="0 0 320 150" role="img"
      aria-label={`Brutto score per runde, ${s.length} runder, fra ${s[0].score} til ${siste.score}. Snitt ${en(o.snitt)}.`}>
      {[min + 1, midt, maks - 1].map((v) => (
        <g key={v}>
          <line x1="26" x2="312" y1={Y(v)} y2={Y(v)} className="phr-graf-linje" />
          <text x="20" y={Y(v) + 4} textAnchor="end" className="gt">{v}</text>
        </g>
      ))}
      <path d={linje((x) => x.score)} className="phr-graf-hver" />
      <path d={linje((x) => x.glidende)} className="phr-graf-snitt" />
      <circle cx={X(s.length - 1)} cy={Y(siste.glidende)} r="4.5" className="phr-graf-prikk" />
      <text x="26" y="145" className="gt">{s[0].dato}</text>
      <text x="312" y="145" textAnchor="end" className="gt">{siste.dato}</text>
    </svg>
  );
}

function Snittkort({ o }: { o: PH18Oversikt }) {
  const diff = o.snitt != null && o.forrigeSnitt != null ? o.forrigeSnitt - o.snitt : null;
  return (
    <section className="phr-fylt" aria-label="Snittscore">
      <div className="phn-hoved">
        <strong>{en(o.snitt)}</strong>
        {diff != null && o.aar != null && (
          <span className={`phn-trend${diff > 0 ? " opp" : ""}`}>
            {diff > 0 ? <ArrowUpRight className="phn-ikon" aria-hidden /> : diff < 0 ? <ArrowDownRight className="phn-ikon" aria-hidden /> : null}
            {diff === 0 ? `Likt med ${o.aar - 1}` : `${en(Math.abs(diff))} ${diff > 0 ? "bedre" : "dårligere"} enn ${o.aar - 1}`}
          </span>
        )}
      </div>
      <p className="phn-forklar">
        Brutto snitt{o.aar != null ? ` ${o.aar}` : ""}.{" "}
        Siste 5 runder: <b>{en(o.siste5)}</b>
      </p>
      <Graf o={o} />
      {o.serie.length >= 2 && (
        <div className="phr-lg-rad">
          <span><i style={{ height: 3 }} />Snitt siste 5 runder</span>
          <span><i style={{ height: 2, opacity: 0.6 }} />Hver runde</span>
        </div>
      )}
      <p className="phn-kilde">Brutto · {o.antall} tellende {o.antall === 1 ? "runde" : "runder"} med 18 hull · ni hull teller ikke</p>
    </section>
  );
}

function PerPar({ o }: { o: PH18Oversikt }) {
  return (
    <section className="phn-seksjon" aria-label="Snitt per par">
      <div className="phn-sek-topp"><h2>Snitt per hull</h2><span className="phn-kilde">{o.runderMedHull} {o.runderMedHull === 1 ? "runde" : "runder"}</span></div>
      <div className="phr-partype">
        {o.perPar.map((p) => (
          <div key={p.par}>
            <b>{to(p.snitt)}</b>
            <span>Par {p.par} · {p.snitt == null ? "—" : formaterFortegn(p.snitt - p.par, 2)}</span>
          </div>
        ))}
      </div>
      <p className="phn-kilde">Fra runder ført hull for hull eller slag for slag.</p>
    </section>
  );
}

function Rundeliste({ runder, detalj }: { runder: PH18Runde[]; detalj: (id: string) => string }) {
  const [filter, setFilter] = useState<Filter>("alle");
  const [alle, setAlle] = useState(false);
  const liste = runder.filter((r) => filter === "alle" || r.art === filter);
  const vis = alle ? liste : liste.slice(0, KORT_LISTE);
  return (
    <section className="phn-seksjon" aria-label="Rundene">
      <div className="phn-sek-topp">
        <h2>Rundene <span className="phr-antall">{runder.length}</span></h2>
        <div className="phn-valg phr-valg" role="group" aria-label="Filter">
          {FILTER.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.navn}</button>
          ))}
        </div>
      </div>
      {vis.length ? (
        <div className="phr-rundeliste">
          {vis.map((r) => {
            const meta = [r.kortDato, artNavn(r.art), kildeNavn(r), r.hull === 9 ? "9 hull" : null].filter(Boolean).join(" · ");
            return (
              <Link key={r.id} href={detalj(r.id)}>
                <span>
                  <b>
                    <span className={`phr-akse-prikk${r.art === "turnering" ? " turn" : ""}`} aria-hidden />
                    {r.bane}
                    {r.sgKilde === RUNDE_SG_KILDE.BEREGNET && <span className="phr-merke sg">SG</span>}
                  </b>
                  <span className="phr-meta">{meta}</span>
                </span>
                <span className="v">{r.score}<small>{r.tilPar ?? "—"}</small></span>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="phn-kilde">Ingen runder passer filteret. Runder uten type står bare under Alle.</p>
      )}
      {!alle && liste.length > KORT_LISTE && (
        <button type="button" className="phn-knapp sek" onClick={() => setAlle(true)}>Vis alle {liste.length}</button>
      )}
    </section>
  );
}

export function PH18Runder(p: PH18Props) {
  const harKladd = useHarRundeKladd();
  const regHref = p.registrerHref ?? "/portal/mal/runder/ny";
  const liveHref = p.liveHref ?? "/portal/runde/live";
  const base = p.baseHref ?? "/portal/mal/runder";
  const detalj = p.detaljHref ?? ((id: string) => `${base}/${id}`);
  const o = p.modell.oversikt;

  return (
    <div className="phn">
      <Tilbake href="/portal/analysere" tekst="Stats" />
      <div className="phr-topp">
        <div className="phn-dato">Stats · snittscore</div>
        <h1 className="phn-tittel">Runder</h1>
      </div>

      {harKladd && p.tilstand !== "feil" && (
        <section className="phr-kladd" aria-label="Runde som ikke er ferdig">
          <div className="phr-kladd-topp">
            <span className="phr-kladd-ikon"><Play className="phn-ikon" aria-hidden /></span>
            <span><b className="phr-undertittel">Du har en runde i gang</b><span className="phn-kilde" style={{ display: "block" }}>Lagret på telefonen</span></span>
          </div>
          <Link className="phn-knapp sek" href={liveHref}>Fortsett runden</Link>
        </section>
      )}

      {p.tilstand === "feil" ? (
        <RunderFeil tittel="Rundene kunne ikke hentes" tekst="Ingen runder er slettet. Prøv å laste siden på nytt." href={base} kode={p.ukjentKode} />
      ) : p.tilstand === "tom" ? (
        <section className="phn-kort phr-kort-dempet">
          <h2 className="phr-undertittel">Ingen runder ennå</h2>
          <p className="phn-forklar">Snittscoren kommer når du har registrert en runde. GolfBox-runder hentes automatisk når du har funnet deg i turneringsresultatene.</p>
          <div className="phn-knapper"><Link className="phn-knapp pri" href={regHref}>Registrer runde</Link></div>
        </section>
      ) : (
        <>
          <div className="phr-grid phr-to">
            <div>
              <Snittkort o={o} />
              <PerPar o={o} />
            </div>
            <div>
              <Rundeliste runder={p.modell.runder} detalj={detalj} />
            </div>
          </div>
          <div className="phr-festet"><Link className="phn-knapp pri phr-knapp-stor" href={regHref}>Registrer runde</Link></div>
          <PH18MerStatistikk modell={p.modell} />
        </>
      )}
    </div>
  );
}
