"use client";

/**
 * AK Golf HQ v2 — Markedsside JUNIOR (/junior), retning C «Presis», mørk.
 * Marketing-idiomene er lokale i denne fila, 1:1 mønster med
 * MarkedForsideV2.tsx. Ekte copy speilet fra
 * src/app/(marketing)/(mlegacy)/junior/page.tsx. Norsk bokmål æøå.
 */
import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { MMobilMeny } from "./marked-ramme";
import { T } from "@/lib/v2/tokens";
import { Icon, LogoAK, Caps, Kort } from "@/components/v2";

const M = {
  heroD: 62,
  heroM: 38,
  seksD: 30,
  seksM: 24,
  lede: 16.5,
  padDY: 96,
  padDX: 64,
  padMY: 56,
  padMX: 22,
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: mobile ? "16px 22px" : "20px 64px", borderBottom: `1px solid ${T.border}`, position: "relative" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <LogoAK size={24} />

      </Link>
      {!mobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {MNAV.map((n) => (
            <Link key={n.id} href={n.href} style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 600, color: aktiv === n.id ? T.fg : T.fg2, textDecoration: "none", borderBottom: aktiv === n.id ? `2px solid ${T.lime}` : "2px solid transparent", paddingBottom: 2 }}>
              {n.l}
            </Link>
          ))}
        </div>
      )}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        {!mobile && (
          <Link href="/auth/login" style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg2, textDecoration: "none" }}>
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
    <div style={{ borderTop: `1px solid ${T.border}`, padding: mobile ? "32px 22px" : "40px 64px", display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "center", justifyContent: "space-between", gap: 18 }}>
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
          <Link key={f.l} href={f.href} style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, textDecoration: "none" }}>{f.l}</Link>
        ))}
      </div>
    </div>
  );
}

function MRamme({ mobile, aktiv, children }: { mobile: boolean; aktiv: string; children: ReactNode }) {
  return (
    <div className="dark" style={{ minHeight: "100vh", colorScheme: "dark", color: T.fg, fontFamily: T.ui, background: `radial-gradient(1100px 520px at 30% -10%, rgba(0,88,64,0.20), transparent 62%), ${T.bg}`, display: "flex", flexDirection: "column" }}>
      <MNav mobile={mobile} aktiv={aktiv} />
      {/* <main>-landemerke — samme a11y-fiks som delt marked-ramme.tsx. */}
      <main style={{ flex: 1 }}>{children}</main>
      <MFot mobile={mobile} />
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <Caps size={11} color={T.lime} style={{ marginBottom: 18 }}>{children}</Caps>;
}
function HeroT({ mobile, children, em }: { mobile: boolean; children: ReactNode; em?: string }) {
  return (
    <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? M.heroM : M.heroD, letterSpacing: "-0.035em", color: T.fg, margin: 0, lineHeight: 1.02 }}>
      {children}{em && <> <em style={{ fontStyle: "italic", color: T.lime }}>{em}</em></>}
    </h1>
  );
}
function SeksT({ mobile, children, em }: { mobile: boolean; children: ReactNode; em?: string }) {
  return (
    <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? M.seksM : M.seksD, letterSpacing: "-0.03em", color: T.fg, margin: 0, lineHeight: 1.08 }}>
      {children}{em && <> <em style={{ fontStyle: "italic", color: T.lime }}>{em}</em></>}
    </h2>
  );
}
function Lede({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <p style={{ fontFamily: T.ui, fontSize: M.lede, color: T.fg2, lineHeight: 1.65, margin: 0, maxWidth: 560, ...style }}>{children}</p>;
}
function MCta({ children, ghost, small, icon, href }: { children: ReactNode; ghost?: boolean; small?: boolean; icon?: string; href?: string }) {
  const style: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.ui, fontWeight: 600, fontSize: small ? 13 : 15, color: ghost ? T.fg : T.onLime, background: ghost ? T.panel3 : T.lime, border: ghost ? `1px solid ${T.borderS}` : "none", borderRadius: 9999, padding: small ? "9px 18px" : "14px 28px", cursor: "pointer", whiteSpace: "nowrap", textDecoration: "none" };
  const inner = (<>{children}{icon && <Icon name={icon} size={small ? 13 : 15} />}</>);
  if (href) return <Link href={href} style={style}>{inner}</Link>;
  return <span style={style}>{inner}</span>;
}
function Seksjon({ mobile, children, style }: { mobile: boolean; children: ReactNode; style?: CSSProperties }) {
  return <div style={{ paddingTop: mobile ? M.padMY : M.padDY, paddingBottom: mobile ? M.padMY : M.padDY, paddingLeft: mobile ? M.padMX : M.padDX, paddingRight: mobile ? M.padMX : M.padDX, ...style }}><div style={{ maxWidth: M.maxw, margin: "0 auto" }}>{children}</div></div>;
}

