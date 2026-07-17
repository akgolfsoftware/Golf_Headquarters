"use client";

/**
 * AksepterForm — registreringsskjema for invitert forelder.
 * v2-port 16. juli 2026: restylet til v2 (Kort + Knapp + de v2-portede
 * felt-primitivene fra wizard-fields). Skjema-flyten er uendret:
 * FormData → aksepterInvitasjon-action (redirect() i action kaster —
 * vi havner i feilgrenen kun ved feil). Ingen rå hex, ingen emoji.
 */

import { useState, useTransition } from "react";
import { T } from "@/lib/v2/tokens";
import { Kort, Knapp } from "@/components/v2";
import { Field, TextField } from "@/components/auth/onboarding/wizard-fields";
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
    <Kort pad="20px 20px">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input type="hidden" name="token" value={token} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fornavn" htmlFor="inv-fornavn">
            <TextField id="inv-fornavn" name="firstName" required autoComplete="given-name" />
          </Field>
          <Field label="Etternavn" htmlFor="inv-etternavn">
            <TextField id="inv-etternavn" name="lastName" required autoComplete="family-name" />
          </Field>
        </div>

        <Field label="E-post" htmlFor="inv-epost">
          <TextField
            id="inv-epost"
            name="email"
            defaultValue={email}
            disabled
            style={{ background: T.panel3, color: T.mut }}
          />
        </Field>

        <Field label="Telefon" htmlFor="inv-telefon">
          <TextField id="inv-telefon" name="phone" type="tel" mono placeholder="+47 ..." autoComplete="tel" />
        </Field>

        <Field label="Velg passord" htmlFor="inv-passord">
          <TextField
            id="inv-passord"
            name="password"
            type="password"
            required
            placeholder="Minst 8 tegn"
            autoComplete="new-password"
          />
        </Field>

        {error ? (
          <div
            role="alert"
            style={{
              borderRadius: 11,
              border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`,
              background: `color-mix(in srgb, ${T.down} 10%, transparent)`,
              padding: "10px 14px",
              fontFamily: T.ui,
              fontSize: 13,
              color: T.down,
            }}
          >
            {error}
          </div>
        ) : null}

        <Knapp
          type="submit"
          full
          disabled={pending}
          icon="check"
          style={{ minHeight: 48, fontSize: 14 }}
        >
          {pending ? "Oppretter konto…" : "Godta og opprett konto"}
        </Knapp>

        <p
          style={{
            margin: 0,
            textAlign: "center",
            fontFamily: T.ui,
            fontSize: 11.5,
            color: T.mut,
          }}
        >
          Ved å fortsette godtar du AK Golfs vilkår for foresatte.
        </p>
      </form>
    </Kort>
  );
}
