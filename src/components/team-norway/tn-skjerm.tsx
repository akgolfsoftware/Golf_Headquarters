import Link from "next/link";
import type { ReactNode } from "react";

import s from "./tn-skjerm.module.css";

/**
 * Innholdsblokker fra Claude Design «Team Norway App» (app/skall.css):
 * sidehode, tallrad, notis, seksjon og tabell. Skjermene setter bare innhold
 * inn her — ingen egne farger eller mål.
 */

export function TnSidehodeDS({ overlinje, tittel, ingress, handling }: { overlinje: string; tittel: string; ingress?: string; handling?: ReactNode }) {
  return (
    <header className={s.sidehode}>
      <div className={s.sidehodeTekst}>
        <p className={s.overlinje}>{overlinje}</p>
        <h1 className={s.tittel}>{tittel}</h1>
        {ingress ? <p className={s.ingress}>{ingress}</p> : null}
      </div>
      {handling ? <div className={s.handling}>{handling}</div> : null}
    </header>
  );
}

export function TnKnapp({ href, children, primar = false }: { href: string; children: ReactNode; primar?: boolean }) {
  return (
    <Link href={href} className={primar ? `${s.knapp} ${s.knappPrimar}` : s.knapp}>
      {children}
    </Link>
  );
}

export function TnTallrad({ tall }: { tall: Array<{ verdi: ReactNode; etikett: string }> }) {
  return (
    <div className={s.tallrad}>
      {tall.map((t) => (
        <div key={t.etikett} className={s.tall}>
          <div className={s.tallVerdi}>{t.verdi}</div>
          <div className={s.tallEtikett}>{t.etikett}</div>
        </div>
      ))}
    </div>
  );
}

export function TnNotis({ tittel, children }: { tittel?: string; children: ReactNode }) {
  return (
    <div className={s.notis}>
      {tittel ? <strong>{tittel} </strong> : null}
      {children}
    </div>
  );
}

export function TnSeksjonDS({ tittel, antall, forklaring, children }: { tittel: string; antall?: string; forklaring?: string; children: ReactNode }) {
  return (
    <section className={s.seksjon}>
      <div className={s.seksjonHode}>
        <h2>{tittel}</h2>
        {antall ? <span className={s.seksjonAntall}>{antall}</span> : null}
      </div>
      {forklaring ? <p className={s.seksjonForklaring}>{forklaring}</p> : null}
      {children}
    </section>
  );
}

export type TnTabellKolonne = { key: string; label: string; tall?: boolean };

/** Tabell som stables til kort under 900 px (etikett foran hver verdi). */
export function TnTabell({ caption, kolonner, rader }: { caption: string; kolonner: TnTabellKolonne[]; rader: Array<Record<string, ReactNode>> }) {
  return (
    <table className={s.tabell}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {kolonner.map((k) => (
            <th key={k.key} scope="col" className={k.tall ? s.tallKolonne : undefined}>{k.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rader.map((rad, i) => (
          <tr key={i}>
            {kolonner.map((k) => (
              <td key={k.key} data-etikett={k.label} className={k.tall ? s.tallKolonne : undefined}>{rad[k.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TnMerkelapp({ children, variant }: { children: ReactNode; variant?: "ok" | "vent" | "navy" }) {
  const klasse = variant === "ok" ? `${s.merkelapp} ${s.merkelappOk}` : variant === "vent" ? `${s.merkelapp} ${s.merkelappVent}` : variant === "navy" ? `${s.merkelapp} ${s.merkelappNavy}` : s.merkelapp;
  return <span className={klasse}>{children}</span>;
}

export function TnFotnote({ children }: { children: ReactNode }) {
  return <p className={s.fotnote}>{children}</p>;
}

export function TnKnapperad({ children }: { children: ReactNode }) {
  return <div className={s.knapperad}>{children}</div>;
}

/** Rad med paneler (kriterier e.l.) — hvert panel: overskrift, tittel, tekst og kildefot. */
export function TnPanelrad({ paneler }: { paneler: Array<{ hode: string; tittel: string; tekst: string; kilde?: string }> }) {
  return (
    <div className={s.paneler}>
      {paneler.map((p) => (
        <div key={p.tittel} className={s.panel}>
          <p className={s.panelHode}>{p.hode}</p>
          <p className={s.panelTittel}>{p.tittel}</p>
          <p className={s.panelTekst}>{p.tekst}</p>
          {p.kilde ? <div className={s.panelFot}><p className={s.kilde}>{p.kilde}</p></div> : null}
        </div>
      ))}
    </div>
  );
}

export function TnUkjent({ children = "Ukjent" }: { children?: ReactNode }) {
  return <span className={s.ukjent}>{children}</span>;
}
