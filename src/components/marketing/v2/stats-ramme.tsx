"use client";

/**
 * AK Golf HQ v2 — delt STATS-RAMME (retning C «Presis», mørk-først).
 * Chrome + maler for de 45 offentlige DataGolf-rutene under /stats. Bygger på
 * MRamme (samme toppnav/footer som resten av markedssidene) og legger til en
 * stats-egen subnav for hovedfamiliene. To delte innholdsmaler dekker nesten
 * alle 45 rutene:
 *   - StatsListe  — hero + søk/filter-chips + kort-/rad-liste (children)
 *   - StatsDetalj — hero + KPI-rad + DataTabell (m/ mobilKort) + seksjoner
 * Data hentes alltid server-side i page.tsx og sendes inn som props — denne
 * fila eier kun presentasjon. Rutespesifikke visualiseringer (radar, trend,
 * kalkulatorer) komponeres av page.tsx selv, med StatsDetalj som ramme rundt.
 */
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps, KpiFlis, DataTabell, TomTilstand, FilterChips } from "@/components/v2";
import type { DataTabellColumn, DataTabellRow } from "@/components/v2";
import { MRamme, Eyebrow, HeroT, SeksT, Lede, Seksjon, useMobile } from "./marked-ramme";

export { useMobile };

/* ── Familienav ───────────────────────────────────────── */
export type StatsFamilie = "spillere" | "turneringer" | "klubber" | "baner" | "leaderboards" | "verktoy";

const STATS_NAV: { id: StatsFamilie; l: string; href: string; icon: string }[] = [
  { id: "spillere", l: "Spillere", href: "/stats/spillere", icon: "users" },
  { id: "turneringer", l: "Turneringer", href: "/turneringer", icon: "trophy" },
  { id: "klubber", l: "Klubber", href: "/stats/klubber", icon: "building-2" },
  { id: "baner", l: "Baner", href: "/stats/baner", icon: "flag" },
  { id: "leaderboards", l: "Leaderboards", href: "/stats/leaderboards", icon: "list" },
  { id: "verktoy", l: "Verktøy", href: "/stats/verktoy", icon: "settings" },
];

export function StatsSubnav({ mobile, aktiv }: { mobile: boolean; aktiv?: StatsFamilie }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: mobile ? "12px 22px" : "14px 64px",
        borderBottom: `1px solid ${T.border}`,
        overflowX: "auto",
      }}
    >
      <Link
        href="/stats"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontFamily: T.mono,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.mut,
          textDecoration: "none",
          flex: "none",
          marginRight: 4,
        }}
      >
        Stats
      </Link>
      {STATS_NAV.map((n) => {
        const on = aktiv === n.id;
        return (
          <Link
            key={n.id}
            href={n.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              flex: "none",
              fontFamily: T.ui,
              fontSize: 13,
              fontWeight: 600,
              color: on ? T.fg : T.fg2,
              background: on ? T.panel2 : "transparent",
              border: `1px solid ${on ? T.borderS : "transparent"}`,
              borderRadius: 9999,
              padding: "7px 14px",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            <Icon name={n.icon} size={13} style={{ color: on ? T.lime : T.mut }} />
            {n.l}
          </Link>
        );
      })}
    </div>
  );
}

export function StatsRamme({
  mobile,
  aktiv,
  children,
}: {
  mobile: boolean;
  aktiv?: StatsFamilie;
  children: ReactNode;
}) {
  return (
    <MRamme mobile={mobile} aktiv="stats">
      <StatsSubnav mobile={mobile} aktiv={aktiv} />
      {children}
    </MRamme>
  );
}

/* ── Søkefelt (stats-egen — Inndata i skjema.tsx krever label/defaultValue) ── */
export function StatsSok({
  value,
  onChange,
  placeholder = "Søk…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
      <Icon
        name="search"
        size={15}
        style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.mut }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          appearance: "none",
          background: T.panel2,
          border: `1px solid ${T.borderS}`,
          borderRadius: 9999,
          padding: "11px 16px 11px 40px",
          fontFamily: T.ui,
          fontSize: 13.5,
          color: T.fg,
          outline: "none",
        }}
      />
    </div>
  );
}

