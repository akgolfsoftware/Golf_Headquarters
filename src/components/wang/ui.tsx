import type { ReactNode } from "react";

export function WangCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-wang-card bg-wang-card p-5 shadow-wang ${className}`}
    >
      {children}
    </div>
  );
}

export function WangHero({
  kicker,
  title,
  value,
  unit,
  insight,
  action,
}: {
  kicker: string;
  title: string;
  value: string;
  unit?: string;
  insight: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-wang-card bg-wang-navy p-6 text-white">
      <div
        className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full border border-wang-mint/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-2 top-8 size-24 rounded-full border border-wang-mint/20"
        aria-hidden
      />
      <p className="font-wang-brand text-[12px] font-medium uppercase tracking-[0.08em] text-wang-mint">
        {kicker}
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-wang-brand text-[12px] font-medium uppercase tracking-[0.08em] text-white/70">
            {title}
          </p>
          <p className="font-wang-brand text-5xl font-extrabold leading-none tracking-tight tabular-nums">
            {value}
            {unit ? (
              <span className="ml-2 text-lg font-semibold text-wang-mint">
                {unit}
              </span>
            ) : null}
          </p>
        </div>
        {action}
      </div>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80">
        {insight}
      </p>
    </div>
  );
}

export function WangButton({
  children,
  variant = "primary",
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "navy" | "ghost" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const look = {
    primary: "bg-wang-burgunder text-white",
    navy: "bg-wang-navy text-white",
    ghost: "bg-wang-navy/10 text-wang-navy",
    danger: "bg-wang-pink text-white",
  }[variant];
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-12 items-center justify-center rounded-wang-chip px-6 font-wang-brand text-[15px] font-semibold transition-[filter,transform] duration-150 ease-out hover:enabled:brightness-95 active:enabled:scale-[0.97] disabled:opacity-45 ${look}`}
    >
      {children}
    </button>
  );
}

export function StatusChip({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "wait" | "lock" | "info";
  children: ReactNode;
}) {
  const look = {
    ok: "bg-wang-teal/15 text-wang-teal",
    warn: "bg-wang-orange/15 text-wang-orange",
    wait: "bg-wang-navy/10 text-wang-navy",
    lock: "bg-wang-pink/10 text-wang-pink",
    info: "bg-wang-navy/10 text-wang-navy",
  }[tone];
  return (
    <span
      className={`inline-flex h-7 items-center rounded-wang-chip px-3 font-wang-brand text-[12px] font-semibold ${look}`}
    >
      {children}
    </span>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <p className="font-wang-brand text-[12px] font-medium uppercase tracking-[0.08em] text-wang-muted">
      {children}
    </p>
  );
}

export function EmptyLock({ title, body }: { title: string; body: string }) {
  return (
    <WangCard>
      <Label>Ingen tilgang</Label>
      <h2 className="mt-2 font-wang-brand text-2xl font-bold text-wang-ink">
        {title}
      </h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-wang-muted">
        {body}
      </p>
    </WangCard>
  );
}

export function DataRow({
  title,
  sub,
  meta,
  last,
}: {
  title: string;
  sub: string;
  meta?: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-3.5 ${last ? "" : "border-b border-wang-line"}`}
    >
      <div className="min-w-0">
        <p className="truncate font-wang-brand text-[15px] font-semibold text-wang-ink">
          {title}
        </p>
        <p className="truncate text-sm text-wang-muted">{sub}</p>
      </div>
      {meta}
    </div>
  );
}
