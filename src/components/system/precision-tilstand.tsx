import type { ReactNode } from "react";
import { FlateRamme, type FlateLenke } from "@/components/flater/FlateRamme";

/**
 * SY-01 systemsidene i nytt design (utkast-flater/gfgk-system.html, utkast 1 15.10.2026):
 * 404, 500, vedlikehold, ikke tilgang og frakoblet. Navnet og props er beholdt, så alle
 * not-found-, error- og tilstandssider bytter design samtidig.
 *
 * Avvik mot utkastet: tegningens faste referanse («7F3A-21C9 · 15.10 14:22»), klokkeslett for
 * vedlikehold og «3 slag venter» er demodata og vises ikke. Referansen er Next sin digest når
 * den finnes. Ekte telefon og e-post beholdes.
 */
export function PrecisionTilstand({
  kicker,
  tittel,
  tekst,
  kode,
  linjer,
  hjelpeliste,
  primar,
  primarKnapp,
  sekundar,
  toppLenke,
  iSkall,
  ikon,
  barn,
}: {
  /** Stort tegn øverst: «404», «500», «403» eller et ord som «Vedlikehold». */
  kicker: string;
  tittel: string;
  tekst: string;
  /** Referanse til support (mono, liten). */
  kode?: string;
  linjer?: { label: string; verdi: string }[];
  /** Ikke i bruk lenger, beholdt for kompatibilitet. */
  linjeTittel?: string;
  hjelpeliste?: string[];
  primar?: { label: string; href: string };
  primarKnapp?: { label: string; onClick: () => void };
  sekundar?: { label: string; href: string };
  toppLenke?: FlateLenke;
  /** Siden vises inni et annet skall (PlayerHQ, AgencyOS, marked): ingen egen topplinje. */
  iSkall?: boolean;
  /** Ikon i stedet for kode, som frakoblet. */
  ikon?: ReactNode;
  barn?: ReactNode;
}) {
  const tall = /^\d{3}$/.test(kicker);
  return (
    <FlateRamme skall="system" toppLenke={toppLenke} iSkall={iSkall}>
      <div className="sys">
        {ikon ?? <span className={tall ? "kode" : "kode rolig"}>{kicker}</span>}
        <h1>{tittel}</h1>
        <p className="ingress">{tekst}</p>
        {hjelpeliste && hjelpeliste.length > 0 && (
          <ul className="hjelp-liste">
            {hjelpeliste.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        )}
        {linjer && linjer.length > 0 && (
          <dl className="dl" style={{ width: "100%", maxWidth: 420 }}>
            {linjer.map((l) => (
              <div key={l.label}>
                <dt>{l.label}</dt>
                <dd>{l.verdi}</dd>
              </div>
            ))}
          </dl>
        )}
        {(primar || primarKnapp || sekundar) && (
          <div className="knapper">
            {primarKnapp && (
              <button type="button" className="knapp pri" onClick={primarKnapp.onClick}>
                {primarKnapp.label}
              </button>
            )}
            {primar && (
              <a href={primar.href} className="knapp pri">
                {primar.label}
              </a>
            )}
            {sekundar && (
              <a href={sekundar.href} className="knapp sek">
                {sekundar.label}
              </a>
            )}
          </div>
        )}
        {barn}
        {kode && <span className="ref">{kode}</span>}
      </div>
    </FlateRamme>
  );
}
