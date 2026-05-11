/**
 * Onboarding 2/4 — Spiller-profil
 * Bygd fra wireframe/design-files-v2/screens/32-onboarding-spiller.html
 * URL: /onboarding-spiller-demo
 */

import { AlertTriangle } from "lucide-react";

export default function OnboardingSpillerDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDEAE2] to-[#F5F2EA] p-8 sm:p-9">
      <div className="mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl bg-background shadow-[0_24px_60px_-20px_rgba(10,31,24,0.18)]">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">
          {/* Narrative pane */}
          <aside className="flex flex-col gap-8 bg-[#0A1F18] p-10 text-[#F5F4EE]">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-[#0A1F18]">
                AK
              </div>
              <div className="font-display text-[15px] font-semibold tracking-tight">
                AK Golf HQ
              </div>
            </div>

            <div>
              <h2 className="font-display text-[28px] font-medium leading-[1.1] tracking-tight">
                La oss <em className="italic font-normal text-accent">kalibrere</em> der du står i dag.
              </h2>
              <p className="mt-4 text-[14px] leading-[1.6] text-[rgba(245,244,238,0.80)]">
                Vi setter ikke karakterer — vi bruker tallene for å lage en realistisk pyramide
                og finne riktig coach. Du justerer alt etter første økt.
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              <StepItem n={1} active>Klubb og medlemskap</StepItem>
              <StepItem n={2} active>Handicap og spillerfaring</StepItem>
              <StepItem n={3} active>Fokus i pyramiden</StepItem>
              <StepItem n={4}>Varsler (neste steg)</StepItem>
            </ul>

            <div className="mt-auto rounded-lg border-l-2 border-accent bg-[rgba(245,244,238,0.04)] p-4 text-[13px] italic leading-[1.6] text-[rgba(245,244,238,0.85)]">
              «Vi har sett at spillere som setter ett tydelig fokus i pyramiden ved start,
              holder ut tre måneder lenger.»
              <span className="mt-2 block font-mono text-[10px] not-italic uppercase tracking-[0.06em] text-[rgba(245,244,238,0.55)]">
                Data fra v0.9-beta · n=412
              </span>
            </div>
          </aside>

          {/* Form */}
          <main className="flex flex-col gap-8 p-10">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                Steg <span className="font-semibold text-foreground">02</span> / 04
              </div>
              <div className="flex items-center gap-2">
                <Dot done />
                <Dot active />
                <Dot />
                <Dot />
              </div>
              <button className="rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">
                Lagre & fortsett senere
              </button>
            </div>

            <div>
              <h1 className="font-display text-[32px] font-medium leading-[1.1] tracking-tight">
                Fortell oss <em className="italic font-normal text-muted-foreground">litt om deg som spiller.</em>
              </h1>
              <p className="mt-3 text-[14px] leading-[1.6] text-muted-foreground">
                Alt er valgfritt — men jo mer du fyller inn, jo bedre matcher AK-Mentor deg
                med riktig coach og pyramide-vei.
              </p>
            </div>

            {/* U18 ribbon */}
            <div className="flex items-center gap-4 rounded-lg border border-[rgba(184,133,42,0.30)] bg-[#FFF6E0] px-4 py-3.5">
              <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-[#B8852A] text-white">
                <AlertTriangle size={18} strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-[12px] leading-[1.5] text-[#6F500B]">
                <b className="font-semibold text-[#3a2a05]">Du er under 18.</b> Når du har lagret
                denne profilen tar vi deg til foreldre-samtykke-skjermen før vi aktiverer
                deling med coach og varsler på e-post.
              </div>
              <span className="font-mono text-[10px] tracking-[0.06em] text-[#B8852A]">
                U18 · GDPR §8
              </span>
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Klubb (NGF-medlem)" help="Vi henter HCP fra GolfBox hver natt — du trenger ikke synke manuelt.">
                <select className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-[13px] text-foreground">
                  <option>Gamle Fredrikstad GK — NGF 0234 ✓</option>
                </select>
              </Field>
              <Field label="Medlemskap-status">
                <select className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-[13px] text-foreground">
                  <option>Junior · betalt 2026-sesongen</option>
                </select>
              </Field>
              <Field label="Fødselsår" help="16 år — utløser U18-flow" helpWarning>
                <input
                  type="text"
                  defaultValue="2010"
                  className="w-full rounded-md border border-input bg-card px-3 py-2.5 font-mono text-[13px] text-foreground"
                />
              </Field>
              <Field label="Dominant hånd">
                <div className="flex gap-2">
                  <Chip active>Høyre</Chip>
                  <Chip>Venstre</Chip>
                </div>
              </Field>
            </div>

            {/* HCP slider */}
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 rounded-lg border border-border bg-secondary p-4">
              <div className="text-center">
                <div className="font-mono text-[36px] font-medium leading-none tracking-tight tabular-nums text-foreground">
                  14
                </div>
                <small className="mt-1 block font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                  WHS HCP · ↓ 18 → 14
                </small>
              </div>
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  Sett ditt nåværende handicap
                </div>
                <div className="relative my-2 h-1.5 rounded-full border border-border bg-card">
                  <div
                    className="absolute left-0 top-[-1px] bottom-[-1px] rounded-full bg-gradient-to-r from-primary to-[#1A7D56]"
                    style={{ width: "42%" }}
                  />
                  <div
                    className="absolute top-[-5px] h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-primary bg-white"
                    style={{ left: "42%" }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                  <span>54.0</span>
                  <span>36</span>
                  <span>20</span>
                  <span>14.0</span>
                  <span>8</span>
                  <span>0</span>
                  <span>+5</span>
                </div>
              </div>
            </div>

            {/* Pyramide-fokus */}
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Velg ditt hovedfokus i pyramiden
                </span>
                <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                  Du kan endre senere · 1 valg
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <PyrTarget color="#005840" label="FYS" sub="Fundament" />
                <PyrTarget color="#1A7D56" label="TEK" sub="Teknikk ✓" active />
                <PyrTarget color="#D1F843" label="SLAG" sub="Slagprog." />
                <PyrTarget color="#B8852A" label="SPILL" sub="Banespill" />
                <PyrTarget color="#5E5C57" label="TURN" sub="Turnering" />
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-6">
              <div className="font-mono text-[11px] text-muted-foreground">
                profile_v1.draft · auto-lagret 14:08
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground hover:bg-secondary">
                  ← Tilbake
                </button>
                <button className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
                  Til foreldre-samtykke →
                </button>
              </div>
            </div>
          </main>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border bg-secondary px-6 py-3.5 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
          <span>Forhåndsutfylt fra GolfBox-sync · 2 felter manuelt endret</span>
          <div className="flex gap-4">
            <span>
              <b className="font-medium text-foreground">HCP-kilde:</b> golfbox.no
            </span>
            <span>
              <b className="font-medium text-foreground">Validering:</b> NGF-medlem ✓
            </span>
            <span className="text-[#B8852A]">● U18-flagg satt</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dot({ active = false, done = false }: { active?: boolean; done?: boolean }) {
  return (
    <span
      className={`h-1.5 w-8 rounded-full ${
        done ? "bg-primary/60" : active ? "bg-primary" : "bg-border"
      }`}
    />
  );
}

function StepItem({ n, active = false, children }: { n: number; active?: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-3 text-[13px] ${active ? "text-[rgba(245,244,238,0.85)]" : "text-[rgba(245,244,238,0.55)]"}`}>
      <span
        className={`grid h-6 w-6 place-items-center rounded-full font-mono text-[11px] font-semibold ${
          active
            ? "bg-[rgba(209,248,67,0.18)] text-accent"
            : "bg-[rgba(245,244,238,0.08)] text-[rgba(245,244,238,0.55)]"
        }`}
      >
        {n}
      </span>
      {children}
    </li>
  );
}

function Field({
  label,
  help,
  helpWarning = false,
  children,
}: {
  label: string;
  help?: string;
  helpWarning?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </label>
      {children}
      {help && (
        <span className={`text-[11px] ${helpWarning ? "text-[#B8852A]" : "text-muted-foreground"}`}>
          {help}
        </span>
      )}
    </div>
  );
}

function Chip({ active = false, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <button
      className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );
}

function PyrTarget({
  color,
  label,
  sub,
  active = false,
}: {
  color: string;
  label: string;
  sub: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 text-center ${
        active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="h-5 w-5 rounded-full" style={{ background: color }} />
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground">
        {label}
      </div>
      <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
    </button>
  );
}
