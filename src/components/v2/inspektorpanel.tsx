"use client";

/**
 * Inspektørpanel — fasitens master–detalj-mønster for AgencyOS-desktop
 * (A2, Anders 16.08.2026 — beslutninger.md §PP-A, PP-plan §5/§2 rotårsak 2).
 *
 * Fasit: designsystem/paper/fase2/agencyos/w4-base.css — `.app.med-panel`
 * (64px rail · 1fr stage · 380px panel), `.panel`/`.phead`/`.pbody`/`.pfoot`/
 * `.blokk`/`.linje`, samt panel-innholdet i agencyos-godkjenninger.html
 * («Køen i tall») og agencyos-planbibliotek.html (malinspektøren).
 *
 * Rutefasit.md §Claude-følelsen: «detaljpanelet til høyre (380 px) forklarer
 * og avgjør valgt sak — master–detalj-varianter fyller panelet, aldri en ny
 * side.» Panelet er desktop-only (skjult under lg/1024px); mobil beholder
 * liste→detalj uendret.
 *
 * Bruk:
 *   <MasterDetalj panel={valgt ? <Inspektorpanel …/> : <InspektorTom …/>}>
 *     …masterlista (klikk på rad → setValgtId)…
 *   </MasterDetalj>
 * `useInspektorSynlig()` sier om panelet vises (≥1024px) — bruk den til å
 * velge inn i panelet på desktop og navigere til detaljruten på mobil.
 */

import { useEffect, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { TL } from "@/lib/v2/train-lock";

import { Caps } from "./core";

/** ≥1024px (Tailwind lg) — samme brekkpunkt som `hidden lg:block` i MasterDetalj. */
export function useInspektorSynlig(): boolean {
  const [synlig, setSynlig] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const oppdater = () => setSynlig(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return synlig;
}

export interface MasterDetaljProps extends HTMLAttributes<HTMLDivElement> {
  /** Innholdet i inspektørkolonnen (Inspektorpanel eller InspektorTom). */
  panel: ReactNode;
  children: ReactNode;
  /** `data-paper-slug` o.l. — sendes videre til rot-elementet. */
  [dataAttr: `data-${string}`]: unknown;
}

/**
 * Master–detalj-grid — fasitens `.app.med-panel`-kolonner uten rail:
 * `minmax(0,1fr) 380px` på ≥lg, én kolonne under. Master-kolonnen har
 * `min-width: 0` (innboks-gotchaen 10.08: uten den sprenger nowrap-innhold
 * kolonnen forbi 1fr). Panel-kolonnen strekkes til radhøyden slik at sticky
 * i panelet får rom å bevege seg i.
 */
export function MasterDetalj({ panel, children, className, style, ...rest }: MasterDetaljProps) {
  return (
    <div
      {...rest}
      className={`grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] ${className ?? ""}`.trim()}
      style={{ gap: 20, minWidth: 0, ...style }}
    >
      <div style={{ minWidth: 0 }}>{children}</div>
      <div className="hidden lg:block" style={{ minWidth: 0 }}>
        {panel}
      </div>
    </div>
  );
}

/** Sticky-posisjon under en ev. dokument-sticky toppbar (gotcha: --ak-topbar-h). */
const STICKY_TOP = "calc(var(--ak-topbar-h, 0px) + 16px)";

export interface InspektorpanelProps {
  /** Paneltittel — fasitens `.phead .t`. */
  tittel: string;
  /** Valgfri status/tag til høyre i hodet (fasitens `.phead .tag`). */
  tag?: ReactNode;
  /** Panelinnhold — fasitens `.pbody` (blokker, KPI-er, linjer). */
  children?: ReactNode;
  /**
   * Bunnhandlinger — fasitens `.pfoot`. Barn deler bredden likt
   * (`.pfoot .btn{ flex:1 }` i fasiten).
   */
  fot?: ReactNode;
  ariaLabel?: string;
}

export function Inspektorpanel({ tittel, tag, children, fot, ariaLabel }: InspektorpanelProps) {
  return (
    <aside
      aria-label={ariaLabel ?? tittel}
      style={{
        position: "sticky",
        top: STICKY_TOP,
        maxHeight: "calc(100vh - var(--ak-topbar-h, 0px) - 32px)",
        display: "flex",
        flexDirection: "column",
        background: TL.elev,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          borderBottom: `1px solid ${TL.hair}`,
        }}
      >
        <span
          style={{
            fontFamily: TL.font.sans,
            fontSize: 13.5,
            fontWeight: 600,
            color: TL.text,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {tittel}
        </span>
        {tag && <span style={{ marginLeft: "auto", flex: "none" }}>{tag}</span>}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: 16,
          minWidth: 0,
        }}
      >
        {children}
      </div>

      {fot && (
        <div
          style={{
            flex: "none",
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "1fr",
            gap: 8,
            padding: "12px 16px",
            borderTop: `1px solid ${TL.hair}`,
            background: TL.dock,
          }}
        >
          {fot}
        </div>
      )}
    </aside>
  );
}

/** Tom tilstand for inspektørkolonnen — når ingenting er valgt i masterlista. */
export function InspektorTom({ tittel, tekst }: { tittel: string; tekst: string }) {
  return (
    <aside
      aria-label={tittel}
      style={{
        position: "sticky",
        top: STICKY_TOP,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        textAlign: "center",
        padding: "40px 24px",
        background: TL.dock,
        border: `1px dashed ${TL.hair}`,
        borderRadius: TL.radius.card,
        minWidth: 0,
      }}
    >
      <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 14.5, fontWeight: 600, color: TL.text }}>{tittel}</h3>
      <p style={{ margin: 0, maxWidth: "36ch", fontFamily: TL.font.sans, fontSize: 12.5, lineHeight: 1.55, color: TL.mute }}>
        {tekst}
      </p>
    </aside>
  );
}

/** KPI-flis i panelet — fasitens `.kpi` inne i `.kpirad`. */
export function InspektorKpi({ label, verdi, sub }: { label: string; verdi: string; sub: string }) {
  return (
    <div style={{ background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: 12, minWidth: 0 }}>
      <Caps size={9}>{label}</Caps>
      <div style={{ fontFamily: TL.font.mono, fontSize: 22, fontWeight: 600, color: TL.text, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
        {verdi}
      </div>
      <div style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute, marginTop: 2, overflowWrap: "anywhere" }}>{sub}</div>
    </div>
  );
}

/** Blokk med flab-etikett — fasitens `.blokk` + `.flab`. */
export function InspektorBlokk({ label, children, style }: { label: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0, ...style }}>
      <Caps size={9}>{label}</Caps>
      {children}
    </div>
  );
}

/** Nøkkel/verdi-linje — fasitens `.linje` (verdi i mono til høyre). */
export function InspektorLinje({ label, verdi }: { label: ReactNode; verdi: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, minWidth: 0 }}>
      <span
        style={{
          fontFamily: TL.font.sans,
          fontSize: 12.5,
          color: TL.text,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute, flex: "none", fontVariantNumeric: "tabular-nums" }}>
        {verdi}
      </span>
    </div>
  );
}
