"use client";

/**
 * Delte deler for økt-flyten (Precision Athletics, PH-live.jsx): teller med −1/+5/+1,
 * stepper for reps og kilo, og 1–N-skala. Bare klasser fra precision-a20.css og
 * precision-komponenter.css.
 */
import type { ReactNode } from "react";
import { Meta } from "@/components/precision/pa";

/** Teller med tre store knapper (−1, +5, +1). Verdien vises som «12 av 30» når plan er kjent. */
export function Teller({ label, v, plan, on, tapId, disabled }: {
  label: string; v: number; plan?: number | null; on: (delta: number) => void; tapId?: string; disabled?: boolean;
}) {
  return <div role="group" aria-label={`${label} ${v}${plan ? ` av ${plan}` : ""}`} className="pa-okt-teller">
    <span className="pa-okt-teller__navn">
      <span className="pa-okt-teller__etikett">{label}</span>
      <span className="pa-okt-teller__verdi">{v}{plan ? <> <span className="pa-okt-teller__av">av {plan}</span></> : null}</span>
    </span>
    <button type="button" className="pa-btn pa-btn--ghost" disabled={disabled || v <= 0} aria-label={`Trekk fra én ${label.toLowerCase()}`} onClick={() => on(-1)}>−1</button>
    <button type="button" className="pa-btn pa-btn--secondary" disabled={disabled} aria-label={`Legg til fem ${label.toLowerCase()}`} onClick={() => on(5)}>+5</button>
    <button type="button" className="pa-btn pa-btn--secondary" disabled={disabled} aria-label={`Legg til én ${label.toLowerCase()}`} data-od-id={tapId} onClick={() => on(1)}>+1</button>
  </div>;
}

/** Minus / verdi / pluss. Knappene er 48 px. */
export function Stepper({ label, value, onChange, min = 0, max = 999, step = 1, enhet }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; enhet?: string;
}) {
  const sett = (n: number) => onChange(Math.min(max, Math.max(min, Math.round(n * 100) / 100)));
  return <div className="pa-stepper" role="group" aria-label={label}>
    <div className="pa-stepper__row">
      <button type="button" className="pa-stepper__btn" aria-label={`Færre ${label.toLowerCase()}`} disabled={value <= min} onClick={() => sett(value - step)}>−</button>
      <output className="pa-stepper__val" aria-live="polite">{String(value).replace(".", ",")}{enhet && <> <span className="pa-stepper__unit">{enhet}</span></>}</output>
      <button type="button" className="pa-stepper__btn" aria-label={`Flere ${label.toLowerCase()}`} disabled={value >= max} onClick={() => sett(value + step)}>+</button>
    </div>
  </div>;
}

/** 1–N-skala med store knapper. Valgt verdi er grafitt. */
export function Skala({ label, n, v, set, lo, hi, disabled }: {
  label: string; n: number; v: number | null; set: (k: number) => void; lo: string; hi: string; disabled?: boolean;
}) {
  return <fieldset className="pa-okt-skala" disabled={disabled}>
    <legend className="pa-sr">{label}</legend>
    <div className="pa-okt-skala__hode"><span className="pa-okt-skala__tittel" aria-hidden>{label}</span><Meta>{v == null ? "—" : `${v} AV ${n}`}</Meta></div>
    <div className="pa-okt-skala__rute" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {Array.from({ length: n }, (_, i) => i + 1).map((k) => <button key={k} type="button" className="pa-okt-skala__knapp" aria-pressed={v === k} aria-label={`${label} ${k} av ${n}`} onClick={() => set(k)}>{k}</button>)}
    </div>
    <div className="pa-okt-skala__ender"><Meta>{lo}</Meta><Meta>{hi}</Meta></div>
  </fieldset>;
}

export function Kortseksjon({ tittel, children }: { tittel: string; children: ReactNode }) {
  return <section aria-label={tittel} className="pa-okt-seksjon"><span className="kicker">{tittel}</span>{children}</section>;
}
