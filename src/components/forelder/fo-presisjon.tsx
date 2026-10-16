"use client";

/**
 * Forelder-primitiver i Precision Athletics. Samme props som fo-kit, uten
 * Train-lock. Radius 8 px på kort, grafitt på primærknapp. Virker inne i
 * .pa-root (ForelderSkall laster precision-athletics.css).
 */
import type { CSSProperties, ReactNode } from "react";

export function FoCaps({ children }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return <p className="fo-kicker">{children}</p>;
}

export function FoHode({ caps, tittel, under, badge }: { caps: string; tittel: string; under?: ReactNode; badge?: string }) {
  return (
    <header className="fo-hode">
      <p className="fo-kicker">{caps}</p>
      <h1>{tittel}</h1>
      {badge ? <p className="fo-kicker">{badge}</p> : null}
      {under ? <p className="fo-under">{under}</p> : null}
    </header>
  );
}

export function FoKort({ children, style, onClick }: { children: ReactNode; pad?: string; style?: CSSProperties; onClick?: () => void }) {
  return (
    <div
      className="fo-kort"
      style={style}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      {children}
    </div>
  );
}

export function FoRad({ title, sub, right, last, muted, onClick }: {
  title: ReactNode; sub?: ReactNode; right?: ReactNode; last?: boolean; muted?: boolean; onClick?: () => void;
}) {
  return (
    <div className="fo-rad" data-last={last ? "true" : undefined} data-muted={muted ? "true" : undefined} onClick={onClick}>
      <div>
        <strong>{title}</strong>
        {sub ? <small>{sub}</small> : null}
      </div>
      {right}
    </div>
  );
}

export function FoRadTall({ children }: { children: ReactNode }) {
  return <span className="fo-rad-tall">{children}</span>;
}

export function FoHake() {
  return (
    <svg className="fo-hake" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4.5 12.5 L10 18 L19.5 6.5" />
    </svg>
  );
}

export function FoChevron() {
  return (
    <svg className="fo-chevron" width={8} height={14} viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
      <path d="M1 1 L6 6 L1 11" />
    </svg>
  );
}

export function FoAvatar({ navn }: { navn: string; size?: 38 | 40 | 44 | 48 }) {
  return <span className="fo-avatar" aria-hidden>{(navn.trim()[0] ?? "?").toUpperCase()}</span>;
}

export function FoToggle({ on, onChange, label, disabled }: { on: boolean; onChange?: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" className="fo-toggle" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange?.(!on)}>
      <span />
    </button>
  );
}

export function FoCtaPrimar({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean; style?: CSSProperties }) {
  return <button type="button" className="pa-btn pa-btn--primary pa-btn--full" onClick={onClick} disabled={disabled}>{children}</button>;
}

export function FoCtaSekundar({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean; style?: CSSProperties }) {
  return <button type="button" className="pa-btn pa-btn--secondary pa-btn--full" onClick={onClick} disabled={disabled}>{children}</button>;
}

export function FoFotnote({ children }: { children: ReactNode; size?: number; style?: CSSProperties }) {
  return <p className="fo-note">{children}</p>;
}

export function FoTallKort({ label, value, suffix }: { label: string; value: ReactNode; suffix?: string }) {
  return (
    <div className="fo-tall">
      <p className="fo-kicker">{label}</p>
      <b>{value}{suffix ? <small> {suffix}</small> : null}</b>
    </div>
  );
}

export function FoSkjerm({ children }: { children: ReactNode }) {
  return <div className="fo-side" data-fo-skjerm>{children}</div>;
}

export function FoTom({ tittel, sub }: { tittel: string; sub: string }) {
  return (
    <div className="fo-tom">
      <strong>{tittel}</strong>
      <p>{sub}</p>
    </div>
  );
}
