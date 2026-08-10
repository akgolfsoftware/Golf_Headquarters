"use client";
import { T } from "@/lib/v2/tokens";

/**
 * S-14: GDPR-cookie-banner.
 *
 * Vises ved første besøk. Bruker velger:
 * - "Godta alle" → analytics-cookies + nødvendige cookies
 * - "Kun nødvendige" → kun funksjonelle cookies
 *
 * Samtykke lagres i localStorage (nøkkel: "ak_cookie_consent")
 * og som cookie (nøkkel: "ak_cookie_consent") med 365-dagers levetid.
 *
 * Etter accept fires CustomEvent "ak:cookie-consent" slik at
 * AnalyticsLoader kan laste inn Plausible.
 *
 * Plassbehov (10.08.2026): banneret er festet i bunnen og lå tidligere OPPÅ
 * sticky handlingsdokker og bunn-nav på mobil — dokken så klikkbar ut, men
 * pekerhendelsene traff banner-kortet. Banneret måler derfor sin egen høyde og
 * publiserer den som `--ak-cookie-h` på <html>; bunn-forankret chrome legger
 * variabelen til sin egen bunn-padding og forskyver seg opp mens banneret vises.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie, X } from "lucide-react";

const CONSENT_KEY = "ak_cookie_consent";
const CONSENT_ALL = "all";
const CONSENT_NECESSARY = "necessary";
const CONSENT_TTL_DAYS = 365;
/** CSS-variabel bunn-forankret chrome leser for å forskyve seg opp. */
const HOYDE_VAR = "--ak-cookie-h";

