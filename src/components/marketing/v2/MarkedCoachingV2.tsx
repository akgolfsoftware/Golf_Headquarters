"use client";

/**
 * AK Golf HQ v2 — Markedsside COACHING (/coaching), retning C «Presis», mørk.
 * 1:1 mot mockup-fasit ui_kits/v2/marketing.jsx → funksjon Coaching.
 * Marketing-idiomene (MRamme/MNav/MFot/Eyebrow/HeroT/SeksT/Lede/MCta/Seksjon/
 * Foto/HjelpNote/Punkt) er lokale i denne fila (marketing-egen chrome, IKKE
 * V2Shell), bygget av v2-primitiver + T-tokens. Ekte copy speilet fra
 * src/app/(marketing)/coaching/page.tsx + docs/skjermtekst. Kanon-coach:
 * Markus Røinås Pedersen (ekte navn på markedssidene — aldri byttet ut).
 * Ingen priser hardkodes: coaching-pakke = antall økter, ikke app-nivå;
 * pris avtales i samtalen (299 kr/mnd-kanon uberørt).
 */
import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { MMobilMeny } from "./marked-ramme";
import { Kort, Caps, StatusPill, AvatarInit, LogoAK } from "@/components/v2";

/* ── Marketing-skala (litt større type, mer luft — samme palett) ── */
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

/* true under 768px — speiler mockupens `mobile`-bryter for layout. */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}

/* ── Ramme: toppnav + innhold + footer ─────────────────── */
const MNAV = [
  { id: "hjem", l: "Hjem" },
  { id: "coaching", l: "Coaching" },
  { id: "playerhq", l: "PlayerHQ" },
  { id: "priser", l: "Priser" },
];
function MNav({ mobile, aktiv }: { mobile: boolean; aktiv: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: mobile ? "16px 22px" : "20px 64px", borderBottom: `1px solid ${T.border}`, position: "relative" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <LogoAK size={24} />

      </span>
      {!mobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {MNAV.map((n) => (
            <span key={n.id} style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 600, color: aktiv === n.id ? T.fg : T.fg2, cursor: "pointer", borderBottom: aktiv === n.id ? `2px solid ${T.lime}` : "2px solid transparent", paddingBottom: 2 }}>{n.l}</span>
          ))}
        </div>
      )}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        {!mobile && <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg2, cursor: "pointer" }}>Logg inn</span>}
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
    <div style={{ minHeight: "100vh", background: `radial-gradient(1100px 520px at 30% -10%, color-mix(in srgb, ${T.forest} 20%, transparent), transparent 62%), ${T.bg}`, display: "flex", flexDirection: "column" }}>
      <MNav mobile={mobile} aktiv={aktiv} />
      <div style={{ flex: 1 }}>{children}</div>
      <MFot mobile={mobile} />
    </div>
  );
}

/* ── Tekst- og CTA-primitiver (marketing-skala) ────────── */
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

