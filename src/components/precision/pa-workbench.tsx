"use client";

/**
 * Precision Athletics — grunnkomponenter for Workbench (AG-11 og undersidene).
 * Portert fra Claude Design 7d7c2994, ui_kits/_shared/WB3.jsx (runde 29):
 * aksepiller, øktkort, klokkeslett-ruter, liste-rader og velgeren for spiller
 * og gruppe. Egen fil (ikke pa.tsx) så parallelle bolker ikke deler linjer.
 *
 * Farge betyr akse og ingenting annet (beslutninger.md §FARGE BETYR AKSE):
 * øktkort er nøytrale med aksefarget stripe på venstre kant, fremdrift er grafitt.
 * Stilene ligger i src/styles/precision-a9.css.
 */
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Ikon, type Akse, AKSE_NAVN } from "./pa";
import "@/styles/precision-a9.css";

const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

export const AKSER: readonly Akse[] = ["fys", "tek", "slag", "spill", "turn"];

/** Aksefargen som CSS-variabel for stripe/understrek (bare tokens). */
export function akseStil(akse: Akse | null | undefined): CSSProperties {
  return { ["--a9-akse" as string]: akse ? `var(--axis-${akse})` : "var(--border-strong)" } as CSSProperties;
}

/** «TEK» → «tek». Ukjent verdi gir null (nøytral stripe). */
export function akseFra(pyramide: string | null | undefined): Akse | null {
  const a = (pyramide ?? "").toLowerCase();
  return (AKSER as readonly string[]).includes(a) ? (a as Akse) : null;
}

/** Valgpille (ChoicePill) som fane, radio eller vanlig bryter. Treffmål 44 px. */
export function Valgpille({ valgt, onClick, akse, rolle = "button", children, href }: {
  valgt: boolean; onClick?: () => void; akse?: Akse; rolle?: "button" | "tab" | "radio"; children: ReactNode; href?: string;
}) {
  const klasse = cx("pa-choice a9-choice", akse && `pa-choice--axis pa-choice--${akse}`);
  if (href) {
    return <Link href={href} className={klasse} role={rolle === "tab" ? "tab" : undefined} aria-selected={rolle === "tab" ? valgt : undefined}>{children}</Link>;
  }
  const aria = rolle === "tab" ? { role: "tab", "aria-selected": valgt } : rolle === "radio" ? { role: "radio", "aria-checked": valgt } : { "aria-pressed": valgt };
  return <button type="button" className={klasse} onClick={onClick} {...aria}>
    {akse && <span className="pa-choice__dot" aria-hidden />}{children}
  </button>;
}

/** Liten caps-linje (Meta i designet). */
export function Caps({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <span className="a9-caps" style={style}>{children}</span>;
}

/** Rad i en liste: tittel, undertekst og verdi til høyre. */
export function Listerad({ tittel, under, verdi, forste, akse }: { tittel: ReactNode; under?: ReactNode; verdi?: ReactNode; forste?: boolean; akse?: Akse | null }) {
  return <div role="listitem" className={cx("a9-listerad", !forste && "a9-listerad--skille", akse && "a9-listerad--akse")} style={akse ? akseStil(akse) : undefined}>
    <span className="a9-listerad__tekst"><span className="a9-listerad__tittel">{tittel}</span>{under && <Caps>{under}</Caps>}</span>
    {verdi !== undefined && <span className="a9-listerad__verdi">{verdi}</span>}
  </div>;
}

/** Grafitt fremdriftsstrek. Uten data vises ingen strek (aldri 0 %). */
export function Fremdrift({ pct, label }: { pct: number | null; label: string }) {
  if (pct == null) return null;
  const p = Math.max(0, Math.min(100, Math.round(pct)));
  return <span className="a9-fremdrift" role="progressbar" aria-label={label} aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
    <span className="a9-fremdrift__fyll" style={{ width: `${p}%` }} />
  </span>;
}

/** Øktkortet i uka: nøytralt kort, aksefarget stripe, klokkeslett, tittel og merker. */
export function Oktkort({ akse, tid, tittel, merker, valgt, dempet, dras, onClick, onPointerDown, onDragOver, onDrop, label, ekstra }: {
  akse: Akse | null; tid: string; tittel: string; merker?: ReactNode; valgt?: boolean; dempet?: boolean; dras?: boolean; label: string;
  onClick: () => void; onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLButtonElement>) => void; onDrop?: (e: React.DragEvent<HTMLButtonElement>) => void;
  ekstra?: ReactNode;
}) {
  return <div className="a9-okt-rad">
    <button type="button" className="a9-okt" aria-label={label} aria-pressed={valgt || undefined} data-dempet={dempet || undefined} data-dras={dras || undefined}
      style={akseStil(akse)} onClick={onClick} onPointerDown={onPointerDown} onDragOver={onDragOver} onDrop={onDrop}>
      <span className="a9-okt__tid">{tid}</span>
      <span className="a9-okt__tittel">{tittel}</span>
      {merker && <span className="a9-okt__merker">{merker}</span>}
    </button>
    {ekstra}
  </div>;
}

/** Aksepillene man drar ut i uka (eller trykker, så klokkeslett). */
export function Aksestang({ valgt, onVelg, onPointerDown, label }: {
  valgt: Akse | null; onVelg: (a: Akse | null) => void; label: string;
  onPointerDown?: (a: Akse, e: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  return <div role="group" aria-label={label} className="a9-aksestang">
    {AKSER.map((a) => <button key={a} type="button" className="a9-akseknapp" aria-pressed={valgt === a} style={akseStil(a)}
      onClick={() => onVelg(valgt === a ? null : a)} onPointerDown={onPointerDown ? (e) => onPointerDown(a, e) : undefined}>{AKSE_NAVN[a]}</button>)}
  </div>;
}

/** Spiller/gruppe-velgeren: modus, forrige/neste og søk (WB3 «velger»). */
export function Velger({ modus, onModus, navn, onForrige, onNeste, onSok, meta }: {
  modus: "spiller" | "gruppe"; onModus: (m: "spiller" | "gruppe") => void; navn: string;
  onForrige?: () => void; onNeste?: () => void; onSok: () => void; meta?: ReactNode;
}) {
  return <div className="a9-velger">
    <div className="pa-seg pa-seg--lg" role="group" aria-label="Modus">
      {(["spiller", "gruppe"] as const).map((m) => <button key={m} type="button" className="pa-seg__opt" aria-pressed={modus === m} onClick={() => onModus(m)}>{m === "spiller" ? "Spiller" : "Gruppe"}</button>)}
    </div>
    <div role="group" aria-label="Velg spiller eller gruppe" className="a9-velger__bla">
      <button type="button" className="pa-iconbtn pa-iconbtn--secondary" aria-label="Forrige" onClick={onForrige} disabled={!onForrige}><Ikon icon={ChevronLeft} size={20} /></button>
      <button type="button" className="pa-btn pa-btn--secondary pa-btn--icon-l a9-velger__navn" onClick={onSok}><Ikon icon={Search} size={18} /><span className="a9-klipp">{navn}</span></button>
      <button type="button" className="pa-iconbtn pa-iconbtn--secondary" aria-label="Neste" onClick={onNeste} disabled={!onNeste}><Ikon icon={ChevronRight} size={20} /></button>
    </div>
    {meta && <Caps>{meta}</Caps>}
  </div>;
}
