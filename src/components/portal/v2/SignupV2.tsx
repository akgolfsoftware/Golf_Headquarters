"use client";

/**
 * Registrering i Precision (AU-02).
 *
 * Tegningen er en firestegs veiviser: Talent 0 kr eller Full 299 kr/mnd
 * eller 2 690 kr/år, ett navn, under-16 og deretter e-post og betaling.
 * Den er ikke innført. Produktet beholder Performance Pro, Performance og
 * PlayerHQ, rolle, Google, minst 8 tegn og likhetssjekk, og TalentHQ via
 * ?kilde=talenthq. signUp-metadata og veien til sjekk-e-post eller
 * onboarding er uendret.
 */

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserRole, Tier } from "@/generated/prisma/client";
import "@/styles/precision-athletics.css";

type RoleOption = { value: UserRole; label: string };
const ROLLER: RoleOption[] = [
  { value: "PLAYER", label: "Spiller" },
  { value: "PARENT", label: "Foresatt" },
];

type PackageValue = "PERFORMANCE_PRO" | "PERFORMANCE" | "PLAYERHQ_ONLY";
type PackageOption = {
  value: PackageValue;
  name: string;
  price: string;
  trialHint?: string;
  desc: string;
  monthlyCredits: number;
  featured?: boolean;
};
const PAKKER: PackageOption[] = [
  {
    value: "PERFORMANCE_PRO",
    name: "Performance Pro",
    price: "2 220 kr/mnd",
    desc: "4 coaching-økter i måneden · PlayerHQ inkludert",
    monthlyCredits: 4,
    featured: true,
  },
  {
    value: "PERFORMANCE",
    name: "Performance",
    price: "1 200 kr/mnd",
    desc: "2 coaching-økter i måneden · PlayerHQ inkludert",
    monthlyCredits: 2,
  },
  {
    value: "PLAYERHQ_ONLY",
    name: "PlayerHQ",
    price: "299 kr/mnd",
    trialHint: "1. måned gratis",
    desc: "App-tilgang: tracking, AI-coach, treningsplaner",
    monthlyCredits: 0,
  },
];

function oversettAuthFeil(msg: string): string {
  if (msg.includes("already registered") || msg.includes("already exists"))
    return "En konto med denne e-posten finnes allerede.";
  if (msg.includes("Password should be at least"))
    return "Passordet er for kort. Minst 8 tegn.";
  if (msg.includes("rate limit"))
    return "For mange forsøk. Prøv igjen om litt.";
  return msg;
}

function oversettGoogleFeil(msg: string): string {
  if (msg.includes("Invalid login credentials"))
    return "Feil e-post eller passord.";
  if (msg.includes("Email not confirmed"))
    return "E-posten er ikke bekreftet. Sjekk innboksen din.";
  return msg;
}

function PakkeVelger({
  value,
  onChange,
}: {
  value: PackageValue;
  onChange: (v: PackageValue) => void;
}) {
  return (
    <div className="au-pakker" role="radiogroup" aria-label="Velg medlemskap">
      {PAKKER.map((pakke) => {
        const aktiv = pakke.value === value;
        return (
          <button
            key={pakke.value}
            type="button"
            role="radio"
            aria-checked={aktiv}
            className="au-pakke"
            onClick={() => onChange(pakke.value)}
          >
            {pakke.featured ? <span className="au-merke">Mest populær</span> : null}
            <span className="au-pakke-hode">
              <strong>{pakke.name}</strong>
              <em>{pakke.price}</em>
            </span>
            {pakke.trialHint ? <span className="au-prove">{pakke.trialHint}</span> : null}
            <span>{pakke.desc}</span>
          </button>
        );
      })}
    </div>
  );
}

function TalentInfo() {
  return (
    <div className="au-tips">
      <p className="au-kicker">TalentHQ</p>
      <p><strong>Gratis testprofil</strong> · 0 kr. Testbatteri, stats og SG-registrering.</p>
    </div>
  );
}

