"use client";

/**
 * Sett nytt passord (AU-03, steg «Jeg har en lenke») i Precision Athletics.
 * Tegning: Claude Design 7d7c2994, ui_kits/konto/screens/AU-01-03.jsx › AU03.
 *
 * Ekte logikk er uendret: Supabase auth.updateUser og videresending til
 * /portal. Brukeren lander her fra lenken i e-posten. Supabase-klienten lages
 * først ved trykk.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Knapp } from "@/components/precision/pa";
import { AuthRamme, AuthHode, Felt, Varsel, Lenke } from "@/components/auth/precision/AuthPa";
import { createClient } from "@/lib/supabase/client";

/** Samme feiloversettelse som gamle reset-form.tsx: én kilde til auth-tekst. */
function oversettPassordFeil(msg: string): string {
  if (msg.includes("should be different from the old password")) return "Velg et annet passord enn det du hadde fra før.";
  if (msg.includes("Auth session missing")) return "Lenken er brukt eller utløpt. Be om en ny lenke fra «Glemt passord».";
  return msg;
}

export type ResetForhand = { feil?: string; laster?: boolean; utlopt?: boolean };

export function ResetPasswordV2({ forhand, natt }: { forhand?: ResetForhand; natt?: boolean } = {}) {
  const router = useRouter();
  const [passord, setPassord] = useState("");
  const [bekreft, setBekreft] = useState("");
  const [pending, setPending] = useState(forhand?.laster ?? false);
  const [feil, setFeil] = useState<string | null>(forhand?.feil ?? null);
  const [utlopt, setUtlopt] = useState(forhand?.utlopt ?? false);
  const [felt, setFelt] = useState<{ p1?: string; p2?: string }>({});

  async function lagre(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    const x: { p1?: string; p2?: string } = {};
    if (passord.length < 8) x.p1 = "Passordet må være minst 8 tegn.";
    if (bekreft !== passord) x.p2 = "Passordene er ikke like. Skriv det samme passordet to ganger.";
    setFelt(x);
    if (x.p1 || x.p2) return;
    setPending(true);
    const { error: err } = await createClient().auth.updateUser({ password: passord });
    setPending(false);
    if (err) {
      if (err.message.includes("Auth session missing")) setUtlopt(true);
      setFeil(oversettPassordFeil(err.message));
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  if (utlopt) {
    return (
      <AuthRamme natt={natt}>
        <AuthHode tittel="Lenken er utløpt" under="Lenker for nytt passord kan bare brukes én gang og varer ikke lenge. Be om en ny lenke." />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Knapp onClick={() => router.push("/auth/forgot-password")}>Be om ny lenke</Knapp>
        </div>
        <div><Lenke href="/auth/login">Tilbake til innlogging</Lenke></div>
      </AuthRamme>
    );
  }

  return (
    <AuthRamme natt={natt}>
      <AuthHode tittel="Sett nytt passord" under="Minst 8 tegn." />
      <form onSubmit={lagre} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {feil && <Varsel tone="warn">{feil}</Varsel>}
        <Felt label="Nytt passord" type="password" name="new-password" value={passord} onChange={setPassord} autoComplete="new-password" required error={felt.p1} />
        <Felt label="Gjenta passord" type="password" name="confirm-password" value={bekreft} onChange={setBekreft} autoComplete="new-password" required error={felt.p2} />
        <Knapp type="submit" fullWidth size="lg" loading={pending} loadingText="Lagrer …">Lagre nytt passord</Knapp>
      </form>
      <div><Lenke href="/auth/login">Tilbake til innlogging</Lenke></div>
    </AuthRamme>
  );
}
