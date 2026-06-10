import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * AgencyOS UI-primitiver — port av fasit `agencyos-app/core.jsx` + `agency.css`
 * (.page, .page-head, .btn, .chip, .type, Avatar). Mørkt tema (`.dark`-scope i AdminShell).
 * Alle AgencyOS-skjermer bygger med disse — ikke egne varianter.
 */

export function AgPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-[1320px] px-7 pb-14 pt-6", className)}>{children}</div>;
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
    size === "sm" ? "h-8 px-[11px] text-xs" : size === "lg" ? "h-11 px-5 text-sm" : "h-[38px] px-[15px] text-[13px]",
    btnVariants[variant],
  );
}

const chipTones = {
  ok: "bg-success/15 text-success",
  warn: "bg-warning/15 text-warning",
  alert: "bg-destructive/15 text-destructive",
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
        "inline-flex items-center gap-[5px] rounded-full px-2 py-[3px] font-mono text-[9px] font-extrabold uppercase tracking-[0.06em]",
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
