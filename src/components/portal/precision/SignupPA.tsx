"use client";

/**
 * /auth/signup i Precision Athletics — AU-02 «Registrer» (Claude Design 7d7c2994,
 * ui_kits/konto/screens/AU-01-03.jsx). Steg 1 (pakke) og 2 (konto og samtykke);
 * steg 3 «Sjekk e-post» er /auth/check-email og steg 4 «Betaling» er
 * /auth/checkout-resume.
 *
 * Registreringslogikken er uendret fra SignupV2: Supabase auth.signUp med rolle,
 * pakke og metadata, ?subscribe= videreføres til onboarding/check-email,
 * ?epost= fyller e-postfeltet, ?kilde=talenthq gir gratis TalentHQ-profil.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Tier, UserRole } from "@/generated/prisma/client";
import { Knapp, LasterTilstand } from "@/components/precision/pa";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { AuthBoks, AuthHode, Avkryss, Fremdrift, FormFelt, PassordInput, Segmentert, TekstInput } from "@/components/precision/pa-auth";

type Plan = "TALENT" | "FULL";
type Periode = "MND" | "AAR";
type Kilde = "talenthq" | undefined;

/** Kun i målingen: hopp rett til en tilstand. */
export type SignupForhandsvisning = { steg?: 0 | 1; laster?: boolean; feil?: string; feltfeil?: boolean; tema?: "night" };

const FULL_PRIS: Record<Periode, string> = { MND: "299 kr / mnd", AAR: "2 690 kr / år" };
/** Stripe-planene i /api/stripe/checkout for PlayerHQ-abonnementet. */
const STRIPE_PLAN: Record<Periode, string> = { MND: "pro", AAR: "pro_aar" };

/** Coaching-pakker som markedssidene kan sende inn via ?subscribe=. Uendret fra SignupV2. */
const COACHING: Record<string, { pakke: "PERFORMANCE" | "PERFORMANCE_PRO"; kreditter: number; navn: string }> = {
  performance: { pakke: "PERFORMANCE", kreditter: 2, navn: "Performance" },
  performance_pro: { pakke: "PERFORMANCE_PRO", kreditter: 4, navn: "Performance Pro" },
};

const ROLLER = [{ verdi: "PLAYER", navn: "Spiller" }, { verdi: "PARENT", navn: "Foresatt" }] as const;

const okMail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

/** Samme feiloversettelse som SignupV2/signup-form.tsx. */
function oversettAuthFeil(msg: string): string {
  if (msg.includes("already registered") || msg.includes("already exists")) return "En konto med denne e-posten finnes allerede.";
  if (msg.includes("Password should be at least")) return "Passordet er for kort. Minst 8 tegn.";
  if (msg.includes("rate limit")) return "For mange forsøk. Prøv igjen om litt.";
  return msg;
}
function oversettGoogleFeil(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Feil e-post eller passord.";
  if (msg.includes("Email not confirmed")) return "E-posten er ikke bekreftet. Sjekk innboksen din.";
  return msg;
}

function PakkeKort({ id, pris, tekst, valgt, onVelg }: { id: Plan; pris: string; tekst: string; valgt: boolean; onVelg: () => void }) {
  return <button type="button" role="radio" aria-checked={valgt} onClick={onVelg} className="pa-auth__pakke">
    <span className="pa-auth__pakke-topp">
      <span style={{ font: "600 14px/1 var(--font-mono)", letterSpacing: ".08em" }}>{id}</span>
      <span style={{ font: "var(--type-num)" }}>{pris}</span>
    </span>
    <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{tekst}</span>
  </button>;
}

