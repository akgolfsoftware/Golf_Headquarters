"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

import { oppdaterSpiller } from "../../actions";

const ICON_STROKE = 1.75;

type Initial = {
  navn: string;
  epost: string;
  phone: string;
  hcp: number | null;
  klubb: string;
  ambition: string;
  alder: number | null;
};

export function RedigerSpillerForm({
  userId,
  initial,
}: {
  userId: string;
  initial: Initial;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generellFeil, setGenerellFeil] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setFieldErrors({});
    setGenerellFeil(null);
    startTransition(async () => {
      const res = await oppdaterSpiller(userId, formData);
      if (!res.ok) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        if (res.error) setGenerellFeil(res.error);
        return;
      }
      router.push(`/admin/elever/${userId}`);
      router.refresh();
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
          defaultValue={initial.navn}
          error={fieldErrors.navn}
        />
        <Field
          name="epost"
          label="E-post"
          type="email"
          required
          defaultValue={initial.epost}
          error={fieldErrors.epost}
        />
        <Field
          name="phone"
          label="Mobil"
          type="tel"
          defaultValue={initial.phone}
          placeholder="F.eks. 90123456"
        />
        <Field
          name="alder"
          label="Alder"
          type="number"
          min={5}
          max={120}
          defaultValue={initial.alder?.toString() ?? ""}
          error={fieldErrors.alder}
        />
        <Field
          name="hcp"
          label="Handicap"
          type="text"
          defaultValue={initial.hcp?.toString() ?? ""}
          placeholder="F.eks. 12,4"
        />
        <Field
          name="klubb"
          label="Hjemmeklubb"
          defaultValue={initial.klubb}
          error={fieldErrors.klubb}
        />
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Ambisjon
          </span>
          <textarea
            name="ambition"
            defaultValue={initial.ambition}
            rows={3}
            placeholder="F.eks. Spille divisjon-tour innen 2 år"
            className="rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-6">
        <Link
          href={`/admin/elever/${userId}`}
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
          <Save className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
          {pending ? "Lagrer…" : "Lagre endringer"}
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
  defaultValue?: string;
  placeholder?: string;
  error?: string;
  min?: number;
  max?: number;
};

function Field({
  name,
  label,
  type = "text",
  required,
  defaultValue,
  placeholder,
  error,
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
        defaultValue={defaultValue}
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
