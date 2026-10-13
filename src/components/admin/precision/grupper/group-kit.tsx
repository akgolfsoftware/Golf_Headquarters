"use client";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Knapp, Sidehode, StatusPille } from "@/components/precision/pa";
import type { TlKnappProps, TlKortProps, TlRadProps } from "@/components/admin/v2/oppsett/tl-kit";

/** Gruppeflatene bruker organisasjonens egne Precision-variabler. */
export const TL = { text: "var(--text-primary)", mute: "var(--text-secondary)", hair: "var(--border-ink)",
  elev: "var(--surface-flat)", dim: "var(--surface-flat)", fill: "var(--primary)", onFill: "var(--text-on-primary)" };
export function TlTittel({ children, sub }: { children?: ReactNode; sub?: ReactNode }) {
  return <Sidehode title={children} sub={sub} />;
}
export function TlKort({ eyebrow, action, children, pad = "24px", style }: TlKortProps) {
  return <section className="group-card" style={{ padding: pad, ...style }}>
    {(eyebrow || action) && <div className="group-card__head">{eyebrow ? <h2>{eyebrow}</h2> : <span />}{action}</div>}
    {children}
  </section>;
}
export function TlKnapp({ icon: _icon, children, variant = "sekundaer", full, disabled, href, onClick, type = "button", style }: TlKnappProps) {
  const paVariant = variant === "primaer" ? "primary" : variant === "fare" ? "signal" : variant === "tertiaer" ? "ghost" : "secondary";
  const className = `pa-btn pa-btn--${paVariant}${full ? " pa-btn--full" : ""}`;
  if (href && !disabled) return <Link className={className} href={href} style={style}>{children}</Link>;
  return <Knapp variant={paVariant} fullWidth={full} disabled={disabled} onClick={onClick} type={type} style={style}>{children}</Knapp>;
}
export function TlTilbake({ href, children }: { href: string; children?: ReactNode }) {
  return <Link className="pa-btn pa-btn--ghost" href={href}><ArrowLeft aria-hidden size={18} />{children}</Link>;
}
export function TlBadge({ tone = "nøytral", children }: { tone?: "nøytral" | "varsel" | "fare"; children: ReactNode }) {
  return <StatusPille tone={tone === "varsel" ? "warn" : tone === "fare" ? "signal" : "neutral"}>{children}</StatusPille>;
}
export function TlTomTilstand({ title, sub }: { icon?: string; title: ReactNode; sub?: ReactNode }) {
  return <div className="group-empty"><h3>{title}</h3>{sub && <p>{sub}</p>}</div>;
}
export function TlRad({ title, sub, meta, trailing, last, href, onClick }: TlRadProps) {
  const style: CSSProperties = { borderBottom: last ? "none" : undefined };
  const content = <><div className="group-row__copy"><div>{title}</div>{sub && <p>{sub}</p>}</div>{meta && <span className="group-row__meta">{meta}</span>}{trailing}</>;
  if (href) return <Link href={href} className="group-row" style={style}>{content}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className="group-row" style={style}>{content}</button>;
  return <div className="group-row" style={style}>{content}</div>;
}
