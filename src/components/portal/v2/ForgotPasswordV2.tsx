"use client";

/**
 * Glemt passord — v2 (retning C «Presis», mørk-først). Komponert i samme
 * idiom-familie som LoginV2 (AuthRamme/BrandPanel/Felt/Knapp/Lenke) — mørk
 * split-layout, IKKE V2Shell. Montert på /auth/forgot-password (bytter ut
 * gamle ForgotForm 2026-07-10).
 *
 * Ekte reset-logikk (Supabase `auth.resetPasswordForEmail` +
 * `redirectTo /auth/reset-password`, feiloversettelse) er portert 1:1 fra
 * src/app/auth/forgot-password/forgot-form.tsx — samme auth-semantikk, ny
 * visuell innpakning. To-stegs-flyten (skjema → bekreftelse) er bevart
 * eksakt. Gammel forgot-form.tsx står urørt som fallback.
 *
 * Kun v2-primitiver fra "@/components/v2" (LogoAK, Caps, Icon). Auth-idiomene
 * (BrandPanel/Felt/Knapp/Lenke) er lokale her, 1:1 med LoginV2 — meldt som gap
 * for opprykk til src/components/v2/auth.tsx. Ingen rå hex (kun T.* + rgba).
 * Norsk æøå. Fluid: full viewport, md-breakpoint for split/stablet, ekte dark-scope.
 */

import { useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { LogoAK, Caps, Icon } from "@/components/v2";
import { createClient } from "@/lib/supabase/client";

/** Samme feiloversettelse som gamle forgot-form.tsx — én kilde til auth-tekst. */
function oversettResetFeil(msg: string): string {
  if (msg.includes("you can only request this after"))
    return "Vent et lite øyeblikk før du ber om en ny lenke.";
  if (msg.includes("Unable to validate email address"))
    return "Sjekk at e-postadressen er riktig skrevet.";
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
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  trailing?: ReactNode;
}) {
  const id = `v2forgot-${label.toLowerCase().replace(/[^a-z]/g, "")}`;
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
          required
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

/** Ekte lenke i Lenke-idiomet (Next Link til reell rute). */
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
          Tilbake på plass{" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>på et blunk.</em>
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
          Vi sender deg en lenke, så velger du nytt passord og fortsetter treningen.
        </p>
      </div>
    </div>
  );
}

/* ── Kortene (steg 1 = skjema, steg 2 = bekreftelse) ───────────────── */

function ForgotKort() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    setPending(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/reset-password`,
    });
    setPending(false);
    if (err) {
      setFeil(oversettResetFeil(err.message));
      return;
    }
    setSent(true);
  }

  const kortStil: CSSProperties = {
    background: T.panel,
    border: `1px solid ${T.border}`,
    borderRadius: T.rCard,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.045), 0 12px 32px rgba(0,0,0,0.35)",
  };

  return (
    <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Mobil-logo (BrandPanel er skjult under md) */}
      <div
        className="md:hidden"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "6px 0 6px" }}
      >
        <LogoAK size={46} />
      </div>

      {sent ? (
        <>
          <div style={{ ...kortStil, alignItems: "center", textAlign: "center", padding: "26px 22px" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: T.rPill,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(79,208,138,0.12)",
                border: `1px solid ${T.borderS}`,
              }}
            >
              <Icon name="check-circle" size={24} style={{ color: T.up }} />
            </div>
            <h1
              style={{
                fontFamily: T.disp,
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: "-0.03em",
                color: T.fg,
                margin: 0,
              }}
            >
              Sjekk e-posten
            </h1>
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
              Vi har sendt en lenke til{" "}
              <strong style={{ fontWeight: 600, color: T.fg }}>{email || "e-postadressen din"}</strong>.
              Lenken er gyldig i 30 minutter.
            </p>

            {/* Tips-boks */}
            <div
              style={{
                width: "100%",
                textAlign: "left",
                background: T.panel2,
                border: `1px solid ${T.border}`,
                borderRadius: T.rRow,
                padding: 14,
              }}
            >
              <Caps size={9} style={{ marginBottom: 6 }}>
                Ikke fått e-posten?
              </Caps>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.6, margin: 0 }}>
                Sjekk søppelpost-mappen. Fremdeles ingenting? Kontakt{" "}
                <a
                  href="mailto:anders@akgolf.no"
                  style={{ color: T.fg2, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}
                >
                  anders@akgolf.no
                </a>
              </p>
            </div>

            <Knapp variant="ghost" icon={<Icon name="mail" size={15} style={{ color: T.fg2 }} />} onClick={() => setSent(false)}>
              Send på nytt
            </Knapp>
          </div>

          <div style={{ textAlign: "center" }}>
            <Lenke href="/auth/login">Tilbake til innlogging</Lenke>
          </div>
        </>
      ) : (
        <>
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
              Glemt passordet?
            </h1>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "8px 0 0", lineHeight: 1.6 }}>
              Skriv inn e-postadressen din, så sender vi deg en lenke for å opprette nytt passord.
            </p>
          </div>

          <form onSubmit={send} style={kortStil}>
            <Felt
              label="E-post"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="oyvind@akgolf.no"
              autoComplete="email"
              trailing={<Icon name="mail" size={14} style={{ color: T.mut }} />}
            />
            {feil && (
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
                  {feil}
                </span>
              </div>
            )}
            <Knapp
              variant="primary"
              type="submit"
              disabled={pending}
              icon={<Icon name="send" size={15} style={{ color: T.onLime }} />}
            >
              {pending ? "Sender…" : "Send tilbakestillingslenke"}
            </Knapp>
          </form>

          <div style={{ textAlign: "center" }}>
            <Lenke href="/auth/login">Tilbake til innlogging</Lenke>
          </div>

          {/* Fot — synlig på mobil (1:1 med LoginV2s mobil-fot) */}
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
        </>
      )}
    </div>
  );
}

/* ── Offentlig glemt-passord-flate (dark-scope, fluid AuthRamme) ───── */

export function ForgotPasswordV2() {
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
        <ForgotKort />
      </div>
    </div>
  );
}
