import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/v2";

/**
 * Delte Paper-primitiver for katalog-flatene (coacher/anlegg/blogg/cases/
 * turneringer). Rene presentasjonskomponenter, ingen data-henting.
 * Fasit: designsystem/paper/fase2/marketing/marketing-katalog.html.
 */

export function PkSek({
  children,
  tett,
  notop,
  className,
  style,
}: {
  children: ReactNode;
  tett?: boolean;
  notop?: boolean;
  className?: string;
  style?: import("react").CSSProperties;
}) {
  return (
    <div
      className={["pk-sek", tett ? "pk-sek-tett" : "", notop ? "pk-sek-notop" : "", className ?? ""].join(" ").trim()}
      style={style}
    >
      <div className="pk-wrap">{children}</div>
    </div>
  );
}

export function PkEyebrow({ children }: { children: ReactNode }) {
  return <span className="pk-eyebrow">{children}</span>;
}

export function PkHero({ children }: { children: ReactNode }) {
  return <h1 className="pk-hero">{children}</h1>;
}

export function PkSekt({ children }: { children: ReactNode }) {
  return <h2 className="pk-sekt">{children}</h2>;
}

export function PkIng({ children }: { children: ReactNode }) {
  return <p className="pk-ing">{children}</p>;
}

export function PkProsa({ children }: { children: ReactNode }) {
  return <div className="pk-prosa">{children}</div>;
}

export function PkCta({
  children,
  href,
  clay,
  ghost,
  small,
  icon = "arrow-right",
  onClick,
  type,
}: {
  children: ReactNode;
  href?: string;
  clay?: boolean;
  ghost?: boolean;
  small?: boolean;
  icon?: string | null;
  onClick?: () => void;
  type?: "button";
}) {
  const cls = ["pk-btn", clay ? "pk-btn-clay" : ghost ? "" : "pk-btn-ink", small ? "pk-btn-sm" : ""]
    .join(" ")
    .trim();
  const inner = (
    <>
      {children}
      {icon && <Icon name={icon} size={small ? 13 : 15} />}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} className={cls} onClick={onClick}>
      {inner}
    </button>
  );
}

export function PkKat({ children }: { children: ReactNode }) {
  return <div className="pk-kat">{children}</div>;
}

export function PkKort({
  children,
  href,
  hover,
  tint,
  pad,
  className,
}: {
  children: ReactNode;
  href?: string;
  hover?: boolean;
  tint?: boolean;
  pad?: boolean;
  className?: string;
}) {
  const cls = ["pk-kort", hover ? "pk-kort-hover" : "", tint ? "pk-kort-tint" : "", pad ? "pk-kort-pad" : "", className ?? ""]
    .join(" ")
    .trim();
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}

export function PkBilde({ label }: { label: string }) {
  return (
    <div className="pk-bilde" aria-hidden="true">
      {label}
    </div>
  );
}

export function PkFilterrad({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="pk-filterrad" role="group" aria-label={label}>
      {children}
    </div>
  );
}

export function PkDetalj({ children }: { children: ReactNode }) {
  return <div className="pk-detalj">{children}</div>;
}

export function PkFakta({ children }: { children: ReactNode }) {
  return <aside className="pk-fakta">{children}</aside>;
}

export function PkLinje({ label, verdi }: { label: string; verdi: ReactNode }) {
  return (
    <div className="pk-linje">
      {label}
      <span className="pk-v">{verdi}</span>
    </div>
  );
}

export function PkTom({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="pk-tom">
      <h3>{title}</h3>
      <p>{description}</p>
      {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

export function PkTag({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return <span className={"pk-tag" + (accent ? " pk-tag-accent" : "")}>{children}</span>;
}

export function PkKpi({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="pk-kpi">
      <span className="pk-k">{label}</span>
      <span className="pk-v">{value}</span>
      {sub && <span className="pk-w">{sub}</span>}
    </div>
  );
}
