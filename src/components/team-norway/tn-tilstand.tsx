import type { ReactNode } from "react";

import s from "./tn-skall.module.css";
import t from "./tn-tilstand.module.css";

/**
 * Laster og feil for Team Norway, i skallet. Fasit: tilstandene i
 * docs/design-system/utkast-tn/felles/tn.js (tilstandsflate).
 * Ingen «use client» og ingen klientimport her: loading.tsx kan bruke modulen
 * uten egen klientbunt (gotchas §Bygg og drift). Skallet er et skjelett uten
 * meny, fordi brukeren og gruppen ikke er hentet ennå.
 */
export function TnSkallSkjelett({ children }: { children: ReactNode }) {
  return (
    <div className={s.skall}>
      <div className={s.meny} aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className={t.menyStrek} />)}
      </div>
      <div className={s.kolonne}>
        <div className={s.topplinje} aria-hidden="true"><span className={t.toppStrek} /></div>
        <main className={s.innhold}>
          {/* Skrå-toppen som skjelett: navy flate med skråkutt og rød kant, og innholdet over kanten. */}
          <div className={t.toppSkjelett} aria-hidden="true" />
          <div className={t.overKanten}>{children}</div>
        </main>
      </div>
    </div>
  );
}

export function TnLaster({ tekst }: { tekst: string }) {
  return (
    <div className={t.blokk} aria-busy="true" aria-live="polite">
      <div className={t.lasterKort}>
        <p className={t.forklar}>{tekst}</p>
        <i className={t.skjelett} style={{ height: 96 }} />
      </div>
      <i className={t.skjelett} style={{ height: 64 }} />
      <i className={t.skjelett} style={{ height: 64 }} />
    </div>
  );
}

/** Feilkort: merket «Feil», hva som ikke kunne hentes, at ingenting er endret, og «Prøv igjen». */
export function TnFeilkort({ tittel, tekst = "Ingenting er endret. Sjekk nettet og prøv igjen.", handling }: { tittel: string; tekst?: string; handling: ReactNode }) {
  return (
    <div className={t.blokk}>
      <div className={t.kort} role="alert">
        <span className={t.merke}><i />Feil</span>
        <b className={t.undertittel}>{tittel}</b>
        <p className={t.forklar}>{tekst}</p>
        <div>{handling}</div>
      </div>
    </div>
  );
}

export function TnProvIgjen({ onClick }: { onClick: () => void }) {
  return <button type="button" className={t.knapp} onClick={onClick}>Prøv igjen</button>;
}

/** Tom tilstand: sier hva som mangler, og det neste steget. Samme kort som Feilkort. */
export function TnTomtilstand({ tittel, tekst, handling }: { tittel: string; tekst: string; handling?: ReactNode }) {
  return (
    <div className={t.blokk}>
      <div className={t.kort}>
        <b className={t.undertittel}>{tittel}</b>
        <p className={t.forklar}>{tekst}</p>
        {handling ? <div>{handling}</div> : null}
      </div>
    </div>
  );
}
