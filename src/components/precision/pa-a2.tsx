/**
 * Precision Athletics — grunnkomponenter for bolk A2 (Stall og spiller).
 * Egen fil (ikke pa.tsx) for å unngå at parallelle bolk-grener redigerer samme
 * linjer, jf. docs/planer/agencyos-portering-natt-2026-09-28.md. Bruker bare
 * klassene som allerede finnes i src/styles/precision-komponenter.css
 * (`.pa-table`, `.pa-control`, `.pa-seg`, `.pa-field`) — ingen ny CSS-fil.
 */
import type { ComponentProps, ReactNode } from "react";
import { Search, X, type LucideIcon } from "lucide-react";
import { Ikon } from "./pa";

const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

export function Bolkoverskrift({ icon, tittel, antall, sub }: { icon: LucideIcon; tittel: string; antall: number; sub?: ReactNode }) {
  return <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <Ikon icon={icon} size={16} />
      <span style={{ font: "600 var(--fs-15)/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{tittel}</span>
    </span>
    <span className="kicker">{antall} {antall === 1 ? "SPILLER" : "SPILLERE"}</span>
    {sub && <span style={{ font: "var(--type-body-s)", color: "var(--text-muted)" }}>{sub}</span>}
  </div>;
}

export function Sokefelt({ value, onChange, placeholder = "Søk etter navn", label }: { value: string; onChange: (v: string) => void; placeholder?: string; label: string }) {
  return <label className="pa-field" style={{ flex: "1 1 240px", minWidth: 0, maxWidth: 420 }}>
    <span className="pa-sr">{label}</span>
    <span className="pa-control">
      <Ikon icon={Search} size={16} />
      {/* .pa-control er border-box: innholdshøyden er 2px lavere enn --control-h
          (border 1px topp/bunn). Under 1024 px skal treffmålet være minst 44 px
          (maal.mjs måler <input> sin egen boks) — dekk borderen med negativ margin
          i stedet for å endre den delte komponentstilen (precision-komponenter.css). */}
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ height: "calc(100% + 2px)", margin: "-1px 0" }} />
      {value && <button type="button" className="pa-iconbtn pa-iconbtn--sm" aria-label="Nullstill søk" onClick={() => onChange("")}><Ikon icon={X} size={14} /></button>}
    </span>
  </label>;
}

export function SegmentertValg<T extends string>({ value, options, onChange, label }: { value: T; options: readonly { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return <div className="pa-seg" role="group" aria-label={label}>
    {options.map((o) => <button key={o.id} type="button" className="pa-seg__opt" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{o.label}</button>)}
  </div>;
}

export type Kolonne<T> = {
  key: string;
  label: string;
  mono?: boolean;
  align?: "right";
  lead?: boolean;
  render: (rad: T) => ReactNode;
};

export function Tabell<T extends { id: string }>({ kolonner, rader, onVelg, tomTekst }: {
  kolonner: readonly Kolonne<T>[];
  rader: readonly T[];
  onVelg?: (rad: T) => void;
  tomTekst: string;
}) {
  return <div className="pa-table">
    <table>
      <thead><tr>{kolonner.map((k) => <th key={k.key} className={k.align === "right" ? "is-right" : undefined}>{k.label}</th>)}</tr></thead>
      <tbody>
        {rader.length === 0 && <tr className="pa-table__empty"><td colSpan={kolonner.length}>{tomTekst}</td></tr>}
        {rader.map((r) => {
          const klikkbar = !!onVelg;
          return <tr
            key={r.id}
            className={klikkbar ? "is-click" : undefined}
            tabIndex={klikkbar ? 0 : undefined}
            role={klikkbar ? "button" : undefined}
            onClick={klikkbar ? () => onVelg(r) : undefined}
            onKeyDown={klikkbar ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onVelg(r); } } : undefined}
          >
            {kolonner.map((k) => <td key={k.key} data-label={k.label} className={cx(k.mono && "is-mono", k.align === "right" && "is-right", k.lead && "pa-table__lead")}>{k.render(r)}</td>)}
          </tr>;
        })}
      </tbody>
    </table>
  </div>;
}

export function Kicker({ children }: { children: ReactNode }) {
  return <span className="kicker">{children}</span>;
}

export function IkonKnapp({ icon, name, ...rest }: { icon: LucideIcon; name?: string } & Omit<ComponentProps<"button">, "children">) {
  return <button type="button" className="pa-iconbtn" {...rest}><Ikon icon={icon} name={name} size={20} /></button>;
}
