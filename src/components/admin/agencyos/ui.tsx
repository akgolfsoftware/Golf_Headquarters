import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AgencyOS UI-primitiver — port av fasit `agencyos-app/core.jsx` + `agency.css`
 * (.page, .page-head, .btn, .chip, .type, Avatar). Mørkt tema (`.dark`-scope i AdminShell).
 * Alle AgencyOS-skjermer bygger med disse — ikke egne varianter.
 */

export function AgPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-[1320px] px-4 pb-14 pt-5 md:px-7 md:pt-6", className)}>{children}</div>;
}

export function AgPageHead({
  eyebrow,
  title,
  italic,
  lead,
  actions,
  when,
}: {
  eyebrow?: string;
  title: ReactNode;
  italic?: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  when?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="font-mono text-[10px] font-bold uppercase leading-none tracking-[0.12em] text-muted-foreground">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-2 font-display text-[28px] font-bold leading-[1.08] tracking-[-0.02em] text-foreground">
          {title}
          {italic && (
            <>
              {" "}
              <em className="font-normal italic text-primary">{italic}</em>
            </>
          )}
        </h1>
        {lead && <p className="mt-2 max-w-[60ch] text-sm leading-normal text-muted-foreground">{lead}</p>}
      </div>
      {when && (
        <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="inline-flex items-center gap-[5px] text-primary before:h-[6px] before:w-[6px] before:rounded-full before:bg-accent before:shadow-[0_0_6px_rgba(209,248,67,0.7)] before:content-[''] motion-safe:before:animate-pulse">
            Live
          </span>
          {when}
        </div>
      )}
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

const btnVariants = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-card text-foreground shadow-[inset_0_0_0_1px_hsl(var(--border))] hover:bg-secondary",
  ghost: "bg-transparent text-foreground shadow-[inset_0_0_0_1px_hsl(var(--border))] hover:bg-secondary",
} as const;

export function agBtnClass(
  variant: keyof typeof btnVariants = "primary",
  size: "md" | "sm" | "lg" = "md",
): string {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-[7px] whitespace-nowrap rounded-[10px] border-0 font-display font-semibold tracking-[-0.005em] transition-all",
    size === "sm" ? "h-8 max-md:h-11 px-[11px] text-xs" : size === "lg" ? "h-11 px-5 text-sm" : "h-[38px] max-md:h-11 px-[15px] text-[13px]",
    btnVariants[variant],
  );
}

const chipTones = {
  ok: "bg-chip-ok-bg text-chip-ok-fg",
  warn: "bg-chip-warn-bg text-chip-warn-fg",
  alert: "bg-chip-alert-bg text-chip-alert-fg",
  neu: "bg-secondary text-muted-foreground",
  lime: "bg-accent text-accent-foreground",
} as const;

export function AgChip({
  tone = "neu",
  children,
  className,
}: {
  tone?: keyof typeof chipTones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded-full px-2 py-[3px] font-mono text-[9px] font-extrabold uppercase leading-none tracking-[0.06em]",
        chipTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Innboks-type-chip (Godkjenn/Forespørsel/Melding/Råd) — fasit `.type.*`. */
const typeTones = {
  appr: "bg-accent/30 text-primary",
  req: "bg-chip-req-bg text-info",
  msg: "bg-secondary text-muted-foreground",
  advice: "bg-warning/[0.14] text-warning",
} as const;

export type AgInboxType = keyof typeof typeTones;

/** size="inline" = innboks-rad (fasit .ix-row .type, 8px mono caps) · "row" = Forespørsler (arvet str.) */
export function AgTypeChip({
  type,
  size = "inline",
  children,
}: {
  type: AgInboxType;
  size?: "inline" | "row";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[3px]",
        size === "inline"
          ? "px-[5px] py-px font-mono text-[8px] font-extrabold uppercase tracking-[0.12em]"
          : "px-[5px] py-px text-[15px] font-normal leading-none",
        typeTones[type],
      )}
    >
      {children}
    </span>
  );
}

/** Avatar med initialer — fasit-toner: pri (lime/primær), lime (accent), neu (secondary). */
export function AgAvatar({
  initials,
  size = 30,
  tone = "neu",
  className,
}: {
  initials: string;
  size?: number;
  tone?: "pri" | "lime" | "neu";
  className?: string;
}) {
  const tones = {
    pri: "bg-primary text-primary-foreground",
    lime: "bg-accent text-accent-foreground",
    neu: "bg-secondary text-secondary-foreground ring-1 ring-inset ring-border",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold",
        tones[tone],
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials}
    </span>
  );
}

/* ---------- Tabell-primitiver — fasit `table.tbl` + tilbehør ---------- */

export function AgTable({ children, className }: { children: ReactNode; className?: string }) {
  return <table className={cn("w-full border-collapse", className)}>{children}</table>;
}

