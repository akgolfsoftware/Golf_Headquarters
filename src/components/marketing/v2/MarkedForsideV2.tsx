"use client";

/**
 * Marketing — Forside v2 (retning C «Presis», mørk-først). Komponert 1:1 fra
 * ui_kits/v2/marketing.jsx → funksjonen Forside (+ marketing-rammen MRamme:
 * MNav topp · innhold · MFot bunn, og idiomene Eyebrow/HeroT/SeksT/Lede/MCta/
 * Seksjon/SkjermPlassholder). Montert offentlig i (v2preview)/v2-marked/page.tsx
 * (ingen auth-guard, ingen dataloader — dette er akgolf.no-forsiden).
 *
 * Marketing har EGEN chrome (MRamme), IKKE V2Shell — en uinnlogget besøkende
 * har ikke app-navigasjon. Datavis-primitivene (Kort/TallHero/Trend/FordelingRad/
 * InnsiktChip) er de kanoniske fra "@/components/v2"; marketing-idiomene er lokale
 * her, 1:1 med mockup-kilden (større type, mer luft — samme palett).
 *
 * Fluid motpart til mockupens faste device-frame: full viewport + JS-breakpoint
 * (useMobile) for stablet/side-om-side. Ekte dark-scope. Kun T.* + rgba/color-mix
 * (ingen rå hex). Norsk bokmål æøå. Ekte skjermtekst fra mockup-fasit (docs/
 * skjermtekst M1) — ingen oppdiktet copy. Coaching-kanon: Markus Røinås Pedersen.
 */

import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { MMobilMeny } from "./marked-ramme";
import { T } from "@/lib/v2/tokens";
import {
  Icon,
  LogoAK,
  Caps,
  Kort,
  TallHero,
  Trend,
  FordelingRad,
  InnsiktChip,
} from "@/components/v2";

/* ── Marketing-tokens (litt større type, mer luft — samme palett) ── */
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

/** Fluid breakpoint (default desktop → unngår hydrerings-hopp). */
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

/* ── Ramme: toppnav + innhold + footer ─────────────────── */
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
      {/* <main>-landemerke — samme a11y-fiks som delt marked-ramme.tsx. */}
      <main style={{ flex: 1 }}>{children}</main>
      <MFot mobile={mobile} />
    </div>
  );
}

/* ── Tekst- og CTA-primitiver (marketing-skala) ────────── */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Caps size={11} style={{ marginBottom: 18 }}>
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
        lineHeight: 1.02,
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

