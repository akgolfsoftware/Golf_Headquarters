"use client";

/**
 * AK Golf HQ v2 — Markedsside CASES (/cases), retning C «Presis», mørk.
 * Marketing-idiomene er lokale i denne fila, 1:1 mønster med
 * MarkedForsideV2.tsx. Ekte copy speilet fra
 * src/app/(marketing)/(mlegacy)/cases/page.tsx. Turneringer hentes fra DB i
 * page.tsx (server) og sendes inn som prop — denne komponenten er "use client"
 * og fetcher aldri selv.
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

type Case = { slug: string; navn: string; alder: number; hcpFra: number; hcpTil: number; tid: string; sitat: string; badge: string };
const CASES: Case[] = [
  { slug: "marcus", navn: "Marcus R.", alder: 17, hcpFra: 12.4, hcpTil: 6.1, tid: "8 måneder", sitat: "SG Hub-analysene forandret måten jeg trener på.", badge: "Personlig rekord" },
  { slug: "sofie", navn: "Sofie L.", alder: 22, hcpFra: 8.2, hcpTil: 3.7, tid: "6 måneder", sitat: "Endelig data-drevet coaching som faktisk funker.", badge: "Data-drevet" },
];

export type CasesTournament = { day: string; mon: string; name: string; venue: string; format: string; pagar: boolean };

function CaseKort({ c }: { c: Case }) {
  const forbedring = (c.hcpFra - c.hcpTil).toFixed(1);
  return (
    <Kort pad="0">
      <div style={{ position: "relative", height: 96, borderRadius: `${T.rCard}px ${T.rCard}px 0 0`, background: `linear-gradient(150deg, ${T.forest} 0%, ${T.panel} 100%)`, overflow: "hidden" }}>
        <span style={{ position: "absolute", left: 16, top: 14, borderRadius: 9999, background: T.lime, color: T.onLime, padding: "5px 12px", fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.badge}</span>
        <span style={{ position: "absolute", right: 16, top: 14, width: 34, height: 34, borderRadius: 9999, background: T.lime, color: T.onLime, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="trending-down" size={16} />
        </span>
        <div style={{ position: "absolute", bottom: 8, right: 16, fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: "rgba(255,255,255,0.14)", lineHeight: 1 }}>-{forbedring}</div>
      </div>
      <div style={{ padding: "22px 22px 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut }}>
          <span>{c.navn}</span>
          <span>· {c.alder} år</span>
          <span style={{ borderRadius: 9999, background: T.panel3, padding: "3px 10px" }}>{c.tid}</span>
        </div>
        <blockquote style={{ margin: "14px 0 0", borderLeft: `2px solid ${T.lime}`, paddingLeft: 14, fontFamily: T.disp, fontStyle: "italic", fontWeight: 400, fontSize: 15, lineHeight: 1.5, color: T.fg2 }}>
          «{c.sitat}»
        </blockquote>
        <div style={{ marginTop: 18, display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.lime }}>-{forbedring}</span>
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2 }}>HCP-forbedring · {c.hcpFra} → {c.hcpTil}</span>
        </div>
      </div>
    </Kort>
  );
}

export function MarkedCasesV2({ tournaments }: { tournaments: CasesTournament[] }) {
  const mobile = useMobile();
  return (
    <MRamme mobile={mobile} aktiv="cases">
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 28 : 40 }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow>Resultater vi er stolte av</Eyebrow>
          <HeroT mobile={mobile} em="turneringer.">Cases &amp;</HeroT>
          <Lede style={{ marginTop: 22 }}>
            Dokumenterte resultater fra spillere i AK Golf-programmet, fra HCP 12 til nasjonal elite.
          </Lede>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
            <MCta href="/booking">Book gratis kartleggings-økt</MCta>
            <MCta ghost href="/turneringer">Se turneringskalenderen</MCta>
          </div>
        </div>
      </Seksjon>

      {/* Cases-grid */}
      <Seksjon mobile={mobile}>
        <Caps>Spillere · Dokumentert fremgang</Caps>
        <div style={{ marginTop: 8 }}>
          <SeksT mobile={mobile} em="kan måles.">Historier som</SeksT>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: T.gap, marginTop: 24 }}>
          {CASES.map((c) => (
            <CaseKort key={c.slug} c={c} />
          ))}
        </div>
      </Seksjon>

      {/* Turneringer */}
      <Seksjon mobile={mobile}>
        <Caps>Kalender · Neste 90 dager</Caps>
        <div style={{ marginTop: 8 }}>
          <SeksT mobile={mobile} em="turneringer.">Kommende</SeksT>
        </div>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
          {tournaments.length === 0 ? (
            <div style={{ borderRadius: T.rCard, border: `1px dashed ${T.border}`, background: T.panel2, padding: "26px 22px", textAlign: "center" }}>
              <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, margin: 0 }}>
                Ingen kommende turneringer akkurat nå. Se hele kalenderen på{" "}
                <Link href="/turneringer" style={{ color: T.lime, fontWeight: 600, textDecoration: "none" }}>/turneringer</Link>.
              </p>
            </div>
          ) : (
            tournaments.map((t) => (
              <div key={`${t.day}-${t.name}`} style={{ display: "flex", alignItems: "center", gap: 16, borderRadius: T.rCard, border: `1px solid ${T.border}`, background: T.panel, padding: "12px 16px" }}>
                <div style={{ flex: "none", width: 44, height: 44, borderRadius: 10, background: T.panel3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.lime, lineHeight: 1 }}>{t.day}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 8, color: T.mut, marginTop: 2 }}>{t.mon}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 700, color: T.fg }}>{t.name}</div>
                  <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, marginTop: 2 }}>{t.venue} · {t.format}</div>
                </div>
                <span style={{ flex: "none", borderRadius: 9999, padding: "5px 12px", fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, background: t.pagar ? "rgba(90,169,240,0.14)" : "rgba(209,248,67,0.12)", color: t.pagar ? T.info : T.lime }}>
                  {t.pagar ? "Pågår" : "Kommende"}
                </span>
              </div>
            ))
          )}
        </div>
      </Seksjon>

      {/* Closing CTA */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 24 : 40 }}>
        <Kort tint pad={mobile ? "32px 24px" : "48px 56px"} style={{ alignItems: "center", textAlign: "center" }}>
          <Caps size={11} color={T.lime}>Din tur</Caps>
          <div style={{ marginTop: 14 }}>
            <SeksT mobile={mobile} em="suksesshistorie?">Klar for din</SeksT>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 14.5, color: T.fg2, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 460 }}>
            Start med en gratis kartleggings-økt. Vi finner ut hva som stopper deg, og legger en plan for å komme videre.
          </p>
          <div style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <MCta href="/booking" icon="arrow-right">Book gratis kartleggings-økt</MCta>
            <MCta ghost href="/kontakt">Snakk med oss</MCta>
          </div>
        </Kort>
      </Seksjon>
    </MRamme>
  );
}
