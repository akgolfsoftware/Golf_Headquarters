/**
 * Precision Athletics — grunnkomponenter for bolk A5 («Mer»: Tester, Grupper,
 * Gruppeanalyse, Økonomi, Oppsett). Legges her og ikke i pa.tsx for å unngå
 * konflikt med de andre bolkene som porterer samtidig.
 *
 * Klassene (pa-tabs, pa-table, pa-sheet, pa-field, pa-kv, pa-alert, pa-switch)
 * kommer fra src/styles/precision-komponenter.css (Claude Design 7d7c2994).
 * Denne fila bygger bare React-komponenter oppå dem.
 */
import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from "react";
import { useId } from "react";
import { ChevronDown, TriangleAlert, Info, CircleCheck } from "lucide-react";
import { Ikon } from "./pa";

const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

/* ---------- Faner (tabs) ---------- */
export type Fane = { value: string; label: string; count?: number };
export function Faner({ faner, value, onChange }: { faner: readonly Fane[]; value: string; onChange: (v: string) => void }) {
  return <div role="tablist" className="pa-tabs" aria-label="Faner">
    {faner.map((f) => <button key={f.value} type="button" role="tab" aria-selected={f.value === value} className="pa-tab" style={{ minWidth: 44 }} onClick={() => onChange(f.value)}>
      {f.label}{f.count != null && <span className="pa-tab__count">{f.count}</span>}
    </button>)}
  </div>;
}

/* ---------- Tabell (blir kortrader under 760px, via @container i CSS) ---------- */
export type Kolonne<R> = { key: string; label: string; render: (r: R) => ReactNode; mono?: boolean; align?: "left" | "right"; lead?: boolean };
export function Tabell<R extends { id: string }>({ caption, columns, rows, onSelect, selected, tomTekst = "Ingen rader." }: {
  caption?: string; columns: ReadonlyArray<Kolonne<R>>; rows: readonly R[]; onSelect?: (r: R) => void; selected?: string | null; tomTekst?: string;
}) {
  return <div className="pa-table">
    <table>
      {caption && <caption className="pa-table__caption">{caption}</caption>}
      <thead><tr>{columns.map((c) => <th key={c.key} className={c.align === "right" ? "is-right" : undefined}>{c.label}</th>)}</tr></thead>
      <tbody>
        {rows.length === 0 && <tr className="pa-table__empty"><td colSpan={columns.length}>{tomTekst}</td></tr>}
        {rows.map((r) => <tr key={r.id} className={onSelect ? "is-click" : undefined} aria-selected={selected === r.id || undefined}
          onClick={onSelect ? () => onSelect(r) : undefined} tabIndex={onSelect ? 0 : undefined}
          onKeyDown={onSelect ? (e) => { if (e.key === "Enter") onSelect(r); } : undefined}>
          {columns.map((c, i) => <td key={c.key} data-label={c.label} className={cx(c.mono && "is-mono", c.align === "right" && "is-right", i === 0 && c.lead !== false && "pa-table__lead")}>
            {c.render(r)}
          </td>)}
        </tr>)}
      </tbody>
    </table>
  </div>;
}

/* ---------- Ark (sheet/dialog) ---------- */
export function Ark({ open, onClose, kicker, tittel, footer, children }: {
  open: boolean; onClose: () => void; kicker?: string; tittel: string; footer?: ReactNode; children: ReactNode;
}) {
  if (!open) return null;
  return <div className="pa-sheet-layer" role="presentation">
    <div className="pa-sheet-scrim" onClick={onClose} />
    <div className="pa-sheet pa-sheet--right" role="dialog" aria-modal="true" aria-label={tittel}>
      <div className="pa-sheet__head">
        <div className="pa-sheet__titles">
          {kicker && <span className="kicker">{kicker}</span>}
          <span className="pa-sheet__title">{tittel}</span>
        </div>
        <button type="button" className="pa-iconbtn" aria-label="Lukk" onClick={onClose}>×</button>
      </div>
      <div className="pa-sheet__body">{children}</div>
      {footer && <div className="pa-sheet__foot">{footer}</div>}
    </div>
  </div>;
}

/* ---------- Felt (input) ---------- */
export function Felt({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return <label className="pa-field">
    <span className="pa-field__label">{label}</span>
    {children}
    {error ? <span className="pa-field__hint pa-field__hint--error">{error}</span> : hint ? <span className="pa-field__hint">{hint}</span> : null}
  </label>;
}
export function TekstFelt(props: InputHTMLAttributes<HTMLInputElement>) {
  return <span className="pa-control"><input {...props} /></span>;
}
export function ValgFelt({ options, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { options: ReadonlyArray<{ value: string; label: string } | string> }) {
  return <span className="pa-select"><span className="pa-control">
    <select {...props}>{options.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}</select>
  </span><Ikon icon={ChevronDown} size={16} /></span>;
}
export function Bryter({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId();
  return <label className="pa-switch" htmlFor={id}><input id={id} type="checkbox" {...props} /><span className="pa-switch__track" />{label}</label>;
}

/* ---------- Nøkkelverdi ---------- */
export function Nokkelverdi({ items, kolonner = 1 }: { items: ReadonlyArray<readonly [string, ReactNode, string?]>; kolonner?: 1 | 2 }) {
  return <dl className={cx("pa-kv", kolonner === 2 && "pa-kv--grid")} style={kolonner === 2 ? ({ "--kv-cols": 2 } as React.CSSProperties) : undefined}>
    {items.map(([k, v, hint], i) => <div className="pa-kv__row" key={i}>
      <dt className="pa-kv__k">{k}</dt>
      <dd className="pa-kv__v">{v}{hint && <span className="pa-kv__hint">{hint}</span>}</dd>
    </div>)}
  </dl>;
}

/* ---------- Inline varsel ---------- */
const ALERT_IKON = { info: Info, warn: TriangleAlert, ok: CircleCheck, signal: TriangleAlert } as const;
export function InlineVarsel({ tone = "info", tittel, children }: { tone?: "info" | "warn" | "ok" | "signal"; tittel?: string; children: ReactNode }) {
  return <div className={`pa-alert pa-alert--${tone}`} role={tone === "signal" || tone === "warn" ? "alert" : undefined}>
    <Ikon icon={ALERT_IKON[tone]} size={18} />
    <span>{tittel && <span className="pa-alert__title">{tittel} </span>}{children}</span>
  </div>;
}

/* ---------- Kort med overskrift ---------- */
export function KortHode({ tittel, aside }: { tittel: ReactNode; aside?: ReactNode }) {
  return <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
    <span style={{ font: "600 15px/1.3 var(--font-sans)" }}>{tittel}</span>
    {aside && <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{aside}</span>}
  </div>;
}
export function Kort({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div className="pa-card" style={{ padding: 16, gap: 12, ...style }}>{children}</div>;
}
