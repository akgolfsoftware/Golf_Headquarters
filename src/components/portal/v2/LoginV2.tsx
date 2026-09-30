"use client";

/**
 * Logg inn (AU-01) i Precision Athletics. Tegning: Claude Design 7d7c2994,
 * ui_kits/konto/screens/AU-01-03.jsx › AU01.
 *
 * Ekte innloggingslogikk er uendret: Supabase signInWithPassword og Google
 * OAuth, feiloversettelse og safeRedirectPath med ?next=. Bare visningen er ny.
 * Supabase-klienten lages først når brukeren trykker, så visningen kan måles
 * uten nett.
 */

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Fingerprint } from "lucide-react";
import { Knapp, Meta } from "@/components/precision/pa";
import { AuthRamme, AuthHode, Felt, Varsel, Lenke } from "@/components/auth/precision/AuthPa";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/security/safe-redirect-client";

/** Samme feiloversettelse som gamle login-form.tsx: én kilde til auth-tekst. */
function oversettAuthFeil(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Feil e-post eller passord.";
  if (msg.includes("Email not confirmed")) return "E-posten er ikke bekreftet. Sjekk innboksen din.";
  return msg;
}

const erEpost = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());

export type LoginForhand = { feil?: string; laster?: boolean; epost?: string };

function LoginKort({ forhand }: { forhand?: LoginForhand }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [epost, setEpost] = useState(forhand?.epost ?? "");
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState<string | null>(forhand?.feil ?? null);
  const [felt, setFelt] = useState<{ e?: string; p?: string }>({});
  const [laster, setLaster] = useState(forhand?.laster ?? false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    const x: { e?: string; p?: string } = {};
    if (!erEpost(epost)) x.e = "Skriv e-postadressen du registrerte deg med.";
    if (!passord) x.p = "Skriv passordet ditt.";
    setFelt(x);
    if (x.e || x.p) return;
    setLaster(true);
    const { error: authErr } = await createClient().auth.signInWithPassword({ email: epost.trim(), password: passord });
    if (authErr) {
      setLaster(false);
      setFeil(oversettAuthFeil(authErr.message));
      return;
    }
    const next = safeRedirectPath(searchParams.get("next"), "/auth/etter-innlogging");
    router.push(next);
    router.refresh();
  }

  async function loggInnGoogle() {
    setFeil(null);
    setLaster(true);
    const next = safeRedirectPath(searchParams.get("next"), "/auth/etter-innlogging");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: authErr } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/api/auth/oauth-callback?next=${encodeURIComponent(next)}` },
    });
    if (authErr) {
      setLaster(false);
      setFeil(oversettAuthFeil(authErr.message));
    }
    // Ellers sender Supabase brukeren videre til Google.
  }

  return (
    <>
      <AuthHode tittel="Logg inn" under="Spiller, forelder og coach bruker samme innlogging." />
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* id brukes av innloggede p0-tester for å lese feilteksten */}
        <div id="v2login-feil" aria-live="polite" aria-atomic="true" style={feil ? undefined : { marginBlock: -10 }}>
          {feil && <Varsel tone="warn" title={feil}>{feil === "Feil e-post eller passord." ? "Sjekk at e-posten er riktig og prøv igjen." : undefined}</Varsel>}
        </div>
        <Felt label="E-post" type="email" name="email" value={epost} onChange={setEpost} autoComplete="email" required error={felt.e} inputMode="email" />
        <Felt label="Passord" type="password" name="password" value={passord} onChange={setPassord} autoComplete="current-password" required error={felt.p} />
        <Knapp type="submit" fullWidth size="lg" loading={laster} loadingText="Logger inn …">Logg inn</Knapp>
      </form>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Knapp variant="secondary" fullWidth size="lg" onClick={loggInnGoogle} disabled={laster}>Fortsett med Google</Knapp>
        <Link href="/auth/bankid" className="pa-btn pa-btn--secondary pa-btn--lg pa-btn--full pa-btn--icon-l" style={{ justifyContent: "space-between" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Fingerprint className="pa-icon" size={18} strokeWidth={2} aria-hidden />
            Logg inn med BankID
          </span>
          <Meta>KOMMER</Meta>
        </Link>
      </div>
      <div style={{ display: "flex", gap: "0 20px", flexWrap: "wrap" }}>
        <Lenke href="/auth/forgot-password">Glemt passord?</Lenke>
        <Lenke href="/auth/signup">Ny bruker</Lenke>
      </div>
    </>
  );
}

export function LoginV2({ forhand, natt }: { forhand?: LoginForhand; natt?: boolean } = {}) {
  return (
    <AuthRamme natt={natt}>
      <Suspense fallback={null}>
        <LoginKort forhand={forhand} />
      </Suspense>
    </AuthRamme>
  );
}
