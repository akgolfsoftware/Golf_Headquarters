"use client";

/**
 * Signup — v2 (retning C «Presis», mørk-først). Komponert i samme idiom-familie
 * som LoginV2 (AuthRamme/BrandPanel/Felt/Knapp/GoogleG/EllerSkille/Lenke) — mørk
 * split-layout, IKKE V2Shell. Montert på /auth/signup (bytter ut gamle
 * SignupForm 2026-07-10).
 *
 * Ekte registreringslogikk (Supabase auth.signUp med rolle/pakke/metadata,
 * passord-validering, GDPR-samtykke, navigasjon til /auth/check-email eller
 * /auth/onboarding, ?subscribe=-videreføring) er portert 1:1 fra
 * src/app/auth/signup/signup-form.tsx — samme auth-semantikk, ny visuell
 * innpakning. Utvidet med pakkevalg (PakkeVelger) og rolle-toggle (RolleVelger)
 * som fantes i den gamle formen men ikke i første v2-mockup. Google-knappen
 * bruker samme signInWithOAuth-mekanisme som LoginV2 (Supabase skiller ikke
 * signup/login for OAuth — kontoen opprettes automatisk av
 * /api/auth/oauth-callback). Gammel signup-form.tsx står urørt som fallback.
 * ?epost=-prefill fra booking-broen speiles via prop `defaultEmail`.
 *
 * Kun v2-primitiver fra "@/components/v2" (LogoAK, Caps, Icon) + T fra
 * "@/lib/v2/tokens". Auth-idiomene er lokale her (1:1 med LoginV2) — meldt som gap
 * for opprykk til src/components/v2/auth.tsx når auth-familien porteres. Ingen rå
 * hex (kun T.* + rgba). Norsk æøå. Fluid: full viewport, md-breakpoint for split/
 * stablet, ekte dark-scope.
 */

import { useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T } from "@/lib/v2/tokens";
import { LogoAK, Caps, Icon } from "@/components/v2";
import { createClient } from "@/lib/supabase/client";
import { UserRole, Tier } from "@/generated/prisma/client";

/* ── Pakke- og rolle-data (1:1 med gamle signup-form.tsx) ──────────── */

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

/** Samme feiloversettelse som gamle signup-form.tsx — én kilde til auth-tekst. */
function oversettAuthFeil(msg: string): string {
  if (msg.includes("already registered") || msg.includes("already exists"))
    return "En konto med denne e-posten finnes allerede.";
  if (msg.includes("Password should be at least"))
    return "Passordet er for kort. Minst 8 tegn.";
  if (msg.includes("rate limit"))
    return "For mange forsøk. Prøv igjen om litt.";
  return msg;
}

/** Samme Google-feiloversettelse som LoginV2 — OAuth deler feilrom med innlogging. */
function oversettGoogleFeil(msg: string): string {
  if (msg.includes("Invalid login credentials"))
    return "Feil e-post eller passord.";
  if (msg.includes("Email not confirmed"))
    return "E-posten er ikke bekreftet. Sjekk innboksen din.";
  return msg;
}

/* ── Lokale auth-byggeklosser (1:1 med LoginV2) ────────────────────── */

/** Redigerbart felt i Felt-idiomet. */
function Felt({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  trailing,
  mono,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  trailing?: ReactNode;
  mono?: boolean;
}) {
  const id = `v2signup-${label.toLowerCase().replace(/[^a-z]/g, "")}`;
  return (
    <div>
      <label htmlFor={id}>
        <Caps size={9} style={{ marginBottom: 7 }}>
          {label}
        </Caps>
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 44,
          padding: "0 14px",
          borderRadius: 12,
          background: T.panel2,
          border: `1px solid ${T.borderS}`,
        }}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            flex: 1,
            minWidth: 0,
            appearance: "none",
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: mono ? T.mono : T.ui,
            fontSize: 13.5,
            fontWeight: 500,
            color: T.fg,
          }}
        />
        {trailing}
      </div>
    </div>
  );
}

