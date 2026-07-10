"use client";

/* AK Golf HQ v2 — MARKEDSSIDE: Priser (M4, akgolf.no, retning C «Presis»).
   1:1-port av ui_kits/v2/marketing.jsx → funksjon Priser, med ekte norsk copy
   fra docs/skjermtekst/skjerm-tekst-hovedskjermer.md (M4) og den eksisterende
   /priser-siden. 299 kr/mnd-kanon: gratis via prøveperiode / coaching-pakke /
   gruppe, ellers 299 kr/mnd. Coaching-pakker (Performance / Performance Pro) =
   antall økter, IKKE app-nivåer. ELITE finnes ikke.

   Marketing-rammen (MNav/MFot/MRamme) og tekst-idiomene (Eyebrow/HeroT/Lede/
   MCta/Seksjon/Punkt/HjelpNote) er lokale i denne fila (marketing har egen
   chrome, ikke V2Shell) og bygget av v2-primitiver + T-tokens. */

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { T } from "@/lib/v2/tokens";
import { Caps, Kort, LogoAK, StatusPill } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { MMobilMeny } from "./marked-ramme";

/* ── Marketing-tokens (litt større type, mer luft — samme palett) ── */
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

/* Enkel breakpoint-hook (marketing er responsiv, ikke fast device-ramme). */
function useIsMobile(bp = 768): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [bp]);
  return mobile;
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
        {mobile ? <MMobilMeny aktiv={aktiv} /> : <MCta small>Kom i gang gratis</MCta>}
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
    <div style={{ minHeight: "100vh", background: `radial-gradient(1100px 520px at 30% -10%, rgba(0,88,64,0.20), transparent 62%), ${T.bg}`, display: "flex", flexDirection: "column" }}>
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

function Lede({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <p style={{ fontFamily: T.ui, fontSize: M.lede, color: T.fg2, lineHeight: 1.65, margin: 0, maxWidth: 560, ...style }}>{children}</p>;
}

function MCta({ children, ghost, small, icon }: { children: ReactNode; ghost?: boolean; small?: boolean; icon?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.ui, fontWeight: 600, fontSize: small ? 13 : 15, color: ghost ? T.fg : T.onLime, background: ghost ? T.panel3 : T.lime, border: ghost ? `1px solid ${T.borderS}` : "none", borderRadius: 9999, padding: small ? "9px 18px" : "14px 28px", cursor: "pointer", whiteSpace: "nowrap" }}>
      {children}{icon && <Icon name={icon} size={small ? 13 : 15} />}
    </span>
  );
}

function Seksjon({ mobile, children, style }: { mobile: boolean; children: ReactNode; style?: CSSProperties }) {
  return <div style={{ padding: mobile ? M.padM : M.padD, ...style }}><div style={{ maxWidth: M.maxw, margin: "0 auto" }}>{children}</div></div>;
}

/* Hjelpe-note («?») — klargjør uten å rope */
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

/* ── Data (ekte copy — skjermtekst M4 + eksisterende /priser) ────────── */
const FAQ = [
  { q: "Hvordan får jeg PlayerHQ gratis?", a: "Tre veier: én måneds prøveperiode for alle nye spillere, coaching-pakke (Performance eller Performance Pro) der appen er inkludert, eller gruppe via AK Golf, for eksempel WANG eller klubbtrening." },
  { q: "Hva er forskjellen på coaching-pakker og appen?", a: "Coaching-pakkene handler om antall økter med coach per måned, ikke om app-funksjoner. Appen er den samme for alle med tilgang, ingen nivåer, ingenting låst bak dyrere trinn." },
  { q: "Kan jeg si opp når som helst?", a: "Ja. Abonnementet løper måned for måned uten binding, og du beholder tilgangen ut perioden du har betalt for." },
  { q: "Hva skjer etter prøveperioden?", a: "Du velger selv: fortsett for 299 kr per måned, gå videre med en coaching-pakke der appen er inkludert, eller la kontoen hvile. Dataene dine slettes ikke." },
];

