"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveOnboardingProfile } from "./actions";

const TOTAL_STEPS = 4;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [hcp, setHcp] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [pending, startTransition] = useTransition();

  function neste() {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else fullfor();
  }

  function tilbake() {
    if (step > 1) setStep(step - 1);
  }

  function hopp() {
    fullfor();
  }

  function fullfor() {
    startTransition(async () => {
      await saveOnboardingProfile({ phone: phone || undefined });
      router.push("/portal");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <span>
          Steg {step} av {TOTAL_STEPS}
        </span>
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className={`h-2.5 w-2.5 rounded-full ${
                n < step
                  ? "bg-primary"
                  : n === step
                  ? "bg-accent ring-4 ring-accent/30"
                  : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <Steg
          tittel="Kontaktinfo"
          ingress="Vi bruker dette til å sende bekreftelser og påminnelser."
        >
          <Felt
            label="Mobilnummer (valgfritt)"
            id="phone"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="+47 ..."
          />
        </Steg>
      )}

      {step === 2 && (
        <Steg
          tittel="Om deg"
          ingress="La oss bli kjent med spillet ditt. Du kan endre alt senere i innstillingene."
        >
          <Felt
            label="Hva er din nåværende HCP?"
            id="hcp"
            type="number"
            value={hcp}
            onChange={setHcp}
            placeholder="f.eks. 18.4"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            HCP-feltet lagres i en kommende fase (1.4). Verdien går ikke tapt
            hvis du fyller ut nå.
          </p>
        </Steg>
      )}

      {(step === 3 || step === 4) && (
        <Steg
          tittel={step === 3 ? "Mål og ambisjon" : "Treningspreferanser"}
          ingress="Disse stegene implementeres i en kommende fase."
        >
          <p className="rounded-md border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
            Dette steget kommer i Fase 1.4. Du kan trygt hoppe over for nå.
          </p>
        </Steg>
      )}

      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={tilbake}
            disabled={pending}
            className="rounded-md border border-input bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-border disabled:opacity-60"
          >
            Tilbake
          </button>
        )}
        <button
          type="button"
          onClick={neste}
          disabled={pending}
          className="flex-1 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending
            ? "Lagrer…"
            : step === TOTAL_STEPS
            ? "Fullfør"
            : "Neste"}
        </button>
      </div>

      <button
        type="button"
        onClick={hopp}
        disabled={pending}
        className="mt-4 block w-full text-center text-xs text-muted-foreground hover:text-foreground"
      >
        Hopp over og gå til portalen
      </button>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Trenger du å logge ut?{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          Tilbake til innlogging
        </Link>
      </p>
    </div>
  );
}

function Steg({
  tittel,
  ingress,
  children,
}: {
  tittel: string;
  ingress: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
        <em className="font-normal text-primary md:italic">{tittel}</em>
      </h2>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">{ingress}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Felt({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
    </div>
  );
}
