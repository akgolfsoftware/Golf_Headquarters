"use client";

/**
 * AK Golf HQ v2 — Markedsside OM OSS (/om-oss), retning C «Presis», mørk.
 * Marketing-idiomene (MRamme/MNav/MFot/Eyebrow/HeroT/SeksT/Lede/MCta/Seksjon)
 * er lokale i denne fila, 1:1 mønster med MarkedForsideV2.tsx (marketing-egen
 * chrome, IKKE V2Shell). Ekte copy speilet fra
 * src/app/(marketing)/(mlegacy)/om-oss/page.tsx. Norsk bokmål æøå.
 */
import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { MMobilMeny } from "./marked-ramme";
import Image from "next/image";
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
  return <div style={{ paddingTop: mobile ? M.padMY : M.padDY, paddingBottom: mobile ? M.padMY : M.padDY, paddingLeft: mobile ? M.padMX : M.padDX, paddingRight: mobile ? M.padMX : M.padDX, ...style }}><div style={{ maxWidth: M.maxw, margin: "0 auto" }}>{children}</div></div>;
}

function Foto({ src, alt, mobile }: { src: string; alt: string; mobile: boolean }) {
  return (
    <div style={{ position: "relative", width: "100%", height: mobile ? 260 : 420, borderRadius: 24, overflow: "hidden", border: `1px solid ${T.borderS}` }}>
      <Image src={src} alt={alt} fill sizes="(max-width: 860px) 100vw, 1040px" style={{ objectFit: "cover" }} priority />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(13,14,13,0) 55%, rgba(13,14,13,0.55) 100%)" }} />
    </div>
  );
}

const MANIFEST: { nr: string; t: string; d: string }[] = [
  { nr: "01", t: "Tydelig, ikke magisk", d: "Du skal alltid vite hva vi jobber med, hvorfor vi jobber med det, og hvordan du ser at det virker." },
  { nr: "02", t: "Balansert, ikke tilfeldig", d: "AK Golf-pyramiden fordeler treningstiden riktig mellom fysikk, teknikk, slag, spill og turneringserfaring." },
  { nr: "03", t: "Målbar, ikke synsing", d: "PlayerHQ holder plan, runder og statistikk samlet på ett sted. Fremgangen er synlig, ikke noe du må tro på." },
];

export function MarkedOmOssV2() {
  const mobile = useMobile();
  return (
    <MRamme mobile={mobile} aktiv="om-oss">
      {/* Hero */}
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 28 : 40 }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow>Om oss · AK Golf Academy</Eyebrow>
          <HeroT mobile={mobile} em="bygd på data.">Personlig coaching,</HeroT>
          <Lede style={{ marginTop: 22 }}>
            AK Golf Academy drives av Anders Kristiansen: golfcoach, gründer og CEO i AK Golf Group AS. Tett personlig oppfølging, målbar fremgang.
          </Lede>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
            <MCta href="/booking">Book første time</MCta>
            <MCta ghost icon="arrow-right" href="/coaching">Møt coachene</MCta>
          </div>
        </div>
      </Seksjon>

      <Seksjon mobile={mobile} style={{ paddingTop: 0, paddingBottom: mobile ? 28 : 48 }}>
        <Foto src="/images/akademy/coach-observerer.jpg" alt="Coach observerer spiller på range" mobile={mobile} />
      </Seksjon>

      {/* Manifest */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Caps>Manifest · Det vi tror på</Caps>
        <div style={{ marginTop: 8 }}>
          <SeksT mobile={mobile} em="aldri går på akkord med.">Tre ting vi</SeksT>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap, marginTop: 24 }}>
          {MANIFEST.map((m) => (
            <Kort key={m.nr} pad="24px 24px 26px">
              <Caps size={11}>{m.nr}</Caps>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg, letterSpacing: "-0.02em", marginTop: 12 }}>{m.t}</div>
              <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: "9px 0 0" }}>{m.d}</p>
            </Kort>
          ))}
        </div>
      </Seksjon>

      {/* Historien */}
      <Seksjon mobile={mobile}>
        <Caps>Historien</Caps>
        <div style={{ marginTop: 8 }}>
          <SeksT mobile={mobile} em="kan måles.">Coaching som</SeksT>
        </div>
        <div style={{ marginTop: 22, maxWidth: 640, display: "flex", flexDirection: "column", gap: 18 }}>
          <p style={{ fontFamily: T.ui, fontSize: 15.5, color: T.fg2, lineHeight: 1.65, margin: 0 }}>
            Anders har brukt mer enn et tiår på spillere på alle nivåer, fra klubbamatører til konkurranseutøvere. Underveis vokste det frem en praksis der personlig oppfølging og målbare resultater ikke er motsetninger, men to sider av samme metode.
          </p>
          <blockquote style={{ borderLeft: `2px solid ${T.lime}`, paddingLeft: 20, margin: 0, fontFamily: T.disp, fontStyle: "italic", fontWeight: 400, fontSize: mobile ? 19 : 23, lineHeight: 1.45, color: T.lime }}>
            «Coaching skal ikke være magi. Det skal være tydelig: hva vi jobber med, hvorfor vi jobber med det, og hvordan du ser at det virker. Det er det Academy er bygget rundt.»
          </blockquote>
          <p style={{ fontFamily: T.ui, fontSize: 15.5, color: T.fg2, lineHeight: 1.65, margin: 0 }}>
            Kjernen er AK Golf-pyramiden, et balansert system som sørger for at treningstiden fordeles riktig mellom fysikk, teknikk, slag, spill og turneringserfaring. Til daglig støttes coachingen av PlayerHQ, spillerportalen som holder plan, runder og statistikk samlet på ett sted.
          </p>
        </div>
      </Seksjon>

      {/* Selskapet */}
      <Seksjon mobile={mobile}>
        <Caps>Selskapet · AK Golf Group AS</Caps>
        <div style={{ marginTop: 16, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
          {[
            { l: "Org.nummer", v: "927 248 581", mono: true },
            { l: "Adresse", v: "AK Golf Group AS, Fredrikstad, Norge", mono: false },
            { l: "E-post", v: "post@akgolf.no", mono: true },
          ].map((r, i, arr) => (
            <div key={r.l} style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 8, padding: "16px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${T.border}` }}>
              <Caps size={10.5}>{r.l}</Caps>
              <span style={{ fontFamily: r.mono ? T.mono : T.ui, fontSize: r.mono ? 14 : 15, fontWeight: r.mono ? 700 : 500, color: T.fg }}>{r.v}</span>
            </div>
          ))}
        </div>
      </Seksjon>

      {/* Closing CTA */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 24 : 40 }}>
        <Kort tint pad={mobile ? "32px 24px" : "48px 56px"} style={{ alignItems: "center", textAlign: "center" }}>
          <Caps size={11} color={T.lime}>AK Golf Academy · Fredrikstad</Caps>
          <div style={{ marginTop: 14 }}>
            <SeksT mobile={mobile} em="første time?">Klar for</SeksT>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 14.5, color: T.fg2, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 480 }}>
            Start med en enkelt time, så ser vi sammen hva som er riktig vei videre for spillet ditt.
          </p>
          <div style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <MCta href="/booking" icon="arrow-right">Book første time</MCta>
            <MCta ghost href="/kontakt">Ta kontakt</MCta>
          </div>
        </Kort>
      </Seksjon>
    </MRamme>
  );
}