/* ════════════════════════════════════════════════════════
   M4. PRISER (/priser)
   ════════════════════════════════════════════════════════ */
export function MarkedPriserV2() {
  const mobile = useIsMobile();
  const [open, setOpen] = useState(0);

  return (
    <MRamme mobile={mobile} aktiv="priser">
      {/* Hero */}
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 28 : 48 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow>Priser</Eyebrow>
          <HeroT mobile={mobile} em="ærlig">Enkelt og</HeroT>
          <Lede style={{ margin: "20px auto 0" }}>Én app, to måter å ha den på. Coaching-pakker med antall økter kjøpes separat, de er ikke app-nivåer.</Lede>
        </div>
      </Seksjon>

      {/* Pris-kort */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: T.gap, maxWidth: 820, margin: "0 auto" }}>
          <Kort pad="26px 26px 28px">
            <Caps>Gratis</Caps>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14 }}>
              <span style={{ fontFamily: T.mono, fontSize: 44, fontWeight: 700, color: T.fg, lineHeight: 0.9, letterSpacing: "-0.03em" }}>0 kr</span>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "12px 0 0" }}>Full app, uten månedspris, hvis ett av dette gjelder deg:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              <Punkt>Én måneds prøveperiode, for alle nye</Punkt>
              <Punkt>Coaching-pakke: Performance eller Performance Pro</Punkt>
              <Punkt>Gruppe via AK Golf, som WANG eller klubbtrening</Punkt>
            </div>
            <div style={{ marginTop: 22 }}><MCta ghost small>Kom i gang gratis</MCta></div>
          </Kort>

          <Kort tint pad="26px 26px 28px" style={{ borderColor: "rgba(209,248,67,0.35)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <Caps color={T.lime}>Pro</Caps>
              <StatusPill>Full tilgang</StatusPill>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14 }}>
              <span style={{ fontFamily: T.mono, fontSize: 44, fontWeight: 700, color: T.fg, lineHeight: 0.9, letterSpacing: "-0.03em" }}>299</span>
              <span style={{ fontFamily: T.mono, fontSize: 14, color: T.mut }}>kr/mnd</span>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "12px 0 0" }}>For deg som trener på egen hånd, uten pakke eller gruppe.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              <Punkt>Strokes gained-analyse og runder</Punkt>
              <Punkt>Treningsplan og loggføring</Punkt>
              <Punkt>TrackMan-data og video</Punkt>
              <Punkt>AI-caddie og prioritert støtte</Punkt>
            </div>
            <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <MCta small>Velg Pro</MCta>
              <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>Eller 2 690 kr/år, to måneder gratis.</span>
            </div>
          </Kort>
        </div>
        <div style={{ maxWidth: 820, margin: `${T.gap}px auto 0` }}>
          <HjelpNote tittel="Coaching-pakker kjøpes separat.">Performance og Performance Pro er antall økter med coach, ikke app-nivåer. Har du pakke, er appen inkludert. Les mer på coaching-siden.</HjelpNote>
        </div>
      </Seksjon>

      {/* FAQ-trekkspill */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 28 : 48 }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <Caps>Ofte stilt</Caps>
          <div style={{ marginTop: 14, background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rCard, padding: "4px 20px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.045), 0 12px 32px rgba(0,0,0,0.35)" }}>
            {FAQ.map((f, i) => {
              const on = open === i;
              return (
                <div key={f.q} style={{ borderBottom: i === FAQ.length - 1 ? "none" : `1px solid ${T.border}` }}>
                  <button onClick={() => setOpen(on ? -1 : i)} style={{ appearance: "none", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 0" }}>
                    <span style={{ fontFamily: T.ui, fontSize: 14.5, fontWeight: 600, color: T.fg }}>{f.q}</span>
                    <Icon name={on ? "minus" : "plus"} size={15} style={{ color: on ? T.lime : T.mut, flex: "none" }} />
                  </button>
                  {on && <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.65, margin: "0 0 17px", maxWidth: 560 }}>{f.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </Seksjon>
    </MRamme>
  );
}
