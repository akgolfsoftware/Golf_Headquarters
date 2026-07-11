"use client";

/**
 * AK Golf HQ v2 — Markedsside JOBB (/jobb), retning C «Presis», mørk.
 * Marketing-idiomene er lokale i denne fila, 1:1 mønster med
 * MarkedForsideV2.tsx. Ekte copy speilet fra
 * src/app/(marketing)/(mlegacy)/jobb/page.tsx. Norsk bokmål æøå.
 */
import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
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
        {mobile ? <Icon name="menu" size={20} style={{ color: T.fg }} /> : <MCta small href="/auth/signup">Kom i gang gratis</MCta>}
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
        {["Coaching", "PlayerHQ", "Priser", "Book tid", "Personvern"].map((l) => (
          <span key={l} style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, cursor: "pointer" }}>{l}</span>
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

type Stilling = { tittel: string; sted: string; type: string; beskrivelse: string };
const STILLINGER: Stilling[] = [
  { tittel: "Golfcoach (deltid)", sted: "Fredrikstad", type: "50–80 %", beskrivelse: "Vi ser etter en engasjert coach med erfaring fra juniorutvikling og/eller voksne amatørspillere. Du vil jobbe tett med Anders Kristiansen, bruke PlayerHQ til å følge opp spillere og bidra til å bygge AK Golf Academy videre." },
  { tittel: "Junior-trener (sesong)", sted: "Fredrikstad", type: "Mai–september", beskrivelse: "Sesongjobb for deg som brenner for å utvikle unge golfspillere. Du vil lede treningsgrupper for U10–U18, samarbeide med foreldrene og rapportere progresjon gjennom sesongen. PGA-utdanning er en fordel, men ikke et krav." },
];

const VERDIER: { t: string; d: string }[] = [
  { t: "Data-drevet coaching", d: "Vi bruker Trackman, PlayerHQ og Strokes Gained-analyse i alle coachingsesjoner. Du lærer å lese og bruke data som en proff." },
  { t: "Tett samarbeid", d: "Teamet er lite, så du jobber direkte med Academy-ledelsen og har reell innflytelse på metoder og opplegg." },
  { t: "Faglig utvikling", d: "Vi støtter videreutdanning, kursing og konferanse-deltakelse. Din faglige vekst er en del av teamets vekst." },
];

export function MarkedJobbV2() {
  const mobile = useMobile();
  return (
    <MRamme mobile={mobile} aktiv="jobb">
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 28 : 40 }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow>Karriere</Eyebrow>
          <HeroT mobile={mobile} em="teamet.">Bli en del av</HeroT>
          <Lede style={{ marginTop: 22 }}>
            Vi er et lite team med store ambisjoner. Hos oss jobber du med de beste verktøyene, tett på spillerne, og med rom til å vokse som coach og fagperson.
          </Lede>
        </div>
      </Seksjon>

      {/* Verdier */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap }}>
          {VERDIER.map((v) => (
            <Kort key={v.t} pad="22px 22px 24px">
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg, letterSpacing: "-0.015em" }}>{v.t}</div>
              <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: "9px 0 0" }}>{v.d}</p>
            </Kort>
          ))}
        </div>
      </Seksjon>

      {/* Aktive stillinger */}
      <Seksjon mobile={mobile}>
        <Caps>Aktive stillinger</Caps>
        <div style={{ marginTop: 8 }}>
          <SeksT mobile={mobile} em="deg.">Vi søker</SeksT>
        </div>
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          {STILLINGER.map((s) => (
            <Kort key={s.tittel} pad={mobile ? "22px 20px" : "28px 32px"}>
              <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: 20, alignItems: mobile ? "stretch" : "flex-start", justifyContent: "space-between" }}>
                <div style={{ flex: 1, display: "flex", gap: 14 }}>
                  <span style={{ width: 40, height: 40, flex: "none", borderRadius: 9999, background: T.panel3, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="user" size={18} style={{ color: T.lime }} />
                  </span>
                  <div>
                    <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg, letterSpacing: "-0.02em" }}>{s.tittel}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.mut }}>
                        <Icon name="map-pin" size={11} style={{ color: T.mut }} />
                        {s.sted}
                      </span>
                      <span style={{ borderRadius: 9999, background: T.panel3, padding: "3px 12px", fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.fg2 }}>{s.type}</span>
                    </div>
                    <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 500 }}>{s.beskrivelse}</p>
                  </div>
                </div>
                <a
                  href={`mailto:post@akgolf.no?subject=${encodeURIComponent(`Søknad: ${s.tittel}`)}`}
                  style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.ui, fontWeight: 600, fontSize: 13.5, color: T.onLime, background: T.lime, borderRadius: 9999, padding: "12px 22px", textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  Søk stilling
                  <Icon name="arrow-right" size={13} />
                </a>
              </div>
            </Kort>
          ))}
        </div>
      </Seksjon>

      {/* Spontansøknad */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 24 : 40 }}>
        <Kort tint pad={mobile ? "28px 24px" : "36px 40px"}>
          <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "center", gap: 20, justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <Caps size={11} color={T.lime}>Spontansøknad</Caps>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 20 : 24, color: T.fg, letterSpacing: "-0.02em", marginTop: 10 }}>Finner du ikke din drømmestilling?</div>
              <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 460 }}>
                Send oss en spontansøknad. Fortell hvem du er, hva du brenner for og hva du kan bidra med. Vi leser alle henvendelser og svarer innen 3 virkedager.
              </p>
            </div>
            <a
              href="mailto:post@akgolf.no?subject=Spontansøknad"
              style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.ui, fontWeight: 600, fontSize: 15, color: T.onLime, background: T.lime, borderRadius: 9999, padding: "14px 28px", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              <Icon name="mail" size={15} />
              Send spontansøknad
            </a>
          </div>
        </Kort>
      </Seksjon>
    </MRamme>
  );
}
