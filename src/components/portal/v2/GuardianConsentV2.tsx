"use client";

/**
 * Verge-samtykke — v2 (retning C «Presis», mørk-først). Komponert i v2-idiomet
 * fra auth-rammen (AuthRamme/BrandPanel/Felt/Avkryssing/Knapp), 1:1 med
 * LoginV2s mønster — IKKE V2Shell (uinnlogget verge har ingen app-navigasjon).
 * Montert på /auth/guardian-consent/[token] (bytter ut gamle Expired/Success/
 * GuardianConsentForm-oppsettet 2026-07-10). GDPR art. 8 (P17).
 *
 * Ekte samtykke-logikk er portert 1:1 fra
 * src/app/auth/guardian-consent/[token]/page.tsx + guardian-consent-form.tsx:
 * Prisma-token-oppslaget (utløpt/allerede-akseptert/gyldig) SKJER FORTSATT på
 * page.tsx (server-komponent, kan ikke flyttes til klient) og styrer hvilken
 * `state` som sendes hit som prop. Klient-valideringen (fullt navn påkrevd +
 * begge samtykke-hakene påkrevd) og selve innsendingen (server-action
 * `confirmGuardianConsent` + router.push til
 * /auth/login?guardian_consent_given=1) er portert eksakt. Info-seksjonen
 * («Hva betyr dette samtykket?») er bevart 1:1 fra page.tsx.
 *
 * Kun v2-primitiver fra "@/components/v2" (LogoAK, Caps, Icon) + T-tokens.
 * Auth-idiomene er lokale her (1:1 med LoginV2) — meldt som gap for opprykk til
 * src/components/v2/auth.tsx. Ingen rå hex (kun T.* + rgba). Norsk æøå.
 */

import { useState, useTransition, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T } from "@/lib/v2/tokens";
import { LogoAK, Caps, Icon } from "@/components/v2";
import { confirmGuardianConsent } from "@/app/auth/guardian-consent/[token]/actions";

/* ── Props (datakontrakt 1:1 med ekte page.tsx/GuardianConsentForm) ─── */

export type GuardianConsentV2Props =
  | {
      state: "form";
      token: string;
      playerName: string;
      playerAge: number | null;
      playerEmail: string;
      guardianEmail: string;
    }
  | { state: "expired"; playerName: string; playerAge: number | null; email: string }
  | { state: "success"; playerName: string; playerAge: number | null };

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

/** Feilboks — 1:1 idiom med ForgotPasswordV2/ResetPasswordV2. */
function Feilboks({ children }: { children: ReactNode }) {
  return (
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
      <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{children}</span>
    </div>
  );
}

/** Felles hode — 1:1 med page.tsx sitt <header>, vises i alle tre tilstander (form/expired/success). */
function Hode({ playerName, playerAge }: { playerName: string; playerAge: number | null }) {
  return (
    <div style={{ width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Mobil-logo (BrandPanel skjult under md) */}
      <div className="md:hidden" style={{ display: "flex", justifyContent: "center", padding: "6px 0 2px" }}>
        <LogoAK size={44} />
      </div>
      <div style={{ textAlign: "center" }}>
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            width: 52,
            height: 52,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            background: "rgba(0,88,64,0.22)",
            border: `1px solid ${T.borderS}`,
          }}
        >
          <Icon name="shield" size={26} style={{ color: T.lime }} />
        </span>
        <Caps size={9} color={T.mut} style={{ marginBottom: 8, textAlign: "center" }}>
          AK Golf · Foreldresamtykke
        </Caps>
        <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 28, letterSpacing: "-0.03em", color: T.fg, margin: 0 }}>
          Bekreft <em style={{ fontStyle: "italic", color: T.lime }}>samtykke</em>
        </h1>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "8px 0 0", lineHeight: 1.5 }}>
          For at <strong style={{ color: T.fg, fontWeight: 600 }}>{playerName}</strong>
          {playerAge !== null ? ` (${playerAge} år)` : ""} skal kunne bruke AK Golf.
        </p>
      </div>
    </div>
  );
}

