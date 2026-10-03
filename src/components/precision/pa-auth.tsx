"use client";

/**
 * Precision Athletics — innloggingsflatene (AU-01–AU-03).
 * Portert fra Claude Design 7d7c2994, ui_kits/konto/screens/AU-01-03.jsx
 * (Box, H) og components/forms/{FormField,Checkbox,Segmented}.jsx.
 * Stilene ligger i precision-komponenter.css / precision-athletics.css.
 */
import Image from "next/image";
import { cloneElement, isValidElement, useId, useState, type InputHTMLAttributes, type ReactElement, type ReactNode } from "react";
import { Check, CircleAlert, Eye, EyeOff } from "lucide-react";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import "@/styles/precision-a21.css";
import { Ikon } from "./pa";

const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

/** Side med logo øverst og en smal søyle, som `Box` i AU-01-03.jsx. */
export function AuthBoks({ children, maks = 440, tema }: { children: ReactNode; maks?: number; tema?: "night" }) {
  return <div className="pa-root pa-auth" data-design="precision-athletics" data-theme={tema} style={{ minHeight: "100dvh", background: "var(--surface-page)", color: "var(--text-primary)", font: "var(--type-body)" }}>
    <main className="pa-auth__side" style={{ ["--auth-maks" as string]: `${maks}px` }}>
      <div className="pa-auth__kolonne">
        <Image src={tema === "night" ? "/logos/ak-golf-laas-hq-pa-morkt.svg" : "/logos/ak-golf-laas-hq.svg"} alt="AK Golf HQ" width={69} height={22} priority style={{ height: 22, width: "auto", alignSelf: "flex-start" }} />
        {children}
      </div>
    </main>
  </div>;
}

/** Overskrift (`H` i AU-01-03.jsx): kicker, tittel 26/600, undertekst. */
export function AuthHode({ kicker, tittel, under }: { kicker?: string; tittel: string; under?: ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {kicker && <span className="kicker">{kicker}</span>}
    <h1 style={{ margin: 0, font: "600 26px/1.2 var(--font-sans)", color: "var(--text-primary)", textWrap: "balance" }}>{tittel}</h1>
    {under && <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-secondary)", textWrap: "pretty" }}>{under}</p>}
  </div>;
}

/** De fire stegene i AU-02: Pakke · Konto og samtykke · Sjekk e-post · Betaling. */
export const AU02_STEG = ["Pakke", "Konto og samtykke", "Sjekk e-post", "Betaling"] as const;
export function Fremdrift({ steg }: { steg: 0 | 1 | 2 | 3 }) {
  return <ol aria-label="Steg i registreringen" style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: 0, padding: 0, listStyle: "none" }}>
    {AU02_STEG.map((s, i) => <li key={s} aria-current={i === steg ? "step" : undefined} style={{ display: "inline-flex", gap: 6, alignItems: "center", font: "var(--type-meta)", color: i <= steg ? "var(--text-primary)" : "var(--text-muted)" }}>
      <span style={{ width: 20, height: 20, borderRadius: 999, display: "grid", placeItems: "center", background: i < steg ? "var(--primary)" : "transparent", color: i < steg ? "var(--text-on-primary)" : "inherit", border: "1px solid var(--border-ink)", font: "600 11px/1 var(--font-mono)" }}>{i + 1}</span>
      {s.toUpperCase()}
    </li>)}
  </ol>;
}

/** `FormField` fra designet: etikett, PÅKREVD, hjelpetekst og feilmelding koblet til feltet. */
export function FormFelt({ label, hint, error, required, children }: { label: string; hint?: string; error?: string; required?: boolean; children: ReactElement<InputHTMLAttributes<HTMLInputElement>> | ReactNode }) {
  const fid = useId();
  const hid = `${fid}-hint`, eid = `${fid}-err`;
  const described = [hint && hid, error && eid].filter(Boolean).join(" ") || undefined;
  const barn = isValidElement<InputHTMLAttributes<HTMLInputElement>>(children)
    ? cloneElement(children, { id: children.props.id ?? fid, "aria-describedby": described, "aria-invalid": error ? true : undefined, "aria-required": required || undefined, required: children.props.required ?? required })
    : children;
  return <div className={cx("pa-field", "pa-formfield", error && "pa-formfield--error")}>
    <div className="pa-formfield__top"><label className="pa-field__label" htmlFor={fid}>{label}</label>{required && <span className="pa-formfield__req">PÅKREVD</span>}</div>
    {hint && <span id={hid} className="pa-field__hint">{hint}</span>}
    <div className="pa-formfield__control">{barn}</div>
    {error && <span id={eid} className="pa-formfield__error" role="alert"><Ikon icon={CircleAlert} size={16} /><span>{error}</span></span>}
  </div>;
}

export function TekstInput({ mono, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }) {
  return <div className={cx("pa-control", mono && "pa-control--mono", rest["aria-invalid"] && "pa-control--error", className)}><input {...rest} /></div>;
}

/** Passordfelt med «Vis passord»-knapp (fra SignupV2). Knappen har 44 px treffmål. */
export function PassordInput({ className, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [vis, setVis] = useState(false);
  return <div className={cx("pa-control", rest["aria-invalid"] && "pa-control--error", className)}>
    <input {...rest} type={vis ? "text" : "password"} />
    <button type="button" onClick={() => setVis((v) => !v)} aria-label={vis ? "Skjul passord" : "Vis passord"} aria-pressed={vis}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 44, height: 44, margin: "0 -12px 0 0", border: 0, background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}>
      <Ikon icon={vis ? EyeOff : Eye} size={18} />
    </button>
  </div>;
}

export function Avkryss({ label, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode }) {
  return <label className={cx("pa-check", rest.disabled && "pa-check--disabled")} style={{ alignItems: "flex-start" }}>
    <input type="checkbox" {...rest} />
    <span className="pa-check__box" style={{ marginTop: 1 }}><Ikon icon={Check} size={14} /></span>
    <span>{label}</span>
  </label>;
}

export function Segmentert<T extends string>({ valg, verdi, onChange, etikett, full }: { valg: ReadonlyArray<{ verdi: T; navn: string }>; verdi: T; onChange: (v: T) => void; etikett: string; full?: boolean }) {
  return <div role="group" aria-label={etikett} className={cx("pa-seg", "pa-seg--lg", full && "pa-seg--full")}>
    {valg.map((o) => <button key={o.verdi} type="button" className="pa-seg__opt" aria-pressed={verdi === o.verdi} onClick={() => onChange(o.verdi)}>{o.navn}</button>)}
  </div>;
}
