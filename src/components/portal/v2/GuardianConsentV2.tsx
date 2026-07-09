"use client";

/**
 * Verge-samtykke — v2 (retning C «Presis», mørk-først). Komponert i v2-idiomet
 * fra auth-rammen (AuthRamme/BrandPanel/Felt/Avkryssing/Knapp), 1:1 med
 * LoginV2s mønster — IKKE V2Shell (uinnlogget verge har ingen app-navigasjon).
 * Montert offentlig i (v2preview)/v2-guardian-consent/page.tsx.
 *
 * Dette er en VISUELL v2-variant for godkjenning. Den EKTE samtykke-logikken
 * (Prisma-token-oppslag i src/app/auth/guardian-consent/[token]/page.tsx +
 * server-action `confirmGuardianConsent` i .../actions.ts) dupliseres bevisst
 * IKKE her. Token-flyten bevares presist som datakontrakt: komponenten tar de
 * SAMME propene som den ekte GuardianConsentForm (token/playerName/playerEmail/
 * guardianEmail/playerAge) og kjører den SAMME klient-valideringen (fullt navn
 * påkrevd + begge samtykke-hakene påkrevd). Selve innsendingen (server-action +
 * router.push til /auth/login?guardian_consent_given=1) er nøytralisert og meldt
 * som gap, slik at GDPR-samtykke-flyten forblir én kilde på ekte /auth-rute.
 *
 * Kun v2-primitiver fra "@/components/v2" (LogoAK, Caps, Icon) + T-tokens.
 * Auth-idiomene er lokale her (1:1 med LoginV2) — meldt som gap for opprykk til
 * src/components/v2/auth.tsx. Ingen rå hex (kun T.* + rgba). Norsk æøå.
 */

import { useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { LogoAK, Caps, Icon } from "@/components/v2";

/* ── Props (datakontrakt 1:1 med ekte GuardianConsentForm) ─────────── */

export type GuardianConsentV2Props = {
  token: string;
  playerName: string;
  playerEmail: string;
  guardianEmail: string;
  playerAge: number | null;
};

/* ── Lokale auth-byggeklosser (1:1 med LoginV2) ────────────────────── */

function Felt({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const id = `v2consent-${label.toLowerCase().replace(/[^a-z]/g, "")}`;
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
          type="text"
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
            fontFamily: T.ui,
            fontSize: 13.5,
            fontWeight: 500,
            color: T.fg,
          }}
        />
        <Icon name="user" size={14} style={{ color: T.mut }} />
      </div>
    </div>
  );
}

/** Samtykke-hake — panel-rad med boks til venstre (v2-idiom). */
function Avkryssing({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="v2-focus"
      style={{
        appearance: "none",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: 14,
        borderRadius: 12,
        background: checked ? T.panel3 : T.panel2,
        border: `1px solid ${checked ? T.borderS : T.border}`,
        transition: `background ${T.dur}ms ${T.ease}, border-color ${T.dur}ms ${T.ease}`,
      }}
    >
      <span
        aria-hidden
        style={{
          flex: "none",
          width: 20,
          height: 20,
          marginTop: 1,
          borderRadius: 6,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: checked ? T.lime : "transparent",
          border: `1px solid ${checked ? T.lime : T.borderS}`,
        }}
      >
        {checked ? (
          <Icon name="check" size={13} style={{ color: T.onLime }} />
        ) : null}
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: T.ui,
          fontSize: 12.5,
          lineHeight: 1.5,
          color: T.fg2,
        }}
      >
        {children}
      </span>
    </button>
  );
}