/** Info-seksjon «Hva betyr dette samtykket?» — bevart 1:1 fra page.tsx, vises i alle tre tilstander. */
function InfoSeksjon() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        borderRadius: T.rCard,
        background: T.panel,
        border: `1px solid ${T.border}`,
        padding: 22,
      }}
    >
      <h2 style={{ fontFamily: T.disp, fontSize: 14.5, fontWeight: 600, color: T.fg, margin: "0 0 10px" }}>
        Hva betyr dette samtykket?
      </h2>
      <ul style={{ display: "flex", flexDirection: "column", gap: 9, margin: 0, padding: 0, listStyle: "none" }}>
        <li style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.5 }}>
          <strong style={{ color: T.fg, fontWeight: 600 }}>GDPR artikkel 8:</strong> Norske barn
          under 16 år trenger foreldresamtykke før de kan dele persondata med en tjeneste.
        </li>
        <li style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.5 }}>
          <strong style={{ color: T.fg, fontWeight: 600 }}>Du kan trekke samtykket</strong> når
          som helst ved å kontakte oss på{" "}
          <a href="mailto:post@akgolf.no" style={{ color: T.lime, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}>
            post@akgolf.no
          </a>
          .
        </li>
        <li style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.5 }}>
          <strong style={{ color: T.fg, fontWeight: 600 }}>Du får tilgang</strong> til en
          foreldreportal som lar deg følge barnets utvikling, fakturaer og kommunikasjon med coach.
        </li>
      </ul>
      <p style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, margin: "14px 0 0" }}>
        Mer info i <Lenke href="/personvern">personvernerklæringen</Lenke> og{" "}
        <Lenke href="/vilkar">vilkårene</Lenke>.
      </p>
    </div>
  );
}

/** Utløpt invitasjon — 1:1 med gamle ExpiredCard. */
function ExpiredKort({ email }: { email: string }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        textAlign: "center",
        borderRadius: T.rCard,
        background: "rgba(232,180,60,0.10)",
        border: `1px solid rgba(232,180,60,0.30)`,
        padding: 26,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Icon name="triangle-alert" size={30} style={{ color: T.warn, marginBottom: 6 }} />
      <h2 style={{ fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg, margin: 0 }}>
        Invitasjonen er utløpt
      </h2>
      <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "6px 0 0" }}>
        Lenken er ikke lenger gyldig. Be spilleren sende deg en ny invitasjon til{" "}
        <strong style={{ color: T.fg, fontWeight: 600 }}>{email}</strong>.
      </p>
    </div>
  );
}

/** Samtykke allerede gitt — 1:1 med gamle SuccessCard. */
function SuccessKort({ playerName }: { playerName: string }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        textAlign: "center",
        borderRadius: T.rCard,
        background: "rgba(79,208,138,0.10)",
        border: `1px solid rgba(79,208,138,0.30)`,
        padding: 26,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Icon name="check" size={30} style={{ color: T.up, marginBottom: 6 }} />
      <h2 style={{ fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg, margin: 0 }}>
        Samtykke allerede gitt
      </h2>
      <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "6px 0 0" }}>
        Du har allerede bekreftet samtykke for{" "}
        <strong style={{ color: T.fg, fontWeight: 600 }}>{playerName}</strong>.
      </p>
      <div style={{ width: "100%", marginTop: 14 }}>
        <Link
          href="/forelder"
          className="v2-press v2-focus"
          style={{
            appearance: "none",
            textDecoration: "none",
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
            background: T.lime,
            color: T.onLime,
          }}
        >
          Gå til foreldreportal
        </Link>
      </div>
    </div>
  );
}

/* ── Samtykke-kortet ───────────────────────────────────────────────── */

function ConsentKort({
  token,
  playerName,
  playerEmail,
  guardianEmail,
  playerAge,
}: {
  token: string;
  playerName: string;
  playerEmail: string;
  guardianEmail: string;
  playerAge: number | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [navn, setNavn] = useState("");
  const [databehandling, setDatabehandling] = useState(false);
  const [vilkar, setVilkar] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const kanSende = navn.trim().length > 0 && databehandling && vilkar;

  // Klient-validering + innsending 1:1 med ekte GuardianConsentForm.
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
    startTransition(async () => {
      const result = await confirmGuardianConsent({ token, guardianName: navn.trim() });
      if (!result.ok) {
        setFeil(result.error ?? "Noe gikk galt. Prøv igjen.");
        return;
      }
      router.push("/auth/login?guardian_consent_given=1");
    });
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
        {feil ? <Feilboks>{feil}</Feilboks> : null}

        <Knapp
          type="submit"
          disabled={!kanSende || isPending}
          icon={
            <Icon
              name="check"
              size={16}
              style={{ color: kanSende && !isPending ? T.onLime : T.mut }}
            />
          }
        >
          {isPending ? "Lagrer samtykke…" : "Bekreft samtykke"}
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

export function GuardianConsentV2(props: GuardianConsentV2Props) {
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          padding: "48px 22px",
          background: `radial-gradient(700px 420px at 60% -12%, rgba(0,88,64,0.14), transparent 62%), ${T.bg}`,
        }}
      >
        <Hode playerName={props.playerName} playerAge={props.playerAge} />
        {props.state === "expired" ? (
          <ExpiredKort email={props.email} />
        ) : props.state === "success" ? (
          <SuccessKort playerName={props.playerName} />
        ) : (
          <ConsentKort
            token={props.token}
            playerName={props.playerName}
            playerEmail={props.playerEmail}
            guardianEmail={props.guardianEmail}
            playerAge={props.playerAge}
          />
        )}
        <InfoSeksjon />
      </div>
    </div>
  );
}
