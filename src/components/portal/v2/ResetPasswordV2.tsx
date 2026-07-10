"use client";

/**
 * Sett nytt passord — v2 (retning C «Presis», mørk-først). Komponert 1:1 med
 * LoginV2 sitt auth-idiom (AuthRamme/BrandPanel/Felt/Knapp/Lenke). Montert på
 * /auth/reset-password (bytter ut gamle ResetForm 2026-07-10) — brukeren
 * lander her via tilbakestillingslenken i e-posten.
 *
 * Ekte reset-logikk (Supabase auth.updateUser + redirect til /portal,
 * feiloversettelse) er portert 1:1 fra src/app/auth/reset-password/reset-form.tsx
 * — samme auth-semantikk, ny visuell innpakning. Klient-valideringen (min. 8
 * tegn + passordene like) er bevart EKSAKT. Gammel reset-form.tsx står urørt
 * som fallback.
 *
 * Kun v2-primitiver fra "@/components/v2" (LogoAK, Caps, Icon) + T-tokens.
 * Auth-idiomene (BrandPanel/Felt/Knapp/Lenke) er lokale her, 1:1 med LoginV2 —
 * meldt som gap for opprykk til src/components/v2/auth.tsx. Ingen rå hex
 * (kun T.* + rgba). Norsk æøå. Fluid: full viewport, md-breakpoint for split.
 */

import { useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T } from "@/lib/v2/tokens";
import { LogoAK, Caps, Icon } from "@/components/v2";
import { createClient } from "@/lib/supabase/client";

/** Samme feiloversettelse som gamle reset-form.tsx — én kilde til auth-tekst. */
function oversettPassordFeil(msg: string): string {
  if (msg.includes("should be different from the old password"))
    return "Velg et annet passord enn det du hadde fra før.";
  if (msg.includes("Auth session missing"))
    return "Lenken er brukt eller utløpt. Be om en ny tilbakestillingslenke fra «Glemt passordet?».";
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
  const id = `v2reset-${label.toLowerCase().replace(/[^a-z]/g, "")}`;
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

/** Øye-veksling for passordfelt (1:1 med LoginV2). */
function VisVeksling({
  vis,
  onToggle,
}: {
  vis: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={vis ? "Skjul passord" : "Vis passord"}
      aria-pressed={vis}
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
  );
}

/** primary=lime CTA. */
function Knapp({
  children,
  variant = "primary",
  type = "button",
  disabled,
  onClick,
}: {
  children: ReactNode;
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
      {children}
    </button>
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
          Nesten inne igjen.{" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>Velg et nytt passord.</em>
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
          Sett et sikkert passord, så tar vi deg rett tilbake til treningen.
        </p>
      </div>
    </div>
  );
}

/* ── Reset-kortet ──────────────────────────────────────────────────── */

function ResetKort() {
  const router = useRouter();
  const supabase = createClient();
  // Klient-validering bevart EKSAKT fra reset-form.tsx (lengde + likhet).
  const [passord, setPassord] = useState("");
  const [bekreft, setBekreft] = useState("");
  const [visPassord, setVisPassord] = useState(false);
  const [visBekreft, setVisBekreft] = useState(false);
  const [pending, setPending] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  async function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (passord.length < 8) {
      setFeil("Passordet må være minst 8 tegn.");
      return;
    }
    if (passord !== bekreft) {
      setFeil("Passordene er ikke like.");
      return;
    }
    setFeil(null);
    setPending(true);
    const { error: err } = await supabase.auth.updateUser({ password: passord });
    setPending(false);
    if (err) {
      setFeil(oversettPassordFeil(err.message));
      return;
    }
    router.push("/portal");
    router.refresh();
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
          Sett nytt passord
        </h1>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "8px 0 0" }}>
          Velg et passord på minst 8 tegn.
        </p>
      </div>

      <form
        onSubmit={lagre}
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
          label="Nytt passord"
          type={visPassord ? "text" : "password"}
          value={passord}
          onChange={setPassord}
          placeholder="Minst 8 tegn"
          autoComplete="new-password"
          mono
          trailing={<VisVeksling vis={visPassord} onToggle={() => setVisPassord((v) => !v)} />}
        />
        <Felt
          label="Bekreft passord"
          type={visBekreft ? "text" : "password"}
          value={bekreft}
          onChange={setBekreft}
          placeholder="Gjenta passordet"
          autoComplete="new-password"
          mono
          trailing={<VisVeksling vis={visBekreft} onToggle={() => setVisBekreft((v) => !v)} />}
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

        <Knapp variant="primary" type="submit" disabled={pending}>
          {pending ? "Lagrer…" : "Lagre nytt passord"}
        </Knapp>
      </form>

      <div style={{ textAlign: "center" }}>
        <Lenke href="/auth/login">Tilbake til innlogging</Lenke>
      </div>

      {/* Fot — synlig på mobil (1:1 med LoginV2 sin mobil-fot) */}
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

/* ── Offentlig reset-flate (dark-scope, fluid AuthRamme) ───────────── */

export function ResetPasswordV2() {
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
        <ResetKort />
      </div>
    </div>
  );
}
