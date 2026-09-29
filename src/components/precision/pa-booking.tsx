"use client";

/**
 * Grunnkomponenter for Kalender og booking (bolk A4, del 2) i Precision
 * Athletics. Bruker klassene fra precision-komponenter.css (pa-choice, pa-seg,
 * pa-alert, pa-toast, pa-undo) og A4-tilleggene i precision-a4.css (a4-*),
 * som gir 44 px treffmål under 1024 px.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import { Ikon, Meta, StatusPille } from "./pa";

const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

/* ---------- Valgpille (ChoicePill) ---------- */

export function Valgpille({ valgt, onClick, children, akse, disabled, rolle }: {
  valgt: boolean; onClick: () => void; children: ReactNode; akse?: string; disabled?: boolean; rolle?: "radio";
}) {
  return (
    <button
      type="button"
      role={rolle}
      aria-pressed={rolle ? undefined : valgt}
      aria-checked={rolle ? valgt : undefined}
      disabled={disabled}
      className={cx("pa-choice a4-choice", akse && `pa-choice--axis pa-choice--${akse}`)}
      onClick={onClick}
    >
      {akse && <span className="pa-choice__dot" />}
      {children}
    </button>
  );
}

/* ---------- Segmentert valg ---------- */

export function Segment<T extends string>({ label, value, options, onChange, full }: {
  label: string; value: T; options: ReadonlyArray<{ id: T; label: string }>; onChange: (v: T) => void; full?: boolean;
}) {
  return (
    <div className={cx("pa-seg a4-seg", full && "pa-seg--full")} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" className="pa-seg__opt" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

/* ---------- Inline varsel ---------- */

const VARSEL_IKON = { neutral: Info, info: Info, ok: CircleCheck, warn: TriangleAlert, signal: TriangleAlert } as const;

export function Varsel({ tone = "neutral", tittel, children, handling }: {
  tone?: "neutral" | "info" | "ok" | "warn" | "signal"; tittel?: ReactNode; children?: ReactNode; handling?: ReactNode;
}) {
  return (
    <div className={cx("pa-alert a4-alert", tone !== "neutral" && `pa-alert--${tone}`)} role={tone === "signal" || tone === "warn" ? "alert" : "status"}>
      <Ikon icon={VARSEL_IKON[tone]} size={18} />
      <div className="a4-alert__tekst">
        {tittel && <span className="pa-alert__title">{tittel}</span>}
        {children && <span>{children}</span>}
      </div>
      {handling && <div className="a4-alert__handling">{handling}</div>}
    </div>
  );
}

/* ---------- Angre-toast (UndoToast) ---------- */

/**
 * Fast toast nederst med «Angre». Lukker seg selv etter `ms` (10 s for
 * flytting i kalenderen, Anders 28.09.2026). `onFerdig` kalles når vinduet
 * går ut uten angring, eller etter at angring er gjort.
 */
export function AngreToast({ melding, meta, onAngre, onFerdig, ms = 10_000, inline }: {
  melding: ReactNode; meta?: ReactNode; onAngre?: () => void; onFerdig: () => void; ms?: number; inline?: boolean;
}) {
  const ferdig = useRef(onFerdig);
  useEffect(() => { ferdig.current = onFerdig; }, [onFerdig]);
  useEffect(() => {
    const t = setTimeout(() => ferdig.current(), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return (
    <div className={inline ? undefined : "pa-undo a4-undo"}>
      <div role="status" className="pa-toast">
        <div className="a4-toast__tekst">
          <span>{melding}</span>
          {meta && <span className="pa-toast__meta">{meta}</span>}
        </div>
        {onAngre && <button type="button" className="pa-toast__action a4-toast__action" onClick={onAngre}>Angre</button>}
      </div>
    </div>
  );
}

/* ---------- Steglinje (veiviser) ---------- */

export function Steglinje({ steg, aktiv }: { steg: readonly string[]; aktiv: number }) {
  return (
    <ol className="a4-steg" aria-label="Steg">
      {steg.map((s, i) => (
        <li key={s} className="a4-steg__ledd" aria-current={i === aktiv ? "step" : undefined} data-ferdig={i < aktiv ? "" : undefined}>
          <span className="a4-steg__strek" aria-hidden />
          <Meta style={i === aktiv ? { color: "var(--text-primary)" } : undefined}>{s.toUpperCase()}</Meta>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Valgrad (radio-liste) ---------- */

export function Valgrad({ valgt, onVelg, tittel, under, side, disabled }: {
  valgt: boolean; onVelg: () => void; tittel: ReactNode; under?: ReactNode; side?: ReactNode; disabled?: boolean;
}) {
  return (
    <button type="button" role="radio" aria-checked={valgt} disabled={disabled} className="a4-rad" onClick={onVelg}>
      <span className="a4-rad__hoved">
        <span className="a4-rad__tittel" data-valgt={valgt ? "" : undefined}>{tittel}</span>
        {under && <Meta>{under}</Meta>}
      </span>
      {(side != null || valgt) && <span className="a4-rad__side">{side}{valgt && <StatusPille tone="ok">Valgt</StatusPille>}</span>}
    </button>
  );
}

/* ---------- Dato- og tidsfelt ---------- */

export function Datofelt({ value, onChange, min, id }: { value: string; onChange: (v: string) => void; min?: string; id?: string }) {
  return <input id={id} type="date" className="a4-input a4-input--mono" value={value} min={min} onChange={(e) => onChange(e.target.value)} />;
}

/** Klokkeslett i kvartersteg fra `fra` til `til` (timer). */
export function tidsvalg(fra = 6, til = 22): Array<{ value: string; label: string }> {
  const ut: Array<{ value: string; label: string }> = [];
  for (let m = fra * 60; m <= til * 60; m += 15) {
    const v = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    ut.push({ value: v, label: v });
  }
  return ut;
}
