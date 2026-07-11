"use client";

/* AK Golf HQ v2 — MARKEDSSIDE: Personvern (/personvern, retning C «Presis»).
   Rekomponering av den eksisterende /personvern-siden (mlegacy) med v2-ramme.
   JURIDISK TEKST: kopiert 100 % uendret fra src/app/(marketing)/(mlegacy)/
   personvern/page.tsx — kun v2-chrome (MRamme) og lesbar typografi rundt,
   ingen omskriving av juridisk innhold.

   Marketing-rammen (MNav/MFot/MRamme) er lokal i denne fila, samme mønster
   som MarkedForsideV2/MarkedPriserV2. */

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { MMobilMeny } from "./marked-ramme";
import { T } from "@/lib/v2/tokens";
import { LogoAK, Caps } from "@/components/v2";

function useMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return mobile;
}

const MNAV: { id: string; l: string; href: string }[] = [
  { id: "hjem", l: "Hjem", href: "/" },
  { id: "coaching", l: "Coaching", href: "/coaching" },
  { id: "playerhq", l: "PlayerHQ", href: "/playerhq" },
  { id: "priser", l: "Priser", href: "/priser" },
];

function MNav({ mobile, aktiv }: { mobile: boolean; aktiv: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: mobile ? "16px 22px" : "20px 64px",
        borderBottom: `1px solid ${T.border}`,
        position: "relative",
      }}
    >
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <LogoAK size={24} />
      </Link>
      {!mobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {MNAV.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              style={{
                fontFamily: T.ui,
                fontSize: 14,
                fontWeight: 600,
                color: aktiv === n.id ? T.fg : T.fg2,
                textDecoration: "none",
                borderBottom: aktiv === n.id ? `2px solid ${T.lime}` : "2px solid transparent",
                paddingBottom: 2,
              }}
            >
              {n.l}
            </Link>
          ))}
        </div>
      )}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        {!mobile && (
          <Link
            href="/auth/login"
            style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg2, textDecoration: "none" }}
          >
            Logg inn
          </Link>
        )}
        {mobile ? (
          <MMobilMeny aktiv={aktiv} />
        ) : (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: T.ui,
              fontWeight: 600,
              fontSize: 13,
              color: T.onLime,
              background: T.lime,
              borderRadius: 9999,
              padding: "9px 18px",
              whiteSpace: "nowrap",
            }}
          >
            <Link href="/auth/signup" style={{ color: "inherit", textDecoration: "none" }}>
              Kom i gang gratis
            </Link>
          </span>
        )}
      </span>
    </div>
  );
}

function MFot({ mobile }: { mobile: boolean }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${T.border}`,
        padding: mobile ? "32px 22px" : "40px 64px",
        display: "flex",
        flexDirection: mobile ? "column" : "row",
        alignItems: mobile ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 18,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
        <LogoAK size={18} color={T.mut} />
        <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>AK Golf Group AS · Fredrikstad</span>
      </span>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[
          { l: "Coaching", href: "/coaching" },
          { l: "PlayerHQ", href: "/playerhq" },
          { l: "Priser", href: "/priser" },
          { l: "Book tid", href: "/booking" },
          { l: "Personvern", href: "/personvern" },
        ].map((f) => (
          <Link key={f.l} href={f.href} style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, textDecoration: "none" }}>
            {f.l}
          </Link>
        ))}
      </div>
    </div>
  );
}

function MRamme({ mobile, aktiv, children }: { mobile: boolean; aktiv: string; children: ReactNode }) {
  return (
    <div
      className="dark"
      style={{
        minHeight: "100vh",
        colorScheme: "dark",
        color: T.fg,
        fontFamily: T.ui,
        background: `radial-gradient(1100px 520px at 30% -10%, rgba(0,88,64,0.20), transparent 62%), ${T.bg}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MNav mobile={mobile} aktiv={aktiv} />
      <div style={{ flex: 1 }}>{children}</div>
      <MFot mobile={mobile} />
    </div>
  );
}

/* ── Juridisk artikkel-typografi ─────────────────────────── */
function JurSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: 36 }}>
      <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg, letterSpacing: "-0.015em", margin: 0 }}>{title}</h2>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </section>
  );
}

