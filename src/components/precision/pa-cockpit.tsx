/**
 * Grunnkomponenter for Cockpit (AG-01) i Precision Athletics, portert fra
 * Claude Design 7d7c2994, ui_kits/agencyos/screens/AG-cockpit.jsx (runde 25):
 * Sec, Row, Lbl, tellerkortene og dagsstripen 05–22. Stilene ligger i
 * src/styles/precision-a6.css og virker bare innenfor .pa-root.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { Meta } from "./pa";

/** Seksjonskort: kicker til venstre, meta til høyre (designets Sec). */
export function Seksjon({ kicker, meta, label, children }: { kicker: string; meta?: ReactNode; label?: string; children: ReactNode }) {
  return <section aria-label={label ?? kicker} className="pa-card pa-a6-sek">
    <div className="pa-a6-sek__hode"><span className="kicker pa-a6-sek__kicker">{kicker}</span>{meta != null && <Meta>{meta}</Meta>}</div>
    {children}
  </section>;
}

/** Dempet brødtekst i en seksjon (designets Muted). */
export function Dempet({ children }: { children: ReactNode }) {
  return <p className="pa-a6-dempet">{children}</p>;
}

/** Listerad med hårlinje over alle unntatt første (designets Row). */
export function Rad({ children, forste, mal = "minmax(0,1fr) auto", min = 56 }: { children: ReactNode; forste: boolean; mal?: string; min?: number }) {
  return <div role="listitem" className="pa-a6-rad" data-forste={forste || undefined} style={{ gridTemplateColumns: mal, minHeight: min }}>{children}</div>;
}

/** Lenkerad med samme oppsett som Rad (hele raden er treffmålet). */
export function RadLenke({ href, children, forste, mal = "minmax(0,1fr) auto", min = 56, label }: { href: string; children: ReactNode; forste: boolean; mal?: string; min?: number; label?: string }) {
  return <Link role="listitem" href={href} aria-label={label} className="pa-a6-rad pa-a6-rad--lenke" data-forste={forste || undefined} style={{ gridTemplateColumns: mal, minHeight: min }}>{children}</Link>;
}

/** Tittel med metalinje under (designets Lbl). */
export function Etikett({ a, sub }: { a: ReactNode; sub?: ReactNode }) {
  return <span className="pa-a6-etikett"><span className="pa-a6-etikett__a">{a}</span>{sub != null && <Meta>{sub}</Meta>}</span>;
}

/** Tellerkort øverst i Cockpit. Tallet er «—» når det ikke finnes. */
export function Teller({ href, tall, label }: { href: string; tall: ReactNode; label: string }) {
  return <Link href={href} role="listitem" className="pa-card pa-card--interactive pa-a6-teller">
    <span className="pa-a6-teller__tall">{tall}</span><span className="pa-a6-teller__label">{label}</span>
  </Link>;
}

export function Tellere({ children }: { children: ReactNode }) {
  return <div role="list" aria-label="Tellere" className="pa-a6-tellere">{children}</div>;
}

/** Dagsstripen 05–22: ferdige økter grafitt-grå, resten primær, nålinje. */
export function Dagsstripe({ okter, naaPst }: { okter: ReadonlyArray<{ id: string; fra: number; til: number; ferdig: boolean }>; naaPst: number | null }) {
  return <>
    <div aria-hidden className="pa-a6-stripe">
      {okter.map((o) => <span key={o.id} className="pa-a6-stripe__okt" data-ferdig={o.ferdig || undefined} style={{ left: `${o.fra}%`, width: `${Math.max(0.6, o.til - o.fra)}%` }} />)}
      {naaPst != null && <span className="pa-a6-stripe__naa" style={{ left: `calc(${naaPst}% - 1px)` }} />}
    </div>
    <div className="pa-a6-stripe__akse" aria-hidden>{["05", "09", "13", "17", "22"].map((h) => <Meta key={h}>{h}</Meta>)}</div>
  </>;
}
