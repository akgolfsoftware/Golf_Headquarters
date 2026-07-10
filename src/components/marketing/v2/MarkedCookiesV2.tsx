"use client";

/* AK Golf HQ v2 — MARKEDSSIDE: Cookies (/cookies, retning C «Presis»).
   Rekomponering av den eksisterende /cookies-siden (mlegacy) med v2-ramme.
   JURIDISK TEKST: kopiert 100 % uendret fra src/app/(marketing)/(mlegacy)/
   cookies/page.tsx — kun v2-chrome (MRamme) og lesbar typografi rundt, ingen
   omskriving av juridisk innhold.

   Marketing-rammen (MNav/MFot/MRamme) er lokal i denne fila, samme mønster
   som MarkedForsideV2/MarkedPriserV2. */

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, LogoAK, Caps } from "@/components/v2";

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

function MCta({ children, small, href }: { children: ReactNode; small?: boolean; href: string }) {
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: T.ui,
    fontWeight: 600,
    fontSize: small ? 13 : 15,
    color: T.onLime,
    background: T.lime,
    border: "none",
    borderRadius: 9999,
    padding: small ? "9px 18px" : "14px 28px",
    whiteSpace: "nowrap",
    textDecoration: "none",
  };
  return (
    <Link href={href} style={style}>
      {children}
    </Link>
  );
}

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
        <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", color: T.fg }}>
          AK Golf
        </span>
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
        {mobile ? <Icon name="menu" size={20} style={{ color: T.fg }} /> : <MCta small href="/auth/signup">Kom i gang gratis</MCta>}
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

function JurH3({ children }: { children: ReactNode }) {
  return (
    <h3 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15.5, color: T.fg, letterSpacing: "-0.01em", margin: "18px 0 0" }}>{children}</h3>
  );
}

const A_STYLE = { color: T.lime, textDecoration: "underline" as const };

const SIST_OPPDATERT = "12. mai 2026";

/* ════════════════════════════════════════════════════════
   M-COOKIES (/cookies)
   ════════════════════════════════════════════════════════ */
export function MarkedCookiesV2() {
  const mobile = useMobile();

  return (
    <MRamme mobile={mobile} aktiv="cookies">
      <div style={{ padding: mobile ? "48px 22px" : "72px 64px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Caps size={11} color={T.lime}>
            Juridisk · AK Golf Group
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
            <em style={{ fontStyle: "italic", color: T.lime }}>Cookies</em> og sporing
          </h1>
          <p style={{ fontFamily: T.ui, fontSize: 14.5, color: T.fg2, lineHeight: 1.6, margin: "18px 0 0", maxWidth: 560 }}>
            Slik bruker vi cookies, og hvordan du styrer innstillingene dine.
          </p>
          <p style={{ fontFamily: T.mono, fontSize: 12, color: T.mut, marginTop: 16 }}>Sist oppdatert: {SIST_OPPDATERT}</p>

          <article style={{ marginTop: 8 }}>
            <JurSection title="Hva er cookies?">
              <JurP>
                Cookies er små tekstfiler som lagres i nettleseren din når du besøker AK Golf. De brukes til å huske preferanser, holde deg innlogget, og forstå hvordan nettstedet brukes.
              </JurP>
            </JurSection>

            <JurSection title="Kategorier vi bruker">
              <JurH3>1. Strengt nødvendige</JurH3>
              <JurP>Kreves for at tjenesten skal fungere: pålogging, sesjonshåndtering og sikkerhet. Disse kan ikke slås av.</JurP>

              <JurH3>2. Analyse</JurH3>
              <JurP>
                Vi bruker Plausible Analytics, en personvernvennlig løsning som ikke lagrer personopplysninger og ikke krever samtykke etter norske regler. Vi måler aggregert trafikk for å forbedre opplevelsen.
              </JurP>

              <JurH3>3. Markedsføring</JurH3>
              <JurP>Vi bruker ikke markedsføringscookies eller tredjeparts-piksler i dag. Skulle dette endre seg, ber vi om eksplisitt samtykke.</JurP>

              <JurH3>4. Preferanser</JurH3>
              <JurP>Brukes til å huske valg du har gjort: språk, tema (lyst/mørkt) og hvilke paneler du har åpne i PlayerHQ.</JurP>
            </JurSection>

            <JurSection title="Slik styrer du innstillingene">
              <JurP>
                Du kan blokkere eller slette cookies via nettleserens innstillinger. Vær oppmerksom på at strengt nødvendige cookies må være aktive for at innlogging skal fungere.
              </JurP>
            </JurSection>

            <JurSection title="Kontakt">
              <JurP>
                Spørsmål om cookies eller personvern kan rettes til <a href="mailto:personvern@akgolf.no" style={A_STYLE}>personvern@akgolf.no</a>.
              </JurP>
            </JurSection>
          </article>
        </div>
      </div>
    </MRamme>
  );
}
