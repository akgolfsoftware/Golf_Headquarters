"use client";

/* AK Golf HQ v2 — MARKEDSSIDE: FAQ (/faq, akgolf.no, retning C «Presis»).
   Rekomponering av den eksisterende /faq-siden (mlegacy) med v2-idiomer.
   Ekte copy hentet 1:1 fra src/app/(marketing)/(mlegacy)/faq/page.tsx —
   samme fire kategorier (Coaching/Booking/PlayerHQ/Praktisk), samme
   spørsmål og svar.

   Marketing-rammen (MNav/MFot/MRamme) og tekst-idiomene er lokale i denne
   fila, samme mønster som MarkedForsideV2/MarkedPriserV2. */

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { MMobilMeny } from "./marked-ramme";
import { T } from "@/lib/v2/tokens";
import { Icon, LogoAK, Caps } from "@/components/v2";

const M = {
  heroD: 56,
  heroM: 36,
  seksD: 30,
  seksM: 24,
  lede: 16.5,
  padD: "96px 64px",
  padM: "56px 22px",
  maxw: 1040,
};

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
          <MCta small href="/auth/signup">
            Kom i gang gratis
          </MCta>
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

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Caps size={11} color={T.lime} style={{ marginBottom: 18 }}>
      {children}
    </Caps>
  );
}

