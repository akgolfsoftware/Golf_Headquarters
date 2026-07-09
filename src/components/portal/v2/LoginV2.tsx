"use client";

/**
 * Login — v2 (retning C «Presis», mørk-først). Komponert 1:1 fra
 * ui_kits/v2/auth-profil.jsx → funksjonen Login (+ AuthRamme, BrandPanel,
 * LoginKort, Felt, GoogleG, EllerSkille, Lenke). Montert offentlig i
 * (v2preview)/v2-login/page.tsx (ingen auth-guard, ingen dataloader).
 *
 * Dette er en VISUELL v2-variant for godkjenning. Den EKTE innloggings-logikken
 * (Supabase signInWithPassword / OAuth) bor i src/app/auth/login/login-form.tsx
 * og dupliseres bevisst IKKE her — skjemaet vises med ekte felt, ekte
 * passord-veksling og ekte navigasjon til /auth/signup, /auth/forgot-password
 * og /auth/bankid. «Logg inn»/Google-innsending er bevisst nøytralisert (meldt
 * som gap) slik at auth-flyten forblir én kilde.
 *
 * Kun v2-primitiver fra "@/components/v2" (LogoAK, Caps, Icon). Auth-idiomene
 * (AuthRamme/BrandPanel/Felt/GoogleG/EllerSkille/Lenke/Knapp) er lokale her,
 * 1:1 med mockup-kilden — meldt som gap for opprykk til src/components/v2/auth.tsx
 * når Onboarding/MinProfil porteres. Ingen rå hex (kun T.* + rgba). Norsk æøå.
 * Fluid motpart til mockupens faste device-frame: full viewport, md-breakpoint
 * for split/stablet, ekte dark-scope.
 */

import { useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { LogoAK, Caps, Icon } from "@/components/v2";

/* ── Lokale auth-byggeklosser (1:1 med mockup) ─────────────────────── */

/** Redigerbart felt i Felt-idiomet (mockupens Felt er visning; her er det ekte input). */
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
  const id = `v2login-${label.toLowerCase().replace(/[^a-z]/g, "")}`;
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

/** primary=lime CTA · ghost=panel. hvit-varianten fra mockup brukes ikke på login. */
function Knapp({
  children,
  icon,
  variant = "primary",
  type = "button",
  onClick,
}: {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "ghost";
  type?: "button" | "submit";
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
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        cursor: "pointer",
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

/** Monokromt G-merke — aldri off-palett brandfarger på mørk (1:1 mockup). */
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

/** Ekte lenke i Lenke-idiomet (mockupens span → Next Link til reell rute). */
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
        background: `radial-gradient(560px 460px at 28% 24%, rgba(0,88,64,0.55), transparent 68%), radial-gradient(420px 380px at 82% 88%, rgba(209,248,67,0.07), transparent 60%), ${T.bg}`,
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
        <circle cx="260" cy="330" r="3.5" fill="rgba(209,248,67,0.5)" />
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
          Hele golfutviklingen din.{" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>Ett sted.</em>
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
          Plan, trening og analyse — koblet rett til coachen din.
        </p>
      </div>
    </div>
  );
}

/* ── Login-kortet ──────────────────────────────────────────────────── */

function LoginKort() {
  const [email, setEmail] = useState("");
  const [passord, setPassord] = useState("");
  const [visPassord, setVisPassord] = useState(false);

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
          Logg inn
        </h1>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "8px 0 0" }}>
          Ny her? <Lenke href="/auth/signup">Opprett konto</Lenke>
        </p>
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
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
        <Felt
          label="E-post"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="oyvind@akgolf.no"
          autoComplete="email"
          trailing={<Icon name="mail" size={14} style={{ color: T.mut }} />}
        />
        <Felt
          label="Passord"
          type={visPassord ? "text" : "password"}
          value={passord}
          onChange={setPassord}
          placeholder="••••••••"
          autoComplete="current-password"
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
        <Knapp variant="primary" type="submit">
          Logg inn
        </Knapp>
        <EllerSkille />
        <Knapp variant="ghost" icon={<GoogleG />}>
          Fortsett med Google
        </Knapp>
        <Link href="/auth/bankid" style={{ textDecoration: "none" }}>
          <Knapp variant="ghost" icon={<Icon name="fingerprint" size={16} style={{ color: T.fg2 }} />}>
            Fortsett med BankID
          </Knapp>
        </Link>
      </form>

      <div style={{ textAlign: "center" }}>
        <Lenke href="/auth/forgot-password">Glemt passord?</Lenke>
      </div>

      {/* Fot — synlig på mobil (1:1 med mockupens mobil-Login) */}
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

/* ── Offentlig login-flate (dark-scope, fluid AuthRamme) ───────────── */

export function LoginV2() {
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
        <LoginKort />
      </div>
    </div>
  );
}
