"use client";

import { useState } from "react";
import { Check, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Steg-teller (1/2/3) med lime square-number for aktivt/fullført steg. */
export function StepOnboardingIndicator({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-md font-mono text-[11px] font-extrabold tabular-nums",
                done || active ? "bg-accent text-primary" : "bg-secondary text-muted-foreground",
              )}
            >
              {done ? <Check className="h-3 w-3" strokeWidth={2.5} /> : i + 1}
            </span>
            <span className={cn("font-mono text-[9px] font-bold uppercase tracking-[0.08em]", active ? "text-foreground" : "text-muted-foreground")}>
              {label}
            </span>
            {i < steps.length - 1 && <span className="h-px w-4 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}

/**
 * GDPR-gate for mindreårige (mobil-først, 430px): alder-sjekk → inviter foreldre →
 * vent på samtykke. Tre steg, kontrollert internt for demo; koble til onboarding-
 * gate-logikken i prod.
 */
export function MinorGate({ className }: { className?: string }) {
  const [step, setStep] = useState(0);
  const steps = ["Alder", "Foreldre", "Samtykke"];

  return (
    <div className={cn("mx-auto w-[430px] max-w-full rounded-[16px] border border-border bg-card p-6", className)}>
      <StepOnboardingIndicator steps={steps} current={step} className="mb-6" />

      {step === 0 && (
        <div>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Steg 1 · alder</div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">Når er du født?</h2>
          <p className="mt-2 text-sm leading-[1.5] text-muted-foreground">
            Er du under 16 trenger vi samtykke fra en forelder før du kan opprette konto.
          </p>
          <input type="date" className="mt-4 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
          <button type="button" onClick={() => setStep(1)} className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 font-mono text-[11px] font-extrabold uppercase tracking-[0.10em] text-accent">
            Fortsett <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Steg 2 · foreldre</div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">Inviter en <em className="font-normal italic text-primary">forelder</em></h2>
          <p className="mt-2 text-sm leading-[1.5] text-muted-foreground">
            Vi sender en forespørsel om samtykke. Du kan begynne å trene så snart de godkjenner.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5">
            <Mail className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <input type="email" placeholder="forelders e-post" className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          </div>
          <button type="button" onClick={() => setStep(2)} className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 font-mono text-[11px] font-extrabold uppercase tracking-[0.10em] text-accent">
            Send forespørsel <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center text-center">
          <span className="relative mb-5 inline-flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 rounded-full border-2 border-dashed border-accent motion-safe:animate-spin [animation-duration:3s]" />
            <ShieldCheck className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </span>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Steg 3 · samtykke</div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">Venter på foreldresamtykke</h2>
          <p className="mt-2 text-sm leading-[1.5] text-muted-foreground">
            Vi har sendt forespørselen. Du får beskjed med en gang den er godkjent — vanligvis innen et døgn.
          </p>
          <span className="mt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Sendt 28. mai · 14:30</span>
        </div>
      )}
    </div>
  );
}
