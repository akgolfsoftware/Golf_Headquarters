"use client";

/* AK Golf HQ v2 — MARKEDSSIDE: PlayerHQ-produktside (retning C «Presis», mørk).
   Port av ui_kits/v2/marketing.jsx → funksjon PlayerHQSide (M2), 1:1 layout +
   ekte copy. Marketing har EGEN chrome (MRamme = MNav + innhold + MFot), IKKE
   V2Shell. Fluid motpart til mockupens faste 1280/390px device-frame — samme
   uttrykk, men full bredde og responsiv (mobile-deteksjon via matchMedia).
   Marketing-idiomene (HeroT/Lede/SeksT/Seksjon/Eyebrow/Punkt/MCta/TelefonMock)
   er lokale her (1:1 mockup), bygget av v2-primitiver + T-tokens.
   Kanon: 299 kr/mnd, «nærspill», anbefalinger aldri sperrer, Lucide via Icon. */

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { T, type AkseKey } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { MMobilMeny } from "./marked-ramme";
import {
  Caps,
  FordelingRad,
  InnsiktChip,
  LogoAK,
  Rad,
  TallHero,
} from "@/components/v2";

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
} as const;

/* ── Responsiv mobile-deteksjon (marketing er full bredde, ikke device-frame) ── */
function useMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return mobile;
}

/* ── Ramme: toppnav + innhold + footer ─────────────────── */
const MNAV = [
  { id: "hjem", l: "Hjem" },
  { id: "coaching", l: "Coaching" },
  { id: "playerhq", l: "PlayerHQ" },
  { id: "priser", l: "Priser" },
] as const;

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
    <div className="dark" style={{ width: "100%", minHeight: "100vh", background: `radial-gradient(1100px 520px at 30% -10%, rgba(0,88,64,0.20), transparent 62%), ${T.bg}`, display: "flex", flexDirection: "column" }}>
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