export function SignupPA({ defaultEmail, subscribe, kilde, forhandsvisning }: { defaultEmail?: string; subscribe?: string; kilde?: Kilde; forhandsvisning?: SignupForhandsvisning }) {
  const router = useRouter();
  const coaching = subscribe ? COACHING[subscribe] : undefined;
  const [steg, setSteg] = useState<0 | 1>(forhandsvisning?.steg ?? (coaching ? 1 : 0));
  const [plan, setPlan] = useState<Plan | null>(kilde === "talenthq" ? "TALENT" : "FULL");
  const [periode, setPeriode] = useState<Periode>(subscribe === "pro_aar" ? "AAR" : "MND");
  const [rolle, setRolle] = useState<UserRole>("PLAYER");
  const [fornavn, setFornavn] = useState(forhandsvisning?.feltfeil ? "" : forhandsvisning ? "Øyvind" : "");
  const [etternavn, setEtternavn] = useState(forhandsvisning?.feltfeil ? "" : forhandsvisning ? "Rohjan" : "");
  const [email, setEmail] = useState(defaultEmail ?? (forhandsvisning ? "oyvind@demo.no" : ""));
  const [passord, setPassord] = useState("");
  const [bekreft, setBekreft] = useState("");
  const [vilkar, setVilkar] = useState(false);
  const [feltfeil, setFeltfeil] = useState<Record<string, string>>(forhandsvisning?.feltfeil ? { fornavn: "Skriv fornavnet ditt.", email: "Skriv en gyldig e-postadresse.", passord: "Passordet må være minst 8 tegn.", vilkar: "Du må godta vilkårene for å fortsette." } : {});
  const [feil, setFeil] = useState<string | null>(forhandsvisning?.feil ?? null);
  const [laster, setLaster] = useState(forhandsvisning?.laster ?? false);

  /**
   * Verdien som følger brukeren til onboarding og betaling. TALENT har ingen betaling.
   * Coaching-pakke fra markedssidene gjelder uendret. For FULL avgjør den viste
   * perioden planen, så kortet og Stripe alltid er enige; ukjente ?subscribe=-verdier
   * sendes aldri videre. Foresatte sendes ikke til betaling på egen konto med mindre
   * de kom inn med en eksplisitt PlayerHQ-plan (?subscribe=pro / pro_aar), som før.
   */
  const fullPlan = subscribe === "pro" || subscribe === "pro_aar";
  const abonnement = coaching ? subscribe
    : plan === "FULL" && (rolle === "PLAYER" || fullPlan) ? STRIPE_PLAN[periode]
    : undefined;

  function videre() {
    if (!plan) { setFeltfeil({ plan: "Velg TALENT eller FULL." }); return; }
    setFeltfeil({});
    setSteg(1);
  }

  async function opprett(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    const x: Record<string, string> = {};
    if (!fornavn.trim()) x.fornavn = "Skriv fornavnet ditt.";
    if (!etternavn.trim()) x.etternavn = "Skriv etternavnet ditt.";
    if (!okMail(email)) x.email = "Skriv en gyldig e-postadresse.";
    if (passord.length < 8) x.passord = "Passordet må være minst 8 tegn.";
    if (bekreft !== passord) x.bekreft = "Passordene er ikke like. Skriv det samme passordet to ganger.";
    if (!vilkar) x.vilkar = "Du må godta vilkårene for å fortsette.";
    setFeltfeil(x);
    if (Object.keys(x).length) return;

    setLaster(true);
    // TalentHQ: gratis låst testprofil. `kilde` i user_metadata leses av ensureUser,
    // som setter profilType TALENT; Tier tvinges til GRATIS server-side uansett.
    const metadata = plan === "TALENT" && !coaching
      ? { role: rolle, tier: "GRATIS" satisfies Tier, kilde: "talenthq", firstName: fornavn, lastName: etternavn }
      : { role: rolle, tier: "PRO" satisfies Tier, package: coaching?.pakke ?? "PLAYERHQ_ONLY", monthlyCredits: coaching?.kreditter ?? 0, firstName: fornavn, lastName: etternavn };
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({ email, password: passord, options: { data: metadata } });
    if (err) { setLaster(false); setFeil(oversettAuthFeil(err.message)); return; }

    // Aktiv session betyr at «Confirm email» er av: brukeren er allerede innlogget.
    const sub = abonnement ? `?subscribe=${encodeURIComponent(abonnement)}` : "";
    if (data.session) { router.push(`/auth/onboarding${sub}`); router.refresh(); }
    else router.push(`/auth/check-email${sub}`);
  }

  async function fortsettMedGoogle() {
    setFeil(null);
    setLaster(true);
    const next = abonnement ? `/auth/onboarding?subscribe=${encodeURIComponent(abonnement)}` : "/auth/onboarding";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: err } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${origin}/api/auth/oauth-callback?next=${encodeURIComponent(next)}` } });
    if (err) { setLaster(false); setFeil(oversettGoogleFeil(err.message)); }
  }

  const tema = forhandsvisning?.tema;
  if (laster) return <AuthBoks maks={520} tema={tema}><LasterTilstand text="Oppretter konto …" /></AuthBoks>;

  return <AuthBoks maks={520} tema={tema}>
    <Fremdrift steg={steg} />
    {steg === 0 && <>
      <AuthHode tittel="Velg pakke" under="Du kan bytte eller avslutte når som helst." />
      <div role="radiogroup" aria-label="Pakke" className="pa-auth__valg">
        <PakkeKort id="TALENT" pris="0 kr" tekst="Spillerprofil, åpent testbatteri og analyse av runder." valgt={plan === "TALENT"} onVelg={() => setPlan("TALENT")} />
        <PakkeKort id="FULL" pris={FULL_PRIS[periode]} tekst="Alt i TALENT, plan fra coach, Workbench og Caddie." valgt={plan === "FULL"} onVelg={() => setPlan("FULL")} />
      </div>
      {plan === "FULL" && <Segmentert etikett="Betalingsperiode" valg={[{ verdi: "MND", navn: "Månedlig" }, { verdi: "AAR", navn: "Årlig" }]} verdi={periode} onChange={setPeriode} />}
      {feltfeil.plan && <InlineVarsel tone="warn">{feltfeil.plan}</InlineVarsel>}
      <div className="pa-auth__rad"><Knapp onClick={videre}>Fortsett</Knapp></div>
      <Link href="/auth/login" className="pa-auth__lenke" style={{ alignSelf: "flex-start" }}>Har du konto? Logg inn</Link>
    </>}
    {steg === 1 && <form onSubmit={opprett} noValidate style={{ display: "contents" }}>
      <AuthHode tittel="Konto og samtykke" under={coaching ? `Du har valgt ${coaching.navn}. Betaling kommer etter registreringen.` : undefined} />
      {feil && <InlineVarsel tone="warn" tittel="Kontoen kunne ikke opprettes">{feil}</InlineVarsel>}
      <FormFelt label="Fornavn" required error={feltfeil.fornavn}><TekstInput value={fornavn} onChange={(e) => setFornavn(e.target.value)} autoComplete="given-name" /></FormFelt>
      <FormFelt label="Etternavn" required error={feltfeil.etternavn}><TekstInput value={etternavn} onChange={(e) => setEtternavn(e.target.value)} autoComplete="family-name" /></FormFelt>
      <FormFelt label="E-post" required error={feltfeil.email}><TekstInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></FormFelt>
      <FormFelt label="Passord" required hint="Minst 8 tegn." error={feltfeil.passord}><PassordInput value={passord} onChange={(e) => setPassord(e.target.value)} autoComplete="new-password" /></FormFelt>
      <FormFelt label="Gjenta passord" required error={feltfeil.bekreft}><PassordInput value={bekreft} onChange={(e) => setBekreft(e.target.value)} autoComplete="new-password" /></FormFelt>
      <div className="pa-field"><span className="pa-field__label">Jeg er</span>
        <Segmentert etikett="Jeg er" full valg={ROLLER.map((r) => ({ verdi: r.verdi, navn: r.navn }))} verdi={rolle as "PLAYER" | "PARENT"} onChange={(v) => setRolle(v)} />
      </div>
      <Avkryss checked={vilkar} onChange={(e) => setVilkar(e.target.checked)} label={<>Jeg godtar <a href="/vilkar" target="_blank" rel="noopener noreferrer" style={{ color: "var(--link)" }}>vilkår</a> og <a href="/personvern" target="_blank" rel="noopener noreferrer" style={{ color: "var(--link)" }}>personvernerklæring</a></>} />
      {feltfeil.vilkar && <InlineVarsel tone="warn">{feltfeil.vilkar}</InlineVarsel>}
      <div className="pa-auth__rad">
        <Knapp variant="ghost" onClick={() => setSteg(0)}>Tilbake</Knapp>
        <Knapp type="submit">Opprett konto</Knapp>
      </div>
      <Knapp variant="secondary" fullWidth onClick={fortsettMedGoogle}>Fortsett med Google</Knapp>
    </form>}
  </AuthBoks>;
}
