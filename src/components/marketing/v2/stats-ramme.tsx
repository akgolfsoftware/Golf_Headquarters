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
import { Icon, Kort, Caps, KpiFlis, DataTabell, TomTilstand, FilterChips, StatusPill } from "@/components/v2";
import type { DataTabellColumn, DataTabellRow, StatusTone } from "@/components/v2";
import { MRamme, Eyebrow, HeroT, SeksT, Lede, Seksjon, useMobile } from "./marked-ramme";

export { useMobile };

/**
 * B-pakke: status først — hva er viktig på 5 sekunder.
 * Brukes på stats-hub, lister og detalj før innhold/CTA.
 */
export function StatsStatusBar({
  label,
  tone = "info",
  meta,
}: {
  label: string;
  tone?: StatusTone;
  meta?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 10,
        marginBottom: 18,
      }}
    >
      <StatusPill tone={tone}>{label}</StatusPill>
      {meta ? (
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: T.mut,
          }}
        >
          {meta}
        </span>
      ) : null}
    </div>
  );
}

/**
 * STATS_LEGACY_VARS — adapter for porterte (mlegacy) stats-komponenter
 * (StatsHistogram, StatsNorgeskart, pga-kategori-page m.fl.). De konsumerer
 * farge via TRE navnerom, alle overstyrt her til v2 sine mørke T-tokens
 * (src/lib/v2/tokens.ts):
 *   1) shadcn-trippel (--primary, --border, ...) via hsl(var(--x))
 *   2) stats-lokalt --s-* (--s-primary, --s-card, ...) via rå var(--s-x)
 *   3) DS-semantiske aliaser (--bg, --surface, --signal, --text, ...) — dette
 *      er navnerommet Tailwind-utilities (bg-card, text-primary,
 *      text-muted-foreground) faktisk går via (@theme inline i globals.css
 *      peker f.eks. --color-card på var(--surface), IKKE var(--card)) — sider
 *      som porteres med rene Tailwind-klasser (f.eks. turneringer/[slug]/
 *      statistikk) trenger derfor denne tredje gruppen, ikke bare (1)+(2).
 *
 * Satt som INLINE style (ikke en CSS-klasse) med vilje: en klasse-selector
 * (.stats-v2-scope) har samme spesifisitet som legacy sine :root-regler, så
 * hvem som vinner ville avhengt av CSS-chunk-rekkefølge — som Next.js ikke
 * garanterer på tvers av rute-spesifikke CSS-imports. Inline style vinner
 * alltid, uansett import-rekkefølge.
 */
const STATS_LEGACY_VARS = {
  colorScheme: "dark",
  // 1) shadcn-trippel (HSL-triple, konsumeres via hsl(var(--x)))
  "--background": "120 3.7% 5.3%", // T.bg
  "--foreground": "90 11.8% 93.3%", // T.fg
  "--card": "120 4.5% 8.6%", // T.panel
  "--card-foreground": "90 11.8% 93.3%",
  "--popover": "120 4.5% 8.6%",
  "--popover-foreground": "90 11.8% 93.3%",
  "--primary": "72.9 92.8% 61.8%", // T.lime
  "--primary-foreground": "120 3.7% 5.3%", // T.onLime
  "--accent": "72.9 92.8% 61.8%",
  "--accent-foreground": "120 3.7% 5.3%",
  "--secondary": "120 5% 7.8%", // T.panel2
  "--secondary-foreground": "90 11.8% 93.3%",
  "--muted": "120 5% 7.8%",
  "--muted-foreground": "90 3.4% 65.1%", // T.fg2
  "--destructive": "14.2 85.6% 59.2%", // T.down
  "--destructive-foreground": "0 0% 100%",
  "--warning": "41.9 78.9% 57.3%", // T.warn
  "--warning-foreground": "120 3.7% 5.3%",
  "--border": "0 0% 100% / 0.08", // T.border
  "--input": "0 0% 100% / 0.08",
  "--ring": "72.9 92.8% 61.8%",
  // 3) DS-semantiske aliaser (rå verdier — det Tailwind-utilities faktisk bruker)
  "--bg": T.bg,
  "--surface": T.panel,
  "--surface-2": T.panel2,
  "--surface-hover": T.panel3,
  "--border-strong": T.borderS,
  "--text": T.fg,
  "--text-2": T.fg2,
  "--text-muted": T.mut,
  "--text-faint": T.mut,
  "--signal": T.lime,
  "--on-signal": T.onLime,
  "--on-signal-fill": T.onLime,
  "--track": T.track,
  // 2) Stats-lokalt navnerom (rå verdier, konsumeres via var(--s-x))
  "--s-bg": T.bg,
  "--s-fg": T.fg,
  "--s-card": T.panel,
  "--s-primary": T.lime,
  "--s-primary-fg": T.onLime,
  "--s-secondary": T.panel2,
  "--s-accent": T.lime,
  "--s-accent-fg": T.onLime,
  "--s-muted": T.panel2,
  "--s-muted-fg": T.fg2,
  "--s-tier-college-bg": T.tierCollegeBg,
  "--s-tier-college-fg": T.forest,
  "--s-border": "rgba(255, 255, 255, 0.08)",
  "--s-border-strong": "rgba(255, 255, 255, 0.14)",
  "--s-shadow-sm": "0 1px 2px rgba(0, 0, 0, 0.28)",
  "--s-shadow-md": "0 2px 8px rgba(0, 0, 0, 0.36), 0 1px 2px rgba(0, 0, 0, 0.28)",
  "--s-shadow-lg": "0 12px 32px rgba(0, 0, 0, 0.44), 0 2px 6px rgba(0, 0, 0, 0.3)",
  "--s-shadow-hover": "0 8px 24px rgba(209, 248, 67, 0.16)",
  // --s-r-* (radius) er geometri, ikke tema — uendret fra kilden
  "--s-r-sm": "8px",
  "--s-r-md": "12px",
  "--s-r-lg": "16px",
  "--s-r-xl": "20px",
  "--s-r-2xl": "24px",
  background: "var(--s-bg)",
  color: "var(--s-fg)",
} as CSSProperties;