function HeroT({ mobile, children, em }: { mobile: boolean; children: ReactNode; em?: string }) {
  return (
    <h1
      style={{
        fontFamily: T.disp,
        fontWeight: 700,
        fontSize: mobile ? M.heroM : M.heroD,
        letterSpacing: "-0.035em",
        color: T.fg,
        margin: 0,
        lineHeight: 1.05,
      }}
    >
      {children}
      {em && (
        <>
          {" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>{em}</em>
        </>
      )}
    </h1>
  );
}

function SeksT({ mobile, children, em }: { mobile: boolean; children: ReactNode; em?: string }) {
  return (
    <h2
      style={{
        fontFamily: T.disp,
        fontWeight: 700,
        fontSize: mobile ? M.seksM : M.seksD,
        letterSpacing: "-0.03em",
        color: T.fg,
        margin: 0,
        lineHeight: 1.08,
      }}
    >
      {children}
      {em && (
        <>
          {" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>{em}</em>
        </>
      )}
    </h2>
  );
}

function Lede({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p style={{ fontFamily: T.ui, fontSize: M.lede, color: T.fg2, lineHeight: 1.65, margin: 0, maxWidth: 560, ...style }}>
      {children}
    </p>
  );
}

function MCta({ children, ghost, small, icon, href }: { children: ReactNode; ghost?: boolean; small?: boolean; icon?: string; href?: string }) {
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: T.ui,
    fontWeight: 600,
    fontSize: small ? 13 : 15,
    color: ghost ? T.fg : T.onLime,
    background: ghost ? T.panel3 : T.lime,
    border: ghost ? `1px solid ${T.borderS}` : "none",
    borderRadius: 9999,
    padding: small ? "9px 18px" : "14px 28px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    textDecoration: "none",
  };
  const inner = (
    <>
      {children}
      {icon && <Icon name={icon} size={small ? 13 : 15} />}
    </>
  );
  if (href) {
    return (
      <Link href={href} style={style}>
        {inner}
      </Link>
    );
  }
  return <span style={style}>{inner}</span>;
}

function Seksjon({ mobile, children, style }: { mobile: boolean; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ padding: mobile ? M.padM : M.padD, ...style }}>
      <div style={{ maxWidth: M.maxw, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

/* ── Data (ekte copy fra mlegacy/faq) ─────────────────────── */
type Sporsmal = { q: string; a: string };
const FAQ: { kategori: string; punkter: Sporsmal[] }[] = [
  {
    kategori: "Coaching",
    punkter: [
      { q: "Hva er forskjellen på en vanlig time og et coachingforløp?", a: "En vanlig time er én økt på 50 minutter. Et coachingforløp er et personlig opplegg med treningsplan, oppfølging mellom timer, og tilgang til PlayerHQ. Forløp er bygd for spillere som vil ha målbar fremgang over tid." },
      { q: "Hvem passer Academy for?", a: "Spillere som er klare for tett oppfølging, uansett handicap, fra nybegynner til elite. Vi tar imot juniorer, voksne mosjonister og turneringsspillere. Felles for alle er at de vil ha struktur og fremgang." },
      { q: "Hvor mange timer trenger jeg?", a: "De fleste begynner med 4–8 timer over en sesong. Vi tilpasser frekvens etter mål, tilgjengelig tid og treningsvilje. Vil du ha fast oppfølging, velger du en coaching-pakke: Performance gir 2 økter per måned, Performance Pro gir 4." },
    ],
  },
  {
    kategori: "Booking",
    punkter: [
      { q: "Hvordan booker jeg time?", a: "På bookingsiden (akgolf.no/booking) eller direkte fra PlayerHQ-profilen din. Du velger coach, tjeneste, dato og tid. Bekreftelse kommer på e-post umiddelbart." },
      { q: "Kan jeg avbestille?", a: "Ja. Avbestilling senest 24 timer før oppmøte gir full refusjon eller credit-tilbakeføring. Senere avbestilling kan flyttes etter avtale, men refunderes ikke." },
      { q: "Betaler jeg per time eller med abonnement?", a: "Begge deler er mulig. Enkelttimer betales via Stripe ved booking. Med en coaching-pakke (Performance eller Performance Pro) er øktene inkludert, 2 eller 4 per måned, og bookes innenfor pakken." },
    ],
  },
  {
    kategori: "PlayerHQ",
    punkter: [
      { q: "Hva er PlayerHQ?", a: "Din digitale spillerportal. Her finner du treningsplaner, runder, tester, AI-coach og fremdriftsdata. Appen er gratis med aktiv coaching-pakke (Performance eller Performance Pro), i prøvemåneden, eller om du trener i gruppe gjennom AK Golf. Ellers koster den 299 kr/mnd." },
      { q: "Trenger jeg å være kunde for å bruke PlayerHQ?", a: "Nei. Alle kan opprette konto og prøve PlayerHQ gratis i én måned uten å være Academy-kunde. Etter prøvemåneden er appen gratis så lenge du har en aktiv coaching-pakke eller trener i gruppe gjennom AK Golf. Ellers 299 kr/mnd." },
    ],
  },
  {
    kategori: "Praktisk",
    punkter: [
      { q: "Hvor er dere lokalisert?", a: "Vi holder til på Mulligan Indoor Golf i Fredrikstad (Produksjonsveien 21) og Sarpsborg (Bjørnstadveien 12), samt Gamle Fredrikstad Golfklubb (Torsnesveien 16) fra mai til oktober. Alle anlegg er fullt utstyrt for coaching." },
      { q: "Hva med utstyr, må jeg ha eget?", a: "Vi har leieutstyr tilgjengelig for nybegynnere. For coachingforløp anbefaler vi at du etter hvert investerer i tilpassede køller, og vi hjelper deg med valget når tiden er moden." },
    ],
  },
];

function FaqAccordion({ kategori, punkter }: { kategori: string; punkter: Sporsmal[] }) {
  const [open, setOpen] = useState(-1);
  return (
    <div>
      <Caps>{kategori}</Caps>
      <div
        style={{
          marginTop: 10,
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: T.rCard,
          padding: "4px 20px",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.045), 0 12px 32px rgba(0,0,0,0.35)",
        }}
      >
        {punkter.map((p, i) => {
          const on = open === i;
          return (
            <div key={p.q} style={{ borderBottom: i === punkter.length - 1 ? "none" : `1px solid ${T.border}` }}>
              <button
                onClick={() => setOpen(on ? -1 : i)}
                style={{
                  appearance: "none",
                  background: "none",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "16px 0",
                }}
              >
                <span style={{ fontFamily: T.ui, fontSize: 14.5, fontWeight: 600, color: T.fg }}>{p.q}</span>
                <Icon name={on ? "minus" : "plus"} size={15} style={{ color: on ? T.lime : T.mut, flex: "none" }} />
              </button>
              {on && <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.65, margin: "0 0 17px", maxWidth: 560 }}>{p.a}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   M-FAQ (/faq)
   ════════════════════════════════════════════════════════ */
export function MarkedFaqV2() {
  const mobile = useMobile();

  return (
    <MRamme mobile={mobile} aktiv="faq">
      {/* Hero */}
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 20 : 32 }}>
        <div style={{ maxWidth: 620 }}>
          <Eyebrow>FAQ · Før du starter</Eyebrow>
          <HeroT mobile={mobile} em="stilte">
            Ofte
          </HeroT>
          <Lede style={{ marginTop: 20 }}>Korte, ærlige svar på det folk lurer på før de starter hos oss.</Lede>
        </div>
      </Seksjon>

      {/* Spørsmål gruppert per kategori */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 32 }}>
          {FAQ.map((kat) => (
            <FaqAccordion key={kat.kategori} kategori={kat.kategori} punkter={kat.punkter} />
          ))}
        </div>
      </Seksjon>

      {/* Slutt-CTA */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 24 : 40 }}>
        <div
          style={{
            borderRadius: 24,
            padding: mobile ? "40px 24px" : "64px 56px",
            textAlign: "center",
            background: `linear-gradient(135deg, ${T.forest} 0%, color-mix(in srgb, ${T.forest} 20%, ${T.bg}) 100%)`,
          }}
        >
          <Eyebrow>Fortsatt usikker?</Eyebrow>
          <SeksT mobile={mobile} em="svar">
            Fant du ikke
          </SeksT>
          <p style={{ fontFamily: T.ui, fontSize: 14, color: "rgba(238,240,236,0.85)", lineHeight: 1.6, margin: "14px auto 0", maxWidth: 440 }}>
            Skriv til oss, så svarer vi som regel samme dag.
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <MCta href="mailto:post@akgolf.no" icon="mail">
              post@akgolf.no
            </MCta>
            <MCta ghost href="/kontakt">
              Kontaktskjema
            </MCta>
          </div>
        </div>
      </Seksjon>
    </MRamme>
  );
}