export function SignupV2({
  defaultEmail,
  subscribe,
  kilde,
}: { defaultEmail?: string; subscribe?: string; kilde?: "talenthq" } = {}) {
  const router = useRouter();
  const supabase = createClient();
  const erTalent = kilde === "talenthq";
  const [pkg, setPkg] = useState<PackageValue>("PERFORMANCE_PRO");
  const [rolle, setRolle] = useState<UserRole>("PLAYER");
  const [fornavn, setFornavn] = useState("");
  const [etternavn, setEtternavn] = useState("");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [passord, setPassord] = useState("");
  const [bekreft, setBekreft] = useState("");
  const [visPassord, setVisPassord] = useState(false);
  const [visBekreft, setVisBekreft] = useState(false);
  const [samtykke, setSamtykke] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [laster, setLaster] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFeil(null);

    if (passord.length < 8) {
      setFeil("Passordet må være minst 8 tegn.");
      return;
    }
    if (passord !== bekreft) {
      setFeil("Passordene er ikke like.");
      return;
    }
    if (!samtykke) {
      setFeil("Du må godta vilkårene for å fortsette.");
      return;
    }

    setLaster(true);
    const valgt = PAKKER.find((p) => p.value === pkg)!;
    const metadata = erTalent
      ? {
          role: rolle,
          tier: "GRATIS" satisfies Tier,
          kilde: "talenthq",
          firstName: fornavn,
          lastName: etternavn,
        }
      : {
          role: rolle,
          tier: "PRO" satisfies Tier,
          package: valgt.value,
          monthlyCredits: valgt.monthlyCredits,
          firstName: fornavn,
          lastName: etternavn,
        };
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password: passord,
      options: { data: metadata },
    });
    setLaster(false);

    if (err) {
      setFeil(oversettAuthFeil(err.message));
      return;
    }

    const onbUrl = subscribe
      ? `/auth/onboarding?subscribe=${encodeURIComponent(subscribe)}`
      : "/auth/onboarding";
    if (data.session) {
      router.push(onbUrl);
      router.refresh();
    } else {
      router.push(
        subscribe ? `/auth/check-email?subscribe=${encodeURIComponent(subscribe)}` : "/auth/check-email",
      );
    }
  }

  async function fortsettMedGoogle() {
    setFeil(null);
    setLaster(true);
    const next = subscribe
      ? `/auth/onboarding?subscribe=${encodeURIComponent(subscribe)}`
      : "/auth/onboarding";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/oauth-callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (err) {
      setLaster(false);
      setFeil(oversettGoogleFeil(err.message));
    }
  }

  return (
    <div className="pa-root au-ramme" data-design="precision-athletics">
      <div className="au-boks au-boks--bred">
        <Link href="/" className="au-logo">AK Golf HQ</Link>
        <header>
          <p className="au-kicker">Registrer</p>
          <h1>Lag konto</h1>
          <p>
            {erTalent ? "Gratis testprofil — testbatteri, stats og SG-registrering. " : null}
            Har du konto? <Link href="/auth/login">Logg inn</Link>
          </p>
        </header>
        <form className="au-skjema" onSubmit={onSubmit}>
          {erTalent ? <TalentInfo /> : <PakkeVelger value={pkg} onChange={setPkg} />}
          <div className="au-rad">
            <label>Fornavn
              <input type="text" value={fornavn} autoComplete="given-name" onChange={(e) => setFornavn(e.target.value)} />
            </label>
            <label>Etternavn
              <input type="text" value={etternavn} autoComplete="family-name" onChange={(e) => setEtternavn(e.target.value)} />
            </label>
          </div>
          <label>E-post
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <div className="au-rad">
            <label>Passord
              <span className="au-passord">
                <input
                  type={visPassord ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minst 8 tegn"
                  value={passord}
                  onChange={(e) => setPassord(e.target.value)}
                />
                <button type="button" aria-pressed={visPassord} onClick={() => setVisPassord(!visPassord)}>
                  {visPassord ? "Skjul" : "Vis"}
                </button>
              </span>
            </label>
            <label>Bekreft passord
              <span className="au-passord">
                <input
                  type={visBekreft ? "text" : "password"}
                  autoComplete="new-password"
                  value={bekreft}
                  onChange={(e) => setBekreft(e.target.value)}
                />
                <button type="button" aria-pressed={visBekreft} onClick={() => setVisBekreft(!visBekreft)}>
                  {visBekreft ? "Skjul" : "Vis"}
                </button>
              </span>
            </label>
          </div>
          <div className="au-roller" role="group" aria-label="Jeg er">
            {ROLLER.map((valg) => (
              <button
                key={valg.value}
                type="button"
                aria-pressed={rolle === valg.value}
                onClick={() => setRolle(valg.value)}
              >
                {valg.label}
              </button>
            ))}
          </div>
          <label className="au-sjekk">
            <input type="checkbox" checked={samtykke} onChange={(e) => setSamtykke(e.target.checked)} />
            <span>
              Jeg godtar <Link href="/vilkar">vilkår</Link> og <Link href="/personvern">personvern</Link>.
            </span>
          </label>
          {feil ? <p className="au-melding" data-tone="feil" role="alert">{feil}</p> : null}
          <button type="submit" className="pa-btn pa-btn--primary pa-btn--full" disabled={laster}>
            {laster ? "Oppretter…" : "Opprett konto"}
          </button>
          <p className="au-eller">eller</p>
          <button type="button" className="pa-btn pa-btn--secondary pa-btn--full" disabled={laster} onClick={fortsettMedGoogle}>
            Fortsett med Google
          </button>
        </form>
      </div>
    </div>
  );
}
