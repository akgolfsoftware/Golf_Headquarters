/**
 * Sjekk e-post — v2 (retning C «Presis», mørk-først). Rekomponert fra den ekte
 * skjermen src/app/auth/check-email/page.tsx inn i auth-ramme-idiomet fra
 * LoginV2 (AuthRamme/BrandPanel/Knapp/Lenke — mørk split-layout, IKKE V2Shell).
 * Montert offentlig i (v2preview)/v2-check-email/page.tsx.
 *
 * Den ekte skjermen er REN PRESENTASJON: statisk venteskjerm etter registrering,
 * ingen form-logikk, ingen Prisma/DB/Supabase-kall. Logikken bevares ved at de
 * samme lenkemålene (/auth/signup, /auth/login) og den samme copyen beholdes
 * eksakt.
 *
 * Dette er en VISUELL v2-variant for godkjenning. Kun v2-primitiver fra
 * "@/components/v2" (LogoAK, Caps, Icon) + T.* tokens. Ingen rå hex (kun T.* +
 * rgba). Lucide via Icon, ingen emoji. Norsk æøå. Fluid motpart til mockupens
 * device-frame: full viewport, md-breakpoint for split/stablet, ekte dark-scope.
 */

import type { ReactNode, CSSProperties } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { LogoAK, Caps, Icon } from "@/components/v2";

/* ── Lokale auth-byggeklosser (1:1 med LoggetUtV2-idiomet) ─────────── */

/** primary=lime CTA · ghost=panel. Rendres som Next Link for reell navigasjon. */
function Knapp({
  href,
  children,
  icon,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "ghost";
}) {
  const v: CSSProperties =
    variant === "primary"
      ? { background: T.lime, color: T.onLime, border: "none" }
      : { background: T.panel3, color: T.fg, border: `1px solid ${T.borderS}` };
  return (
    <Link
      href={href}
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
        ...v,
      }}
    >
      {children}
      {icon}
    </Link>
  );
}

/** Ekte lenke i Lenke-idiomet (Next Link til reell rute). */
function Lenke({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: T.ui,
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
          <em style={{ fontStyle: "italic", color: T.lime }}>Én klikk igjen.</em>
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
          Bekreft e-posten din, så venter plan, trening og analyse på deg.
        </p>
      </div>
    </div>
  );
}

/* ── Bekreftelses-kortet ───────────────────────────────────────────── */

function CheckEmailKort() {
  return (
    <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Mobil-logo (BrandPanel er skjult under md) */}
      <Link
        href="/"
        aria-label="AK Golf — hjem"
        className="md:hidden v2-focus"
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "6px 0 2px",
        }}
      >
        <LogoAK size={46} />
      </Link>

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
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.045), 0 12px 32px rgba(0,0,0,0.35)",
        }}
      >
        {/* Mail-check-merke i lime-tintet sirkel */}
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: T.rPill,
            display: "grid",
            placeItems: "center",
            background: "color-mix(in srgb, var(--v2-lime) 10%, transparent)",
            border: `1px solid ${T.borderS}`,
            marginBottom: 22,
          }}
        >
          <Icon name="mail-check" size={38} strokeWidth={1.5} style={{ color: T.lime }} />
        </div>

        <Caps size={9} color={T.lime} style={{ marginBottom: 14 }}>
          AK GOLF · BEKREFT E-POST
        </Caps>

        <h1
          style={{
            fontFamily: T.disp,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "-0.03em",
            color: T.fg,
            margin: 0,
            lineHeight: 1.08,
          }}
        >
          Sjekk <em style={{ fontStyle: "italic", color: T.lime }}>innboksen</em> din
        </h1>
        <p
          style={{
            fontFamily: T.ui,
            fontSize: 13.5,
            color: T.fg2,
            lineHeight: 1.55,
            margin: "12px 0 24px",
            maxWidth: 300,
          }}
        >
          Vi har sendt en bekreftelseslenke til e-posten du registrerte deg
          med. Klikk på lenken for å aktivere kontoen din.
        </p>

        {/* Info-boks — ikke fått e-posten */}
        <div
          style={{
            width: "100%",
            textAlign: "left",
            borderRadius: 12,
            background: T.panel2,
            border: `1px solid ${T.borderS}`,
            padding: "14px 16px",
            marginBottom: 20,
          }}
        >
          <Caps size={9} style={{ marginBottom: 6 }}>
            Ikke fått e-posten?
          </Caps>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: 0 }}>
            Sjekk søppelpost-mappen, eller{" "}
            <Lenke href="/auth/signup">registrer deg på nytt</Lenke>.
          </p>
        </div>

        {/* CTA */}
        <div style={{ width: "100%" }}>
          <Knapp href="/auth/login" variant="ghost">
            Tilbake til innlogging
          </Knapp>
        </div>
      </div>
    </div>
  );
}

/* ── Offentlig sjekk-e-post-flate (dark-scope, fluid AuthRamme) ────── */

export function CheckEmailV2() {
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
        <CheckEmailKort />
      </div>
    </div>
  );
}
