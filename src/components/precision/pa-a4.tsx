"use client";

/**
 * Grunnkomponenter for bolk A4 (Kalender og booking) i Precision Athletics.
 * Nye, ikke i pa.tsx (unngår filkonflikt med parallelle bolker). Stilklassene
 * (pa-tabs, pa-sheet, pa-control, pa-table, pa-kv, pa-dialog, pa-switch, pa-filter)
 * finnes fra før i precision-komponenter.css; denne fila gir React-oppførsel
 * (åpen/lukk, tastatur, aria) oppå dem. Egne A4-spesifikke stiler ligger i
 * precision-a4.css.
 */
import { useEffect, useId, type ReactNode } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Ikon, Knapp } from "./pa";

const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

/* ---------- Faner (klient-state) ---------- */

export function Faner({ faner, valgt, onEndre }: {
  faner: ReadonlyArray<{ verdi: string; navn: string; antall?: number }>;
  valgt: string;
  onEndre: (v: string) => void;
}) {
  return (
    <div className="pa-tabs" role="tablist">
      {faner.map((f) => (
        <button key={f.verdi} type="button" role="tab" aria-selected={f.verdi === valgt} className="pa-tab" onClick={() => onEndre(f.verdi)}>
          {f.navn}
          {f.antall != null && <span className="pa-tab__count">{f.antall}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Faner som ekte lenker (server-rendret navigasjon) ---------- */

export function FanerLenker({ faner }: { faner: ReadonlyArray<{ href: string; navn: string; aktiv: boolean }> }) {
  return (
    <nav className="pa-tabs" aria-label="Faner">
      {faner.map((f) => (
        <Link key={f.href} href={f.href} aria-current={f.aktiv ? "page" : undefined} className="pa-tab" data-fanelenke="">
          {f.navn}
        </Link>
      ))}
    </nav>
  );
}

/* ---------- Ark (bunn/side-sheet) ---------- */

export function Ark({ open, onClose, kicker, title, footer, children }: {
  open: boolean; onClose: () => void; kicker?: ReactNode; title?: ReactNode; footer?: ReactNode; children?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="pa-sheet-layer">
      <div className="pa-sheet-scrim" onClick={onClose} />
      <div className="pa-sheet pa-sheet--auto" role="dialog" aria-modal="true">
        <span className="pa-sheet__grip" aria-hidden />
        <div className="pa-sheet__head">
          <div className="pa-sheet__titles">
            {kicker && <span className="kicker">{kicker}</span>}
            {title && <span className="pa-sheet__title">{title}</span>}
          </div>
          <button type="button" className="pa-iconbtn" aria-label="Lukk" onClick={onClose}><Ikon icon={X} size={20} name="x" /></button>
        </div>
        <div className="pa-sheet__body">{children}</div>
        {footer && <div className="pa-sheet__foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Dialog (bekreftelse) ---------- */

export function Dialogboks({ open, onClose, title, footer, children }: {
  open: boolean; onClose: () => void; title?: ReactNode; footer?: ReactNode; children?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="pa-sheet-layer">
      <div className="pa-sheet-scrim" onClick={onClose} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div className="pa-dialog" role="alertdialog" aria-modal="true">
          <div className="pa-dialog__head"><span className="pa-dialog__title">{title}</span></div>
          <div className="pa-dialog__body">{children}</div>
          {footer && <div className="pa-dialog__foot">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- Skjemafelt ---------- */

export function Skjemafelt({ label, hint, error, required, children }: {
  label: string; hint?: string; error?: string; required?: boolean; children: ReactNode;
}) {
  return (
    <div className={cx("pa-field", error && "pa-formfield--error")}>
      <div className="pa-formfield__top">
        <span className="pa-field__label">{label}</span>
        {required && <span className="pa-formfield__req">Påkrevd</span>}
      </div>
      <div className="pa-formfield__control">{children}</div>
      {error ? <span className="pa-formfield__error">{error}</span> : hint ? <span className="pa-field__hint">{hint}</span> : null}
    </div>
  );
}

// «a4-input» ligger direkte på select/input (ikke i en .pa-control-innpakning):
// en innpakning med kant «spiser» 2 px av høyden barnet fyller med height:100%,
// som gjorde treffmålet 42 px i stedet for 44. Samme utseende, én boks.
export function Nedtrekk({ value, onChange, options, disabled }: {
  value: string; onChange: (v: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <select className="a4-input" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function Tekstfelt({ value, onChange, mono, placeholder, inputMode, defaultValue }: {
  value?: string; onChange?: (v: string) => void; mono?: boolean; placeholder?: string;
  inputMode?: "text" | "numeric"; defaultValue?: string;
}) {
  return (
    <input
      className={cx("a4-input", mono && "a4-input--mono")}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      inputMode={inputMode}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
    />
  );
}

export function TekstOmrade({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: "100%", boxSizing: "border-box", minHeight: 96, padding: 12, borderRadius: "var(--radius)", border: "1px solid var(--border-control)", background: "var(--surface-card)", color: "var(--text-primary)", font: "var(--type-body)", resize: "vertical" }}
    />
  );
}

/* ---------- Bryter ---------- */

export function Bryter({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  const id = useId();
  return (
    <label className="pa-switch" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="pa-switch__track" aria-hidden />
      {label}
    </label>
  );
}

/* ---------- Nøkkelverdi ---------- */

export function Nokkelverdi({ items }: { items: ReadonlyArray<readonly [string, ReactNode, { mono?: boolean; hint?: string }?]> }) {
  return (
    <dl className="pa-kv">
      {items.filter(([, v]) => v !== undefined).map(([k, v, opt], i) => (
        <div className="pa-kv__row" key={k + i}>
          <dt className="pa-kv__k">{k}</dt>
          <dd className={cx("pa-kv__v", opt?.mono && "is-mono")}>
            {v ?? "—"}
            {opt?.hint && <span className="pa-kv__hint">{opt.hint}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Segmentert filter ---------- */

export function SegmentFilter({ label, value, options, onChange }: {
  label: string; value: string; options: ReadonlyArray<{ value: string; label: string; count?: number }>; onChange: (v: string) => void;
}) {
  return (
    <div className="pa-filter" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" className="pa-filter__opt" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          <span className="pa-filter__label">{o.label}</span>
          {o.count != null && <span className="pa-filter__count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Enkel tabell ---------- */

export type TabellKolonne<R> = { key: string; label: string; mono?: boolean; align?: "left" | "right"; render: (row: R) => ReactNode };

export function Tabell<R extends { id: string }>({ caption, columns, rows, onSelect, selectedId, tomTekst }: {
  caption?: string; columns: ReadonlyArray<TabellKolonne<R>>; rows: readonly R[]; onSelect?: (id: string) => void; selectedId?: string | null; tomTekst?: string;
}) {
  return (
    <div className="pa-table">
      <table>
        {caption && <caption className="pa-table__caption">{caption}</caption>}
        <thead><tr>{columns.map((c) => <th key={c.key} className={c.align === "right" ? "is-right" : undefined}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 && (
            <tr className="pa-table__empty"><td colSpan={columns.length}>{tomTekst ?? "—"}</td></tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className={onSelect ? "is-click" : undefined} aria-selected={r.id === selectedId || undefined} onClick={() => onSelect?.(r.id)}>
              {columns.map((c) => (
                <td key={c.key} data-label={c.label} className={cx(c.mono && "is-mono", c.align === "right" && "is-right")}>{c.render(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Layout ---------- */

export function Side({ max = 1200, children }: { max?: number; children: ReactNode }) {
  return <div style={{ maxWidth: max, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>{children}</div>;
}

export function Kolonner({ mal, gap = 16, children }: { mal: string; gap?: number; children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: mal, gap, minWidth: 0, alignItems: "start" }}>{children}</div>;
}

export function Stabel({ gap = 16, children }: { gap?: number; children: ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap, minWidth: 0 }}>{children}</div>;
}

export function Kort({ pad = 20, gap = 12, children }: { pad?: number; gap?: number; children: ReactNode }) {
  return <div className="pa-card" style={{ padding: pad, display: "flex", flexDirection: "column", gap, minWidth: 0 }}>{children}</div>;
}

/* ---------- Sidehode med handlinger ---------- */

export function SideHode({ kicker, title, sub, actions }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="pa-pagehead">
      <div className="pa-pagehead__row">
        <div className="pa-pagehead__text">
          {kicker && <span className="kicker pa-pagehead__kicker">{kicker}</span>}
          <h1 className="pa-pagehead__title">{title}</h1>
          {sub && <p className="pa-pagehead__sub">{sub}</p>}
        </div>
        {actions && <div className="pa-pagehead__actions">{actions}</div>}
      </div>
    </div>
  );
}

/* ---------- Tilstander (data / tom / laster / feil) ---------- */

export type Tilstand = "data" | "tom" | "laster" | "feil";

export function Tilstandsvakt({ tilstand, laster, feil, children }: {
  tilstand: Tilstand; laster: string; feil: { title: string; text: string; code: string }; children: ReactNode;
}) {
  if (tilstand === "laster") {
    return <div className="pa-state pa-state--loading"><span className="pa-state__text">{laster}</span></div>;
  }
  if (tilstand === "feil") {
    return (
      <div className="pa-state pa-state--error">
        <span className="pa-state__title">{feil.title}</span>
        <span className="pa-state__text">{feil.text}</span>
        <span className="pa-state__code pa-state__mono">{feil.code}</span>
      </div>
    );
  }
  return <>{children}</>;
}

export function Aksestripe({ akse }: { akse?: string | null }) {
  const farge = akse ? `var(--axis-${akse})` : "var(--border-hairline)";
  return <span aria-hidden style={{ width: 3, alignSelf: "stretch", background: farge, flex: "none" }} />;
}

export { Knapp };