/* Coach-foto: ekte bilde om det finnes, ellers gradient-plassholder m/ initialer. */
function Foto({ navn, mobile, src }: { navn: string; mobile: boolean; src?: string }) {
  const ramme: CSSProperties = { width: mobile ? "100%" : 340, height: mobile ? 300 : 400, flex: "none", borderRadius: 24, border: `1px solid ${T.borderS}`, position: "relative", overflow: "hidden" };
  if (src) {
    return (
      <div style={ramme}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={navn} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  return (
    <div style={{ ...ramme, background: `linear-gradient(160deg, ${T.forest} 0%, color-mix(in srgb, ${T.forest} 55%, ${T.panel}) 45%, ${T.panel} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 64, color: "color-mix(in srgb, " + T.fg + " 28%, transparent)", letterSpacing: "-0.03em" }}>{navn.split(" ").map((x) => x[0]).join("")}</span>
      <span style={{ position: "absolute", left: 16, bottom: 14, display: "inline-flex", alignItems: "center", gap: 7 }}>
        <Icon name="image" size={13} style={{ color: T.mut }} />
        <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>Foto kommer</span>
      </span>
    </div>
  );
}
/* Hjelpe-note («?») — klargjør uten å rope. */
function HjelpNote({ tittel, children }: { tittel?: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 15px", borderRadius: 14, background: T.panel2, border: `1px solid ${T.border}` }}>
      <span style={{ width: 20, height: 20, flex: "none", borderRadius: 9999, border: `1px solid ${T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.lime, marginTop: 1 }}>?</span>
      <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55 }}>
        {tittel && <strong style={{ color: T.fg, fontWeight: 600 }}>{tittel} </strong>}{children}
      </span>
    </div>
  );
}
function Punkt({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: "flex", gap: 9, alignItems: "flex-start", fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.55 }}>
      <Icon name="check" size={14} style={{ color: T.lime, flex: "none", marginTop: 3 }} />{children}
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   M3. COACHING (/coaching)
   ════════════════════════════════════════════════════════ */
type Pakke = { navn: string; okter: string; frem?: boolean; pkt: string[] };
const PAKKER: Pakke[] = [
  {
    navn: "Performance",
    okter: "2 økter per måned",
    pkt: [
      "Faste økter med coachen din",
      "Treningsplan i PlayerHQ, oppdatert etter hver økt",
      "PlayerHQ inkludert, uten månedspris",
      "Meldingskontakt mellom øktene",
    ],
  },
  {
    navn: "Performance Pro",
    okter: "4 økter per måned",
    frem: true,
    pkt: [
      "Alt i Performance",
      "Dobbelt så mange økter med coach",
      "TrackMan-økter og videoanalyse",
      "Oppfølging rundt turneringer",
    ],
  },
];

export function MarkedCoachingV2() {
  const mobile = useMobile();
  return (
    <MRamme mobile={mobile} aktiv="coaching">
      {/* Hero + coach-presentasjon */}
      <Seksjon mobile={mobile}>
        <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 32 : 56, alignItems: mobile ? "stretch" : "center" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow>Coaching · Abonnement</Eyebrow>
            <HeroT mobile={mobile} em="fremgang">Coaching som gir</HeroT>
            <Lede style={{ marginTop: 22 }}>Som abonnent får du 2 eller 4 coaching-timer hver måned. Du booker dem selv fra PlayerHQ når det passer deg, og får en plan, statistikk og oppfølging mellom øktene.</Lede>
            <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 13 }}>
              <AvatarInit navn="Markus Røinås Pedersen" size={42} />
              <span>
                <span style={{ display: "block", fontFamily: T.ui, fontSize: 15, fontWeight: 600, color: T.fg }}>Markus Røinås Pedersen</span>
                <span style={{ display: "block", fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 2 }}>Head Coach, AK Golf Academy</span>
              </span>
            </div>
            <div style={{ marginTop: 26 }}><MCta href="/booking">Book en samtale</MCta></div>
          </div>
          <Foto navn="Markus Røinås Pedersen" mobile={mobile} src="/images/akademy/coach-observerer.jpg" />
        </div>
      </Seksjon>

      {/* Pakkene */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Caps>Coaching-pakker</Caps>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: T.gap, marginTop: 18 }}>
          {PAKKER.map((p) => (
            <Kort key={p.navn} tint={p.frem} pad="24px 24px 26px">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 21, color: T.fg, letterSpacing: "-0.02em" }}>{p.navn}</span>
                {p.frem && <StatusPill>Mest valgt</StatusPill>}
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.lime, display: "block", marginTop: 8 }}>{p.okter}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
                {p.pkt.map((x) => <Punkt key={x}>{x}</Punkt>)}
              </div>
              <div style={{ marginTop: 22 }}>
                <MCta ghost={!p.frem} small href="/booking">Book en samtale</MCta>
              </div>
            </Kort>
          ))}
        </div>
        <div style={{ marginTop: T.gap, maxWidth: 640 }}>
          <HjelpNote tittel="Hva er en coaching-pakke?">Antall økter med coach per måned, ikke et app-nivå. Appen PlayerHQ er den samme for alle, og er inkludert uten månedspris så lenge du har pakke. Pris avtales i samtalen, den avhenger av opplegg og reisevei.</HjelpNote>
        </div>
      </Seksjon>

      {/* Booking-CTA */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 20 : 32 }}>
        <Kort tint pad={mobile ? "26px 22px" : "36px 40px"}>
          <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "center", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <SeksT mobile={mobile} em="samtale">Start med en</SeksT>
              <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 480 }}>Uforpliktende prat om spillet ditt og hva du vil oppnå. Så finner vi opplegget som passer.</p>
            </div>
            <MCta icon="arrow-right" href="/booking">Book en samtale</MCta>
          </div>
        </Kort>
      </Seksjon>
    </MRamme>
  );
}
