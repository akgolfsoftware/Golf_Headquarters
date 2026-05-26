"use client";

/**
 * Profil-redigering for coach/admin.
 *
 * Én "Rediger profil"-knapp på read-view (rendret av page.tsx). Når den
 * klikkes, viser vi formet inline med alle felt: Personalia + Profesjonelt.
 * En "Lagre alt"-action skriver til User-modellen via oppdaterCoachProfil.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import { oppdaterCoachProfil } from "./actions";

const ICON_STROKE = 1.5;

type Initial = {
  navn: string;
  epost: string;
  phone: string;
  hcp: string;
  homeClub: string;
  bio: string;
  certifications: string;
  languages: string;
  clubs: string;
};

export function EditProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [aapen, setAapen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generellFeil, setGenerellFeil] = useState<string | null>(null);
  const [suksess, setSuksess] = useState(false);

  function handleSubmit(formData: FormData) {
    setFieldErrors({});
    setGenerellFeil(null);
    setSuksess(false);
    startTransition(async () => {
      const res = await oppdaterCoachProfil(formData);
      if (!res.ok) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        if (res.error) setGenerellFeil(res.error);
        return;
      }
      setSuksess(true);
      setAapen(false);
      router.refresh();
    });
  }

  if (!aapen) {
    return (
      <div className="flex flex-col items-end gap-2">
        {suksess && (
          <span
            role="status"
            className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-primary"
          >
            Profil oppdatert
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            setAapen(true);
            setSuksess(false);
          }}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Rediger profil
        </button>
      </div>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-6 rounded-md border border-border bg-card p-6"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-base font-semibold tracking-tight">
          Rediger profil
        </h2>
        <button
          type="button"
          onClick={() => setAapen(false)}
          aria-label="Avbryt"
          className="grid h-8 w-8 place-items-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" strokeWidth={ICON_STROKE} />
        </button>
      </div>

      {generellFeil && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-4 text-sm text-destructive"
        >
          {generellFeil}
        </div>
      )}

      <fieldset className="flex flex-col gap-4 border-t border-border pt-4">
        <legend className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Personalia
        </legend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            name="navn"
            label="Fullt navn"
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
            name="hcp"
            label="Handicap"
            defaultValue={initial.hcp}
            placeholder="F.eks. 8,4"
            error={fieldErrors.hcp}
          />
          <Field
            name="homeClub"
            label="Hjemmeklubb"
            defaultValue={initial.homeClub}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 border-t border-border pt-4">
        <legend className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Profesjonelt
        </legend>
        <label className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Bio · maks 280 tegn
          </span>
          <textarea
            name="bio"
            defaultValue={initial.bio}
            rows={3}
            maxLength={280}
            placeholder="Kort tekst som vises på offentlig profil"
            className={`rounded-md border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring ${
              fieldErrors.bio ? "border-destructive" : "border-input"
            }`}
          />
          {fieldErrors.bio && (
            <span className="text-xs text-destructive" role="alert">
              {fieldErrors.bio}
            </span>
          )}
        </label>
        <Field
          name="certifications"
          label="Sertifiseringer · separer med komma"
          defaultValue={initial.certifications}
          placeholder="PGA Class A, TPI Level 2"
        />
        <Field
          name="languages"
          label="Språk · separer med komma"
          defaultValue={initial.languages}
          placeholder="Norsk, Engelsk"
        />
        <Field
          name="clubs"
          label="Klubb-tilknytning · separer med komma"
          defaultValue={initial.clubs}
          placeholder="Gamle Fredrikstad GK, Onsøy GK"
        />
      </fieldset>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setAapen(false)}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-input bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Avbryt
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
          {pending ? "Lagrer…" : "Lagre alt"}
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
};

function Field({
  name,
  label,
  type = "text",
  required,
  defaultValue,
  placeholder,
  error,
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
        aria-invalid={error ? true : undefined}
        className={`h-10 rounded-md border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring ${
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
