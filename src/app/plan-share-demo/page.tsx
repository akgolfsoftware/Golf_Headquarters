/**
 * PILOT — PlanShare modal
 * URL: /plan-share-demo
 * Bygd fra wireframe/design-files-v2/modaler-A/07-plan-share.html
 */

import Link from "next/link";
import {
  Calendar,
  Check,
  Copy,
  Edit3,
  Eye,
  MessageCircle,
  Share2,
  X,
} from "lucide-react";

export default function PlanShareDemo() {
  return (
    <div className="min-h-screen bg-[var(--surface,#FAFAF7)]">
      <div className="fixed inset-0 bg-[rgba(10,31,24,0.5)]" aria-hidden="true" />

      <div className="relative mx-auto my-8 max-w-[560px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 py-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              <Share2 className="h-3 w-3" strokeWidth={1.75} />
              CoachHQ · plan-detalj · del
            </div>
            <h2 className="mt-1 font-display text-[22px] font-bold leading-tight tracking-tight">
              Del Sommer-toppform
            </h2>
            <p className="mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
              Markus R. Pedersen · 9. mai – 30. juni 2026
            </p>
          </div>
          <Link
            href="/"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </Link>
        </header>

        {/* Body */}
        <div className="flex max-h-[calc(100vh-220px)] flex-col gap-5 overflow-y-auto px-8 py-5">
          {/* Hvem skal motta */}
          <Section title="Hvem skal motta?">
            <div className="flex flex-wrap gap-1.5">
              <TabChip active>Foresatte</TabChip>
              <TabChip>Annen coach</TabChip>
              <TabChip>Spilleren</TabChip>
              <TabChip>Ekstern · e-post</TabChip>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <RecipientRow
                checked
                initials="AP"
                bg="#B8852A"
                name="Anne Pedersen"
                relation="· Mor"
                email="anne.pedersen@gmail.com"
                lastSeen="aktiv i dag"
              />
              <RecipientRow
                initials="LP"
                bg="var(--ink-muted,#5E5C57)"
                name="Lars Pedersen"
                relation="· Far"
                email="lars@pedersengruppen.no"
                lastSeen="7 d siden"
              />
              <RecipientRow
                initials="EP"
                bg="var(--ink-subtle,#9D9C95)"
                name="Emma Pedersen"
                relation="· Søster (myndig)"
                email="emma.p@uib.no"
                lastSeen="aldri"
              />
            </div>
          </Section>

          {/* Tilgangsnivå */}
          <Section title="Tilgangsnivå" topBorder>
            <div className="flex flex-col gap-2">
              <RadioRow
                checked
                title="Kun lese"
                desc="Se plan, økter og pyramide · ingen handlinger"
                icon={<Eye className="h-3.5 w-3.5" strokeWidth={1.75} />}
              />
              <RadioRow
                title="Kommentere"
                desc="Lese + skrive kommentarer på økter"
                icon={<MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />}
              />
              <RadioRow
                title="Redigere"
                desc="Full coach-tilgang · kun for annen coach"
                icon={<Edit3 className="h-3.5 w-3.5" strokeWidth={1.75} />}
              />
            </div>
          </Section>

          {/* Utløper */}
          <Section title="Utløper" topBorder>
            <ToggleRow
                on
              title="Lenken utløper etter plan-periode"
              desc="Tilgang trekkes automatisk når planen er ferdig"
            />
            <div className="mt-2.5 flex items-center gap-2.5 rounded-lg border-2 border-border bg-[var(--surface,#FAFAF7)] px-3.5 py-2.5">
              <Calendar className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              <span className="font-mono text-[13px] font-medium tabular-nums text-foreground">
                Utløper 30. juni 2026 · kl. 23:59
              </span>
            </div>
          </Section>

          {/* Delings-lenke */}
          <Section title="Delings-lenke" topBorder>
            <div className="grid grid-cols-[1fr_auto] items-stretch gap-2.5 rounded-lg border-2 border-border bg-[var(--surface,#FAFAF7)] py-1.5 pl-3.5 pr-1.5">
              <span className="self-center truncate font-mono text-[12px] text-muted-foreground">
                akgolf.app/p/<b className="font-semibold text-foreground">sommer-toppform-mp</b>
                ?t=read
              </span>
              <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 font-display text-[12px] font-semibold text-accent transition-opacity hover:opacity-90">
                <Copy className="h-3 w-3" strokeWidth={2} />
                Kopier
              </button>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-[var(--surface-alt,#F1EEE5)] px-8 py-4">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            Avbryt
          </Link>
          <button className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Send invitasjon →
          </button>
        </footer>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  topBorder,
}: {
  title: string;
  children: React.ReactNode;
  topBorder?: boolean;
}) {
  return (
    <section
      className={`flex flex-col gap-3 ${topBorder ? "border-t border-border pt-5" : ""}`}
    >
      <h4 className="font-display text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      {children}
    </section>
  );
}

function TabChip({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-transparent bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function RecipientRow({
  checked,
  initials,
  bg,
  name,
  relation,
  email,
  lastSeen,
}: {
  checked?: boolean;
  initials: string;
  bg: string;
  name: string;
  relation: string;
  email: string;
  lastSeen: string;
}) {
  return (
    <label
      className={`grid cursor-pointer grid-cols-[22px_auto_1fr_auto] items-center gap-3 rounded-lg border-2 px-3.5 py-2.5 transition-colors ${
        checked
          ? "border-primary bg-[var(--brand-primary-soft,rgba(0,88,64,0.08))]"
          : "border-border bg-[var(--surface,#FAFAF7)] hover:border-muted-foreground"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-md ${
          checked ? "bg-primary text-accent" : "border-2 border-border bg-card"
        }`}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
        style={{ background: bg }}
      >
        {initials}
      </span>
      <span>
        <span className="block text-[13px] font-semibold text-foreground">
          {name}{" "}
          <span className="ml-1 font-mono text-[11px] font-medium text-muted-foreground">
            {relation}
          </span>
        </span>
        <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{email}</span>
      </span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {lastSeen}
      </span>
    </label>
  );
}

function RadioRow({
  checked,
  title,
  desc,
  icon,
}: {
  checked?: boolean;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <label
      className={`grid cursor-pointer grid-cols-[22px_1fr_auto] items-center gap-3 rounded-lg border-2 px-3.5 py-3 transition-colors ${
        checked
          ? "border-primary bg-[var(--brand-primary-soft,rgba(0,88,64,0.08))]"
          : "border-border bg-[var(--surface,#FAFAF7)] hover:border-muted-foreground"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          checked ? "border-primary" : "border-border bg-card"
        }`}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
      <span>
        <span className="block text-[13px] font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{desc}</span>
      </span>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-lg ${
          checked
            ? "bg-primary text-accent"
            : "bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground"
        }`}
      >
        {icon}
      </span>
    </label>
  );
}

function ToggleRow({
  on,
  title,
  desc,
}: {
  on?: boolean;
  title: string;
  desc: string;
}) {
  return (
    <div
      className={`grid grid-cols-[1fr_auto] items-center gap-3.5 rounded-lg border-2 px-3.5 py-3 ${
        on
          ? "border-primary bg-[var(--brand-primary-soft,rgba(0,88,64,0.08))]"
          : "border-border bg-[var(--surface,#FAFAF7)]"
      }`}
    >
      <span>
        <span className="block text-[13px] font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{desc}</span>
      </span>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${
          on ? "bg-primary" : "bg-border"
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            on ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </div>
  );
}
