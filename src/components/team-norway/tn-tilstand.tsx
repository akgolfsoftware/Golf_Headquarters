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

/** Tom tilstand: sier hva som mangler, og det neste steget. Samme kort som Feilkort.
 *  `innfelt` når tilstanden står inne i et kort som allerede finnes (samme kort som innholdet). */
export function TnTomtilstand({ tittel, tekst, handling, innfelt = false }: { tittel: string; tekst: string; handling?: ReactNode; innfelt?: boolean }) {
  const innhold = (
    <>
      <b className={t.undertittel}>{tittel}</b>
      <p className={t.forklar}>{tekst}</p>
      {handling ? <div>{handling}</div> : null}
    </>
  );
  if (innfelt) return <div className={t.innfelt}>{innhold}</div>;
  return (
    <div className={t.blokk}>
      <div className={t.kort}>{innhold}</div>
    </div>
  );
}

/**
 * Formen lasteren tar, så den ligner skjermen som kommer (utkast 2, «Tom, laster og feil»:
 * grå streker i kortets form, ingen spinner over hele siden).
 *   hjem   – hovedkort og to kort ved siden av
 *   liste  – rader med initialer og to linjer
 *   iup    – stripe med fire tall, fanerad og to kort
 *   kort   – rutenett av kort, flere kolonner på brede skjermer
 *   tabell – en flate med rader
 *   plan   – periodebånd og uker
 */
export type TnLasterForm = "hjem" | "liste" | "iup" | "kort" | "tabell" | "plan";

const STREKER = [70, 100, 85, 60];

function Kortskjelett({ linjer = 3 }: { linjer?: number }) {
  return (
    <div className={t.lasterKort}>
      {STREKER.slice(0, linjer).map((b, i) => <i key={i} className={t.strek} style={{ width: `${b}%` }} />)}
    </div>
  );
}

function Rader({ antall }: { antall: number }) {
  return (
    <div className={t.lasterKort}>
      {Array.from({ length: antall }, (_, i) => (
        <span key={i} className={t.rad}>
          <i className={t.sirkel} />
          <span className={t.radLinjer}><i className={t.strek} style={{ width: `${STREKER[i % 4]}%` }} /><i className={t.strek} style={{ width: "40%" }} /></span>
        </span>
      ))}
    </div>
  );
}

/** Laster i skjermens form. Ren server-markup: brukes direkte i loading.tsx. */
export function TnLasterSkjerm({ tekst, form }: { tekst: string; form: TnLasterForm }) {
  return (
    <div className={t.blokk} aria-busy="true" aria-live="polite">
      <p className={`${t.forklar} ${t.lasterTekst}`}>{tekst}</p>
      {form === "hjem" ? (
        <div className={t.rutenettHjem}><Kortskjelett linjer={4} /><Kortskjelett /><Kortskjelett /></div>
      ) : form === "liste" ? (
        <Rader antall={6} />
      ) : form === "iup" ? (
        <>
          <div className={t.stripe}>{[0, 1, 2, 3].map((i) => <i key={i} className={t.skjelett} style={{ height: 64 }} />)}</div>
          <div className={t.faner}>{[0, 1, 2, 3, 4].map((i) => <i key={i} className={t.strek} />)}</div>
          <div className={t.rutenett}><Kortskjelett linjer={4} /><Kortskjelett /></div>
        </>
      ) : form === "kort" ? (
        <div className={t.rutenett}><Kortskjelett /><Kortskjelett /><Kortskjelett /></div>
      ) : form === "tabell" ? (
        <div className={t.lasterKort}>
          {Array.from({ length: 8 }, (_, i) => <i key={i} className={t.strek} style={{ width: `${STREKER[i % 4]}%` }} />)}
        </div>
      ) : (
        <>
          <i className={t.skjelett} style={{ height: 40 }} />
          <div className={t.rutenett}><Kortskjelett /><Kortskjelett /><Kortskjelett /></div>
        </>
      )}
    </div>
  );
}
