/**
 * Precision Athletics — grunnkomponenter for bolk A2 (Stall og spiller).
 * Egen fil (ikke pa.tsx) for å unngå at parallelle bolk-grener redigerer samme
 * linjer, jf. docs/planer/agencyos-portering-natt-2026-09-28.md. Bruker bare
 * klassene som allerede finnes i src/styles/precision-komponenter.css
 * (`.pa-control`, `.pa-seg`, `.pa-field`, `.pa-iconbtn`) — ingen ny CSS-fil.
 */
import type { ComponentProps } from "react";
import { Search, X, type LucideIcon } from "lucide-react";
import { Ikon } from "./pa";

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
  const valgt = options.findIndex((o) => o.id === value);
  return <div className="pa-seg" role="radiogroup" aria-label={label} data-single-select>
    {options.map((o, index) => <button key={o.id} type="button" className="pa-seg__opt" role="radio" aria-checked={value === o.id}
      tabIndex={index === (valgt < 0 ? 0 : valgt) ? 0 : -1}
      onClick={() => { if (value !== o.id) onChange(o.id); }}
      onKeyDown={(event) => {
        let neste: number;
        switch (event.key) {
          case "ArrowRight": case "ArrowDown": neste = (index + 1) % options.length; break;
          case "ArrowLeft": case "ArrowUp": neste = (index - 1 + options.length) % options.length; break;
          case "Home": neste = 0; break;
          case "End": neste = options.length - 1; break;
          default: return;
        }
        event.preventDefault();
        event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[neste]?.focus();
        if (options[neste].id !== value) onChange(options[neste].id);
      }}>{o.label}</button>)}
  </div>;
}

export function IkonKnapp({ icon, name, ...rest }: { icon: LucideIcon; name?: string } & Omit<ComponentProps<"button">, "children">) {
  return <button type="button" className="pa-iconbtn" {...rest}><Ikon icon={icon} name={name} size={20} /></button>;
}