/* Telefon-mockup-plassholder m/ valgfritt mini-innhold */
function TelefonMock({ mobile, children, label }: { mobile: boolean; children: ReactNode; label?: string }) {
  return (
    <div style={{ width: mobile ? 230 : 260, flex: "none", margin: "0 auto" }}>
      <div style={{ borderRadius: 34, border: `1px solid ${T.borderS}`, background: T.panel, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 48px rgba(0,0,0,0.45)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px" }}>
          <span style={{ width: 70, height: 5, borderRadius: 9999, background: T.panel3 }} />
        </div>
        <div style={{ padding: "12px 14px 18px", display: "flex", flexDirection: "column", gap: 10, minHeight: 280 }}>
          {label && <Caps size={8.5}>{label}</Caps>}
          {children}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   M2. PLAYERHQ-PRODUKTSIDE (/playerhq)
   ════════════════════════════════════════════════════════ */
interface Feature {
  eyebrow: string;
  tittel: string;
  em: string;
  tekst: string;
  mock: ReactNode;
}

export function MarkedPlayerHQV2() {
  const mobile = useMobile();

  const planRader: Array<[string, string, AkseKey]> = [
    ["Nærspill 30 til 60 m", "I dag · 60 min", "SPILL"],
    ["FYS styrke", "I morgen · 45 min", "FYS"],
    ["Teknikk P4", "Torsdag · 90 min", "TEK"],
  ];
  const tallRader: Array<[string, string]> = [
    ["DRIVER", "248 m"],
    ["JERN 7", "152 m"],
    ["PW", "108 m"],
    ["SW 56°", "78 m"],
  ];

  const features: Feature[] = [
    {
      eyebrow: "Strokes gained i dybden",
      tittel: "Se hvor slagene",
      em: "forsvinner",
      tekst: "Appen forteller deg hva du taper mest på og hva du skal trene. Ikke gjetting, ikke generiske råd. Tee, innspill, nærspill og putting, målt mot nivået du sikter på.",
      mock: (
        <>
          <TallHero label="SG totalt" value="+1,8" delta="+0,6" dir="up" size={34} accent />
          <div>
            <FordelingRad signal code="NÆR" pct={64} value="−1,2" neg />
            <FordelingRad signal code="PUTT" pct={38} value="−0,5" neg />
            <FordelingRad signal code="TEE" pct={18} value="+0,4" last />
          </div>
        </>
      ),
    },
    {
      eyebrow: "TrackMan per kølle",
      tittel: "Tallene dine,",
      em: "kølle for kølle",
      tekst: "Lengder, spredning og treffbilde per kølle, rett fra TrackMan. Du vet nøyaktig hva en 7-er går, ikke hva du håper den går.",
      mock: (
        <>
          {tallRader.map(([k, v], i) => (
            <Rad
              key={k}
              title={k}
              sub="Snitt siste 30 slag"
              trailing={null}
              last={i === tallRader.length - 1}
              meta={<span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{v}</span>}
            />
          ))}
        </>
      ),
    },
    {
      eyebrow: "Plan fra coachen din",
      tittel: "En uke som er",
      em: "din",
      tekst: "Treningsplanen bygges rundt tallene dine og oppdateres av coachen. Du åpner appen og vet hva du skal gjøre i dag, og hvorfor.",
      mock: (
        <>
          {planRader.map(([t, s, a], i) => (
            <Rad
              key={t}
              title={t}
              sub={s}
              trailing={null}
              last={i === planRader.length - 1}
              naa={i === 0}
              leading={<span style={{ width: 3, height: 30, borderRadius: 2, background: T.ax[a], flex: "none" }} />}
            />
          ))}
        </>
      ),
    },
    {
      eyebrow: "AI-caddie",
      tittel: "Svar når du",
      em: "lurer",
      tekst: "Still spørsmål om spillet ditt og få svar basert på dine egne tall. Caddien foreslår, du og coachen bestemmer. Anbefalinger, aldri sperrer.",
      mock: (
        <>
          <InnsiktChip>Du taper mest fra 30 til 60 m. Torsdagens økt trener akkurat det.</InnsiktChip>
          <InnsiktChip cta="Se runden">Siste runde: putting løftet seg, +0,7 mot snittet ditt.</InnsiktChip>
        </>
      ),
    },
  ];

  return (
    <MRamme mobile={mobile} aktiv="playerhq">
      {/* Hero */}
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 28 : 48 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow>PlayerHQ</Eyebrow>
          <HeroT mobile={mobile} em="målt og planlagt">Din golf,</HeroT>
          <Lede style={{ margin: "22px auto 0" }}>Appen forteller deg hva du taper mest på og hva du skal trene. Ikke gjetting, ikke generiske råd.</Lede>
          <div style={{ marginTop: 28 }}><MCta>Prøv gratis i én måned</MCta></div>
        </div>
      </Seksjon>
      {/* Feature-seksjoner m/ telefon-mockups */}
      {features.map((f, i) => (
        <Seksjon key={f.eyebrow} mobile={mobile} style={{ paddingTop: mobile ? 28 : 56, paddingBottom: mobile ? 28 : 56 }}>
          <div style={{ display: "flex", flexDirection: mobile ? "column" : i % 2 ? "row-reverse" : "row", gap: mobile ? 26 : 64, alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Caps size={10} color={T.lime} style={{ marginBottom: 14 }}>{f.eyebrow}</Caps>
              <SeksT mobile={mobile} em={f.em}>{f.tittel}</SeksT>
              <p style={{ fontFamily: T.ui, fontSize: 14.5, color: T.fg2, lineHeight: 1.65, margin: "14px 0 0", maxWidth: 440 }}>{f.tekst}</p>
            </div>
            <TelefonMock mobile={mobile} label={f.eyebrow}>{f.mock}</TelefonMock>
          </div>
        </Seksjon>
      ))}
      {/* Slutt-CTA */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 20 : 32 }}>
        <div style={{ textAlign: "center" }}>
          <SeksT mobile={mobile} em="fremgangen">Følg</SeksT>
          <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, margin: "12px 0 0" }}>Gratis i én måned. Deretter 299 kr per måned, eller inkludert i coaching-pakke.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
            <MCta>Prøv gratis i én måned</MCta>
            <MCta ghost icon="arrow-right">Se priser</MCta>
          </div>
        </div>
      </Seksjon>
    </MRamme>
  );
}
