"use client";

/**
 * Glemt passord (AU-03, steg «be om lenke») i Precision Athletics. Tegning:
 * Claude Design 7d7c2994, ui_kits/konto/screens/AU-01-03.jsx › AU03.
 *
 * Ekte logikk er uendret: Supabase resetPasswordForEmail med redirectTo
 * /auth/reset-password. Supabase-klienten lages først ved trykk.
 */

import { useState } from "react";
import { Knapp } from "@/components/precision/pa";
import { AuthRamme, AuthHode, Felt, Varsel, Lenke } from "@/components/auth/precision/AuthPa";
import { createClient } from "@/lib/supabase/client";

/** Samme feiloversettelse som gamle forgot-form.tsx: én kilde til auth-tekst. */
function oversettResetFeil(msg: string): string {
  if (msg.includes("you can only request this after")) return "Vent et lite øyeblikk før du ber om en ny lenke.";
  if (msg.includes("Unable to validate email address")) return "Sjekk at e-postadressen er riktig skrevet.";
  return msg;
}

const erEpost = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());

export type ForgotForhand = { sendt?: boolean; feil?: string; laster?: boolean; epost?: string };

export function ForgotPasswordV2({ forhand, natt }: { forhand?: ForgotForhand; natt?: boolean } = {}) {
  const [email, setEmail] = useState(forhand?.epost ?? "");
  const [sendt, setSendt] = useState(forhand?.sendt ?? false);
  const [pending, setPending] = useState(forhand?.laster ?? false);
  const [feil, setFeil] = useState<string | null>(forhand?.feil ?? null);
  const [feltFeil, setFeltFeil] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    if (!erEpost(email)) {
      setFeltFeil("Skriv e-postadressen du bruker til å logge inn.");
      return;
    }
    setFeltFeil(null);
    setPending(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: err } = await createClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${origin}/auth/reset-password` });
    setPending(false);
    if (err) {
      setFeil(oversettResetFeil(err.message));
      return;
    }
    setSendt(true);
  }

  return (
    <AuthRamme natt={natt}>
      <AuthHode tittel="Glemt passord" under="Skriv e-posten din. Vi sender en lenke for å sette nytt passord." />
      {sendt ? (
        <>
          <Varsel tone="ok" title="Lenken er sendt">
            Hvis {email || "e-postadressen din"} har en konto, får du en e-post om et øyeblikk. Fant du den ikke, sjekk søppelpost.
          </Varsel>
          <div><Lenke href="/auth/login">Tilbake til innlogging</Lenke></div>
        </>
      ) : (
        <form onSubmit={send} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {feil && <Varsel tone="warn">{feil}</Varsel>}
          <Felt label="E-post" type="email" name="email" value={email} onChange={setEmail} autoComplete="email" required error={feltFeil} inputMode="email" />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Knapp type="submit" loading={pending} loadingText="Sender lenke …">Send lenke</Knapp>
          </div>
          <div><Lenke href="/auth/login">Tilbake til innlogging</Lenke></div>
        </form>
      )}
    </AuthRamme>
  );
}