function JurP({ children }: { children: ReactNode }) {
  return <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.7, margin: 0 }}>{children}</p>;
}

function JurUl({ children }: { children: ReactNode }) {
  return (
    <ul style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.7, margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
      {children}
    </ul>
  );
}

const A_STYLE = { color: T.lime, textDecoration: "underline" as const };

const SIST_OPPDATERT = "12. mai 2026";

/* ════════════════════════════════════════════════════════
   M-PERSONVERN (/personvern)
   ════════════════════════════════════════════════════════ */
export function MarkedPersonvernV2() {
  const mobile = useMobile();

  return (
    <MRamme mobile={mobile} aktiv="personvern">
      <div style={{ padding: mobile ? "48px 22px" : "72px 64px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Caps size={11} color={T.lime}>
            Juridisk
          </Caps>
          <h1
            style={{
              fontFamily: T.disp,
              fontWeight: 700,
              fontSize: mobile ? 32 : 44,
              letterSpacing: "-0.03em",
              color: T.fg,
              margin: "16px 0 0",
              lineHeight: 1.05,
            }}
          >
            <em style={{ fontStyle: "italic", color: T.lime }}>Personvern</em>-erklæring
          </h1>
          <p style={{ fontFamily: T.mono, fontSize: 12, color: T.mut, marginTop: 16 }}>Sist oppdatert: {SIST_OPPDATERT}</p>

          <div
            style={{
              marginTop: 24,
              borderRadius: 14,
              border: `1px solid rgba(232,180,60,0.35)`,
              background: "rgba(232,180,60,0.08)",
              padding: "14px 16px",
              fontFamily: T.ui,
              fontSize: 13,
              color: T.fg2,
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: T.fg, fontWeight: 700 }}>Utkast.</strong> Endelig versjon godkjennes med advokat før Q3 2026. Innholdet under beskriver hvordan vi behandler personopplysninger i dagens drift.
          </div>

          <article style={{ marginTop: 8 }}>
            <JurSection title="1. Behandlingsansvarlig">
              <JurP>
                AK Golf Group AS, org.nr. 927&nbsp;248&nbsp;581, Bossumveien 6, 1605 Fredrikstad, er behandlingsansvarlig for personopplysninger som registreres i AK Golf-tjenesten.
              </JurP>
              <JurP>
                Kontakt: <a href="mailto:personvern@akgolf.no" style={A_STYLE}>personvern@akgolf.no</a>
              </JurP>
            </JurSection>

            <JurSection title="2. Hva vi samler inn">
              <JurUl>
                <li><strong style={{ color: T.fg }}>Kontaktopplysninger:</strong> navn, e-post, telefon, hjemmeklubb.</li>
                <li><strong style={{ color: T.fg }}>Spillerprofil:</strong> handicap, alder, antall års spilling, ambisjon.</li>
                <li><strong style={{ color: T.fg }}>Trenings- og spilldata:</strong> runder, tester, drills, Trackman-import, AI-chat-historikk.</li>
                <li><strong style={{ color: T.fg }}>Helse-relatert data (frivillig):</strong> hvilepuls, søvn, kun hvis du selv registrerer.</li>
                <li><strong style={{ color: T.fg }}>Tekniske data:</strong> IP-adresse, nettleser, pålogging-tidspunkt, feillogger.</li>
                <li><strong style={{ color: T.fg }}>Betalingsdata:</strong> håndteres av Stripe. Vi lagrer kun ID og status, ikke kortinformasjon.</li>
              </JurUl>
            </JurSection>

            <JurSection title="3. Formål og rettslig grunnlag">
              <JurUl>
                <li><strong style={{ color: T.fg }}>Levere tjenesten</strong> (avtale, GDPR art. 6 nr. 1 b)</li>
                <li><strong style={{ color: T.fg }}>Booking, fakturering, kontakt</strong> (avtale)</li>
                <li><strong style={{ color: T.fg }}>Produktforbedring og analyse</strong> (berettiget interesse, art. 6 nr. 1 f): alltid med anonymisering når mulig</li>
                <li><strong style={{ color: T.fg }}>Markedsføring til eksisterende kunder</strong> (berettiget interesse, kan reservere deg fra i innstillinger)</li>
                <li><strong style={{ color: T.fg }}>Etterleve regnskaps- og bokføringsplikt</strong> (rettslig forpliktelse)</li>
              </JurUl>
            </JurSection>

            <JurSection title="4. Databehandlere vi bruker">
              <JurP>Vi deler nødvendige opplysninger med følgende underleverandører, alle med databehandleravtale (DPA) på plass:</JurP>
              <JurUl>
                <li><strong style={{ color: T.fg }}>Supabase</strong> (EU-region): database, autentisering, fillagring</li>
                <li><strong style={{ color: T.fg }}>Vercel</strong> (EU-region): hosting og deploy</li>
                <li><strong style={{ color: T.fg }}>Stripe</strong>: betalingsbehandling</li>
                <li><strong style={{ color: T.fg }}>Resend</strong>: utsendelse av transaksjons-e-post</li>
                <li><strong style={{ color: T.fg }}>Anthropic</strong>: AI-coach (Claude). Anthropic lagrer ikke prompts ut over kort retensjonsperiode for misbrukskontroll</li>
                <li><strong style={{ color: T.fg }}>Sentry</strong>: feilrapportering (PII filtrert ut)</li>
              </JurUl>
            </JurSection>

            <JurSection title="5. Lagringstid">
              <JurUl>
                <li><strong style={{ color: T.fg }}>Aktive konto-data:</strong> så lenge kontoen er aktiv</li>
                <li><strong style={{ color: T.fg }}>Inaktive kontoer:</strong> slettes etter 36 måneder uten innlogging</li>
                <li><strong style={{ color: T.fg }}>Regnskapsdata (fakturaer, betalinger):</strong> 5 år iht. bokføringsloven</li>
                <li><strong style={{ color: T.fg }}>Feillogger:</strong> 90 dager</li>
                <li><strong style={{ color: T.fg }}>AI-chat-historikk:</strong> kan slettes av deg når som helst, slettes uansett ved konto-sletting</li>
              </JurUl>
            </JurSection>

            <JurSection title="6. Dine rettigheter">
              <JurP>Du har rett til:</JurP>
              <JurUl>
                <li>Innsyn i hvilke opplysninger vi har om deg</li>
                <li>Retting av feil eller ufullstendige opplysninger</li>
                <li>Sletting («retten til å bli glemt»), gjelder ikke data vi er lovpålagt å beholde</li>
                <li>Begrensning av behandling</li>
                <li>Dataportabilitet: utlevering i maskinlesbart format</li>
                <li>Innsigelse mot behandling basert på berettiget interesse</li>
                <li>
                  Klage til Datatilsynet (
                  <a href="https://www.datatilsynet.no" style={A_STYLE} target="_blank" rel="noopener">
                    datatilsynet.no
                  </a>
                  )
                </li>
              </JurUl>
              <JurP>
                Send forespørsel til <a href="mailto:personvern@akgolf.no" style={A_STYLE}>personvern@akgolf.no</a>. Vi svarer innen 30 dager.
              </JurP>
            </JurSection>

            <JurSection title="7. Mindreårige">
              <JurP>
                For brukere under 16 år må forelder eller foresatt opprette og forvalte kontoen. Vi behandler ikke data om mindreårige uten gyldig samtykke fra foresatt.
              </JurP>
            </JurSection>

            <JurSection title="8. Cookies og analytics">
              <JurP>
                Vi bruker minimalt med cookies, kun det som er nødvendig for innlogging og sikkerhet. For analytics bruker vi <strong style={{ color: T.fg }}>Plausible</strong>, som er cookie-fri og GDPR-vennlig.
              </JurP>
              <JurP>Vi bruker ikke Google Analytics, Facebook Pixel eller tilsvarende tredjepart-tracking på marketing-sidene.</JurP>
            </JurSection>

            <JurSection title="9. Endringer">
              <JurP>
                Vi kan oppdatere denne erklæringen. Vesentlige endringer varsles på e-post til registrerte brukere. Datoen for siste oppdatering står øverst på siden.
              </JurP>
            </JurSection>
          </article>
        </div>
      </div>
    </MRamme>
  );
}
