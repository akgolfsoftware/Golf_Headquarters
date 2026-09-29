"use client";

/**
 * Grunnkomponenter for Plan-hub, planmaler og øktark (AG-14, AG-12) i
 * Precision Athletics. Egen fil så parallelle bolker ikke endrer samme linjer.
 * Klassene pa-* finnes i precision-komponenter.css; de egne a10-* ligger i
 * src/styles/precision-a10.css.
 *
 * Tegningens hjelpere (ui_kits/agencyos/ag-parts.jsx og AG-cockpit.jsx):
 * Card/Sec → Seksjon, EvCard → Hendelseskort, Row/Lbl → Listerad/Etikett,
 * Draft → Utkastmerke, ChoicePill → Valgpille, Sheet → Ark.
 */
import Link from "next/link";
import { useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { Ikon, Meta } from "./pa";
import "@/styles/precision-a10.css";

const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

export type PaAkse = "fys" | "tek" | "slag" | "spill" | "turn";

/** Aksestripen: farge betyr akse og ingenting annet. Flere akser deler kanten. */
function stripe(akser: readonly PaAkse[]): string {
  if (akser.length === 0) return "var(--border-strong)";
  if (akser.length === 1) return `var(--axis-${akser[0]})`;
  const n = akser.length;
  return `linear-gradient(to bottom,${akser.map((a, i) => `var(--axis-${a}) ${(i * 100) / n}% ${((i + 1) * 100) / n}%`).join(",")})`;
}

/* ---------- Seksjon (kort med kicker og meta) ---------- */

export function Seksjon({ tittel, meta, label, gap = 12, children }: { tittel: ReactNode; meta?: ReactNode; label?: string; gap?: number; children: ReactNode }) {
  return <section aria-label={label ?? (typeof tittel === "string" ? tittel : undefined)} className="pa-card a10-seksjon" style={{ gap }}>
    <div className="a10-seksjon__hode"><span className="kicker">{tittel}</span>{meta != null && <Meta>{meta}</Meta>}</div>
    {children}
  </section>;
}

/* ---------- Hendelseskort (kort med aksestripe) ---------- */

export function Hendelseskort({ akser = [], href, onClick, label, stiplet, children }: {
  akser?: readonly PaAkse[]; href?: string; onClick?: () => void; label?: string; stiplet?: boolean; children: ReactNode;
}) {
  const klasse = cx("a10-ev", stiplet && "a10-ev--stiplet", (href || onClick) && "a10-ev--klikk");
  const innhold = <>{!stiplet && <span aria-hidden className="a10-ev__stripe" style={{ background: stripe(akser) }} />}{children}</>;
  if (href) return <Link href={href} className={klasse} aria-label={label}>{innhold}</Link>;
  if (onClick) return <button type="button" className={klasse} onClick={onClick} aria-label={label}>{innhold}</button>;
  return <div className={klasse}>{innhold}</div>;
}

/* ---------- Liste og rad ---------- */

export function Liste({ label, children }: { label: string; children: ReactNode }) {
  return <div role="list" aria-label={label} className="a10-liste">{children}</div>;
}

export function Listerad({ mal = "minmax(0,1fr) auto", min = 56, children }: { mal?: string; min?: number; children: ReactNode }) {
  return <div role="listitem" className="a10-rad" style={{ gridTemplateColumns: mal, minHeight: min }}>{children}</div>;
}

export function Etikett({ a, sub }: { a: ReactNode; sub?: ReactNode }) {
  return <span className="a10-etikett"><span className="a10-etikett__a">{a}</span>{sub != null && sub !== "" && <Meta>{sub}</Meta>}</span>;
}

export function Utkastmerke({ children = "Utkast" }: { children?: ReactNode }) {
  return <span className="a10-utkast">{children}</span>;
}

/* ---------- Aksefordeling (stolpe delt per akse) ---------- */

export function Aksebar({ verdier, label }: { verdier: ReadonlyArray<{ akse: PaAkse; verdi: number }>; label: string }) {
  const sum = verdier.reduce((a, v) => a + v.verdi, 0);
  if (sum <= 0) return <span className="a10-aksebar a10-aksebar--tom" role="img" aria-label={`${label}: ingen data`} />;
  return <span className="a10-aksebar" role="img" aria-label={`${label}: ${verdier.map((v) => `${v.akse.toUpperCase()} ${v.verdi}`).join(", ")}`}>
    {verdier.filter((v) => v.verdi > 0).map((v) => <span key={v.akse} style={{ flex: v.verdi / sum, background: `var(--axis-${v.akse})` }} />)}
  </span>;
}

/* ---------- Valgpille ---------- */

export function Valgpille({ valgt, onVelg, akse, mono, children }: { valgt: boolean; onVelg: () => void; akse?: PaAkse; mono?: boolean; children: ReactNode }) {
  return <button type="button" className={cx("pa-choice", akse && `pa-choice--axis pa-choice--${akse}`, mono && "pa-choice--mono")} aria-pressed={valgt} onClick={onVelg}>
    {akse && <span className="pa-choice__dot" aria-hidden />}{children}
  </button>;
}

export function Valgrad({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <div className="a10-valgrad" role="group" aria-label={label}>
    <div className="a10-valgrad__hode"><span className="pa-field__label">{label}</span>{hint && <Meta>{hint}</Meta>}</div>
    <div className="a10-valgrad__valg">{children}</div>
  </div>;
}

/* ---------- Felt ---------- */

export function Felt({ label, hint, error, required, valgfritt, children }: {
  label: string; hint?: string; error?: string; required?: boolean; valgfritt?: boolean; children: ReactNode;
}) {
  return <label className={cx("pa-field", error && "pa-formfield--error")}>
    <span className="pa-formfield__top">
      <span className="pa-field__label">{label}</span>
      {required && <span className="pa-formfield__req">Påkrevd</span>}
      {valgfritt && <span className="pa-field__hint">Valgfritt</span>}
    </span>
    {children}
    {error ? <span className="pa-formfield__error" role="alert">{error}</span> : hint ? <span className="pa-field__hint">{hint}</span> : null}
  </label>;
}

export function Inndata({ mono, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }) {
  return <input className={cx("a10-input", mono && "a10-input--mono", className)} {...rest} />;
}

export function Tekstboks({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx("a10-input", "a10-textarea", className)} {...rest} />;
}

export function Nedtrekk({ options, className, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { options: ReadonlyArray<{ value: string; label: string }> }) {
  return <select className={cx("a10-input", "a10-select", className)} {...rest}>
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>;
}

export function Glider({ label, verdi, akse, onEndre }: { label: string; verdi: number; akse: PaAkse; onEndre: (v: number) => void }) {
  return <input type="range" min={0} max={100} value={verdi} aria-label={label} className="a10-glider" style={{ accentColor: `var(--axis-${akse})` }} onChange={(e) => onEndre(parseInt(e.target.value, 10))} />;
}

export function Avkrysning({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  const id = useId();
  return <label className={cx("pa-check", disabled && "pa-check--disabled")} htmlFor={id}>
    <input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    <span className="pa-check__box" aria-hidden>{checked && <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>}</span>
    {label}
  </label>;
}

/* ---------- Varsel (inline) ---------- */

const VARSEL_IKON = { info: Info, warn: TriangleAlert, ok: CircleCheck, signal: CircleAlert } as const;

export function Varsel({ tone = "info", tittel, children }: { tone?: keyof typeof VARSEL_IKON; tittel?: string; children?: ReactNode }) {
  return <div className={`pa-alert pa-alert--${tone}`} role={tone === "signal" || tone === "warn" ? "alert" : "status"}>
    <Ikon icon={VARSEL_IKON[tone]} size={18} />
    <div className="a10-varsel__tekst">{tittel && <div className="pa-alert__title">{tittel}</div>}{children}</div>
  </div>;
}

/* ---------- Ark (bunnark på mobil, sideark fra 1025 px) ---------- */

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
}

export function Ark({ open, onClose, kicker, tittel, footer, children }: {
  open: boolean; onClose: () => void; kicker?: ReactNode; tittel: string; footer?: ReactNode; children?: ReactNode;
}) {
  useEscape(open, onClose);
  const lukk = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open) lukk.current?.focus(); }, [open]);
  if (!open) return null;
  return <div className="pa-sheet-layer">
    <div className="pa-sheet-scrim" onClick={onClose} />
    <div className="pa-sheet pa-sheet--auto" role="dialog" aria-modal="true" aria-label={tittel}>
      <span className="pa-sheet__grip" aria-hidden />
      <div className="pa-sheet__head">
        <div className="pa-sheet__titles">
          {kicker && <span className="kicker">{kicker}</span>}
          <span className="pa-sheet__title">{tittel}</span>
        </div>
        <button ref={lukk} type="button" className="pa-iconbtn" aria-label="Lukk" onClick={onClose}><Ikon icon={X} size={20} name="x" /></button>
      </div>
      <div className="pa-sheet__body">{children}</div>
      {footer && <div className="pa-sheet__foot">{footer}</div>}
    </div>
  </div>;
}

export function Dialog({ open, onClose, tittel, footer, children }: { open: boolean; onClose: () => void; tittel: string; footer?: ReactNode; children?: ReactNode }) {
  useEscape(open, onClose);
  if (!open) return null;
  return <div className="pa-sheet-layer">
    <div className="pa-sheet-scrim" onClick={onClose} />
    <div className="a10-dialogsenter">
      <div className="pa-dialog" role="alertdialog" aria-modal="true" aria-label={tittel}>
        <div className="pa-dialog__head"><span className="pa-dialog__title">{tittel}</span></div>
        <div className="pa-dialog__body">{children}</div>
        {footer && <div className="pa-dialog__foot">{footer}</div>}
      </div>
    </div>
  </div>;
}

/* ---------- Knapperad ---------- */

export function Knapperad({ children }: { children: ReactNode }) {
  return <div className="a10-knapperad">{children}</div>;
}
