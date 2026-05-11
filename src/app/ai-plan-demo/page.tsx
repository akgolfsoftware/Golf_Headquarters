/**
 * PILOT — AI Plan Generator modal (Brief-steget)
 * URL: /ai-plan-demo
 * Bygd fra wireframe/design-files-v2/modaler-A/10-ai-plan-generator.html
 */

import Link from "next/link";
import { Sparkles, X } from "lucide-react";

export default function AIPlanDemo() {
  return (
    <div className="min-h-screen bg-[var(--surface,#FAFAF7)]">
      <div className="fixed inset-0 bg-[rgba(10,31,24,0.5)]" aria-hidden="true" />

      <div className="relative mx-auto my-8 max-w-[720px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Animated accent stripe */}
        <div
          className="h-1"
          style={{
            background:
              "linear-gradient(90deg, var(--color-primary,#005840) 0%, var(--color-accent,#D1F843) 50%, var(--color-primary,#005840) 100%)",
            backgroundSize: "200% 100%",
          }}
          aria-hidden="true"
        />

        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 py-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
              <Sparkles className="h-3 w-3" strokeWidth={2} />
              AI-generert plan · Coach Pro
            </div>
            <h2 className="mt-1 font-display text-[22px] font-bold leading-tight tracking-tight">
              Beskriv hva agenten skal lage
            </h2>
            <p className="mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
              Naturlig språk → komplett plan på ~15 sek. Du kan justere alt etterpå.
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

        {/* AI steps */}
        <div className="flex items-center gap-1.5 border-b border-border bg-[var(--surface-alt,#F1EEE5)] px-8 py-3.5">
          <StepDot num="1" state="active" />
          <StepLabel active>Brief</StepLabel>
          <StepLine />
          <StepDot num="2" state="todo" />
          <StepLabel>Generering</StepLabel>
          <StepLine />
          <StepDot num="3" state="todo" />
          <StepLabel>Resultat</StepLabel>
        </div>

        {/* Body */}
        <div className="flex max-h-[calc(100vh-280px)] flex-col gap-5 overflow-y-auto px-8 py-6">
          {/* Brief textarea */}
          <div>
            <FieldLabel hint="— mer kontekst gir bedre plan">Beskriv målet</FieldLabel>
            <textarea
              className="min-h-[168px] w-full resize-y rounded-lg border-2 border-border bg-card px-4 py-3.5 text-[14px] leading-[1.55] text-foreground outline-none transition-colors placeholder:italic placeholder:text-muted-foreground focus:border-primary"
              placeholder="Beskriv hva spilleren skal trene på …"
              defaultValue={`Markus skal forberede seg til Sørlandsåpent som spilles om 6 uker. Hovedfokus er TEK-arbeid med jernkøllene fra 130-170m og bunkerspill. Markus har trent jevnt hele vinteren og har god grunnform, men strever fortsatt med kontaktkonsistens på halvlange jern.

Han har lite tid i hverdagen — maks 3 økter/uke + en lengre helg-økt. Vi vil unngå overtrening uke 5 (deload) og peake mot konkurransehelgen.`}
            />
            <div className="mt-1.5 flex justify-between font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>389 / 1000 tegn</span>
              <span>Detaljnivå · godt</span>
            </div>
          </div>

          {/* Player picker */}
          <div>
            <FieldLabel>Spiller</FieldLabel>
            <div className="flex items-center gap-3 rounded-lg border-2 border-border bg-card px-4 py-3">
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-display text-[13px] font-semibold italic text-accent"
                style={{ background: "linear-gradient(135deg, #005840, #16A34A)" }}
              >
                MP
              </span>
              <div className="flex-1">
                <div className="font-display text-[15px] font-semibold tracking-tight text-foreground">
                  Markus Roinås Pedersen
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  HCP 12,4 · Kat A · Pro-tier · 24 økter siste 8u
                </div>
              </div>
              <button className="font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
                Endre →
              </button>
            </div>
          </div>

          {/* Generator mode */}
          <div>
            <FieldLabel>Generator-modus</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              <ModeOpt name="Konservativ" desc="Lavt volum · stabil progresjon" />
              <ModeOpt name="Balansert" desc="Anbefalt · justert volum" active />
              <ModeOpt name="Aggressiv" desc="Høyt volum · raske endringer" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-[var(--surface-alt,#F1EEE5)] px-8 py-4">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            Avbryt
          </Link>
          <div className="flex items-center gap-2">
            <button className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              ← Tilbake
            </button>
            <button className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Generer plan →
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      {children}
      {hint && (
        <span className="text-[11px] font-medium normal-case tracking-normal text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  );
}

function StepDot({
  num,
  state,
}: {
  num: string;
  state: "active" | "done" | "todo";
}) {
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border-2 font-mono text-[11px] font-bold ${
        state === "active"
          ? "border-primary bg-accent text-primary shadow-[0_0_0_3px_var(--brand-primary-soft,rgba(0,88,64,0.08))]"
          : state === "done"
            ? "border-primary bg-primary text-accent"
            : "border-border bg-card text-muted-foreground"
      }`}
    >
      {num}
    </span>
  );
}

function StepLabel({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`ml-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function StepLine() {
  return <span className="ml-2 h-px max-w-[36px] flex-1 bg-border" aria-hidden="true" />;
}

function ModeOpt({
  name,
  desc,
  active,
}: {
  name: string;
  desc: string;
  active?: boolean;
}) {
  return (
    <button
      className={`rounded-lg border-2 px-4 py-3.5 text-left transition-all ${
        active
          ? "border-primary bg-[var(--brand-primary-soft,rgba(0,88,64,0.08))]"
          : "border-border bg-card hover:border-muted-foreground"
      }`}
    >
      <div
        className={`font-display text-[14px] font-semibold tracking-tight ${
          active ? "text-primary" : "text-foreground"
        }`}
      >
        {name}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {desc}
      </div>
    </button>
  );
}