function Knapp({
  children,
  icon,
  disabled,
  type = "button",
  onClick,
}: {
  children: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  const v: CSSProperties = disabled
    ? { background: T.panel3, color: T.mut, border: `1px solid ${T.border}` }
    : { background: T.lime, color: T.onLime, border: "none" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        cursor: disabled ? "not-allowed" : "pointer",
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

/** Venstre brand-panel — samtykke-kontekst (Cosmos-idiom, 1:1 med LoginV2). */
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
        <span
          style={{
            display: "inline-flex",
            width: 52,
            height: 52,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 22,
            background: "rgba(0,88,64,0.22)",
            border: `1px solid ${T.borderS}`,
          }}
        >
          <Icon name="shield" size={26} style={{ color: T.lime }} />
        </span>
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
          Trygt samtykke.{" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>Full kontroll.</em>
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
          GDPR artikkel 8 — du gir samtykke på vegne av barnet ditt, og kan
          trekke det når som helst.
        </p>
      </div>
    </div>
  );
}

/* ── Samtykke-kortet ───────────────────────────────────────────────── */

function ConsentKort({
  playerName,
  playerEmail,
  guardianEmail,
  playerAge,
}: Omit<GuardianConsentV2Props, "token">) {
  const [navn, setNavn] = useState("");
  const [databehandling, setDatabehandling] = useState(false);
  const [vilkar, setVilkar] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const kanSende = navn.trim().length > 0 && databehandling && vilkar;

  // Klient-validering 1:1 med ekte GuardianConsentForm. Server-action +
  // router.push er bevisst nøytralisert (gap) — ekte flyt bor på /auth-ruten.
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    if (!navn.trim()) {
      setFeil("Skriv inn fullt navn.");
      return;
    }
    if (!databehandling || !vilkar) {
      setFeil("Du må samtykke til begge punktene for å fortsette.");
      return;
    }
    // Visuell variant: ingen server-innsending her.
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Mobil-logo (BrandPanel skjult under md) */}
      <div
        className="md:hidden"
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "6px 0 2px",
        }}
      >
        <LogoAK size={44} />
      </div>

      <div style={{ marginBottom: 2 }}>
        <Caps size={9} color={T.mut} style={{ marginBottom: 8 }}>
          AK Golf · Foreldresamtykke
        </Caps>
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
          Bekreft{" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>samtykke</em>
        </h1>
        <p
          style={{
            fontFamily: T.ui,
            fontSize: 12.5,
            color: T.mut,
            margin: "8px 0 0",
            lineHeight: 1.5,
          }}
        >
          For at{" "}
          <strong style={{ color: T.fg, fontWeight: 600 }}>{playerName}</strong>
          {playerAge !== null ? ` (${playerAge} år)` : ""} skal kunne bruke AK
          Golf.
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
          gap: 16,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.045), 0 12px 32px rgba(0,0,0,0.35)",
        }}
      >
        {/* Spiller-kort */}
        <div
          style={{
            padding: 14,
            borderRadius: 12,
            background: T.panel2,
            border: `1px solid ${T.border}`,
          }}
        >
          <Caps size={9} color={T.mut} style={{ marginBottom: 6 }}>
            Spiller
          </Caps>
          <div
            style={{
              fontFamily: T.disp,
              fontSize: 15,
              fontWeight: 600,
              color: T.fg,
            }}
          >
            {playerName}
            {playerAge !== null ? (
              <span
                style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, fontWeight: 400 }}
              >
                {"  "}({playerAge} år)
              </span>
            ) : null}
          </div>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 10.5,
              color: T.mut,
              marginTop: 3,
            }}
          >
            {playerEmail}
          </div>
        </div>

        {/* Vergens navn */}
        <div>
          <Felt
            label="Ditt fulle navn (foresatt)"
            value={navn}
            onChange={setNavn}
            placeholder="F.eks. Anne Hansen"
            autoComplete="name"
          />
          <p
            style={{
              fontFamily: T.mono,
              fontSize: 10,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: T.mut,
              margin: "7px 0 0",
            }}
          >
            Registrert e-post: {guardianEmail}
          </p>
        </div>

        {/* Samtykke-haker */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Avkryssing
            checked={databehandling}
            onToggle={() => setDatabehandling((v) => !v)}
          >
            <strong style={{ color: T.fg, fontWeight: 600 }}>
              Jeg samtykker til at AK Golf behandler {playerName} sine persondata
            </strong>{" "}
            iht. personvernerklæringen — profil, treningsdata, golf-statistikk,
            bookinger og kommunikasjon med coach.
          </Avkryssing>
          <Avkryssing checked={vilkar} onToggle={() => setVilkar((v) => !v)}>
            <strong style={{ color: T.fg, fontWeight: 600 }}>
              Jeg har lest og godtar vilkårene
            </strong>{" "}
            for bruk av AK Golf på vegne av {playerName}, og bekrefter at jeg har
            foreldreansvar/foresattmyndighet.
          </Avkryssing>
        </div>

        {/* Feil */}
        {feil ? (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 9,
              padding: "11px 14px",
              borderRadius: 12,
              background: "rgba(240,104,62,0.10)",
              border: `1px solid rgba(240,104,62,0.30)`,
            }}
          >
            <Icon name="triangle-alert" size={15} style={{ color: T.down, flex: "none", marginTop: 1 }} />
            <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.down }}>
              {feil}
            </span>
          </div>
        ) : null}

        <Knapp
          type="submit"
          disabled={!kanSende}
          icon={
            <Icon
              name="check"
              size={16}
              style={{ color: kanSende ? T.onLime : T.mut }}
            />
          }
        >
          Bekreft samtykke
        </Knapp>

        <p
          style={{
            fontFamily: T.ui,
            fontSize: 11,
            color: T.mut,
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          Ved å bekrefte gir du juridisk samtykke iht. GDPR artikkel 8. Du kan
          trekke samtykket når som helst ved å kontakte oss på{" "}
          <a
            href="mailto:post@akgolf.no"
            style={{ color: T.fg2, textDecoration: "underline", textUnderlineOffset: 2 }}
          >
            post@akgolf.no
          </a>
          .
        </p>
      </form>

      <div style={{ textAlign: "center", display: "flex", gap: 14, justifyContent: "center" }}>
        <Lenke href="/personvern">Personvern</Lenke>
        <Lenke href="/vilkar">Vilkår</Lenke>
      </div>
    </div>
  );
}

/* ── Offentlig samtykke-flate (dark-scope, fluid AuthRamme) ────────── */

export function GuardianConsentV2({
  playerName,
  playerEmail,
  guardianEmail,
  playerAge,
}: GuardianConsentV2Props) {
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
        <ConsentKort
          playerName={playerName}
          playerEmail={playerEmail}
          guardianEmail={guardianEmail}
          playerAge={playerAge}
        />
      </div>
    </div>
  );
}