/**
 * StatsLegacyScope — se STATS_LEGACY_VARS. Bruk rundt children som
 * gjenbruker mlegacy-komponenter — ikke rundt rene v2-primitiver (de er
 * allerede hex-frie via T).
 */
export function StatsLegacyScope({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ ...STATS_LEGACY_VARS, ...style }}>
      {children}
    </div>
  );
}

/**
 * StatsLegacyShell — chrome for porterte mlegacy-stats-sider som beholder
 * server-fetching i page.tsx. page.tsx forblir en async Server Component;
 * den rendrede (server-side) JSX-en sendes inn som children hit (lovlig i
 * RSC — server-rendret markup kan sendes som children til en Client
 * Component). Denne komponenten eier kun mobile-deteksjon + StatsRamme +
 * StatsLegacyScope, så porting av en side blir: wrap return-JSX + fiks
 * CSS-importstien.
 */
export function StatsLegacyShell({ aktiv, children }: { aktiv?: StatsFamilie; children: ReactNode }) {
  const mobile = useMobile();
  return (
    <StatsRamme mobile={mobile} aktiv={aktiv}>
      <StatsLegacyScope>{children}</StatsLegacyScope>
    </StatsRamme>
  );
}

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
  /** B: status-linje over tittel (f.eks. «1 500 spillere · oppdatert i dag»). */
  status?: { label: string; tone?: StatusTone; meta?: string };
  sok?: { value: string; onChange: (v: string) => void; placeholder?: string };
  filter?: { items: string[]; active: string[]; onToggle: (x: string) => void };
  meta?: ReactNode;
  tom?: { icon?: string; title: ReactNode; sub?: ReactNode };
  children: ReactNode;
}
export function StatsListe({ mobile, eyebrow, tittel, tittelEm, lede, status, sok, filter, meta, tom, children }: StatsListeProps) {
  return (
    <>
      <Seksjon mobile={mobile}>
        <Eyebrow>{eyebrow}</Eyebrow>
        {status ? <StatsStatusBar label={status.label} tone={status.tone} meta={status.meta} /> : null}
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
  /** B: status først (5-sekunders lesning). */
  status?: { label: string; tone?: StatusTone; meta?: string };
  kpis?: StatsDetaljKpi[];
  tabell?: StatsDetaljTabell;
  children?: ReactNode;
}
export function StatsDetalj({ mobile, eyebrow, tittel, tittelEm, sub, action, status, kpis, tabell, children }: StatsDetaljProps) {
  return (
    <>
      <Seksjon mobile={mobile}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            {status ? <StatsStatusBar label={status.label} tone={status.tone} meta={status.meta} /> : null}
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
