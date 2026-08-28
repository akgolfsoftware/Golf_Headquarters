/**
 * Logget ut — v2 (retning C «Presis», mørk-først). Rekomponert fra den ekte
 * skjermen src/app/auth/logget-ut/page.tsx (→ <LoggetUtSkjerm>) inn i auth-
 * ramme-idiomet fra LoginV2 (AuthRamme/BrandPanel/Knapp/Lenke — mørk split-
 * layout, IKKE V2Shell). Montert offentlig i (v2preview)/v2-logget-ut/page.tsx.
 *
 * Den ekte skjermen er REN PRESENTASJON: en «logget ut»-bekreftelse med
 * props-drevne lenker (hjem, logg inn på nytt, marketing, feedback-e-post).
 * Ingen Prisma/DB/Supabase/auth-kall finnes å bevare — logikken bevares ved at
 * de samme lenkemålene og den samme copyen beholdes eksakt. Selve utloggingen
 * skjer i den ekte auth-flyten før denne bekreftelsen vises.
 *
 * Dette er en VISUELL v2-variant for godkjenning. Kun v2-primitiver fra
 * "@/components/v2" (LogoAK, Caps, Icon) + T.* tokens. Ingen rå hex (kun T.* +
 * rgba). Lucide via Icon, ingen emoji. Norsk æøå. Fluid motpart til mockupens
 * device-frame: full viewport, md-breakpoint for split/stablet, ekte dark-scope.
 */

import type { ReactNode, CSSProperties } from "react";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { T } from "@/lib/v2/tokens";
import { LogoAK, Caps, Icon } from "@/components/v2";

export type LoggetUtV2Props = {
  /** Lenke bak logoen — vanligvis marketing-forsiden. */
  hjemHref?: string;
  /** Lenke til ny innlogging (primær-CTA). */
  loggInnHref?: string;
  /** Lenke «Tilbake til akgolf.no» (sekundær/ghost-CTA). */
  marketingHref?: string;
  /** E-postadresse for feedback-lenken i footer. */
  feedbackEpost?: string;
};

/* ── Lokale auth-byggeklosser (1:1 med LoginV2-idiomet) ────────────── */

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
      ? { background: TL.fill, color: TL.onFill, border: "none" }
      : { background: TL.dim, color: TL.text, border: `1px solid ${TL.hair}` };
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
        fontFamily: TL.font.sans,
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

/** Ekte e-post-lenke i Lenke-idiomet (feedback-footer). */
function Lenke({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      style={{
        fontFamily: TL.font.sans,
        fontWeight: 600,
        color: TL.mute,
        cursor: "pointer",
        textDecoration: "underline",
        textDecorationColor: TL.hair,
        textUnderlineOffset: 3,
      }}
    >
      {children}
    </a>
  );
}

/** Venstre brand-panel (Neon/Cosmos-idiomet). Skjult under md (stablet mobil). */
function BrandPanel() {
  return (
    <div
 data-paper-slug="auth-logget-ut"       className="hidden lg:flex"
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
        <LogoAK size={30} surface="paper" />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ position: "relative" }}>
        <LogoAK size={64} surface="paper" style={{ marginBottom: 22 }} />
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
          Trygt logget ut.{" "}
          <em style={{ fontStyle: "italic", color: TL.fill }}>Vi ses snart.</em>
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
          Planen, treningen og analysen din venter når du logger inn igjen.
        </p>
      </div>
    </div>
  );
}

/* ── Bekreftelses-kortet ───────────────────────────────────────────── */

function LoggetUtKort({
  hjemHref,
  loggInnHref,
  marketingHref,
  feedbackEpost,
}: Required<LoggetUtV2Props>) {
  return (
    <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Mobil-logo (BrandPanel er skjult under md) */}
      <Link
        href={hjemHref}
        aria-label="AK Golf — hjem"
        className="md:hidden v2-focus"
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "6px 0 2px",
        }}
      >
        <LogoAK size={46} surface="paper" />
      </Link>

      <div
        style={{
          background: TL.elev,
          border: `1px solid ${TL.hair}`,
          borderRadius: TL.radius.card,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 0,
          boxShadow: `inset 0 1px 0 ${T.farge.hvitA5}, 0 12px 32px ${TL.scrim}`,
        }}
      >
        {/* Sjekk-merke i lime-tintet sirkel */}
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: TL.radius.pill,
            display: "grid",
            placeItems: "center",
            background: "color-mix(in srgb, var(--tl-fill) 10%, transparent)",
            border: `1px solid ${TL.hair}`,
            marginBottom: 22,
          }}
        >
          <Icon name="check-circle" size={38} strokeWidth={1.5} style={{ color: TL.fill }} />
        </div>

        <Caps size={9} color={TL.fill} style={{ marginBottom: 14 }}>
          AK GOLF · TAKK FOR DENNE GANG
        </Caps>

        <h1
          style={{
            fontFamily: TL.font.sans,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "-0.03em",
            color: TL.text,
            margin: 0,
            lineHeight: 1.08,
          }}
        >
          Vi <em style={{ fontStyle: "italic", color: TL.fill }}>ses</em> snart
        </h1>
        <p
          style={{
            fontFamily: TL.font.sans,
            fontSize: 13.5,
            color: TL.mute,
            lineHeight: 1.55,
            margin: "12px 0 24px",
            maxWidth: 300,
          }}
        >
          Din sesjon er avsluttet. Logg inn igjen når du er klar.
        </p>

        {/* CTA-er */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <Knapp
            href={loggInnHref}
            variant="primary"
            icon={<Icon name="arrow-right" size={16} style={{ color: TL.onFill }} />}
          >
            Logg inn på nytt
          </Knapp>
          <Knapp href={marketingHref} variant="ghost">
            Tilbake til akgolf.no
          </Knapp>
        </div>

        {/* Feedback-footer */}
        <div
          style={{
            width: "100%",
            marginTop: 24,
            paddingTop: 20,
            borderTop: `1px solid ${TL.hair}`,
          }}
        >
          <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, margin: 0, lineHeight: 1.5 }}>
            Hadde du en god økt? Del feedback med oss på{" "}
            <Lenke href={`mailto:${feedbackEpost}`}>{feedbackEpost}</Lenke>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Offentlig logget-ut-flate (dark-scope, fluid AuthRamme) ───────── */

export function LoggetUtV2({
  hjemHref = "/",
  loggInnHref = "/auth/login",
  marketingHref = "/",
  feedbackEpost = "post@akgolf.no",
}: LoggetUtV2Props = {}) {
  return (
    <div
      data-paper-logget-ut
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
        <LoggetUtKort
          hjemHref={hjemHref}
          loggInnHref={loggInnHref}
          marketingHref={marketingHref}
          feedbackEpost={feedbackEpost}
        />
      </main>
    </div>
  );
}
