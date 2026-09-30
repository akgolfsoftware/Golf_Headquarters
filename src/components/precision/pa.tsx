/**
 * Precision Athletics — grunnkomponenter, portert fra Claude Design-prosjektet
 * 7d7c2994 (components/*.jsx). Stilene ligger i src/styles/precision-athletics.css
 * og virker bare innenfor .pa-root.
 *
 * Ikoner: designet henter Lucide som CSS-maske fra CDN; appen bruker de samme
 * Lucide-glyfene via lucide-react (samme strek: size/12).
 */
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

export type Akse = "fys" | "tek" | "slag" | "spill" | "turn";
export const AKSE_NAVN: Record<Akse, string> = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" };

export function Ikon({ icon: I, size = 20, name }: { icon: LucideIcon; size?: number; name?: string }) {
  return <I className="pa-icon" data-icon={name} size={size} strokeWidth={2} aria-hidden />;
}

type Variant = "primary" | "secondary" | "ghost" | "signal";
type Size = "sm" | "md" | "lg" | "xl";
function btnClass(variant: Variant, size: Size, full?: boolean, harIkon?: boolean, harIkonH?: boolean) {
  return cx("pa-btn", `pa-btn--${variant}`, size !== "md" && `pa-btn--${size}`, full && "pa-btn--full", harIkon && "pa-btn--icon-l", harIkonH && "pa-btn--icon-r");
}
const ikonStr = (size: Size) => (size === "sm" ? 16 : size === "xl" ? 22 : 18);

type Felles = { variant?: Variant; size?: Size; fullWidth?: boolean; icon?: LucideIcon; iconName?: string; iconRight?: LucideIcon; children: ReactNode };

export function Knapp({ variant = "primary", size = "md", fullWidth, icon, iconName, iconRight, children, loading, loadingText = "Lagrer …", ...rest }:
  Felles & { loading?: boolean; loadingText?: string } & Omit<ComponentProps<"button">, "children">) {
  return <button type="button" className={btnClass(variant, size, fullWidth, !loading && !!icon, !loading && !!iconRight)} disabled={rest.disabled || loading} aria-busy={loading || undefined} {...rest}>
    {loading ? <span className="pa-btn__loading">{loadingText}</span> : <>
      {icon && <Ikon icon={icon} name={iconName} size={ikonStr(size)} />}{children}{iconRight && <Ikon icon={iconRight} size={ikonStr(size)} />}
    </>}
  </button>;
}

export function KnappLenke({ variant = "primary", size = "md", fullWidth, icon, iconName, iconRight, children, href }: Felles & { href: string }) {
  return <Link href={href} className={btnClass(variant, size, fullWidth, !!icon, !!iconRight)}>
    {icon && <Ikon icon={icon} name={iconName} size={ikonStr(size)} />}{children}{iconRight && <Ikon icon={iconRight} size={ikonStr(size)} />}
  </Link>;
}

export function AkseMerke({ axis, size = "md" }: { axis: Akse; size?: "sm" | "md" }) {
  return <span className={cx("pa-badge", `pa-badge--${axis}`, size === "sm" && "pa-badge--sm")}><span className="pa-badge__dot" />{AKSE_NAVN[axis]}</span>;
}

export function StatusPille({ tone = "neutral", children }: { tone?: "neutral" | "ok" | "warn" | "info" | "signal" | "live"; children: ReactNode }) {
  return <span className={cx("pa-status", tone !== "neutral" && `pa-status--${tone}`)}><span className="pa-status__dot" />{children}</span>;
}

export function Meta({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", ...style }}>{children}</span>;
}
export function Tall({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <span style={{ font: "var(--type-num)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)", ...style }}>{children}</span>;
}

export type TidslinjePunkt = { id: string; time: string | null; title: ReactNode; meta?: string | null; axis?: Akse | null; hollow?: boolean };
export function Tidslinje({ items, dense }: { items: readonly TidslinjePunkt[]; dense?: boolean }) {
  return <ol className={cx("pa-timeline", dense && "pa-timeline--dense")}>
    {items.map((it) => <li key={it.id} className="pa-timeline__item">
      <span className="pa-timeline__time">{it.time ?? "—"}</span>
      <span className={cx("pa-timeline__dot", it.axis && `pa-timeline__dot--${it.axis}`, it.hollow && "pa-timeline__dot--hollow")} aria-hidden />
      <div className="pa-timeline__content">
        <div className="pa-timeline__title">{it.title}</div>
        {it.meta && <div className="pa-timeline__meta">{it.meta}</div>}
      </div>
    </li>)}
  </ol>;
}

export function Sidehode({ kicker, title, sub }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return <header className="pa-pagehead"><div className="pa-pagehead__row"><div className="pa-pagehead__text">
    {kicker && <div className="kicker pa-pagehead__kicker">{kicker}</div>}
    <h1 className="pa-pagehead__title">{title}</h1>
    {sub && <p className="pa-pagehead__sub">{sub}</p>}
  </div></div></header>;
}

export function LasterTilstand({ text = "Henter …" }: { text?: string }) {
  return <div className="pa-state pa-state--loading" role="status" aria-live="polite"><span className="pa-state__mono">{text}</span></div>;
}

export function TomTilstand({ icon, title, text, actions }: { icon: LucideIcon; title: string; text?: string; actions?: ReactNode }) {
  return <div className="pa-state pa-state--empty">
    <span className="pa-state__icon"><Ikon icon={icon} size={22} /></span>
    <div className="pa-state__text"><span className="pa-state__title">{title}</span>{text && <span className="pa-state__body">{text}</span>}</div>
    {actions && <div className="pa-state__actions">{actions}</div>}
  </div>;
}

export function FeilTilstand({ icon, title, text, code, retry }: { icon: LucideIcon; title: string; text?: string; code?: string; retry?: ReactNode }) {
  return <div className="pa-state pa-state--error" role="alert">
    <span className="pa-state__icon"><Ikon icon={icon} size={22} /></span>
    <div className="pa-state__text"><span className="pa-state__title">{title}</span>{text && <span className="pa-state__body">{text}</span>}</div>
    {retry && <div className="pa-state__actions">{retry}</div>}
    {code && <span className="pa-state__code">{code}</span>}
  </div>;
}