/** primary=lime CTA · ghost=panel. */
function Knapp({
  children,
  icon,
  variant = "primary",
  type = "button",
  disabled,
  onClick,
}: {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const v: CSSProperties =
    variant === "primary"
      ? { background: T.lime, color: T.onLime, border: "none" }
      : { background: T.panel3, color: T.fg, border: `1px solid ${T.borderS}` };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-busy={disabled || undefined}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        width: "100%",
        height: 44,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        fontFamily: T.ui,
        fontSize: 13.5,
        fontWeight: 600,
        ...v,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

/** Monokromt G-merke — aldri off-palett brandfarger på mørk. */
function GoogleG() {
  return (
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: 9999,
        background: T.panel,
        border: `1px solid ${T.borderS}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: T.disp,
        fontSize: 11,
        fontWeight: 700,
        color: T.fg,
        flex: "none",
      }}
    >
      G
    </span>
  );
}

function EllerSkille() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ flex: 1, height: 1, background: T.border }} />
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: T.mut,
        }}
      >
        ELLER
      </span>
      <span style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
}

/** Ekte lenke i Lenke-idiomet. */
function Lenke({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: T.ui,
        fontSize: 12,
        fontWeight: 600,
        color: T.fg2,
        cursor: "pointer",
        textDecoration: "underline",
        textDecorationColor: T.borderS,
        textUnderlineOffset: 3,
      }}
    >
      {children}
    </Link>
  );
}

/** GDPR-samtykke: lime-fylt avkryssing når huket (intent bevart fra ekte form). */
function Samtykke({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        cursor: "pointer",
        fontFamily: T.ui,
        fontSize: 12,
        color: T.fg2,
        lineHeight: 1.5,
      }}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onToggle}
        className="v2-focus"
        style={{
          appearance: "none",
          flex: "none",
          marginTop: 1,
          width: 20,
          height: 20,
          borderRadius: 6,
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          background: checked ? T.lime : T.panel2,
          border: `1.5px solid ${checked ? T.lime : T.borderS}`,
          transition: `background ${T.dur}ms ${T.ease}, border-color ${T.dur}ms ${T.ease}`,
        }}
      >
        {checked && <Icon name="check" size={13} strokeWidth={3} style={{ color: T.onLime }} />}
      </button>
      <span>
        Jeg godtar{" "}
        <Lenke href="/vilkar">vilkår</Lenke> og <Lenke href="/personvern">personvern</Lenke>.
      </span>
    </label>
  );
}

/** Feilboks — 1:1 idiom med ResetPasswordV2/GuardianConsentV2. */
function Feilboks({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 9,
        padding: "11px 13px",
        borderRadius: 12,
        background: T.panel2,
        border: `1px solid ${T.borderS}`,
      }}
    >
      <Icon name="triangle-alert" size={14} style={{ color: T.down, marginTop: 1, flex: "none" }} />
      <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 500, color: T.down }}>
        {children}
      </span>
    </div>
  );
}

/** Pakkevalg — vertikal liste av trykkbare kort (radio-oppførsel), 1:1 intent med gamle signup-form.tsx. */
function PakkeVelger({
  value,
  onChange,
}: {
  value: PackageValue;
  onChange: (v: PackageValue) => void;
}) {
  return (
    <div>
      <Caps size={9} style={{ marginBottom: 8 }}>
        Velg medlemskap
      </Caps>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PAKKER.map((p) => {
          const aktiv = p.value === value;
          return (
            <button
              key={p.value}
              type="button"
              role="radio"
              aria-checked={aktiv}
              onClick={() => onChange(p.value)}
              className="v2-focus"
              style={{
                appearance: "none",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: 14,
                borderRadius: 12,
                background: aktiv ? T.panel3 : T.panel2,
                border: `1px solid ${aktiv ? T.lime : T.border}`,
                transition: `background ${T.dur}ms ${T.ease}, border-color ${T.dur}ms ${T.ease}`,
              }}
            >
              {p.featured && (
                <span
                  style={{
                    position: "absolute",
                    top: -9,
                    right: 14,
                    borderRadius: 9999,
                    padding: "2px 9px",
                    background: T.lime,
                    fontFamily: T.mono,
                    fontSize: 8.5,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: T.onLime,
                  }}
                >
                  Mest populær
                </span>
              )}
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 600, color: T.fg }}>
                  {p.name}
                </span>
                <span style={{ fontFamily: T.mono, fontSize: 11.5, fontWeight: 700, color: T.lime }}>
                  {p.price}
                </span>
              </div>
              {p.trialHint && (
                <span
                  style={{
                    alignSelf: "flex-start",
                    borderRadius: 9999,
                    padding: "2px 8px",
                    background: "color-mix(in srgb, var(--v2-lime) 12%, transparent)",
                    fontFamily: T.mono,
                    fontSize: 9,
                    fontWeight: 700,
                    color: T.lime,
                  }}
                >
                  {p.trialHint}
                </span>
              )}
              <span style={{ fontFamily: T.ui, fontSize: 12, lineHeight: 1.4, color: T.fg2 }}>
                {p.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Rolle-toggle — «Spiller»/«Foresatt», 1:1 intent med gamle signup-form.tsx. */
function RolleVelger({
  value,
  onChange,
}: {
  value: UserRole;
  onChange: (v: UserRole) => void;
}) {
  return (
    <div>
      <Caps size={9} style={{ marginBottom: 8 }}>
        Jeg er
      </Caps>
      <div style={{ display: "flex", gap: 8 }}>
        {ROLLER.map((r) => {
          const aktiv = r.value === value;
          return (
            <button
              key={r.value}
              type="button"
              aria-pressed={aktiv}
              onClick={() => onChange(r.value)}
              className="v2-focus"
              style={{
                appearance: "none",
                cursor: "pointer",
                flex: 1,
                height: 40,
                borderRadius: 10,
                fontFamily: T.ui,
                fontSize: 13,
                fontWeight: aktiv ? 600 : 500,
                background: aktiv ? T.panel3 : T.panel2,
                border: `1px solid ${aktiv ? T.lime : T.border}`,
                color: aktiv ? T.lime : T.fg2,
                transition: `background ${T.dur}ms ${T.ease}, border-color ${T.dur}ms ${T.ease}`,
              }}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Venstre brand-panel (Neon/Cosmos-idiomet). Skjult under md (stablet mobil). */
function BrandPanel() {
  return (
    <div
      className="hidden md:flex"
      style={{
        width: 520,
        flex: "none",
        position: "relative",
        overflow: "hidden",
        borderRight: `1px solid ${T.border}`,
        background: `radial-gradient(560px 460px at 28% 24%, rgba(0,88,64,0.55), transparent 68%), radial-gradient(420px 380px at 82% 88%, color-mix(in srgb, var(--v2-lime) 7%, transparent), transparent 60%), ${T.bg}`,
        flexDirection: "column",
        padding: "34px 40px 44px",
      }}
    >
      {/* subtilt motiv (Cosmos): svake konsentriske treffsirkler */}
      <svg
        viewBox="0 0 520 720"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        aria-hidden
      >
        {[70, 130, 190, 250].map((r) => (
          <circle
            key={r}
            cx="260"
            cy="330"
            r={r}
            fill="none"
            stroke="rgba(238,240,236,0.05)"
            strokeWidth="1"
          />
        ))}
        <circle cx="260" cy="330" r="3.5" fill="color-mix(in srgb, var(--v2-lime) 50%, transparent)" />
      </svg>
      <div style={{ position: "relative" }}>
        <LogoAK size={30} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ position: "relative" }}>
        <LogoAK size={64} style={{ marginBottom: 22 }} />
        <h2
          style={{
            fontFamily: T.disp,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "-0.03em",
            lineHeight: 1.12,
            color: T.fg,
            margin: 0,
          }}
        >
          Start reisen din.{" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>Gratis.</em>
        </h2>
        <p
          style={{
            fontFamily: T.ui,
            fontSize: 13.5,
            color: T.fg2,
            lineHeight: 1.6,
            margin: "14px 0 0",
            maxWidth: 360,
          }}
        >
          Opprett konto på under ett minutt. Ingen binding.
        </p>
      </div>
    </div>
  );
}

/* ── Signup-kortet ─────────────────────────────────────────────────── */

function SignupKort({
  defaultEmail,
  subscribe,
}: {
  defaultEmail?: string;
  subscribe?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
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

  async function onSubmit(e: React.FormEvent) {
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
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password: passord,
      options: {
        data: {
          role: rolle,
          tier: "PRO" satisfies Tier,
          package: valgt.value,
          monthlyCredits: valgt.monthlyCredits,
          firstName: fornavn,
          lastName: etternavn,
        },
      },
    });
    setLaster(false);

    if (err) {
      setFeil(oversettAuthFeil(err.message));
      return;
    }

    // Hvis Supabase returnerer en aktiv session betyr det at "Confirm email"
    // er AV — brukeren er allerede innlogget. Ellers (vanlig case) må de
    // bekrefte e-posten først. Bær subscribe-intent videre.
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
    // Ingen videre handling — Supabase redirecter til Google.
  }

  return (
    <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Mobil-logo (BrandPanel er skjult under md) */}
      <div
        className="md:hidden"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "6px 0 6px" }}
      >
        <LogoAK size={46} />
      </div>

      <div style={{ marginBottom: 4 }}>
        <h1
          style={{
            fontFamily: T.disp,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "-0.03em",
            color: T.fg,
            margin: 0,
          }}
        >
          Lag konto
        </h1>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "8px 0 0" }}>
          Har du konto? <Lenke href="/auth/login">Logg inn</Lenke>
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        style={{
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: T.rCard,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.045), 0 12px 32px rgba(0,0,0,0.35)",
        }}
      >
        <PakkeVelger value={pkg} onChange={setPkg} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Felt
            label="Fornavn"
            value={fornavn}
            onChange={setFornavn}
            placeholder="Øyvind"
            autoComplete="given-name"
          />
          <Felt
            label="Etternavn"
            value={etternavn}
            onChange={setEtternavn}
            placeholder="Rohjan"
            autoComplete="family-name"
          />
        </div>
        <Felt
          label="E-post"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="oyvind@akgolf.no"
          autoComplete="email"
          trailing={<Icon name="mail" size={14} style={{ color: T.mut }} />}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Felt
            label="Passord"
            type={visPassord ? "text" : "password"}
            value={passord}
            onChange={setPassord}
            placeholder="Minst 8 tegn"
            autoComplete="new-password"
            mono
            trailing={
              <button
                type="button"
                onClick={() => setVisPassord((v) => !v)}
                aria-label={visPassord ? "Skjul passord" : "Vis passord"}
                aria-pressed={visPassord}
                className="v2-focus"
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "inline-flex",
                }}
              >
                <Icon name="eye" size={14} style={{ color: T.mut }} />
              </button>
            }
          />
          <Felt
            label="Bekreft passord"
            type={visBekreft ? "text" : "password"}
            value={bekreft}
            onChange={setBekreft}
            placeholder="Gjenta passordet"
            autoComplete="new-password"
            mono
            trailing={
              <button
                type="button"
                onClick={() => setVisBekreft((v) => !v)}
                aria-label={visBekreft ? "Skjul passord" : "Vis passord"}
                aria-pressed={visBekreft}
                className="v2-focus"
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "inline-flex",
                }}
              >
                <Icon name="eye" size={14} style={{ color: T.mut }} />
              </button>
            }
          />
        </div>
        <RolleVelger value={rolle} onChange={setRolle} />
        <Samtykke checked={samtykke} onToggle={() => setSamtykke((s) => !s)} />

        {feil && <Feilboks>{feil}</Feilboks>}

        <Knapp
          variant="primary"
          type="submit"
          disabled={laster}
          icon={<Icon name="arrow-right" size={16} style={{ color: T.onLime }} />}
        >
          {laster ? "Oppretter…" : "Opprett konto"}
        </Knapp>
        <EllerSkille />
        <Knapp variant="ghost" icon={<GoogleG />} disabled={laster} onClick={fortsettMedGoogle}>
          Fortsett med Google
        </Knapp>
      </form>

      {/* Fot — synlig på mobil */}
      <p
        className="md:hidden"
        style={{
          fontFamily: T.ui,
          fontSize: 10.5,
          color: T.mut,
          textAlign: "center",
          margin: "6px 0 0",
        }}
      >
        AK Golf Group · Vilkår · Personvern
      </p>
    </div>
  );
}

/* ── Offentlig signup-flate (dark-scope, fluid AuthRamme) ──────────── */

export function SignupV2({
  defaultEmail,
  subscribe,
}: { defaultEmail?: string; subscribe?: string } = {}) {
  return (
    <div
      className="dark"
      style={{
        minHeight: "100vh",
        display: "flex",
        colorScheme: "dark",
        color: T.fg,
        fontFamily: T.ui,
        background: T.bg,
      }}
    >
      <BrandPanel />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 22px",
          background: `radial-gradient(700px 420px at 60% -12%, rgba(0,88,64,0.14), transparent 62%), ${T.bg}`,
        }}
      >
        <SignupKort defaultEmail={defaultEmail} subscribe={subscribe} />
      </div>
    </div>
  );
}