function setCookieConsent(value: string) {
  const expires = new Date();
  expires.setDate(expires.getDate() + CONSENT_TTL_DAYS);
  // Sett som cookie (HttpOnly kan ikke settes fra JS — dette er client-side)
  document.cookie = `${CONSENT_KEY}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  localStorage.setItem(CONSENT_KEY, value);
  // Varsle andre komponenter (f.eks. AnalyticsLoader)
  window.dispatchEvent(new CustomEvent("ak:cookie-consent", { detail: { value } }));
}

function getStoredConsent(): string | null {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const ytreRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  // GFGK Junior-micrositen har egen merkevare — banneren skifter drakt der.
  // Klassen gfgk-jr gir tilgang til de scopede GFGK-variablene (tokens-fila
  // lastes av micrositens layout på de samme rutene).
  const gfgk = pathname?.startsWith("/gfgk-junior") ?? false;
  // Auth-flyten (login/signup/onboarding) er kort og fokusert — banneren
  // dekket «Fortsett med Google»-knappen og andre CTA-er nederst på skjermen.
  const skjulPaAuth = pathname?.startsWith("/auth") ?? false;
  const farger = gfgk
    ? {
        kortBg: "var(--gfgk-white)",
        kortBorder: "var(--hairline)",
        tittel: "var(--ink)",
        tittelFont: "var(--font-jr-sans)",
        tekst: "var(--fg-2)",
        ikon: "var(--gold-700)",
        lenke: "var(--teal-600)",
        knappBg: "var(--gfgk-ink)",
        knappFg: "var(--gfgk-white)",
        knapp2Fg: "var(--fg-2)",
        knapp2Border: "var(--n-200)",
      }
    : {
        kortBg: "hsl(var(--card))",
        kortBorder: "hsl(var(--border))",
        tittel: "hsl(var(--foreground))",
        tittelFont: "var(--font-familjen-grotesk)",
        tekst: "hsl(var(--muted-foreground))",
        ikon: "hsl(var(--primary))",
        lenke: "hsl(var(--primary))",
        knappBg: "hsl(var(--primary))",
        // MÅ være --primary-foreground, ikke --accent: i mørkt tema er --primary og
        // --accent samme lime (se .claude/rules/gotchas.md «primary=accent»), så
        // accent-på-primary ga 1:1 kontrast — knappen var usynlig. Lys: hvit på grønn.
        // Mørk: nær-svart på lime.
        knappFg: "hsl(var(--primary-foreground))",
        knapp2Fg: "hsl(var(--muted-foreground))",
        knapp2Border: "hsl(var(--border))",
      };

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      // Liten forsinkelse for å unngå flash på første render
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  // Publiser bannerets faktiske høyde som --ak-cookie-h så lenge det vises.
  // ResizeObserver fordi høyden endrer seg med tekstbryting (390px vs 1280px)
  // og med knappene som wrapper på smale skjermer.
  useEffect(() => {
    const el = ytreRef.current;
    const rot = document.documentElement;
    if (!visible || skjulPaAuth || !el) {
      rot.style.setProperty(HOYDE_VAR, "0px");
      return;
    }
    const oppdater = () => {
      rot.style.setProperty(HOYDE_VAR, `${Math.ceil(el.getBoundingClientRect().height)}px`);
    };
    oppdater();
    const ro = new ResizeObserver(oppdater);
    ro.observe(el);
    return () => {
      ro.disconnect();
      rot.style.setProperty(HOYDE_VAR, "0px");
    };
  }, [visible, skjulPaAuth]);

  if (!visible || skjulPaAuth) return null;

  function onGodta() {
    setCookieConsent(CONSENT_ALL);
    setVisible(false);
  }

  function onNodvendig() {
    setCookieConsent(CONSENT_NECESSARY);
    setVisible(false);
  }

  return (
    <div
      ref={ytreRef}
      role="dialog"
      aria-modal="false"
      aria-label="Cookie-samtykke"
      className={gfgk ? "gfgk-jr" : undefined}
      style={{
        background: "transparent",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "16px",
        paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          background: farger.kortBg,
          border: `1px solid ${farger.kortBorder}`,
          borderRadius: "16px 16px 0 0",
          padding: "20px 24px",
          boxShadow: `0 -4px 24px ${T.farge.svartA10}`,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          pointerEvents: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Cookie size={18} style={{ color: farger.ikon }} strokeWidth={1.75} />
            <span
              style={{
                fontFamily: farger.tittelFont,
                fontSize: 15,
                fontWeight: 700,
                color: farger.tittel,
                letterSpacing: "-0.01em",
              }}
            >
              Vi bruker informasjonskapsler
            </span>
          </div>
          <button
            type="button"
            onClick={onNodvendig}
            aria-label="Lukk og godta kun nødvendige"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              width: 44,
              height: 44,
              color: farger.tekst,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: -8,
            }}
          >
            <X size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        {/* Beskrivelse */}
        <p
          style={{
            fontSize: 13,
            color: farger.tekst,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Vi bruker nødvendige informasjonskapsler for at plattformen skal fungere,
          og analyse-cookies (Plausible) for å forstå hvordan sidene brukes — ingen
          personopplysninger deles med tredjeparter.{" "}
          <Link
            href="/cookies"
            style={{ color: farger.lenke, textDecoration: "underline" }}
          >
            Les mer
          </Link>
          .
        </p>

        {/* Knapper */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onGodta}
            style={{
              flex: 1,
              minWidth: 140,
              height: 44,
              borderRadius: 999,
              background: farger.knappBg,
              color: farger.knappFg,
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: farger.tittelFont,
            }}
          >
            Godta alle
          </button>
          <button
            type="button"
            onClick={onNodvendig}
            style={{
              flex: 1,
              minWidth: 140,
              height: 44,
              borderRadius: 999,
              background: "transparent",
              color: farger.knapp2Fg,
              border: `1px solid ${farger.knapp2Border}`,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Kun nødvendige
          </button>
        </div>
      </div>
    </div>
  );
}

/** Eksponert for bruk i tester og andre komponenter */
export { CONSENT_KEY, CONSENT_ALL, CONSENT_NECESSARY, getStoredConsent };
