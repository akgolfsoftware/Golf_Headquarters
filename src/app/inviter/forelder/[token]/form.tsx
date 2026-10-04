"use client";

/**
 * Registrering for invitert forelder. Feltnavn og aksepterInvitasjon
 * er uendret. redirect() i actionen kaster — feilgrenen viser bare feil.
 */

import { useState, useTransition, type FormEvent } from "react";
import { aksepterInvitasjon } from "./actions";
import "@/styles/precision-athletics.css";

export function AksepterForm({ token, email }: { token: string; email: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await aksepterInvitasjon(fd);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form className="au-skjema" onSubmit={submit}>
      <input type="hidden" name="token" value={token} />
      <div className="au-rad">
        <label>Fornavn
          <input id="inv-fornavn" name="firstName" required autoComplete="given-name" />
        </label>
        <label>Etternavn
          <input id="inv-etternavn" name="lastName" required autoComplete="family-name" />
        </label>
      </div>
      <label>E-post
        <input id="inv-epost" name="email" defaultValue={email} disabled />
      </label>
      <label>Telefon
        <input id="inv-telefon" name="phone" type="tel" placeholder="+47 …" autoComplete="tel" />
      </label>
      <label>Velg passord
        <input id="inv-passord" name="password" type="password" required placeholder="Minst 8 tegn" autoComplete="new-password" />
      </label>
      {error ? <p className="au-melding" data-tone="feil" role="alert">{error}</p> : null}
      <button type="submit" className="pa-btn pa-btn--primary pa-btn--full" disabled={pending}>
        {pending ? "Oppretter konto…" : "Godta og opprett konto"}
      </button>
      <p>Ved å fortsette godtar du AK Golfs vilkår for foresatte.</p>
    </form>
  );
}
