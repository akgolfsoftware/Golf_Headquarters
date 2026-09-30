"use client";

/**
 * Registrer (AU-02) i Precision Athletics. Tegning: Claude Design 7d7c2994,
 * ui_kits/konto/screens/AU-01-03.jsx › AU02.
 *
 * Ekte registreringslogikk er uendret: Supabase auth.signUp med rolle, pakke og
 * metadata, TalentHQ-varianten (?kilde=talenthq), ?epost= og ?subscribe= som
 * videreføres, og Google OAuth. Visningen følger tegningens to første steg
 * (Pakke, Konto og samtykke); «Sjekk e-post» er /auth/check-email og
 * «Betaling» er onboarding. Supabase-klienten lages først ved trykk.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Knapp } from "@/components/precision/pa";
import {
  AuthRamme, AuthHode, Felt, Varsel, Lenke, LenkeTekst, Avkryssing, ValgKort, Stegrad,
} from "@/components/auth/precision/AuthPa";
import { createClient } from "@/lib/supabase/client";
import { UserRole, Tier } from "@/generated/prisma/client";

/* Pakke- og rolledata (1:1 med gamle signup-form.tsx) */

type RoleOption = { value: UserRole; label: string };
const ROLLER: RoleOption[] = [
  { value: "PLAYER", label: "Spiller" },
  { value: "PARENT", label: "Foresatt" },
];

type PackageValue = "PERFORMANCE_PRO" | "PERFORMANCE" | "PLAYERHQ_ONLY";
type PackageOption = { value: PackageValue; name: string; price: string; trialHint?: string; desc: string; monthlyCredits: number };
const PAKKER: PackageOption[] = [
  { value: "PERFORMANCE_PRO", name: "Performance Pro", price: "2 220 kr / mnd", desc: "4 coaching-økter i måneden. PlayerHQ inkludert.", monthlyCredits: 4 },
  { value: "PERFORMANCE", name: "Performance", price: "1 200 kr / mnd", desc: "2 coaching-økter i måneden. PlayerHQ inkludert.", monthlyCredits: 2 },
  { value: "PLAYERHQ_ONLY", name: "PlayerHQ", price: "299 kr / mnd", trialHint: "1. MÅNED GRATIS", desc: "App-tilgang: tracking, AI-coach og treningsplaner.", monthlyCredits: 0 },
];

/** Samme feiloversettelse som gamle signup-form.tsx: én kilde til auth-tekst. */
function oversettAuthFeil(msg: string): string {
  if (msg.includes("already registered") || msg.includes("already exists")) return "En konto med denne e-posten finnes allerede.";
  if (msg.includes("Password should be at least")) return "Passordet er for kort. Minst 8 tegn.";
  if (msg.includes("rate limit")) return "For mange forsøk. Prøv igjen om litt.";
  return msg;
}

/** Google deler feilrom med innlogging. */
function oversettGoogleFeil(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Feil e-post eller passord.";
  if (msg.includes("Email not confirmed")) return "E-posten er ikke bekreftet. Sjekk innboksen din.";
  return msg;
}

const erEpost = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());

export type SignupForhand = { steg?: 0 | 1; feil?: string; laster?: boolean };