type Gruppe = { gruppe: string; alder: string; krav: string; frekvens: string; sesong: string; icon: string };
const GRUPPER: Gruppe[] = [
  { gruppe: "U10", alder: "Under 10 år", krav: "Ingen krav, nybegynnere hjertelig velkomne", frekvens: "1 gang per uke", sesong: "Mai–september (utendørs)", icon: "star" },
  { gruppe: "U14", alder: "Under 14 år", krav: "Grunnleggende golferfaring, eget sett med køller", frekvens: "2 ganger per uke", sesong: "Helårs, innendørs Mulligan om vinteren", icon: "users" },
  { gruppe: "U18", alder: "Under 18 år", krav: "Handicap under 36, minimum 1 sesong med erfaring", frekvens: "2–3 ganger per uke", sesong: "Helårs med periodisert treningsplan", icon: "trophy" },
  { gruppe: "Talent", alder: "14–18 år · Elitesatsing", krav: "Handicap under 10 og anbefaling fra coach", frekvens: "3–5 ganger per uke + turneringer", sesong: "Helårs med WANG Toppidrett Fredrikstad", icon: "flame" },
];

const SESONGPLAN: { periode: string; fokus: string; sted: string }[] = [
  { periode: "Januar–april", fokus: "Innendørs teknikk og fysikk", sted: "Mulligan Fredrikstad / Sarpsborg" },
  { periode: "Mai–juni", fokus: "Overgang utendørs, nærspill", sted: "GFGK (Torsnesveien)" },
  { periode: "Juli–august", fokus: "Turneringer og runde-spilling", sted: "Baner i regionen" },
  { periode: "September–oktober", fokus: "Avslutning sesong, evaluering", sted: "GFGK (Torsnesveien)" },
  { periode: "November–desember", fokus: "Styrke, kondisjon, individuelle mål", sted: "Mulligan Fredrikstad / Sarpsborg" },
];

