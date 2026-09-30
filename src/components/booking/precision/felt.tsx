"use client";

/**
 * Skjemabiter for bookingen, portert fra Claude Design 7d7c2994
 * (components/forms/FormField.jsx, Input.jsx, Checkbox.jsx, display/KeyValue.jsx,
 * forms/Segmented.jsx, feedback/InlineAlert.jsx). Samme klassenavn og markup.
 */
import { cloneElement, isValidElement, useId, type InputHTMLAttributes, type ReactElement, type ReactNode } from "react";
import { Check, CircleAlert, Info, TriangleAlert } from "lucide-react";
import { Ikon } from "@/components/precision/pa";

export function Skjemafelt({ label, hint, error, required, optional, children }: {
  label: string; hint?: string; error?: string; required?: boolean; optional?: boolean; children: ReactElement<InputHTMLAttributes<HTMLInputElement>>;
}) {
  const fid = useId();
  const hid = `${fid}-hint`, eid = `${fid}-err`;
  const described = [hint && hid, error && eid].filter(Boolean).join(" ") || undefined;
  const barn = isValidElement(children)
    ? cloneElement(children, { id: children.props.id ?? fid, "aria-describedby": described, "aria-invalid": error ? true : undefined, "aria-required": required || undefined, required: required || undefined })
    : children;
  return (
    <div className={`pa-field pa-formfield${error ? " pa-formfield--error" : ""}`}>
      <div className="pa-formfield__top">
        <label className="pa-field__label" htmlFor={fid}>{label}</label>
        {required && <span className="pa-formfield__req">PÅKREVD</span>}
        {optional && !required && <span className="pa-formfield__opt">VALGFRITT</span>}
      </div>
      {hint && <span id={hid} className="pa-field__hint">{hint}</span>}
      <div className="pa-formfield__control">{barn}</div>
      {error && <span id={eid} className="pa-formfield__error" role="alert"><Ikon icon={CircleAlert} size={16} name="circle-alert" /><span>{error}</span></span>}
    </div>
  );
}

export function Tekstinput({ mono, ...rest }: InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }) {
  return <div className={`pa-control${mono ? " pa-control--mono" : ""}${rest["aria-invalid"] ? " pa-control--error" : ""}`}><input {...rest} /></div>;
}

export function Avkryssing({ label, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode }) {
  return (
    <label className="pa-check">
      <input type="checkbox" {...rest} />
      <span className="pa-check__box"><Ikon icon={Check} size={14} name="check" /></span>
      <span>{label}</span>
    </label>
  );
}

export function Nokkelverdi({ items }: { items: ReadonlyArray<readonly [string, ReactNode, { mono?: boolean; hint?: string }?]> }) {
  return (
    <dl className="pa-kv">
      {items.map(([k, v, o], i) => (
        <div key={i} className="pa-kv__row">
          <dt className="pa-kv__k">{k}</dt>
          <dd className={`pa-kv__v${(o?.mono ?? true) ? " is-mono" : ""}`}>{v === null || v === undefined || v === "" ? "—" : v}{o?.hint && <span className="pa-kv__hint">{o.hint}</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Segment<T extends string>({ valg, verdi, onEndre, label }: { valg: readonly T[]; verdi: T; onEndre: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="pa-seg">
      {valg.map((v) => <button key={v} type="button" className="pa-seg__opt" aria-pressed={verdi === v} onClick={() => onEndre(v)}>{v}</button>)}
    </div>
  );
}

const VARSELIKON = { info: Info, warn: TriangleAlert, signal: CircleAlert } as const;
export function Varsel({ tone, children }: { tone: "info" | "warn" | "signal"; children: ReactNode }) {
  return (
    <div role={tone === "signal" ? "alert" : "status"} className={`pa-alert pa-alert--${tone}`}>
      <Ikon icon={VARSELIKON[tone]} size={18} />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
