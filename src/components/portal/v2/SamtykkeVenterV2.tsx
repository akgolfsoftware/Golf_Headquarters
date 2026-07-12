"use client";

/**
 * Samtykke-venter — v2 (retning C «Presis», mørk-først). Komponert i samme
 * auth-idiom som LoginV2 (AuthRamme/BrandPanel/Felt/Knapp/Lenke — mørk
 * split-layout, IKKE V2Shell). Montert offentlig i
 * (v2preview)/v2-samtykke-venter/page.tsx (ingen auth-guard, ingen dataloader).
 *
 * Dette er en VISUELL v2-variant for godkjenning. Den EKTE venterom-logikken
 * bor i src/app/auth/samtykke-venter/samtykke-venter-klient.tsx og dupliseres
 * bevisst IKKE: resend-invitasjon (server action `resendGuardianInvitation`),
 * logg-ut (server action `logout`), useTransition-state og STATUS-utledningen er
 * GJENBRUKT 1:1 herfra — ingen Supabase-kall er kopiert. Kun presentasjonen er
 * rekomponert. GDPR-gaten (16 år, art. 8) og e-post-flyten er bevart presist.
 *
 * Kun v2-primitiver fra "@/components/v2" (LogoAK, Caps, Icon) + T.* fra
 * "@/lib/v2/tokens". Auth-idiomene (BrandPanel/Felt/Knapp/Lenke) er lokale her,
 * 1:1 med LoginV2 — meldt som gap for opprykk til src/components/v2/auth.tsx.
 * Ingen rå hex (kun T.* + rgba). Norsk æøå. Lucide via Icon, ingen emoji.
 * Fluid AuthRamme: full viewport, md-breakpoint for split/stablet, ekte dark-scope.
 */

import { useState, useTransition, type ReactNode, type CSSProperties } from "react";
import { T } from "@/lib/v2/tokens";
import { LogoAK, Caps, Icon } from "@/components/v2";
import { resendGuardianInvitation } from "@/app/auth/onboarding/actions";
import { logout } from "@/lib/auth/logout";

type Props = {
  spillerNavn: string;
  invitasjonEmail: string | null;
};

/* ── Lokale auth-byggeklosser (1:1 med LoginV2) ────────────────────── */

/** Redigerbart felt i Felt-idiomet (ekte input med ledende ikon). */
function Felt({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  leading,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  leading?: ReactNode;
}) {
  const id = `v2samtykke-${label.toLowerCase().replace(/[^a-z]/g, "")}`;
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
        {leading}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
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
      </div>
    </div>
  );
}

/** primary=lime CTA · ghost=panel (1:1 med LoginV2). */
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
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        cursor: disabled ? "not-allowed" : "pointer",
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
          Nesten i mål.{" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>Ett samtykke igjen.</em>
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
          En forelder godkjenner kontoen din, så er hele golfutviklingen klar.
        </p>
      </div>
    </div>
  );
}

/* ── Venterom-kortet ───────────────────────────────────────────────── */

