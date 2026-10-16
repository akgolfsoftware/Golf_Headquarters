import type { ReactNode } from "react";
import Link from "next/link";
import "@/styles/precision-athletics.css";

/**
 * Felles Precision-ramme for SY-01. Tegningens demokoder (klokkeslett,
 * «3 endringer venter», falsk feilreferanse) brukes ikke. Produkttekst
 * og ekte telefon/e-post beholdes.
 */
export function PrecisionTilstand({
  kicker,
  tittel,
  tekst,
  kode,
  linjer,
  linjeTittel = "Virker fortsatt",
  primar,
  primarKnapp,
  sekundar,
  barn,
}: {
  kicker: string;
  tittel: string;
  tekst: string;
  kode?: string;
  linjer?: { label: string; verdi: string }[];
  linjeTittel?: string;
  primar?: { label: string; href: string };
  primarKnapp?: { label: string; onClick: () => void };
  sekundar?: { label: string; href: string };
  barn?: ReactNode;
}) {
  return (
    <div className="pa-root au-ramme" data-design="precision-athletics">
      <div className="au-boks au-boks--bred">
        <Link href="/" className="au-logo">AK Golf HQ</Link>
        <header>
          <p className="au-kicker">{kicker}</p>
          <h1>{tittel}</h1>
          <p>{tekst}</p>
        </header>
        {kode ? <p className="au-kodeboks">{kode}</p> : null}
        {linjer && linjer.length > 0 ? (
          <div className="au-tips">
            <p className="au-kicker">{linjeTittel}</p>
            <ul className="au-linjer">
              {linjer.map((linje) => (
                <li key={linje.label}>
                  <span>{linje.label}</span>
                  <span>{linje.verdi}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {barn}
        {(primar || primarKnapp || sekundar) && (
          <div className="au-handlinger">
            {primarKnapp ? (
              <button type="button" className="pa-btn pa-btn--primary" onClick={primarKnapp.onClick}>
                {primarKnapp.label}
              </button>
            ) : null}
            {primar ? (
              <Link href={primar.href} className="pa-btn pa-btn--primary">{primar.label}</Link>
            ) : null}
            {sekundar ? (
              <Link href={sekundar.href} className="pa-btn pa-btn--secondary">{sekundar.label}</Link>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
