"use client";

/**
 * AK Golf HQ v2 — Markedsside TRENINGSFILOSOFI (/treningsfilosofi), retning C
 * «Presis», mørk. Marketing-idiomene er lokale i denne fila, 1:1 mønster med
 * MarkedForsideV2.tsx. Ekte copy speilet fra
 * src/app/(marketing)/(mlegacy)/treningsfilosofi/page.tsx. AK-pyramiden bruker
 * T.ax-aksefargene (FYS/TEK/SLAG/SPILL/TURN), SG-boksene er nøytrale. Norsk
 * bokmål æøå.
 */
import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { MMobilMeny } from "./marked-ramme";
import Image from "next/image";
import { T, type AkseKey } from "@/lib/v2/tokens";
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

function Foto({ src, alt, mobile }: { src: string; alt: string; mobile: boolean }) {
  return (
    <div style={{ position: "relative", width: "100%", height: mobile ? 220 : 380, borderRadius: 24, overflow: "hidden", border: `1px solid ${T.borderS}` }}>
      <Image src={src} alt={alt} fill sizes="(max-width: 860px) 100vw, 1040px" style={{ objectFit: "cover" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(13,14,13,0) 55%, rgba(13,14,13,0.55) 100%)" }} />
    </div>
  );
}

const PYRAMIDE: { kort: AkseKey; navn: string; tekst: string }[] = [
  { kort: "FYS", navn: "Fysisk", tekst: "Rotasjon, mobilitet og kjernemuskulatur er fundamentet alt annet bygger på. Har du ikke basen, fester ikke tekniske endringer seg, uansett hvor mange repetisjoner du tar." },
  { kort: "TEK", navn: "Teknisk", tekst: "Sving, grep, impact og club-path, analysert med Trackman som fasit. Vi bygger en sving du kan stole på under press, ikke én som bare ser bra ut på video." },
  { kort: "SLAG", navn: "Slag", tekst: "60–65 % av alle slag skjer innen 100 meter fra flagget. Chip, pitch, putt og bunkerspill trenes systematisk, for det er her de fleste slag hentes." },
  { kort: "SPILL", navn: "Spill", tekst: "Riktig valg er like viktig som riktig utførelse. Vi trener beslutninger, risk/reward og banetilpasning, slik at du skårer lavere med svingene du allerede har." },
  { kort: "TURN", navn: "Turnering", tekst: "Alt du øver på må holde når det gjelder. Pre-shot rutine, fokusstrategi og press-håndtering, slik at du er den samme spilleren i runde to som i treningsrunden." },
];

const SG: { kort: string; navn: string; tekst: string }[] = [
  { kort: "OTT", navn: "Off The Tee", tekst: "Drives og lengde-slag fra utslag" },
  { kort: "APP", navn: "Approach", tekst: "Innspill til grønn fra fairway/rough" },
  { kort: "ARG", navn: "Around the Green", tekst: "Chip, pitch og korthold" },
  { kort: "PUTT", navn: "Putting", tekst: "Alle slag på grønnen" },
];

export function MarkedTreningsfilosofiV2() {
  const mobile = useMobile();
  return (
    <MRamme mobile={mobile} aktiv="treningsfilosofi">
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 28 : 40 }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow>Slik trener vi</Eyebrow>
          <HeroT mobile={mobile} em="er balansert, målbar og din egen.">Trening som</HeroT>
          <Lede style={{ marginTop: 22 }}>
            Vi tror ikke på trening-flavor-of-the-week. Hver spiller får en plan basert på tre prinsipper: balansert pyramide, data-drevet retning, og individualisering på alvor.
          </Lede>
        </div>
      </Seksjon>

      <Seksjon mobile={mobile} style={{ paddingTop: 0, paddingBottom: mobile ? 28 : 48 }}>
        <Foto src="/images/akademy/putting-vann.jpg" alt="To spillere på putting-grønn med vann-refleksjon i forgrunnen" mobile={mobile} />
      </Seksjon>

      {/* Prinsipp 1: Pyramiden */}
      <Seksjon mobile={mobile}>
        <Caps>Prinsipp 1 · Pyramiden</Caps>
        <div style={{ marginTop: 8 }}>
          <SeksT mobile={mobile} em="samtidig.">Fem områder,</SeksT>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 14.5, color: T.fg2, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 560 }}>
          Fem områder må jobbes med samtidig, ikke ett etter et. Vi sørger for at tiden din fordeles riktig.
        </p>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          {PYRAMIDE.map((p) => (
            <Kort key={p.kort} pad="20px 22px" style={{ flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "center", gap: 16 }}>
              <span style={{ flex: "none", width: 56, height: 40, borderRadius: 10, background: `color-mix(in srgb, ${T.ax[p.kort]} 20%, transparent)`, color: T.ax[p.kort], display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
                {p.kort}
              </span>
              <div>
                <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, letterSpacing: "-0.015em" }}>{p.navn}</div>
                <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.55, margin: "5px 0 0" }}>{p.tekst}</p>
              </div>
            </Kort>
          ))}
        </div>
      </Seksjon>

      {/* Prinsipp 2: Strokes Gained */}
      <Seksjon mobile={mobile}>
        <Caps>Prinsipp 2 · Strokes Gained</Caps>
        <div style={{ marginTop: 8 }}>
          <SeksT mobile={mobile} em="hvor du skal trene.">Data forteller</SeksT>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 14.5, color: T.fg2, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 600 }}>
          Vi bruker Strokes Gained (SG) til å se nøyaktig hvor du taper slag mot ditt nivå. Det betyr at planen din peker på det som faktisk koster deg slag, ikke det som føles dårligst.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: T.gap, marginTop: 22 }}>
          {SG.map((s) => (
            <Kort key={s.kort} pad="18px 18px 20px">
              <Caps size={10.5} color={T.lime}>{s.kort}</Caps>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15.5, color: T.fg, letterSpacing: "-0.015em", marginTop: 8 }}>{s.navn}</div>
              <p style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.5, margin: "6px 0 0" }}>{s.tekst}</p>
            </Kort>
          ))}
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 14.5, color: T.fg2, lineHeight: 1.6, margin: "22px 0 0", maxWidth: 620 }}>
          Etter 3–5 registrerte runder ser vi et klart mønster. Kanskje driver du bedre enn du tror, men taper alt rundt grønnen. Kanskje er innspillene svakheten ingen har fortalt deg om. Planen peker dit dataen peker, ikke dit magefølelsen peker.
        </p>
        <div style={{ marginTop: 28 }}>
          <Foto src="/images/akademy/bunker-shot.jpg" alt="Nærbilde av spiller midt i bunker-shot med sand som spruter" mobile={mobile} />
        </div>
      </Seksjon>

      {/* Prinsipp 3: Individualisering */}
      <Seksjon mobile={mobile}>
        <Caps>Prinsipp 3 · Individualisering</Caps>
        <div style={{ marginTop: 8 }}>
          <SeksT mobile={mobile} em="kopi av en annen.">Ingen plan er</SeksT>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 15, color: T.fg2, lineHeight: 1.6, margin: "16px 0 0", maxWidth: 620 }}>
          Det som virker for en elite-junior, virker ikke for en 50-åring som spiller én gang i uken. Hver plan tar utgangspunkt i tre ting: <strong style={{ color: T.fg, fontWeight: 600 }}>målet ditt</strong>, <strong style={{ color: T.fg, fontWeight: 600 }}>tiden du har tilgjengelig</strong>, og <strong style={{ color: T.fg, fontWeight: 600 }}>ferdighetene du allerede har</strong>. Det er du som setter ambisjonen. Vi sørger for at veien dit er realistisk.
        </p>
      </Seksjon>

      {/* Closing CTA */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 24 : 40 }}>
        <Kort tint pad={mobile ? "32px 24px" : "48px 56px"} style={{ alignItems: "center", textAlign: "center" }}>
          <Caps size={11} color={T.lime}>Neste steg</Caps>
          <div style={{ marginTop: 14 }}>
            <SeksT mobile={mobile} em="slik?">Vil du trene</SeksT>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 14.5, color: T.fg2, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 460 }}>
            Book en intro-time, eller velg en av coaching-pakkene våre med månedlig oppfølging.
          </p>
          <div style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <MCta href="/booking" icon="arrow-right">Book intro-time</MCta>
            <MCta ghost href="/coaching">Se coaching-pakker</MCta>
          </div>
        </Kort>
      </Seksjon>
    </MRamme>
  );
}
