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
import { TL } from "@/lib/v2/train-lock";
import { AK } from "@/lib/v2/ak-palett";

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
          background: TL.dock,
          border: `1px solid ${TL.hair}`,
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
            fontFamily: TL.font.sans,
            fontSize: 13.5,
            fontWeight: 500,
            color: TL.text,
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
      ? { background: TL.fill, color: TL.onFill, border: "none" }
      : { background: TL.dim, color: TL.text, border: `1px solid ${TL.hair}` };
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
        fontFamily: TL.font.sans,
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
        fontFamily: TL.font.sans,
        fontSize: 12,
        fontWeight: 600,
        color: TL.mute,
        cursor: "pointer",
        textDecoration: "underline",
        textDecorationColor: TL.hair,
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
 data-paper-slug="auth-forgot"       className="hidden lg:flex"
      style={{
        // Deler plassen proporsjonalt. Fast 520px ga skjemaet kun 204px
        // brukbar bredde på iPad stående (målt på prod 2026-08-15).
        flex: "1 1 0",
        maxWidth: 720,
        minWidth: 420,
        position: "relative",
        overflow: "hidden",
        borderRight: `1px solid ${TL.hair}`,
        background: `radial-gradient(560px 460px at 28% 24%, ${TL.dim}, transparent 68%), radial-gradient(420px 380px at 82% 88%, color-mix(in srgb, var(--tl-fill) 10%, transparent), transparent 60%), ${TL.scene}`,
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
        <circle cx="260" cy="330" r="3.5" fill="color-mix(in srgb, var(--tl-fill) 45%, transparent)" />
      </svg>
      <div style={{ position: "relative" }}>
        <LogoAK size={30} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ position: "relative" }}>
        <LogoAK size={64} style={{ marginBottom: 22 }} />
        <h2
          style={{
            fontFamily: TL.font.sans,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "-0.03em",
            lineHeight: 1.12,
            color: TL.text,
            margin: 0,
          }}
        >
          Tilbake på plass{" "}
          <em style={{ fontStyle: "italic", color: TL.fill }}>på et blunk.</em>
        </h2>
        <p
          style={{
            fontFamily: TL.font.sans,
            fontSize: 13.5,
            color: TL.mute,
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
    background: TL.elev,
    border: `1px solid ${TL.hair}`,
    borderRadius: TL.radius.card,
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
                borderRadius: TL.radius.pill,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: AK.farge.myntLysA12,
                border: `1px solid ${TL.hair}`,
              }}
            >
              <Icon name="check-circle" size={24} style={{ color: TL.ok }} />
            </div>
            <h1
              style={{
                fontFamily: TL.font.sans,
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: "-0.03em",
                color: TL.text,
                margin: 0,
              }}
            >
              Sjekk e-posten
            </h1>
            <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.6, margin: 0 }}>
              Vi har sendt en lenke til{" "}
              <strong style={{ fontWeight: 600, color: TL.text }}>{email || "e-postadressen din"}</strong>.
              Lenken er gyldig i 30 minutter.
            </p>

            {/* Tips-boks */}
            <div
              style={{
                width: "100%",
                textAlign: "left",
                background: TL.dock,
                border: `1px solid ${TL.hair}`,
                borderRadius: TL.radius.row,
                padding: 14,
              }}
            >
              <Caps size={9} style={{ marginBottom: 6 }}>
                Ikke fått e-posten?
              </Caps>
              <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.6, margin: 0 }}>
                Sjekk søppelpost-mappen. Fremdeles ingenting? Kontakt{" "}
                <a
                  href="mailto:anders@akgolf.no"
                  style={{ color: TL.mute, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}
                >
                  anders@akgolf.no
                </a>
              </p>
            </div>

            <Knapp variant="ghost" icon={<Icon name="mail" size={15} style={{ color: TL.mute }} />} onClick={() => setSent(false)}>
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
                fontFamily: TL.font.sans,
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: "-0.03em",
                color: TL.text,
                margin: 0,
              }}
            >
              Glemt passordet?
            </h1>
            <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, margin: "8px 0 0", lineHeight: 1.6 }}>
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
              trailing={<Icon name="mail" size={14} style={{ color: TL.mute }} />}
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
                  background: TL.dock,
                  border: `1px solid ${TL.hair}`,
                }}
              >
                <Icon name="triangle-alert" size={14} style={{ color: TL.danger, marginTop: 1, flex: "none" }} />
                <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 500, color: TL.danger }}>
                  {feil}
                </span>
              </div>
            )}
            <Knapp
              variant="primary"
              type="submit"
              disabled={pending}
              icon={<Icon name="send" size={15} style={{ color: TL.onFill }} />}
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
              fontFamily: TL.font.sans,
              fontSize: 10.5,
              color: TL.mute,
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
      style={{
        minHeight: "100vh",
        display: "flex",
        // Flaten er Paper LYS — "dark" fikk nettleseren til å tegne autofyll,
        // passordikon og rullefelt mørkt oppå en lys side.
        colorScheme: "light",
        color: TL.text,
        fontFamily: TL.font.sans,
        background: TL.scene,
      }}
    >
      <BrandPanel />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 22px",
          background: `radial-gradient(700px 420px at 60% -12%, ${TL.dim}, transparent 62%), ${TL.scene}`,
        }}
      >
        <ForgotKort />
      </main>
    </div>
  );
}