export function AgTh({
  num,
  children,
  className,
}: {
  num?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "whitespace-nowrap border-b border-border px-[14px] py-[10px] font-mono text-[9px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground",
        num ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function AgTd({
  num,
  children,
  className,
}: {
  num?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-[14px] py-[11px] align-middle text-[13px]",
        num && "text-right font-mono font-semibold tabular-nums",
        className,
      )}
    >
      {children}
    </td>
  );
}

/** Rad med hover + skillelinje (fasit `table.tbl tbody tr`). Bruk i <tbody>. */
export const agTrClass =
  "cursor-pointer transition-colors hover:bg-secondary [&+tr>td]:border-t [&+tr>td]:border-border";

/** Spiller-celle: avatar 30 + navn + mono-undertekst (fasit `.cell-player`). */
export function AgPlayerCell({
  initials,
  name,
  sub,
  tone = "neu",
  size = 30,
}: {
  initials: string;
  name: string;
  sub?: string;
  tone?: "pri" | "lime" | "neu";
  size?: number;
}) {
  return (
    <span className="flex items-center gap-[10px]">
      <AgAvatar initials={initials} size={size} tone={tone} />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold leading-[1.25] tracking-[-0.005em] text-foreground">
          {name}
        </span>
        {sub && (
          <span className="mt-px block font-mono text-[10px] leading-[1.2] text-muted-foreground">{sub}</span>
        )}
      </span>
    </span>
  );
}

/** Status-dot m/ mono-tekst (fasit `.status-dot`). */
export function AgStatusDot({
  tone = "neu",
  children,
}: {
  tone?: "ok" | "warn" | "alert" | "neu";
  children: ReactNode;
}) {
  const dot = {
    ok: "before:bg-success",
    warn: "before:bg-warning",
    alert: "before:bg-destructive",
    neu: "before:bg-muted-foreground",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[7px] font-mono text-[11px] font-semibold text-muted-foreground",
        "before:h-[7px] before:w-[7px] before:rounded-full before:content-['']",
        dot[tone],
      )}
    >
      {children}
    </span>
  );
}

/** Mini-sparkline (fasit `Spark`): polyline av tallserie. */
export function AgSpark({
  points,
  color = "hsl(var(--primary))",
  w = 64,
  h = 20,
}: {
  points: number[];
  color?: string;
  w?: number;
  h?: number;
}) {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const rng = max - min || 1;
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / rng) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block">
      <polyline
        points={d}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Toolbar over tabell: søk + filterchips (fasit `.tbl-toolbar`). */
export function AgTableToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-[14px] py-3">
      {children}
    </div>
  );
}

export function AgFilterChip({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-8 cursor-pointer items-center gap-[6px] rounded-lg border border-border bg-card px-[11px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground hover:bg-secondary"
    >
      {children}
    </button>
  );
}

/** Segmentert kontroll (fasit `.seg`): aktiv = card-bakgrunn + primary-tekst. */
export function AgSeg({
  options,
  active,
}: {
  options: string[];
  active: string;
}) {
  return (
    <span className="inline-flex gap-[2px] rounded-lg bg-secondary p-[3px]">
      {options.map((o) => (
        <span
          key={o}
          className={cn(
            "inline-flex h-[26px] items-center rounded-md px-[11px] font-mono text-[10px] font-bold uppercase tracking-[0.06em]",
            o === active ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
          )}
        >
          {o}
        </span>
      ))}
    </span>
  );
}

/** Seksjonshode m/ teller og hairline (fasit `.sechead`). */
export function AgSectionHead({
  children,
  count,
  action,
  className,
}: {
  children: ReactNode;
  count?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-[14px] mt-7 flex items-center gap-[10px] font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground",
        "after:h-px after:flex-1 after:bg-border after:content-['']",
        className,
      )}
    >
      {children}
      {count != null && <span className="font-bold text-muted-foreground">· {count}</span>}
      {action}
    </div>
  );
}

/* ================================================================
 * MOBIL-PRIMITIVER (Fase 4 — AgencyOS mobil, < md)
 * Brukes av mobil-listene (Stall, Mer). Rør ikke primitivene over.
 * ================================================================ */

/**
 * Trykkbar liste-rad for mobil: leading (avatar/ikon) + tittel/sub +
 * valgfri trailing + chevron. Min-høyde 56px (touch-mål ≥ 44px).
 * Forelderen styrer skillelinjer (f.eks. `divide-y divide-border`).
 */
export function AgMobileRow({
  href,
  leading,
  title,
  sub,
  trailing,
  className,
}: {
  href: string;
  leading?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-[56px] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-secondary active:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        className,
      )}
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold leading-[1.25] tracking-[-0.005em] text-foreground">
          {title}
        </span>
        {sub && (
          <span className="mt-px block truncate font-mono text-[10px] leading-[1.3] text-muted-foreground">
            {sub}
          </span>
        )}
      </span>
      {trailing}
      <ChevronRight
        className="h-4 w-4 shrink-0 text-muted-foreground"
        strokeWidth={1.5}
        aria-hidden
      />
    </Link>
  );
}
