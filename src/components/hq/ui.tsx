import type { UiState } from "@/lib/hq/types";
import { UNKNOWN } from "@/lib/hq/data";

export function cn(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

export function Kicker({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "haste" | "warn";
}) {
  return (
    <div
      className={cn(
        "font-display text-sm font-semibold uppercase tracking-etikett",
        tone === "haste" && "text-rust-500",
        tone === "warn" && "text-amber-600",
        tone === "default" && "text-grafitt-600",
      )}
    >
      {children}
    </div>
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="m-0 max-w-[22ch] font-display text-2xl font-semibold tracking-tight text-grafitt-900 md:text-3xl">
      {children}
    </h1>
  );
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="m-0 max-w-[66ch] text-pretty text-base text-grafitt-600">{children}</p>;
}

export function Felt({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display text-xs font-semibold uppercase tracking-etikett text-grafitt-500">
      {children}
    </div>
  );
}

export function Seksjon({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="m-0 text-xs font-semibold uppercase tracking-seksjon text-grafitt-600">
      {children}
    </h2>
  );
}

export function Meta({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-meta text-2xs font-medium uppercase tracking-meta text-grafitt-500", className)}>
      {children}
    </span>
  );
}

export function StatusText({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "haste" | "warn" | "info" | "ok";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[26px] items-center self-start rounded-sm px-2.5 font-meta text-xs uppercase tracking-etikett",
        tone === "haste" && "bg-rust-100 text-rust-600",
        tone === "warn" && "bg-amber-100 text-amber-700",
        tone === "info" && "bg-bla-100 text-bla-700",
        tone === "ok" && "bg-sand-200 text-grafitt-700",
        tone === "neutral" && "bg-sand-200 text-grafitt-600",
      )}
    >
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  onClick,
  className,
  danger,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-control px-5 text-base font-medium transition-transform duration-150 active:scale-[0.97] disabled:opacity-40",
        danger ? "bg-handling text-sand-100 hover:bg-handling-hover" : "bg-grafitt-900 text-sand-100 hover:bg-grafitt-800",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  danger,
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-control border px-4 text-base transition-transform duration-150 active:scale-[0.97] disabled:opacity-40",
        danger
          ? "border-sand-500 bg-hevet text-rust-500 hover:border-rust-500"
          : "border-sand-500 bg-hevet text-grafitt-900 hover:border-grafitt-900",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Row({
  kicker,
  title,
  sub,
  meta,
  onClick,
  current,
}: {
  kicker?: string;
  title: string;
  sub?: string;
  meta?: string;
  onClick?: () => void;
  current?: boolean;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "grid min-h-12 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-sand-200 py-3.5 text-left",
        current && "bg-sand-150",
      )}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        {kicker ? <Meta className="text-grafitt-600">{kicker}</Meta> : null}
        <span className="text-base font-medium text-grafitt-900">{title}</span>
        {sub ? <span className="text-xs text-grafitt-500">{sub}</span> : null}
      </span>
      {meta ? <span className="font-meta text-xs text-grafitt-600">{meta}</span> : <span className="text-grafitt-500">›</span>}
    </Comp>
  );
}

export function Axes({
  pyramid,
  area,
  motor,
  load,
  press,
}: {
  pyramid: string;
  area: string;
  motor: string;
  load: string;
  press: string;
}) {
  const items = [
    ["Pyramide", pyramid],
    ["Område", area],
    ["Motorikk", motor],
    ["Belastning", load],
    ["Press", press],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {items.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1 border-t border-sand-200 pt-2">
          <Meta>{k}</Meta>
          <span className="text-sm text-grafitt-900">{v || UNKNOWN}</span>
        </div>
      ))}
    </div>
  );
}

export function Unknown({ label }: { label?: string }) {
  return (
    <span className="font-meta text-grafitt-500">
      {UNKNOWN}
      {label ? <span className="ml-2 font-sans text-xs normal-case tracking-normal">{label}</span> : null}
    </span>
  );
}

export function StateGate({
  tilstand,
  children,
  emptyTitle = "Ingen data ennå",
  emptyBody = "Feltet er tomt. Det er ikke det samme som null.",
}: {
  tilstand?: UiState;
  children: React.ReactNode;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (tilstand === "laster") {
    return (
      <div className="flex flex-col gap-3 py-8">
        <StatusText tone="warn">Laster · ikke bekreftet</StatusText>
        <Lead>Vi venter på svar. Ingenting er skrevet.</Lead>
      </div>
    );
  }
  if (tilstand === "feil") {
    return (
      <div className="flex flex-col gap-3 py-8">
        <StatusText tone="haste">Henting feilet · ingenting tapt</StatusText>
        <Lead>Kontroller tilkoblingen. Prøv igjen overskriver ikke data.</Lead>
      </div>
    );
  }
  if (tilstand === "frakoblet" || tilstand === "offline") {
    return (
      <div className="flex flex-col gap-3 py-8">
        <StatusText tone="warn">Uten nett · lokal kø</StatusText>
        <Lead>Endringer ligger her til synk er bekreftet. Utfallet er ukjent til da.</Lead>
      </div>
    );
  }
  if (tilstand === "tilgang") {
    return (
      <div className="flex flex-col gap-3 py-8">
        <StatusText tone="haste">Tilgang avvist</StatusText>
        <Lead>Rollen din ser ikke denne flaten. Ingenting er endret.</Lead>
      </div>
    );
  }
  if (tilstand === "tom") {
    return (
      <div className="flex flex-col gap-3 py-8">
        <StatusText>Tomt</StatusText>
        <Title>{emptyTitle}</Title>
        <Lead>{emptyBody}</Lead>
      </div>
    );
  }
  return <>{children}</>;
}

export function ScreenStack({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-6 md:gap-7">{children}</div>;
}

export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-md border border-sand-200 bg-hevet px-5 py-4">
      {children}
    </section>
  );
}

export function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-sand-200 pt-3">
      <Meta>{label}</Meta>
      <span className="font-display text-xl font-semibold tracking-tight text-grafitt-900">{value}</span>
      {hint ? <span className="text-xs text-grafitt-500">{hint}</span> : null}
    </div>
  );
}
