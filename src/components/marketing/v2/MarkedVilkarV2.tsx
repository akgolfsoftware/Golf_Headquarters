"use client";

/* AK Golf HQ v2 — MARKEDSSIDE: Vilkår (/vilkar, retning C «Presis»).
   Rekomponering av den eksisterende /vilkar-siden (mlegacy) med v2-ramme.
   JURIDISK TEKST: kopiert 100 % uendret fra src/app/(marketing)/(mlegacy)/
   vilkar/page.tsx — kun v2-chrome (MRamme) og lesbar typografi rundt, ingen
   omskriving av juridisk innhold (inkl. «kr 300 per måned»-teksten i §3,
   som er juridisk fasit her selv om 299 kr er kanon andre steder i appen).

   Marketing-rammen (MNav/MFot/MRamme) er lokal i denne fila, samme mønster
   som MarkedForsideV2/MarkedPriserV2. */

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
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
        {mobile ? <MMobilMeny aktiv={aktiv} /> : <MCta small href="/auth/signup">Kom i gang gratis</MCta>}
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

const A_STYLE = { color: T.lime, textDecoration: "underline" as const };

const SIST_OPPDATERT = "12. mai 2026";

/* ════════════════════════════════════════════════════════
   M-VILKÅR (/vilkar)
   ════════════════════════════════════════════════════════ */
export function MarkedVilkarV2() {
  const mobile = useMobile();

  return (
    <MRamme mobile={mobile} aktiv="vilkar">
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
            <em style={{ fontStyle: "italic", color: T.lime }}>Bruker</em>vilkår
          </h1>
          <p style={{ fontFamily: T.ui, fontSize: 14.5, color: T.fg2, lineHeight: 1.6, margin: "18px 0 0", maxWidth: 560 }}>
            Vilkår for bruk av AK Golf-tjenestene: booking, portal og coaching.
          </p>
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
            <strong style={{ color: T.fg, fontWeight: 700 }}>Utkast.</strong> Endelig versjon godkjennes med advokat før Q3 2026. Disse vilkårene gjelder dagens drift, men kan endres ved formell publisering. Vesentlige endringer varsles til registrerte brukere på e-post minst 30 dager før de trer i kraft.
          </div>

          <article style={{ marginTop: 8 }}>
            <JurSection title="1. Tjenestebeskrivelse">
              <JurP>
                AK Golf («Tjenesten») er en SaaS-plattform for golfspillere og coacher levert av AK Golf Group AS, org.nr. 927&nbsp;248&nbsp;581, Bossumveien 6, 1605 Fredrikstad («vi», «oss», «AK Golf»).
              </JurP>
              <JurP>
                Tjenesten omfatter blant annet PlayerHQ (spillerportal), AgencyOS (coach-portal), AI-coach, treningsplaner, booking, og tilhørende data- og analyseverktøy.
              </JurP>
            </JurSection>

            <JurSection title="2. Konto og bruk">
              <JurP>
                For å bruke Tjenesten må du opprette en brukerkonto. Du er ansvarlig for at opplysningene du oppgir er riktige, og for å beskytte påloggingsinformasjonen din.
              </JurP>
              <JurP>
                Du må være minst 16 år for å opprette egen konto. For spillere under 16 år må en forelder eller foresatt opprette og forvalte kontoen.
              </JurP>
              <JurP>
                Det er ikke tillatt å dele konto, omgå tekniske begrensninger, eller bruke Tjenesten til å samle data om andre brukere uten samtykke.
              </JurP>
            </JurSection>

            <JurSection title="3. Abonnement og betaling">
              <JurP>
                Tjenesten tilbys som gratis-tier (begrenset) og Pro-tier (kr&nbsp;300 per måned, inkl. mva). Pro-abonnement faktureres månedlig via Stripe og fornyes automatisk inntil oppsigelse.
              </JurP>
              <JurP>
                Du kan si opp Pro-abonnementet når som helst via <em style={{ fontStyle: "italic", color: T.fg }}>Meg → Abonnement</em>. Oppsigelsen gjelder fra neste fornyelsesdato. Du beholder tilgang til Pro-funksjonene ut inneværende betalt periode.
              </JurP>
              <JurP>
                Enkelttjenester (Pro-time, Trackman-analyse mv.) betales per booking. Avbestilling senest 24 timer før oppmøte gir full refusjon. Senere avbestilling refunderes ikke, men kan etter avtale flyttes til ny dato.
              </JurP>
            </JurSection>

            <JurSection title="4. Innhold og data">
              <JurP>
                Du beholder eierskap til alle data du laster opp eller registrerer i Tjenesten (runder, tester, notater, opptak osv.). Du gir AK Golf en ikke-eksklusiv lisens til å lagre, prosessere og vise disse dataene som nødvendig for å levere Tjenesten.
              </JurP>
              <JurP>Anonymiserte og aggregerte data kan brukes til produktforbedring og statistikk uten egen varsling.</JurP>
            </JurSection>

            <JurSection title="5. AI-coach og automatiserte agenter">
              <JurP>
                AK Golf bruker språkmodeller (Anthropic Claude) og automatiserte agenter for å gi anbefalinger. AI-coachens svar er ikke å regne som personlig medisinsk, juridisk eller finansiell rådgivning.
              </JurP>
              <JurP>
                Vi gjør vårt beste for at anbefalingene er treffsikre, men kan ikke garantere resultat. Du bør konsultere kvalifisert fagperson ved skader, helseutfordringer eller annen tvil.
              </JurP>
            </JurSection>

            <JurSection title="6. Tilgjengelighet og endringer">
              <JurP>Vi tilstreber høy oppetid, men kan ikke garantere uavbrutt drift. Planlagt vedlikehold varsles når mulig.</JurP>
              <JurP>
                Vi kan endre, utvide eller fjerne funksjoner over tid. Vesentlige negative endringer varsles minst 30 dager på forhånd, og du har da rett til å si opp uten oppsigelsestid.
              </JurP>
            </JurSection>

            <JurSection title="7. Ansvarsbegrensning">
              <JurP>
                Tjenesten leveres «som den er». AK Golf er ikke ansvarlig for indirekte tap, tapt fortjeneste, eller skade som følge av at spilleren handler på AI-anbefalinger eller treningsplaner.
              </JurP>
              <JurP>Vårt samlede erstatningsansvar er uansett begrenset til de siste 12 månedenes innbetalte abonnementskostnad.</JurP>
            </JurSection>

            <JurSection title="8. Personvern">
              <JurP>
                Behandling av personopplysninger er beskrevet i vår <a href="/personvern" style={A_STYLE}>personvernerklæring</a>.
              </JurP>
            </JurSection>

            <JurSection title="9. Verneting og lovvalg">
              <JurP>
                Vilkårene reguleres av norsk rett. Tvister behandles ved Fredrikstad tingrett som avtalt verneting, med mindre ufravikelig lov bestemmer noe annet.
              </JurP>
            </JurSection>

            <JurSection title="10. Kontakt">
              <JurP>
                Spørsmål om vilkårene rettes til <a href="mailto:support@akgolf.no" style={A_STYLE}>support@akgolf.no</a>.
              </JurP>
            </JurSection>
          </article>
        </div>
      </div>
    </MRamme>
  );
}