function MCta({
  children,
  ghost,
  small,
  icon,
  href,
}: {
  children: ReactNode;
  ghost?: boolean;
  small?: boolean;
  icon?: string;
  href?: string;
}) {
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
    <div style={{ paddingTop: mobile ? M.padMY : M.padDY, paddingBottom: mobile ? M.padMY : M.padDY, paddingLeft: mobile ? M.padMX : M.padDX, paddingRight: mobile ? M.padMX : M.padDX, ...style }}>
      <div style={{ maxWidth: M.maxw, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

/* ── Produkt-skjermbilde: gradient-ramme rundt en mini app-mock ── */
function SkjermPlassholder({ mobile }: { mobile: boolean }) {
  return (
    <div
      style={{
        padding: 1.5,
        borderRadius: 24,
        background: `linear-gradient(140deg, ${T.lime} 0%, rgba(209,248,67,0.06) 30%, rgba(0,88,64,0.7) 100%)`,
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          background: T.bg,
          borderRadius: 23,
          padding: mobile ? "16px 14px" : "24px 26px",
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "1.4fr 1fr",
          gap: 14,
        }}
      >
        <Kort tint eyebrow="Strokes gained · siste 4 runder">
          <TallHero value="+1,8" unit="SG totalt" delta="+0,6" dir="up" size={mobile ? 40 : 52} accent />
          <div style={{ marginTop: 16 }}>
            <Trend series={[-0.4, 0.2, -0.1, 0.8, 0.6, 1.2, 1.8]} height={mobile ? 70 : 88} xLabels={["MAI", "JUN", "JUL"]} />
          </div>
        </Kort>
        {!mobile && (
          <Kort eyebrow="Størst gevinst å hente">
            <div>
              <FordelingRad signal code="NÆR" pct={64} value="−1,2" neg />
              <FordelingRad signal code="PUTT" pct={38} value="−0,5" neg />
              <FordelingRad signal code="INN" pct={22} value="+0,3" />
              <FordelingRad signal code="TEE" pct={18} value="+0,4" last />
            </div>
            <div style={{ marginTop: 12 }}>
              <InnsiktChip cta="Se planen">Nærspill koster deg mest. Planen din prioriterer det nå.</InnsiktChip>
            </div>
          </Kort>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   M1. FORSIDE (/)
   ════════════════════════════════════════════════════════ */
const PROPS: { i: string; t: string; d: string }[] = [
  { i: "bar-chart", t: "Analyse", d: "Strokes gained på hver del av spillet. Se nøyaktig hvor du taper slag, mot nivået du sikter på." },
  { i: "calendar", t: "Plan", d: "En treningsplan som lukker gapet. Bygget rundt dine tall, oppdatert etter hver runde og økt." },
  { i: "user", t: "Coaching", d: "Coachen ser det samme som deg. Personlig oppfølging bygget på data, ikke magefølelse." },
];

const BEVIS: { v: string; l: string }[] = [
  { v: "120+", l: "Aktive spillere" },
  { v: "9 500", l: "Økter loggført" },
  { v: "4 av 5", l: "Senker snittscoren første sesong" },
];

export function MarkedForsideV2() {
  const mobile = useMobile();
  return (
    <MRamme mobile={mobile} aktiv="hjem">
      {/* Hero */}
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 36 : 56 }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow>AK Golf</Eyebrow>
          <HeroT mobile={mobile} em="trenger">
            Tren på det du
          </HeroT>
          <Lede style={{ marginTop: 22 }}>
            Strokes gained, plan og coach i samme app. Se hvor du taper slag, og få en plan som lukker gapet.
          </Lede>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30, alignItems: "center" }}>
            <MCta href="/auth/signup">Kom i gang gratis</MCta>
            <MCta ghost icon="arrow-right" href="/playerhq">
              Se hvordan det virker
            </MCta>
          </div>
        </div>
      </Seksjon>

      {/* Produkt-skjermbilde */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0, paddingBottom: mobile ? 36 : 64 }}>
        <SkjermPlassholder mobile={mobile} />
      </Seksjon>

      {/* Tre verdiprop-kort */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Caps>Slik virker det</Caps>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)",
            gap: T.gap,
            marginTop: 18,
          }}
        >
          {PROPS.map((p, i) => (
            <Kort key={p.t} tint={i === 0} pad="22px 22px 24px">
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(209,248,67,0.10)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Icon name={p.i} size={18} style={{ color: T.lime }} />
              </span>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg, letterSpacing: "-0.02em" }}>
                {p.t}
              </div>
              <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: "9px 0 0" }}>{p.d}</p>
            </Kort>
          ))}
        </div>
      </Seksjon>

      {/* Sosialt bevis-stripe */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 12 : 24, paddingBottom: mobile ? 12 : 24 }}>
        <div
          style={{
            borderTop: `1px solid ${T.border}`,
            borderBottom: `1px solid ${T.border}`,
            padding: mobile ? "26px 0" : "32px 0",
            display: "flex",
            flexDirection: mobile ? "column" : "row",
            alignItems: mobile ? "flex-start" : "center",
            gap: mobile ? 22 : 0,
          }}
        >
          <span style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, flex: 1, paddingRight: 24 }}>
            Brukt av spillere fra junior til aspirerende Tour.
          </span>
          <div style={{ display: "flex", gap: mobile ? 28 : 48 }}>
            {BEVIS.map((b) => (
              <span key={b.l}>
                <span
                  style={{
                    display: "block",
                    fontFamily: T.mono,
                    fontSize: 26,
                    fontWeight: 700,
                    color: T.fg,
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {b.v}
                </span>
                <Caps size={8.5} style={{ marginTop: 5 }}>
                  {b.l}
                </Caps>
              </span>
            ))}
          </div>
        </div>
      </Seksjon>

      {/* Slutt-CTA */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 36 : 64 }}>
        <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
          <SeksT mobile={mobile} em="gratis">
            Prøv PlayerHQ i én måned,
          </SeksT>
          <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.6, margin: "14px 0 0" }}>
            Ingen binding. Full tilgang til analyse, plan og loggføring fra dag én.
          </p>
          <div style={{ marginTop: 24 }}>
            <MCta href="/auth/signup">Start gratis prøving</MCta>
          </div>
        </div>
      </Seksjon>
    </MRamme>
  );
}