/* ── StatsListe — hero + søk/filter-chips + liste/grid (children) ───── */
export interface StatsListeProps {
  mobile: boolean;
  eyebrow: string;
  tittel: ReactNode;
  tittelEm?: string;
  lede?: ReactNode;
  sok?: { value: string; onChange: (v: string) => void; placeholder?: string };
  filter?: { items: string[]; active: string[]; onToggle: (x: string) => void };
  meta?: ReactNode;
  tom?: { icon?: string; title: ReactNode; sub?: ReactNode };
  children: ReactNode;
}
export function StatsListe({ mobile, eyebrow, tittel, tittelEm, lede, sok, filter, meta, tom, children }: StatsListeProps) {
  return (
    <>
      <Seksjon mobile={mobile}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <HeroT mobile={mobile} em={tittelEm}>
          {tittel}
        </HeroT>
        {lede && <Lede style={{ marginTop: 22 }}>{lede}</Lede>}
        {(sok || filter) && (
          <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: 12, marginTop: 28 }}>
            {sok && <StatsSok value={sok.value} onChange={sok.onChange} placeholder={sok.placeholder} />}
            {filter && <FilterChips items={filter.items} active={filter.active} onToggle={filter.onToggle} />}
          </div>
        )}
        {meta && (
          <div style={{ marginTop: 16, fontFamily: T.mono, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut }}>
            {meta}
          </div>
        )}
      </Seksjon>
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        {tom ? <Kort><TomTilstand icon={tom.icon} title={tom.title} sub={tom.sub} /></Kort> : children}
      </Seksjon>
    </>
  );
}

/* ── StatsDetalj — hero + KPI-rad + DataTabell (m/ mobilKort) + seksjoner ── */
export interface StatsDetaljKpi {
  label: ReactNode;
  value: number | string;
  delta?: string;
  dir?: "up" | "down";
}
export interface StatsDetaljTabell {
  tittel?: ReactNode;
  columns: DataTabellColumn[];
  rows: DataTabellRow[];
  sortKey?: string;
  sortDir?: "asc" | "desc";
}
export interface StatsDetaljProps {
  mobile: boolean;
  eyebrow: string;
  tittel: ReactNode;
  tittelEm?: string;
  sub?: ReactNode;
  action?: ReactNode;
  kpis?: StatsDetaljKpi[];
  tabell?: StatsDetaljTabell;
  children?: ReactNode;
}
export function StatsDetalj({ mobile, eyebrow, tittel, tittelEm, sub, action, kpis, tabell, children }: StatsDetaljProps) {
  return (
    <>
      <Seksjon mobile={mobile}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <HeroT mobile={mobile} em={tittelEm}>
              {tittel}
            </HeroT>
            {sub && <Lede style={{ marginTop: 18 }}>{sub}</Lede>}
          </div>
          {action}
        </div>

        {kpis && kpis.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr 1fr" : `repeat(${kpis.length}, 1fr)`,
              gap: T.gap,
              marginTop: 32,
            }}
          >
            {kpis.map((k, i) => (
              <KpiFlis key={i} label={k.label} value={k.value} delta={k.delta} dir={k.dir} />
            ))}
          </div>
        )}
      </Seksjon>

      {tabell && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <Kort eyebrow={tabell.tittel} pad={mobile ? "16px" : "20px 22px"}>
            <DataTabell columns={tabell.columns} rows={tabell.rows} sortKey={tabell.sortKey} sortDir={tabell.sortDir} mobilKort />
          </Kort>
        </Seksjon>
      )}

      {children}
    </>
  );
}

/* ── StatsSeksjon — delt seksjonsoverskrift for ekstra innhold under StatsDetalj/StatsListe ── */
export function StatsSeksjon({
  mobile,
  eyebrow,
  tittel,
  tittelEm,
  action,
  children,
  style,
}: {
  mobile: boolean;
  eyebrow?: string;
  tittel: ReactNode;
  tittelEm?: string;
  action?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Seksjon mobile={mobile} style={{ paddingTop: 0, ...style }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          {eyebrow && <Caps style={{ marginBottom: 10 }}>{eyebrow}</Caps>}
          <SeksT mobile={mobile} em={tittelEm}>
            {tittel}
          </SeksT>
        </div>
        {action}
      </div>
      {children}
    </Seksjon>
  );
}
