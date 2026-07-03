"use client";

/**
 * Onboarding-wizard — mobil-først felt- og valg-byggeklosser (430px).
 * Valg-kort portet til fersk fasit: [historisk fasit, fjernet 2026-07-03] AK Golf HQ Design
 * System/playerhq-app (ph-auth.jsx AOnboarding + app.css .opt-card).
 *
 * Editorial sport-analytics: mono-caps labels, lime-accent på valgt tilstand,
 * card-bg + 3px lime venstrekant på info-banner. 44px touch-targets.
 *
 * Ren presentasjon. Ingen hardkodet hex — kun DS-token-klasser.
 * Ingen emoji — kun lucide-react. ui/-primitiver gjenbrukes (Input, Checkbox).
 */

import { Check, Info, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// ── Felt-label + input ──────────────────────────────────────────
export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground"
      >
        {label}
        {hint && (
          <span className="ml-1.5 font-mono text-[9px] font-semibold normal-case tracking-[0.04em] text-muted-foreground/80">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

export function TextField(
  props: React.InputHTMLAttributes<HTMLInputElement> & { mono?: boolean },
) {
  const { mono, className, ...rest } = props;
  return <Input className={cn(mono && "font-mono", className)} {...rest} />;
}

// ── Hero-illo (kun steg 1) — bevisst mørkt kort løftet fra cream-flaten ─
export function HeroIllo({ label }: { label: string }) {
  return (
    <div className="relative flex h-[88px] items-end overflow-hidden rounded-xl bg-primary px-3 py-2 shadow-[0_8px_22px_-10px_hsl(var(--primary)/0.55)]">
      {/* diagonal-stripe-overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 12px, hsl(var(--primary-foreground)) 12px 24px)",
        }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -right-2.5 -top-2.5 h-14 w-14 rounded-full bg-accent opacity-20 blur-xl"
        aria-hidden
      />
      <span className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent font-display text-[13px] font-bold text-primary">
        ak
      </span>
      <span className="relative z-10 ml-auto font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-accent">
        {label}
      </span>
    </div>
  );
}

// ── Info-banner (mindreårig-note): card-bg + 3px lime venstrekant ─
export function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[14px_1fr] gap-2 rounded-lg border border-border border-l-[3px] border-l-accent bg-card px-3 py-2.5">
      <Info className="mt-0.5 h-3.5 w-3.5 text-primary" strokeWidth={1.5} aria-hidden />
      <p className="text-[11px] leading-relaxed text-foreground">{children}</p>
    </div>
  );
}

// ── Seksjons-eyebrow inne i steg-body ───────────────────────────
export function FieldGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </span>
  );
}

// ── Valg-kort (fasit opt-card: ikon-kvadrat + tittel + check-sirkel) ─
export function OptionRow({
  label,
  sub,
  trailing,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  sub?: string;
  trailing?: string;
  icon?: LucideIcon;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-[14px] border bg-card p-4 text-left transition-[border-color,box-shadow]",
        selected
          ? "border-primary shadow-[inset_0_0_0_1px_hsl(var(--primary))]"
          : "border-border hover:border-primary",
      )}
    >
      {Icon && (
        <span
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            selected ? "bg-primary text-accent" : "bg-secondary text-primary",
          )}
        >
          <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
        </span>
      )}
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          {label}
        </span>
        {sub && (
          <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
            {sub}
          </span>
        )}
      </span>
      {trailing && (
        <span
          className={cn(
            "shrink-0 font-mono text-xs font-extrabold tabular-nums tracking-[-0.005em]",
            selected ? "text-primary" : "text-foreground",
          )}
        >
          {trailing}
        </span>
      )}
      <span
        className={cn(
          "inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px]",
          selected ? "border-primary bg-primary text-accent" : "border-border text-transparent",
        )}
      >
        {selected && <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />}
      </span>
    </button>
  );
}

// ── Multi-pill toggle (sesongmål, preferanser) ──────────────────
export function PillToggle({
  label,
  selected,
  onClick,
  icon: Icon,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 font-mono text-[11px] font-semibold tracking-[0.04em] transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-card text-muted-foreground hover:bg-secondary",
      )}
    >
      {Icon && <Icon className="h-3 w-3" strokeWidth={1.5} aria-hidden />}
      {label}
    </button>
  );
}

// ── Profil-bryter-kort (mosjon / konkurranse) ───────────────────
export function ProfileCard({
  name,
  desc,
  icon: Icon,
  selected,
  onClick,
}: {
  name: string;
  desc: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border-[1.5px] px-2 py-3 text-center transition-colors",
        selected ? "border-primary bg-primary/5" : "border-input bg-card hover:bg-secondary",
      )}
    >
      <span
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          selected ? "bg-primary text-accent" : "bg-secondary text-muted-foreground",
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </span>
      <span className="font-display text-xs font-bold tracking-[-0.015em] text-foreground">
        {name}
      </span>
      <span className="font-mono text-[8px] font-semibold leading-tight tracking-[0.04em] text-muted-foreground">
        {desc}
      </span>
    </button>
  );
}

// ── Implikasjons-banner (lime) ──────────────────────────────────
export function ImplicationBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-accent px-3 py-2 font-mono text-[9px] font-extrabold uppercase leading-relaxed tracking-[0.04em] text-accent-foreground">
      {children}
    </div>
  );
}

// ── Fasilitet-rad (fasit opt-card-utseende, multi-select) ───────
export function FacilityRow({
  name,
  sub,
  icon: Icon,
  selected,
  onClick,
}: {
  name: string;
  sub?: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-[14px] border bg-card p-4 text-left transition-[border-color,box-shadow]",
        selected
          ? "border-primary shadow-[inset_0_0_0_1px_hsl(var(--primary))]"
          : "border-border hover:border-primary",
      )}
    >
      <span
        className={cn(
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          selected ? "bg-primary text-accent" : "bg-secondary text-primary",
        )}
      >
        <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          {name}
        </span>
        {sub && (
          <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
            {sub}
          </span>
        )}
      </span>
      <span
        className={cn(
          "inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px]",
          selected ? "border-primary bg-primary text-accent" : "border-border text-transparent",
        )}
      >
        {selected && <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />}
      </span>
    </button>
  );
}

// ── Frekvens — segmentert kontroll (mono-tall) ──────────────────
export function FrequencySegment({
  options,
  value,
  onChange,
  unit,
}: {
  options: number[];
  value: number;
  onChange: (n: number) => void;
  unit?: string;
}) {
  return (
    <div className="rounded-lg bg-secondary p-2.5">
      <div className="mb-1.5 flex items-baseline gap-1">
        <span className="font-mono text-[26px] font-extrabold leading-none tabular-nums tracking-[-0.025em] text-foreground">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      <div className="flex gap-1">
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            className={cn(
              "h-9 flex-1 rounded-md font-mono text-[13px] font-bold tabular-nums transition-colors",
              value === n
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-card/60",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Coach-kort ──────────────────────────────────────────────────
export function CoachCard({
  initials,
  name,
  role,
  meta,
  selected,
  onClick,
}: {
  initials: string;
  name: string;
  role: string;
  meta: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
        selected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary",
      )}
    >
      {selected && (
        <span className="absolute right-2.5 top-2.5 rounded-[3px] bg-accent px-1.5 py-0.5 font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-accent-foreground">
          Valgt
        </span>
      )}
      <span
        className={cn(
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold",
          selected ? "bg-primary text-accent" : "bg-secondary text-foreground",
        )}
      >
        {initials}
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block font-display text-[13px] font-bold tracking-[-0.015em] text-foreground">
          {name}
        </span>
        <span className="mt-0.5 block font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          {role}
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
          {meta}
        </span>
      </span>
    </button>
  );
}

// ── Abonnement-kort ─────────────────────────────────────────────
export function PlanCard({
  tier,
  price,
  per,
  features,
  footnote,
  recommended,
  selected,
  onClick,
}: {
  tier: string;
  price: string;
  per?: string;
  features: string[];
  footnote?: string;
  recommended?: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-col gap-2 rounded-xl border px-4 py-4 text-left transition-colors",
        selected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary",
      )}
    >
      {recommended && selected && (
        <span className="absolute -top-2 right-3.5 rounded-[3px] bg-accent px-1.5 py-0.5 font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-accent-foreground">
          Anbefalt
        </span>
      )}
      <span
        className={cn(
          "font-mono text-[11px] font-extrabold uppercase tracking-[0.14em]",
          selected ? "text-primary" : "text-muted-foreground",
        )}
      >
        {tier}
      </span>
      <span className="font-mono text-[22px] font-extrabold leading-none text-foreground">
        {price}
        {per && (
          <span className="ml-1 text-[13px] font-medium text-muted-foreground">{per}</span>
        )}
      </span>
      <span className="flex flex-col gap-1.5">
        {features.map((f) => (
          <span key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" strokeWidth={2} aria-hidden />
            {f}
          </span>
        ))}
      </span>
      {footnote && (
        <span className="font-mono text-[10px] text-muted-foreground">{footnote}</span>
      )}
    </button>
  );
}

// ── Oppsummering (siste sjekk) ──────────────────────────────────
export function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-2 last:border-b-0 last:pb-0">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-[13px] font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function SummaryCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-secondary px-4 py-4">
      <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        Du har valgt
      </span>
      {children}
    </div>
  );
}

// ── Samtykke-rad (checkbox-kort) ────────────────────────────────
export function AgreeItem({
  title,
  desc,
  checked,
  onClick,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors",
        checked ? "border-primary bg-primary/5" : "border-border bg-secondary hover:bg-secondary/70",
      )}
    >
      <span className="mt-0.5">
        <Checkbox checked={checked} readOnly tabIndex={-1} className="pointer-events-none" />
      </span>
      <span className="leading-snug">
        <span className="block font-display text-sm font-bold text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}

// ── Sikkerhets-strip (lime, GDPR) ───────────────────────────────
export function SecurityStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-accent/55 bg-accent/20 px-4 py-3 text-[13px] leading-relaxed text-foreground">
      {children}
    </div>
  );
}