function VenterKort({ spillerNavn, invitasjonEmail }: Props) {
  const [isPending, startTransition] = useTransition();
  const [nyEmail, setNyEmail] = useState(invitasjonEmail ?? "");
  const [status, setStatus] = useState<{ ok: boolean; melding: string } | null>(null);

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!nyEmail.trim()) return;
    startTransition(async () => {
      setStatus(null);
      const result = await resendGuardianInvitation({ guardianEmail: nyEmail.trim() });
      if (result.ok) {
        setStatus({ ok: true, melding: "Invitasjon sendt. Be forelderen sjekke innboksen." });
      } else {
        setStatus({ ok: false, melding: result.error ?? "Noe gikk galt. Prøv igjen." });
      }
    });
  }

  // STATUS-kortets rader — avledet av eksisterende props/state (uendret logikk).
  const epostSendt = Boolean(invitasjonEmail) || Boolean(status?.ok);
  const statusRader: { label: string; done: boolean }[] = [
    { label: "Konto opprettet", done: true },
    { label: "E-post til forelder sendt", done: epostSendt },
    { label: "Foreldre-samtykke", done: false },
  ];

  return (
    <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Mobil-logo (BrandPanel er skjult under md) */}
      <div
        className="md:hidden"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "6px 0 6px" }}
      >
        <LogoAK size={46} />
      </div>

      {/* Hode: klokke-badge + chip + tittel */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, marginBottom: 2 }}>
        <span
          aria-hidden
          style={{
            display: "grid",
            placeItems: "center",
            width: 60,
            height: 60,
            borderRadius: 16,
            background: `radial-gradient(120% 120% at 30% 20%, rgba(0,88,64,0.55), rgba(21,23,21,0) 70%), ${T.panel3}`,
            border: `1px solid ${T.borderS}`,
            color: T.lime,
          }}
        >
          <Icon name="clock" size={28} />
        </span>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 9999,
            padding: "4px 11px",
            background: "rgba(232,180,60,0.14)",
            fontFamily: T.mono,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: T.warn,
          }}
        >
          <Icon name="clock" size={11} />
          Venter på samtykke
        </span>

        <h1
          style={{
            fontFamily: T.disp,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            color: T.fg,
            margin: 0,
            textWrap: "balance",
          }}
        >
          Nesten <em style={{ fontStyle: "italic", fontWeight: 400, color: T.lime }}>i mål.</em>
        </h1>
        <p style={{ fontFamily: T.ui, fontSize: 13.5, lineHeight: 1.55, color: T.fg2, margin: 0 }}>
          Hei {spillerNavn || "der"}! Du er under 16 år, så en forelder må godkjenne kontoen din.
          {epostSendt ? " Vi har sendt en e-post til forelderen du oppga." : ""}
        </p>
      </div>

      {/* STATUS-kort — tre rader med check/klokke */}
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: T.rCard,
          padding: 18,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.045), 0 12px 32px rgba(0,0,0,0.35)",
        }}
      >
        <Caps size={9}>Status</Caps>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column" }}>
          {statusRader.map((rad) => (
            <div key={rad.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}>
              <span
                aria-hidden
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 22,
                  height: 22,
                  flex: "none",
                  borderRadius: 9999,
                  background: rad.done ? T.lime : T.panel3,
                  border: rad.done ? "none" : `1px solid ${T.borderS}`,
                  color: rad.done ? T.onLime : T.mut,
                }}
              >
                <Icon name={rad.done ? "check" : "clock"} size={13} />
              </span>
              <span
                style={{
                  fontFamily: T.ui,
                  fontSize: 13,
                  fontWeight: 500,
                  color: rad.done ? T.fg : T.mut,
                }}
              >
                {rad.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Resend / legg til forelder — eksisterende logikk, v2-felt + CTA */}
      <form onSubmit={onSend} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Felt
          label={invitasjonEmail ? "Send til annen e-post" : "Legg til forelder"}
          type="email"
          value={nyEmail}
          onChange={setNyEmail}
          placeholder="forelder@example.com"
          autoComplete="email"
          required
          leading={<Icon name="mail" size={14} style={{ color: T.mut }} />}
        />
        <Knapp variant="primary" type="submit" disabled={isPending || !nyEmail.trim()}>
          {isPending ? "Sender…" : invitasjonEmail ? "Send påminnelse" : "Send invitasjon"}
        </Knapp>

        {status && (
          <p
            role="status"
            style={{
              fontFamily: T.mono,
              fontSize: 12,
              letterSpacing: "0.04em",
              margin: 0,
              color: status.ok ? T.up : T.down,
            }}
          >
            {status.melding}
          </p>
        )}
      </form>

      {/* Hjelpetekst */}
      <p style={{ fontFamily: T.ui, fontSize: 12, textAlign: "center", color: T.mut, margin: "4px 0 0" }}>
        Har du spørsmål?{" "}
        <a
          href="mailto:post@akgolf.no"
          style={{ color: T.lime, textDecoration: "none", fontWeight: 600 }}
        >
          post@akgolf.no
        </a>
      </p>

      {/* Logg ut — server action (dempet mono-caps lenke) */}
      <div style={{ textAlign: "center", marginTop: 2 }}>
        <form action={logout}>
          <button
            type="submit"
            className="v2-focus"
            style={{
              appearance: "none",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: T.mono,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: T.mut,
            }}
          >
            Logg ut
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Offentlig venterom-flate (dark-scope, fluid AuthRamme) ────────── */

export function SamtykkeVenterV2({ spillerNavn, invitasjonEmail }: Props) {
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
        <VenterKort spillerNavn={spillerNavn} invitasjonEmail={invitasjonEmail} />
      </div>
    </div>
  );
}
