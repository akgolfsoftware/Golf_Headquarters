/**
 * Felles biter for pakke 5 «Runder» (PH-RD-01 til PH-RD-09 og PH-18): tilbakelenke, score-merke,
 * scorekort i to rader à ni hull, SG-stolper og lastetilstand.
 * Fasit: docs/design-system/utkast-playerhq/runder.html.
 * Avvik:
 *   - Ingen egne avvik; avvikene per skjerm står i PH18Runder, PHRD01VelgNiva, PH08RundeLive, PH09RegistrerRunde og PHRD08RundeFerdig.
 *
 * Ingen "use client": loading.tsx importerer RunderLaster herfra.
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { formaterFortegn } from "@/lib/format-tall";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-runder.css";
export { RunderLaster } from "./PHRunderLaster";

/** «+2», «−1», «E». */
export function tilParTekst(d: number): string {
  return d === 0 ? "E" : d > 0 ? `+${d}` : `−${Math.abs(d)}`;
}

/** SG med fortegn og én desimal: «+0,4», «−1,1», «0,0», «—». */
export function sgEn(v: number | null | undefined): string {
  return formaterFortegn(v, 1);
}

export function Tilbake({ href, tekst }: { href: string; tekst: string }) {
  return (
    <Link className="phr-tilbake" href={href}>
      <ChevronLeft className="phn-ikon" aria-hidden />
      {tekst}
    </Link>
  );
}

/** Ring = under par, firkant = over par, dobbel = to eller flere. Ingen farge (farge betyr akse). */
export function SkMerke({ slag, par }: { slag: number; par: number }) {
  const d = slag - par;
  const k = d <= -2 ? "e" : d === -1 ? "b" : d === 1 ? "bo" : d >= 2 ? "db" : "";
  return <span className={`phr-sk ${k}`}>{slag}</span>;
}

export type ScorekortHull = { nr: number; par: number; score: number; putter: number | null };

function Halvdel({ hull, navn }: { hull: ScorekortHull[]; navn: string }) {
  const sum = (f: (h: ScorekortHull) => number) => hull.reduce((s, h) => s + f(h), 0);
  const harPutter = hull.every((h) => h.putter != null);
  return (
    <table className="phr-sktab" aria-label={`Scorekort, hull ${hull[0]?.nr ?? ""} til ${hull[hull.length - 1]?.nr ?? ""}`}>
      <thead>
        <tr><th scope="col">Hull</th>{hull.map((h) => <th scope="col" key={h.nr}>{h.nr}</th>)}<th scope="col">{navn}</th></tr>
      </thead>
      <tbody>
        <tr className="par"><td>Par</td>{hull.map((h) => <td key={h.nr}>{h.par}</td>)}<td>{sum((h) => h.par)}</td></tr>
        <tr className="score"><td>Score</td>{hull.map((h) => <td key={h.nr}><SkMerke slag={h.score} par={h.par} /></td>)}<td>{sum((h) => h.score)}</td></tr>
        <tr className="par"><td>Putter</td>{hull.map((h) => <td key={h.nr}>{h.putter ?? "—"}</td>)}<td>{harPutter ? sum((h) => h.putter ?? 0) : "—"}</td></tr>
      </tbody>
    </table>
  );
}

/** Scorekortet bryter i rader à ni hull, så det aldri ruller sidelengs. */
export function Scorekort({ hull }: { hull: ScorekortHull[] }) {
  const ut = hull.filter((h) => h.nr <= 9);
  const inn = hull.filter((h) => h.nr > 9);
  const brutto = hull.reduce((s, h) => s + h.score, 0);
  const par = hull.reduce((s, h) => s + h.par, 0);
  const harPutter = hull.length > 0 && hull.every((h) => h.putter != null);
  return (
    <div className="phr-scorekort">
      {ut.length > 0 && <Halvdel hull={ut} navn="Ut" />}
      {inn.length > 0 && <Halvdel hull={inn} navn="Inn" />}
      <div className="phr-sk-sum">
        <span>Brutto <b>{brutto}</b> ({tilParTekst(brutto - par)})</span>
        <span>Putter <b>{harPutter ? hull.reduce((s, h) => s + (h.putter ?? 0), 0) : "—"}</b></span>
      </div>
      <div className="phr-sk-forklar">
        <span><span className="phr-sk b">3</span>Birdie</span>
        <span><span className="phr-sk bo">5</span>Bogey</span>
        <span><span className="phr-sk db">6</span>Dobbel eller verre</span>
      </div>
    </div>
  );
}

export type SgRad = { navn: string; kode: string; v: number };

/** SG-stolper symmetriske rundt null (samme som Stats). Svakeste kategori er mørkest. */
export function SgListe({ rader }: { rader: SgRad[] }) {
  if (rader.length === 0) return null;
  const maks = Math.max(1.5, ...rader.map((r) => Math.abs(r.v)));
  const svak = rader.reduce((a, b) => (b.v < a.v ? b : a));
  return (
    <div className="phr-sg-liste">
      {rader.map((r) => {
        const w = Math.min(Math.abs(r.v) / maks, 1) * 50;
        return (
          <div key={r.kode} className={`phr-sgr${r === svak ? " svakest" : ""}`}>
            <span className="phr-sgn">{r.navn}<small>{r.kode}</small></span>
            <span className="phr-sgbar" aria-hidden><i className="null" /><span style={{ left: `${r.v < 0 ? 50 - w : 50}%`, width: `${w}%` }} /></span>
            <span className="phr-sgv">{sgEn(r.v)}</span>
          </div>
        );
      })}
    </div>
  );
}

export const SG_NAVN: Record<"OTT" | "APP" | "ARG" | "PUTT", string> = {
  OTT: "Utslag", APP: "Innspill", ARG: "Nærspill", PUTT: "Putting",
};


/** Feilflate i nytt design. Knappen er en lenke, så komponenten virker uten klientkode. */
export function RunderFeil({ tittel, tekst, href, kode }: { tittel: string; tekst: string; href: string; kode?: string }) {
  return (
    <section className="phn-kort" role="alert">
      <h1 className="phn-tittel" style={{ fontSize: 22 }}>{tittel}</h1>
      <p className="phn-forklar">{tekst}</p>
      {kode && <p className="phn-kilde">Feilkode {kode}</p>}
      <div className="phn-knapper"><Link className="phn-knapp sek" href={href}>Prøv igjen</Link></div>
    </section>
  );
}