function SignupKort({ defaultEmail, subscribe, kilde, forhand }: {
  defaultEmail?: string; subscribe?: string; kilde?: "talenthq"; forhand?: SignupForhand;
}) {
  const router = useRouter();
  const erTalent = kilde === "talenthq";
  const [steg, setSteg] = useState<0 | 1>(forhand?.steg ?? (erTalent ? 1 : 0));
  const [pkg, setPkg] = useState<PackageValue>("PERFORMANCE_PRO");
  const [rolle, setRolle] = useState<UserRole>("PLAYER");
  const [fornavn, setFornavn] = useState("");
  const [etternavn, setEtternavn] = useState("");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [passord, setPassord] = useState("");
  const [bekreft, setBekreft] = useState("");
  const [samtykke, setSamtykke] = useState(false);
  const [feil, setFeil] = useState<string | null>(forhand?.feil ?? null);
  const [felt, setFelt] = useState<Record<string, string>>({});
  const [laster, setLaster] = useState(forhand?.laster ?? false);

  function gaaVidere() {
    setFeil(null);
    setSteg(1);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    const x: Record<string, string> = {};
    if (!fornavn.trim()) x.fornavn = "Skriv fornavnet ditt.";
    if (!etternavn.trim()) x.etternavn = "Skriv etternavnet ditt.";
    if (!erEpost(email)) x.email = "Skriv en gyldig e-postadresse.";
    if (passord.length < 8) x.passord = "Passordet må være minst 8 tegn.";
    else if (passord !== bekreft) x.bekreft = "Passordene er ikke like. Skriv det samme passordet to ganger.";
    if (!samtykke) x.samtykke = "Du må godta vilkårene for å fortsette.";
    setFelt(x);
    if (Object.keys(x).length) return;

    setLaster(true);
    const valgt = PAKKER.find((p) => p.value === pkg)!;
    // TalentHQ (?kilde=talenthq): gratis låst testprofil, ingen pakke. `kilde` i
    // user_metadata leses av ensureUser, som setter profilType TALENT ved opprettelse
    // (plan T3). Tier tvinges uansett til GRATIS server-side i ensureUser.
    const metadata = erTalent
      ? { role: rolle, tier: "GRATIS" satisfies Tier, kilde: "talenthq", firstName: fornavn, lastName: etternavn }
      : { role: rolle, tier: "PRO" satisfies Tier, package: valgt.value, monthlyCredits: valgt.monthlyCredits, firstName: fornavn, lastName: etternavn };
    const { data, error: err } = await createClient().auth.signUp({ email: email.trim(), password: passord, options: { data: metadata } });
    setLaster(false);
    if (err) {
      setFeil(oversettAuthFeil(err.message));
      return;
    }
    // Aktiv session betyr at «Confirm email» er av: brukeren er allerede innlogget.
    // Ellers må e-posten bekreftes først. subscribe-intensjonen bæres videre.
    const onbUrl = subscribe ? `/auth/onboarding?subscribe=${encodeURIComponent(subscribe)}` : "/auth/onboarding";
    if (data.session) {
      router.push(onbUrl);
      router.refresh();
    } else {
      router.push(subscribe ? `/auth/check-email?subscribe=${encodeURIComponent(subscribe)}` : "/auth/check-email");
    }
  }

  async function fortsettMedGoogle() {
    setFeil(null);
    setLaster(true);
    const next = subscribe ? `/auth/onboarding?subscribe=${encodeURIComponent(subscribe)}` : "/auth/onboarding";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: err } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/api/auth/oauth-callback?next=${encodeURIComponent(next)}` },
    });
    if (err) {
      setLaster(false);
      setFeil(oversettGoogleFeil(err.message));
    }
  }

  return (
    <>
      <Stegrad aktiv={steg} />
      {steg === 0 && (
        <>
          <AuthHode tittel="Velg pakke" under="Du kan bytte eller avslutte når som helst." />
          <div role="radiogroup" aria-label="Pakke" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PAKKER.map((p) => (
              <ValgKort key={p.value} valgt={pkg === p.value} onVelg={() => setPkg(p.value)} tittel={p.name} pris={p.price} merke={p.trialHint} tekst={p.desc} />
            ))}
          </div>
          {feil && <Varsel tone="warn">{feil}</Varsel>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Knapp onClick={gaaVidere} iconRight={ArrowRight}>Fortsett</Knapp>
          </div>
          <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Har du konto? <LenkeTekst href="/auth/login">Logg inn</LenkeTekst></span>
        </>
      )}
      {steg === 1 && (
        <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <AuthHode
            tittel="Konto og samtykke"
            under={erTalent ? "Gratis testprofil: testbatteri, stats og SG-registrering." : `Valgt pakke: ${PAKKER.find((p) => p.value === pkg)?.name}.`}
          />
          {feil && <Varsel tone="warn">{feil}</Varsel>}
          <div role="group" aria-label="Jeg er" className="pa-seg pa-seg--full pa-seg--lg">
            {ROLLER.map((r) => (
              <button key={r.value} type="button" aria-pressed={rolle === r.value} className="pa-seg__opt" onClick={() => setRolle(r.value)}>
                {r.label}
              </button>
            ))}
          </div>
          <Felt label="Fornavn" name="given-name" value={fornavn} onChange={setFornavn} autoComplete="given-name" required error={felt.fornavn} />
          <Felt label="Etternavn" name="family-name" value={etternavn} onChange={setEtternavn} autoComplete="family-name" required error={felt.etternavn} />
          <Felt label="E-post" type="email" name="email" value={email} onChange={setEmail} autoComplete="email" required error={felt.email} inputMode="email" />
          <Felt label="Passord" type="password" name="new-password" value={passord} onChange={setPassord} autoComplete="new-password" required error={felt.passord} hint="Minst 8 tegn." />
          <Felt label="Gjenta passord" type="password" name="confirm-password" value={bekreft} onChange={setBekreft} autoComplete="new-password" required error={felt.bekreft} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Avkryssing checked={samtykke} onChange={setSamtykke}>
              Jeg godtar <LenkeTekst href="/vilkar">vilkår</LenkeTekst> og <LenkeTekst href="/personvern">personvernerklæring</LenkeTekst>
            </Avkryssing>
            {felt.samtykke && <Varsel tone="warn">{felt.samtykke}</Varsel>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {!erTalent && <Knapp variant="ghost" onClick={() => setSteg(0)} disabled={laster}>Tilbake</Knapp>}
            <Knapp type="submit" loading={laster} loadingText="Oppretter konto …" iconRight={ArrowRight}>Opprett konto</Knapp>
          </div>
          <Knapp variant="secondary" fullWidth size="lg" onClick={fortsettMedGoogle} disabled={laster}>Fortsett med Google</Knapp>
          <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Har du konto? <LenkeTekst href="/auth/login">Logg inn</LenkeTekst></span>
        </form>
      )}
    </>
  );
}

export function SignupV2({ defaultEmail, subscribe, kilde, forhand, natt }: {
  defaultEmail?: string; subscribe?: string; kilde?: "talenthq"; forhand?: SignupForhand; natt?: boolean;
} = {}) {
  return (
    <AuthRamme max={520} natt={natt}>
      <SignupKort defaultEmail={defaultEmail} subscribe={subscribe} kilde={kilde} forhand={forhand} />
    </AuthRamme>
  );
}
