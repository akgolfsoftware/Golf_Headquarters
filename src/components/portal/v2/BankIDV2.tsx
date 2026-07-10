/**
 * BankID · Auth — v2 (retning C «Presis», mørk-først). Rekomponert visuelt fra
 * den ekte skjermen src/app/auth/bankid/page.tsx → <BankIdSkjerm> (post-BETA-
 * placeholder). Montert offentlig i (v2preview)/v2-bankid/page.tsx (ingen
 * auth-guard, ingen dataloader — søsken-rutene har heller ingen).
 *
 * Dette er en VISUELL v2-variant for godkjenning. Den EKTE BankID-flyten
 * (verge-verifisering) kommer post-BETA og finnes IKKE i koden ennå — den ekte
 * skjermen er en ærlig placeholder som peker tilbake til vanlig login. Denne
 * varianten BEVARER nøyaktig samme funksjon: BankID-badge → tittel «Logg inn
 * med BankID.» → ærlig status-ingress → primær-CTA tilbake til /auth/login, med
 * hjem-lenke bak logoen. Ingen Supabase-/DB-kall dupliseres (det finnes ingen).
 *
 * Kun v2-primitiver fra "@/components/v2" (LogoAK, Caps, Icon). Auth-idiomene
 * (AuthRamme/BrandPanel/Knapp/Lenke) er lokale her, 1:1 med LoginV2 — meldt som
 * gap for opprykk til src/components/v2/auth.tsx sammen med LoginV2. Ingen rå
 * hex (kun T.* + rgba). Norsk æøå. BrandPanel skjules under md (sentrert kort
 * på mobil), som LoginV2.
 */

import type { ReactNode, CSSProperties } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { LogoAK, Caps, Icon } from "@/components/v2";

/* ── Lokale auth-byggeklosser (1:1 med LoginV2) ────────────────────── */

/** primary=lime CTA · ghost=panel. */
function Knapp({
  children,
  icon,
  variant = "primary",
}: {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "ghost";
}) {
  const v: CSSProperties =
    variant === "primary"
      ? { background: T.lime, color: T.onLime, border: "none" }
      : { background: T.panel3, color: T.fg, border: `1px solid ${T.borderS}` };
  return (
    <span
      className="v2-press v2-focus"
      style={{
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
      {icon}
    </span>
  );
}

/** Venstre brand-panel (Cosmos-idiomet). Skjult under md (stablet mobil). */
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
      <Link href="/" aria-label="AK Golf — hjem" style={{ position: "relative" }}>
        <LogoAK size={30} />
      </Link>
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
          Trygg innlogging for hele familien.{" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>Med BankID.</em>
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
          Verge-verifisering med BankID kommer på plass etter beta-perioden.
        </p>
      </div>
    </div>
  );
}

/* ── BankID-kortet ─────────────────────────────────────────────────── */

function BankIDKort() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Mobil-logo (BrandPanel er skjult under md) */}
      <div
        className="md:hidden"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          padding: "6px 0 6px",
        }}
      >
        <Link href="/" aria-label="AK Golf — hjem">
          <LogoAK size={46} />
        </Link>
      </div>

      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: T.rCard,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 0,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.045), 0 12px 32px rgba(0,0,0,0.35)",
        }}
      >
        {/* BankID-badge — mørkt kvadrat med ordmerke og fingeravtrykk-motiv */}
        <span
          aria-hidden
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            background: T.panel3,
            border: `1px solid ${T.borderS}`,
            marginBottom: 20,
          }}
        >
          <Icon name="fingerprint" size={30} style={{ color: T.lime }} />
        </span>

        <Caps size={9} style={{ color: T.mut }}>
          BANKID · KOMMER POST-BETA
        </Caps>

        <h1
          style={{
            fontFamily: T.disp,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: T.fg,
            margin: "12px 0 0",
          }}
        >
          Logg inn med{" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>BankID.</em>
        </h1>

        <p
          style={{
            fontFamily: T.ui,
            fontSize: 13.5,
            lineHeight: 1.6,
            color: T.fg2,
            margin: "12px 0 0",
          }}
        >
          BankID-pålogging kommer på plass etter beta-perioden. Bruk e-post,
          passord eller Google for nå.
        </p>

        <div style={{ width: "100%", marginTop: 24 }}>
          <Link href="/auth/login" style={{ textDecoration: "none" }}>
            <Knapp
              variant="primary"
              icon={<Icon name="arrow-right" size={16} style={{ color: T.onLime }} />}
            >
              Tilbake til vanlig login
            </Knapp>
          </Link>
        </div>
      </div>

      {/* Fot — synlig på mobil (1:1 med LoginV2) */}
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

/* ── Offentlig BankID-flate (dark-scope, fluid AuthRamme) ──────────── */

export function BankIDV2() {
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
        <BankIDKort />
      </div>
    </div>
  );
}
