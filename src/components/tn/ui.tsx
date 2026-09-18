import type { ReactNode } from "react";

export function TnCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-tn-lg bg-tn-card p-[22px] shadow-tn ${className}`}
    >
      {children}
    </div>
  );
}

export function TnKicker({ children }: { children: ReactNode }) {
  return (
    <p className="font-tn-mono text-[11px] font-medium uppercase tracking-[0.16em] text-tn-muted">
      {children}
    </p>
  );
}

export function TnButton({
  children,
  variant = "navy",
  onClick,
  disabled,
}: {
  children: ReactNode;
  variant?: "navy" | "ghost" | "danger";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const look = {
    navy: "bg-tn-navy text-white",
    ghost: "border border-tn-line bg-white text-tn-navy",
    danger: "bg-tn-red text-white",
  }[variant];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full px-5 font-tn text-sm font-semibold active:enabled:scale-[0.97] disabled:opacity-45 ${look}`}
    >
      {children}
    </button>
  );
}

export function TnChip({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "wait" | "lock" | "info";
  children: ReactNode;
}) {
  const look = {
    ok: "bg-tn-ok-bg text-tn-ok-text",
    warn: "bg-tn-warn-bg text-tn-warn-text",
    wait: "bg-tn-navy-100 text-tn-navy-700",
    lock: "bg-tn-err-bg text-tn-err-text",
    info: "bg-tn-navy-50 text-tn-navy-700",
  }[tone];
  return (
    <span
      className={`inline-flex h-7 items-center rounded-full px-3 font-tn text-xs font-semibold ${look}`}
    >
      {children}
    </span>
  );
}

export function TnEmpty({ title, body }: { title: string; body: string }) {
  return (
    <TnCard>
      <TnKicker>Ingen tilgang</TnKicker>
      <h2 className="mt-2 font-tn text-[1.75rem] font-bold tracking-[-0.02em] text-tn-navy">
        {title}
      </h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-tn-muted">{body}</p>
    </TnCard>
  );
}

export function TnRow({
  title,
  sub,
  meta,
  last,
  mark,
}: {
  title: string;
  sub: string;
  meta?: ReactNode;
  last?: boolean;
  mark?: "red" | "navy" | "amber" | "none";
}) {
  return (
    <div
      className={`flex min-h-11 items-center justify-between gap-3 py-3.5 ${last ? "" : "border-b border-tn-line"}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        {mark && mark !== "none" ? (
          <span
            className={`mt-1.5 size-2 shrink-0 rounded-full ${
              mark === "red"
                ? "bg-tn-red"
                : mark === "amber"
                  ? "bg-tn-warn"
                  : "bg-tn-navy"
            }`}
          />
        ) : null}
        <div className="min-w-0">
          <p className="truncate font-tn text-sm font-semibold text-tn-navy">{title}</p>
          <p className="truncate text-xs text-tn-muted">{sub}</p>
        </div>
      </div>
      {meta}
    </div>
  );
}

export function TnHead({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <TnKicker>{kicker}</TnKicker>
        <h1 className="mt-1.5 font-tn text-[2.25rem] font-bold leading-none tracking-[-0.035em] text-tn-navy">
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}

export function TnCoverage({
  value,
  of,
  insight,
}: {
  value: string;
  of: string;
  insight: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-tn-lg bg-tn-card p-7 shadow-tn sm:flex-row sm:items-center sm:gap-9">
      <div className="shrink-0">
        <TnKicker>Dekningsgrad</TnKicker>
        <div className="mt-1 flex items-baseline gap-2.5">
          <span className="font-tn-mono text-[3rem] font-semibold leading-none tracking-[-0.035em] text-tn-navy">
            {value}
          </span>
          <span className="text-lg font-semibold text-tn-muted">{of}</span>
        </div>
        <p className="mt-1 text-xs text-tn-muted">{insight}</p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex h-3 overflow-hidden rounded-full bg-tn-sunken">
          <div className="w-[36%] bg-tn-navy" />
          <div className="w-[27%] bg-tn-navy-400" />
          <div className="w-[18%] bg-tn-warn" />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-5 text-sm">
          <span>Komplett 4</span>
          <span className="text-tn-muted">Delvis 3</span>
          <span className="text-tn-warn-text">Mangler 2</span>
          <span className="text-tn-faint">Uten 2</span>
        </div>
      </div>
    </div>
  );
}
