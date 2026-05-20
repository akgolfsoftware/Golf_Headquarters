"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

import { leggTilSpiller } from "../actions";

const ICON_STROKE = 1.75;

export function NySpillerForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generellFeil, setGenerellFeil] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setFieldErrors({});
    setGenerellFeil(null);
    startTransition(async () => {
      const res = await leggTilSpiller(formData);
      if (!res.ok) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        if (res.error) setGenerellFeil(res.error);
        return;
      }
      if (res.userId) {
        router.push(`/admin/elever/${res.userId}`);
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      {generellFeil && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-4 text-sm text-destructive"
        >
          {generellFeil}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Field
          name="navn"
          label="Navn"
          required
          autoFocus
          error={fieldErrors.navn}
          placeholder="F.eks. Markus R Pedersen"
        />
        <Field
          name="epost"
          label="E-post"
          type="email"
          required
          error={fieldErrors.epost}
          placeholder="markus@eksempel.no"
        />
        <Field
          name="alder"
          label="Alder"
          type="number"
          min={5}
          max={120}
          error={fieldErrors.alder}
          placeholder="F.eks. 17"
        />
        <Field
          name="klubb"
          label="Hjemmeklubb"
          error={fieldErrors.klubb}
          placeholder="F.eks. Gamle Fredrikstad GK"
        />
        <Field
          name="gruppe"
          label="Gruppe (valgfritt)"
          error={fieldErrors.gruppe}
          placeholder="F.eks. Junior Elite"
        />
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-6">
        <Link
          href="/admin/spillere"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-input bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
          Avbryt
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <UserPlus className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
          {pending ? "Oppretter…" : "Opprett spiller"}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
  error?: string;
  placeholder?: string;
  min?: number;
  max?: number;
};

function Field({
  name,
  label,
  type = "text",
  required,
  autoFocus,
  error,
  placeholder,
  min,
  max,
}: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        autoFocus={autoFocus}
        placeholder={placeholder}
        min={min}
        max={max}
        aria-invalid={error ? true : undefined}
        className={`h-10 rounded-md border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
