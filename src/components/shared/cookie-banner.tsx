"use client";

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
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie, X } from "lucide-react";

const CONSENT_KEY = "ak_cookie_consent";
const CONSENT_ALL = "all";
const CONSENT_NECESSARY = "necessary";
const CONSENT_TTL_DAYS = 365;

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
  const pathname = usePathname();
  // GFGK Junior-micrositen har egen merkevare — banneren skifter drakt der.
  // Klassen gfgk-jr gir tilgang til de scopede GFGK-variablene (tokens-fila
  // lastes av micrositens layout på de samme rutene).
  const gfgk = pathname?.startsWith("/gfgk-junior") ?? false;
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
        knappFg: "hsl(var(--accent))",
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

  if (!visible) return null;

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
          boxShadow: "0 -4px 24px rgba(0,0,0,0.10)",
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
