"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { TnLogo, type TnBunnValg, type TnMenyGruppe } from "./core";
import { initialer } from "./initialer";
import { TnIkon } from "./tn-ikon";
import s from "./tn-skall.module.css";

/**
 * Mobil under 900 px: navy topplinje og hvit bunnmeny med fire valg pluss «Mer».
 * «Mer» åpner et navy ark med alle menygruppene og brukeren nederst.
 * Fasit: docs/design-system/utkast-tn/felles/tn.css og tn.js (pakke 1 grunnmur).
 * Bunnmenyen er fast og legger til `--ak-cookie-h` og safe-area (gotchas §UI).
 * Bevegelse (Skrå-drakten): arket glir opp når det åpnes og ned igjen samme vei når det lukkes.
 * Med «reduser bevegelse» åpner og lukker det uten animasjon.
 * Avvik:
 *   - Topplinjen har ingen varselbjelle: Team Norway har ingen varsler ennå.
 *   - Brukeren står nederst i Mer-arket, fordi topplinjen ikke har plass til navnet.
 */
export function TnRailMobil({ grupper, bunn, brukerNavn, rolle, orgNavn, orgUndertittel }: { grupper: TnMenyGruppe[]; bunn: TnBunnValg[]; brukerNavn: string; rolle: string; orgNavn: string; orgUndertittel: string }) {
  const [ark, setArk] = useState<"lukket" | "apen" | "lukker">("lukket");
  const mer = ark === "apen";
  const arkId = useId();
  const merRef = useRef<HTMLButtonElement>(null);
  const fastAktiv = bunn.some((b) => b.aktiv);

  // Lukker med animasjon ut, eller straks når brukeren har slått på «reduser bevegelse».
  const lukk = useCallback((fokus: boolean) => {
    const redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setArk(redusert ? "lukket" : "lukker");
    if (fokus) merRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!mer) return;
    const tast = (e: KeyboardEvent) => {
      if (e.key === "Escape") lukk(true);
    };
    window.addEventListener("keydown", tast);
    return () => window.removeEventListener("keydown", tast);
  }, [mer, lukk]);

  return (
    <>
      <div className={s.topplinje}>
        <TnLogo hoyde={28} prioritet paaMork />
        <span className={s.toppOrg}><b>{orgNavn}</b><span>{orgUndertittel}</span></span>
      </div>

      {ark !== "lukket" ? (
        <nav
          id={arkId}
          aria-label="Alle sider"
          className={s.ark}
          data-tilstand={ark}
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget && ark === "lukker") setArk("lukket");
          }}
        >
          <div className={s.arkTopp}>
            <span className={s.arkTittel}>Meny</span>
            <button type="button" className={s.ikonknapp} onClick={() => lukk(true)} aria-label="Lukk meny">
              <TnIkon navn="lukk" />
            </button>
          </div>
          {grupper.map((g) => (
            <div key={g.id}>
              <span className={s.gruppe}>{g.label}</span>
              {g.punkter.map((p) => (
                <a key={p.href} href={p.href} className={s.lenke} aria-current={p.aktiv ? "page" : undefined} onClick={() => setArk("lukket")}>{p.label}</a>
              ))}
            </div>
          ))}
          <Link href="/team-norway/profil" className={s.bruker} aria-label={`Min profil, ${brukerNavn}`} onClick={() => setArk("lukket")}>
            <span className={s.avatar} aria-hidden="true">{initialer(brukerNavn)}</span>
            <span><span className={s.brukerNavn}>{brukerNavn}</span><span className={s.brukerRolle}>{rolle}</span></span>
          </Link>
        </nav>
      ) : null}

      <nav aria-label="Hovedvalg" className={s.bunnmeny}>
        {bunn.map((b) => (
          <a key={b.href} href={b.href} className={s.bunnvalg} data-aktiv={b.aktiv && !mer ? "" : undefined} aria-current={b.aktiv && !mer ? "page" : undefined}>
            <TnIkon navn={b.ikon} />
            <span>{b.label}</span>
          </a>
        ))}
        <button ref={merRef} type="button" className={s.bunnvalg} onClick={() => (mer ? lukk(false) : setArk("apen"))} aria-expanded={mer} aria-controls={arkId} data-aktiv={mer || !fastAktiv ? "" : undefined}>
          <TnIkon navn="mer" />
          <span>Mer</span>
        </button>
      </nav>
    </>
  );
}
