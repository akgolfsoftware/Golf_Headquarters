"use client";

import { useState, useTransition } from "react";
import { aksepterInvitasjon } from "./actions";

export function AksepterForm({ token, email }: { token: string; email: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await aksepterInvitasjon(fd);
      // redirect() i action kaster — vi havner her bare ved feil.
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-6">
      <input type="hidden" name="token" value={token} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Felt label="Fornavn" name="firstName" required />
        <Felt label="Etternavn" name="lastName" required />
      </div>

      <Felt label="E-post" name="email" defaultValue={email} disabled />

      <Felt label="Telefon" name="phone" type="tel" placeholder="+47 ..." />

      <Felt
        label="Velg passord"
        name="password"
        type="password"
        required
        placeholder="Minst 8 tegn"
      />

      {error ? (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? "Oppretter konto…" : "Godta og opprett konto"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Ved å fortsette godtar du AK Golfs vilkår for foresatte.
      </p>
    </form>
  );
}

function Felt({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        disabled={disabled}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:bg-muted disabled:text-muted-foreground"
      />
    </label>
  );
}
