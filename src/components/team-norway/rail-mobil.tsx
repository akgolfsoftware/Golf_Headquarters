"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TnLogo, type TnBunnValg, type TnMenyGruppe } from "./core";
import { TnIkon } from "./tn-ikon";
import s from "./tn-skall.module.css";

/**
 * Mobil under 900 px: navy topplinje og hvit bunnmeny med fire valg pluss «Mer».
 * «Mer» åpner et navy ark med alle menygruppene og brukeren nederst.
 * Fasit: docs/design-system/utkast-tn/felles/tn.css og tn.js (pakke 1 grunnmur).
 * Bunnmenyen er fast og legger til `--ak-cookie-h` og safe-area (gotchas §UI).
 * Avvik:
 *   - Topplinjen har ingen varselbjelle: Team Norway har ingen varsler ennå.
 *   - Brukeren står nederst i Mer-arket, fordi topplinjen ikke har plass til navnet.
 */
export function TnRailMobil({ grupper, bunn, brukerNavn, rolle, orgNavn, orgUndertittel }: { grupper: TnMenyGruppe[]; bunn: TnBunnValg[]; brukerNavn: string; rolle: string; orgNavn: string; orgUndertittel: string }) {
  const [mer, setMer] = useState(false);
  const arkId = useId();
  const merRef = useRef<HTMLButtonElement>(null);
  const fastAktiv = bunn.some((b) => b.aktiv);

  useEffect(() => {
    if (!mer) return;
    const lukk = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMer(false);
        merRef.current?.focus();
      }
    };
    window.addEventListener("keydown", lukk);
    return () => window.removeEventListener("keydown", lukk);
  }, [mer]);

  return (
    <>
      <div className={s.topplinje}>
        <TnLogo hoyde={28} prioritet paaMork />
        <span className={s.toppOrg}><b>{orgNavn}</b><span>{orgUndertittel}</span></span>
      </div>

      {mer ? (
        <nav id={arkId} aria-label="Alle sider" className={s.ark}>
          <div className={s.arkTopp}>
            <span className={s.arkTittel}>Meny</span>
            <button type="button" className={s.ikonknapp} onClick={() => { setMer(false); merRef.current?.focus(); }} aria-label="Lukk meny">
              <TnIkon navn="lukk" />
            </button>
          </div>
          {grupper.map((g) => (
            <div key={g.id}>
              <span className={s.gruppe}>{g.label}</span>
              {g.punkter.map((p) => (
                <a key={p.href} href={p.href} className={s.lenke} aria-current={p.aktiv ? "page" : undefined} onClick={() => setMer(false)}>{p.label}</a>
              ))}
            </div>
          ))}
          <div className={s.bruker}>
            <span className={s.avatar} aria-hidden="true">{initialer(brukerNavn)}</span>
            <span><span className={s.brukerNavn}>{brukerNavn}</span><span className={s.brukerRolle}>{rolle}</span></span>
          </div>
        </nav>
      ) : null}

      <nav aria-label="Hovedvalg" className={s.bunnmeny}>
        {bunn.map((b) => (
          <a key={b.href} href={b.href} className={s.bunnvalg} data-aktiv={b.aktiv && !mer ? "" : undefined} aria-current={b.aktiv && !mer ? "page" : undefined}>
            <TnIkon navn={b.ikon} />
            <span>{b.label}</span>
          </a>
        ))}
        <button ref={merRef} type="button" className={s.bunnvalg} onClick={() => setMer((v) => !v)} aria-expanded={mer} aria-controls={arkId} data-aktiv={mer || !fastAktiv ? "" : undefined}>
          <TnIkon navn="mer" />
          <span>Mer</span>
        </button>
      </nav>
    </>
  );
}

export function initialer(navn: string) {
  return navn.split(/\s+/).filter(Boolean).slice(0, 2).map((d) => d[0]?.toUpperCase() ?? "").join("") || "?";
}