export function MarkedJuniorV2() {
  const mobile = useMobile();
  return (
    <MRamme mobile={mobile} aktiv="junior">
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 28 : 40 }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow>Junior · AK Golf Academy</Eyebrow>
          <HeroT mobile={mobile} em="unge talenter.">Golf for</HeroT>
          <Lede style={{ marginTop: 22 }}>
            Vi tror på systematisk utvikling fra tidlig alder. AK Golf Academy tilbyr strukturert juniortrening tilpasset hvert utviklingstrinn, fra de aller yngste til elitesatsing med WANG Toppidrett Fredrikstad.
          </Lede>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
            <MCta href="#pamelding" icon="arrow-right">Meld på junior</MCta>
            <MCta ghost href="/kontakt">Spør oss</MCta>
          </div>
        </div>
      </Seksjon>

      {/* Aldersgrupper */}
      <Seksjon mobile={mobile}>
        <Caps>Aldersgrupper</Caps>
        <div style={{ marginTop: 8 }}>
          <SeksT mobile={mobile} em="programmet.">Fire veier inn i</SeksT>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 14.5, color: T.fg2, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 520 }}>
          Alle grupper trener etter AK Golf-pyramiden og følges opp gjennom PlayerHQ slik at foreldre alltid har oversikt over progresjon.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: T.gap, marginTop: 24 }}>
          {GRUPPER.map((g) => (
            <Kort key={g.gruppe} pad="26px 26px 22px">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                <div>
                  <Caps size={10.5}>{g.alder}</Caps>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 26, color: T.fg, letterSpacing: "-0.02em", marginTop: 10 }}>{g.gruppe}</div>
                </div>
                <span style={{ width: 44, height: 44, flex: "none", borderRadius: 9999, background: T.panel3, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={g.icon} size={20} style={{ color: T.lime }} />
                </span>
              </div>
              <div style={{ marginTop: 20, borderTop: `1px solid ${T.border}`, paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <GruppeRad label="Krav" verdi={g.krav} />
                <GruppeRad label="Treningsfrekvens" verdi={g.frekvens} />
                <GruppeRad label="Sesong" verdi={g.sesong} />
              </div>
              <div style={{ marginTop: 20 }}>
                <a href="#pamelding" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.lime, textDecoration: "none" }}>
                  Meld på til {g.gruppe}
                  <Icon name="arrow-right" size={13} />
                </a>
              </div>
            </Kort>
          ))}
        </div>
      </Seksjon>

      {/* Sesongplan */}
      <Seksjon mobile={mobile}>
        <Caps>Sesongplan</Caps>
        <div style={{ marginTop: 8 }}>
          <SeksT mobile={mobile} em="året.">Hele</SeksT>
        </div>
        <div style={{ marginTop: 24, borderRadius: T.rCard, border: `1px solid ${T.border}`, background: T.panel, overflow: "hidden" }}>
          {SESONGPLAN.map((s, i) => (
            <div key={s.periode} style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 4 : 16, padding: "16px 20px", borderBottom: i === SESONGPLAN.length - 1 ? "none" : `1px solid ${T.border}` }}>
              <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 600, color: T.fg, flex: mobile ? "none" : "0 0 180px" }}>{s.periode}</span>
              <span style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, flex: 1 }}>{s.fokus}</span>
              <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>{s.sted}</span>
            </div>
          ))}
        </div>
      </Seksjon>

      {/* Påmelding */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 24 : 40 }}>
        <div id="pamelding" style={{ scrollMarginTop: 80, display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1.2fr", gap: mobile ? 32 : 48, alignItems: "start" }}>
          <div>
            <Caps>Påmelding</Caps>
            <div style={{ marginTop: 8 }}>
              <SeksT mobile={mobile} em="starte?">Klar for å</SeksT>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 14.5, color: T.fg2, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 460 }}>
              Send oss en e-post med navn på junior, alder og kontaktinfo, så tar vi kontakt innen 1 virkedag. Vi finner riktig gruppe basert på alder og erfaring.
            </p>
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
              <InfoRad label="Sesongstart" verdi="1. mai (utendørs)" />
              <InfoRad label="Vinterstudio" verdi="1. november (innendørs)" />
              <InfoRad label="Påmeldingsfrist" verdi="Løpende, plass til det er fullt" />
            </div>
          </div>
          <Kort tint pad={mobile ? "26px 24px" : "36px 40px"}>
            <Caps size={11} color={T.lime}>Svar innen 1 virkedag</Caps>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 22 : 26, color: T.fg, letterSpacing: "-0.02em", lineHeight: 1.1, marginTop: 12 }}>
              Meld interesse på <em style={{ fontStyle: "italic", color: T.lime }}>e-post</em>.
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.55, margin: "14px 0 0" }}>
              Send oss en e-post med navn på junior, alder og kontaktinfo, så tar vi kontakt innen 1 virkedag.
            </p>
            <div style={{ marginTop: 22 }}>
              <a
                href="mailto:post@akgolf.no?subject=Junior-p%C3%A5melding&body=Hei!%0A%0ANavn%20p%C3%A5%20junior%3A%20%0AAlder%3A%20%0AE-post%20foresatte%3A%20%0ATelefon%3A%20%0A%0AHilsen"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.ui, fontWeight: 600, fontSize: 15, color: T.onLime, background: T.lime, borderRadius: 9999, padding: "14px 28px", textDecoration: "none" }}
              >
                Send e-post til post@akgolf.no
                <Icon name="arrow-right" size={15} />
              </a>
            </div>
          </Kort>
        </div>
      </Seksjon>
    </MRamme>
  );
}

function GruppeRad({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Caps size={9.5}>{label}</Caps>
      <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.45 }}>{verdi}</span>
    </div>
  );
}

function InfoRad({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, borderBottom: `1px solid ${T.border}`, paddingBottom: 12 }}>
      <Caps size={9.5}>{label}</Caps>
      <span style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg }}>{verdi}</span>
    </div>
  );
}
