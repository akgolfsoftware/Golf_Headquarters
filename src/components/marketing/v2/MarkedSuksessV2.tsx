"use client";

/**
 * AK Golf HQ v2 — Markedsside SUKSESS (/suksess), retning C «Presis», mørk.
 * Marketing-idiomene er lokale i denne fila, 1:1 mønster med
 * MarkedForsideV2.tsx. Ekte copy speilet fra
 * src/app/(marketing)/(mlegacy)/suksess/page.tsx. Norsk bokmål æøå.
 */
import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { MMobilMeny } from "./marked-ramme";
import { T } from "@/lib/v2/tokens";
import { Icon, LogoAK, Caps, Kort, AvatarInit } from "@/components/v2";

const M = {
  heroD: 62,
  heroM: 38,
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
      <div style={{ flex: 1 }}>{children}</div>
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
  return <div style={{ padding: mobile ? M.padM : M.padD, ...style }}><div style={{ maxWidth: M.maxw, margin: "0 auto" }}>{children}</div></div>;
}

type Case = { navn: string; rolle: string; hcpFra: number; hcpTil: number; periode: string; sitat: string };
const CASES: Case[] = [
  { navn: "Lars H.", rolle: "Klubbmedlem, 47 år", hcpFra: 28, hcpTil: 16, periode: "12 måneder", sitat: "Jeg trodde aldri jeg skulle komme under 20. Med struktur og oppfølging mellom timene falt det på plass. Coachingen ga meg ikke bare bedre slag, den ga meg en plan jeg faktisk kunne følge." },
  { navn: "Emma S.", rolle: "Junior, 16 år", hcpFra: 18, hcpTil: 6, periode: "2 sesonger", sitat: "Anders behandlet meg som en utøver fra dag én. Treningsplanene var ikke generiske, de var bygd rundt det jeg trengte. Nå spiller jeg NM og trives med presset." },
  { navn: "Geir T.", rolle: "Mosjonist, 62 år", hcpFra: 22, hcpTil: 14, periode: "9 måneder", sitat: "Jeg ville bare slå bedre med jernene mine før pensjonsturneringene. Det jeg fikk var hele spillet løftet: putting, nærspill, og en mental ro jeg aldri har hatt på banen." },
];

export function MarkedSuksessV2() {
  const mobile = useMobile();
  return (
    <MRamme mobile={mobile} aktiv="suksess">
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 28 : 40 }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow>Suksesshistorier · AK Golf Academy</Eyebrow>
          <HeroT mobile={mobile} em="tatt steget.">Spillere som har</HeroT>
          <Lede style={{ marginTop: 22 }}>
            Tre eksempler på hva personlig coaching kan gjøre når plan, struktur og tett oppfølging går hånd i hånd.
          </Lede>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
            <MCta href="/coaching">Les om coaching</MCta>
            <MCta ghost href="/kontakt">Snakk med oss</MCta>
          </div>
        </div>
      </Seksjon>

      <Seksjon mobile={mobile}>
        <Caps>Resultater · Ekte spillere</Caps>
        <div style={{ marginTop: 8 }}>
          <SeksT mobile={mobile} em="kan måles.">Fremgang som</SeksT>
        </div>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {CASES.map((c) => (
            <Kort key={c.navn} pad={mobile ? "24px 22px" : "32px 40px"}>
              <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 24 : 40, alignItems: mobile ? "flex-start" : "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: mobile ? "flex-start" : "center", textAlign: mobile ? "left" : "center", flex: "none", width: mobile ? "100%" : 200 }}>
                  <AvatarInit navn={c.navn} size={64} />
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg, letterSpacing: "-0.02em", marginTop: 12 }}>{c.navn}</div>
                  <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 2 }}>{c.rolle}</div>
                  <div style={{ marginTop: 14, width: "100%", borderRadius: 14, border: `1px solid ${T.border}`, background: T.panel2, padding: "12px 14px" }}>
                    <Caps size={9.5}>HCP-utvikling</Caps>
                    <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 10, fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.fg }}>
                      <span>{c.hcpFra}</span>
                      <Icon name="trending-down" size={14} style={{ color: T.lime }} />
                      <span style={{ color: T.lime }}>{c.hcpTil}</span>
                    </div>
                    <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 4 }}>{c.periode}</div>
                  </div>
                </div>
                <blockquote style={{ margin: 0, borderLeft: `2px solid ${T.lime}`, paddingLeft: 18, fontFamily: T.disp, fontStyle: "italic", fontWeight: 400, fontSize: mobile ? 16 : 18, lineHeight: 1.5, color: T.fg2 }}>
                  «{c.sitat}»
                </blockquote>
              </div>
            </Kort>
          ))}
        </div>
      </Seksjon>

      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 24 : 40 }}>
        <Kort tint pad={mobile ? "32px 24px" : "48px 56px"} style={{ alignItems: "center", textAlign: "center" }}>
          <Caps size={11} color={T.lime}>Begrenset antall plasser</Caps>
          <div style={{ marginTop: 14 }}>
            <SeksT mobile={mobile} em="suksesshistorie?">Vil du være neste</SeksT>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 14.5, color: T.fg2, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 460 }}>
            Vi tar imot et begrenset antall nye spillere hver sesong.
          </p>
          <div style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <MCta href="/coaching" icon="arrow-right">Les om coaching</MCta>
            <MCta ghost href="/kontakt">Snakk med oss</MCta>
          </div>
        </Kort>
      </Seksjon>
    </MRamme>
  );
}
