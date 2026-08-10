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
 *
 * Plassbehov (10.08.2026): banneret er festet i bunnen og lå tidligere OPPÅ
 * sticky handlingsdokker og bunn-nav på mobil — dokken så klikkbar ut, men
 * pekerhendelsene traff banner-kortet. Banneret måler derfor sin egen høyde og
 * publiserer den som `--ak-cookie-h` på <html>; bunn-forankret chrome legger
 * variabelen til sin egen bunn-padding og forskyver seg opp mens banneret vises.
 *
 * Drakt (10.08.2026): portet til Claude Paper. Flater/tekst/avstand er `--p-*`
 * (src/styles/paper-tokens.css), knappene følger `.btn`/`.btn.ink` i
 * `designsystem/paper/fase1/_foundation.css` — 13px/500, radius `--p-r`, blekk
 * som primær. Ikke clay: aksenten er reservert «Én ting nå»
 * (docs/port/monsterdokument-paper.md §2 + §7). GFGK-micrositen beholder sin
 * egen drakt.
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
  // Paper-drakt (--p-*, src/styles/paper-tokens.css). Primærknappen er BLEKK
  // (--p-cta), ikke clay: aksenten #d97757 har monopol på «Én ting nå»
  // (monsterdokument-paper.md §2 + §7). Blekk snur seg selv i mørkt tema, så
  // den gamle primary/accent-kollisjonen kan ikke gjenoppstå her.
  const farger = gfgk
    ? {
        kortBg: "var(--gfgk-white)",
        kortBorder: "var(--hairline)",
        tittel: "var(--ink)",
        tittelFont: "var(--font-jr-sans)",
        tekst: "var(--fg-2)",
        ikon: "var(--gold-700)",
        lenke: "var(--ink)",
        knappBg: "var(--gfgk-ink)",
        knappFg: "var(--gfgk-white)",
        knapp2Fg: "var(--ink)",
        knapp2Border: "var(--n-200)",
      }
    : {
        kortBg: "var(--p-surface)",
        kortBorder: "var(--p-border)",
        tittel: "var(--p-fg)",
        tittelFont: "var(--p-font-sans)",
        tekst: "var(--p-muted)",
        ikon: "var(--p-muted)",
        lenke: "var(--p-fg)",
        knappBg: "var(--p-cta)",
        knappFg: "var(--p-on-cta)",
        knapp2Fg: "var(--p-fg)",
        knapp2Border: "var(--p-border)",
      };
  // Brødtekst er Lora i Paper, men GFGK-micrositen har egen prosa-font.
  const brodFont = gfgk ? "var(--font-jr-sans)" : "var(--p-font-serif)";

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
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          // 560px: samme lesebredde som Paper sine bunn-ark. Arket ligger flush
          // mot bunnkanten (kun toppradius) — ikke et flytende kort med luft
          // rundt, som kolliderer visuelt med bunn-nav-en bak det.
          maxWidth: 560,
          width: "100%",
          background: farger.kortBg,
          border: `1px solid ${farger.kortBorder}`,
          borderBottom: "none",
          borderRadius: "var(--p-r-md) var(--p-r-md) 0 0",
          padding: "var(--p-s5) var(--p-s5) calc(var(--p-s5) + env(safe-area-inset-bottom, 0px))",
          boxShadow: "var(--p-shadow)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--p-s3)",
          pointerEvents: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--p-s2)" }}>
            <Cookie size={18} style={{ color: farger.ikon }} strokeWidth={1.75} />
            <span
              style={{
                fontFamily: farger.tittelFont,
                fontSize: "var(--p-text-panel)",
                fontWeight: 600,
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
              // --p-tap: Paper sin gulvregel for alt interaktivt.
              width: "var(--p-tap)",
              height: "var(--p-tap)",
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
            // Lora 14px/1.62, maks 52ch — Paper sin prosa-anatomi.
            fontFamily: brodFont,
            fontSize: "var(--p-text-body-player)",
            color: farger.tekst,
            lineHeight: 1.62,
            maxWidth: "52ch",
            margin: 0,
          }}
        >
          Vi bruker nødvendige informasjonskapsler for at plattformen skal fungere,
          og analyse-cookies (Plausible) for å forstå hvordan sidene brukes — ingen
          personopplysninger deles med tredjeparter.{" "}
          <Link
            href="/cookies"
            style={{
              color: farger.lenke,
              textDecoration: "underline",
              textUnderlineOffset: "0.18em",
            }}
          >
            Les mer
          </Link>
          .
        </p>

        {/* Knapper — Paper `.btn` / `.btn.ink` (_foundation.css): 13px/500,
            min-høyde --p-tap, radius --p-r. Ingen pill, ingen fet skrift, og
            ingen clay: dette er ikke «Én ting nå». */}
        <div style={{ display: "flex", gap: "var(--p-s2)", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onGodta}
            style={{
              flex: 1,
              minWidth: 140,
              minHeight: "var(--p-tap)",
              padding: "0 var(--p-s4)",
              borderRadius: "var(--p-r)",
              background: farger.knappBg,
              color: farger.knappFg,
              border: `1px solid ${farger.knappBg}`,
              fontFamily: farger.tittelFont,
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1,
              cursor: "pointer",
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
              minHeight: "var(--p-tap)",
              padding: "0 var(--p-s4)",
              borderRadius: "var(--p-r)",
              background: "transparent",
              color: farger.knapp2Fg,
              border: `1px solid ${farger.knapp2Border}`,
              fontFamily: farger.tittelFont,
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1,
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
