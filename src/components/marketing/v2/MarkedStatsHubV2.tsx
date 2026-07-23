"use client";

/**
 * AK Golf HQ v2 — markedsside STATS-HUB (/stats), retning C, mørk.
 * Ekte copy speilet fra (mlegacy)/stats/page.tsx (hub.jsx-porten). Live-tall
 * (norske i aksjon denne uken, kommende turneringer, siste DataGolf-sync,
 * antall baner) hentes server-side i page.tsx via samme loadere som legacy
 * og sendes inn som props — ingen fabrikerte tall her. Familie-oversikten
 * lenker videre til de seks stats-hovedgruppene via StatsRamme sin subnav.
 */
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps, KpiFlis } from "@/components/v2";
import { StatsRamme, StatsStatusBar, useMobile, type StatsFamilie } from "./stats-ramme";
import { Eyebrow, HeroT, SeksT, Lede, MCta, Seksjon } from "./marked-ramme";

const FAMILIER: {
  id: StatsFamilie;
  navn: string;
  desc: string;
  href: string;
  icon: string;
  foot: string;
}[] = [
  {
    id: "spillere",
    navn: "Norsk spillerbase",
    desc: "1 500+ norske golfspillere. Komplett resultathistorikk fra 10 år med norsk golf.",
    href: "/stats/spillere",
    icon: "users",
    foot: "SØK · FILTER · SAMMENLIGN",
  },
  {
    id: "turneringer",
    navn: "Turneringer",
    desc: "PGA Tour, DP World, LET, Korn Ferry og norske amatørtourer i én kalender.",
    href: "/turneringer",
    icon: "trophy",
    foot: `${(1175).toLocaleString("nb-NO")} TURNERINGER · OPPDATERT DAGLIG`,
  },
  {
    id: "klubber",
    navn: "Klubbdatabase",
    desc: "Pro-talent, college-commits og turneringsdata per klubb.",
    href: "/stats/klubber",
    icon: "building-2",
    foot: "10 KLUBBER · PRO-TALENT · JUNIOR",
  },
  {
    id: "baner",
    navn: "Banedatabase",
    desc: "Slope, CR, turneringsdata og score-distribusjon for norske golfbaner.",
    href: "/stats/baner",
    icon: "flag",
    foot: "BANER · SLOPE · CR",
  },
  {
    id: "leaderboards",
    navn: "Leaderboards",
    desc: "Tverrkategori topp-10 for PGA Tour og norske spillere.",
    href: "/stats/leaderboards",
    icon: "list",
    foot: "TOPP 10 · 6 KATEGORIER",
  },
  {
    id: "verktoy",
    navn: "Golf-verktøy",
    desc: "Score til HCP, Tour-ekvivalent, WHS, SG-estimator og avstandskonverter.",
    href: "/stats/verktoy",
    icon: "settings",
    foot: "5 VERKTØY · GRATIS",
  },
];

const TRENER_STEG = [
  { n: "01", tittel: "Mål svakhet", tekst: "SG-profilen viser nøyaktig hvor strokene tapes: fra teen, innspillet eller på greenen.", icon: "crosshair" },
  { n: "02", tittel: "Bygg drillen", tekst: "Coach lager treningsplan målrettet svakheten. Korte økter, ukentlig fokus.", icon: "dumbbell" },
  { n: "03", tittel: "Følg utvikling", tekst: "SG-trenden viser om treningen virker. Tall, ikke synsing.", icon: "activity" },
];

const PLAYERHQ_FORDELER = [
  "SG-beregning automatisk fra hvert kort",
  "Trenden over hele sesongen, ikke bare siste runde",
  "Sammenlign mot PGA Tour-snitt fra første scorekort",
  "Treningsdagbok med drill-bibliotek",
  "Del med coach: én lenke, full innsikt",
  "Eksporter rådata når du vil. Det er dine tall.",
];

export interface MarkedStatsHubV2Props {
  norskeIAksjon: number;
  kommendeTurneringer: number;
  sisteSync: string;
  totalBaner: number;
}

export function MarkedStatsHubV2({ norskeIAksjon, kommendeTurneringer, sisteSync, totalBaner }: MarkedStatsHubV2Props) {
  const mobile = useMobile();
  const familier = FAMILIER.map((f) => (f.id === "baner" ? { ...f, foot: `${totalBaner} BANER · SLOPE · CR` } : f));

  return (
    <StatsRamme mobile={mobile}>
      {/* Hero */}
      <Seksjon mobile={mobile}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.4fr 1fr", gap: mobile ? 32 : 48, alignItems: "start" }}>
          <div>
            <Eyebrow>AK GOLF STATS</Eyebrow>
            <StatsStatusBar
              label={
                norskeIAksjon > 0
                  ? `${norskeIAksjon} norske i aksjon denne uken`
                  : "Ingen norske i aksjon denne uken"
              }
              tone={norskeIAksjon > 0 ? "up" : "info"}
              meta={`${kommendeTurneringer} turneringer neste 30 d · ${sisteSync}`}
            />
            <HeroT mobile={mobile} em="Gratis. Alltid.">
              All statistikken.
            </HeroT>
            <Lede style={{ marginTop: 22, maxWidth: 520 }}>
              Live PGA Tour-data, norske spillere over hele verden, og verktøy for å sammenligne ditt eget spill mot proffene. Bygget i Norge, åpent for alle.
            </Lede>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 26 }}>
              <MCta icon="arrow-right" href={norskeIAksjon > 0 ? "/stats/norske" : "/stats/spillere"}>
                {norskeIAksjon > 0 ? "Se norske i aksjon" : "Utforsk spillere"}
              </MCta>
              <MCta ghost icon="arrow-down" href="#familier">
                Alle verktøy
              </MCta>
            </div>
          </div>

          <Kort pad="20px 22px">
            {[
              ["Sesong", "2026"],
              ["Turneringer i DB", (1175).toLocaleString("nb-NO")],
              ["PGA-spillere", "1 299"],
              ["Norske spillere", (2497).toLocaleString("nb-NO")],
              ["Siste sync", sisteSync],
            ].map(([label, val], i) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                }}
              >
                <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2 }}>{label}</span>
                <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg }}>{val}</span>
              </div>
            ))}
          </Kort>
        </div>
      </Seksjon>

      {/* KPI-strip */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap }}>
          <KpiFlis label="Denne uken · norske i aksjon" value={norskeIAksjon} />
          <KpiFlis label="Neste 30 dager · turneringer" value={kommendeTurneringer} />
          <Kort>
            <Caps size={9}>Database</Caps>
            <div style={{ marginTop: 12, fontFamily: T.disp, fontWeight: 700, fontSize: 21, color: T.fg }}>
              Oppdatert
            </div>
            <div style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, marginTop: 4 }}>{sisteSync}</div>
          </Kort>
        </div>
      </Seksjon>

      {/* Familier */}
      <div id="familier">
        <Seksjon mobile={mobile}>
          <Caps>Verktøy</Caps>
          <div style={{ marginTop: 14 }}>
            <SeksT mobile={mobile} em="Én plattform.">
              Seks familier.
            </SeksT>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(2, 1fr)", gap: T.gap, marginTop: 24 }}>
            {familier.map((f) => (
              <Link key={f.id} href={f.href} style={{ textDecoration: "none" }}>
                <Kort hover style={{ minHeight: 176 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 10, background: T.panel2, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name={f.icon} size={16} style={{ color: T.lime }} />
                    </span>
                    <Icon name="arrow-right" size={16} style={{ color: T.mut }} />
                  </div>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg, marginTop: 14, letterSpacing: "-0.015em" }}>{f.navn}</div>
                  <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "8px 0 0" }}>{f.desc}</p>
                  <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, marginTop: "auto", paddingTop: 16 }}>
                    {f.foot}
                  </div>
                </Kort>
              </Link>
            ))}
          </div>
        </Seksjon>
      </div>

      {/* Mersalg PlayerHQ */}
      <Seksjon mobile={mobile}>
        <Kort tint pad={mobile ? "26px 22px" : "40px 44px"} style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.2fr 1fr", gap: 32 }}>
          <div>
            <Caps color={T.lime} style={{ marginBottom: 14 }}>
              PlayerHQ · Treningsdagbok
            </Caps>
            <SeksT mobile={mobile} em="dine egne tall?">
              Vil du følge
            </SeksT>
            <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.65, margin: "14px 0 0", maxWidth: 440 }}>
              PlayerHQ regner ut Strokes Gained automatisk fra hvert scorekort. Du ser hvor strokene tapes, og om treningen virker. Trenden over måneder, ikke synsing.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
              <MCta icon="arrow-right" href="/portal">
                Prøv gratis i 30 dager
              </MCta>
              <MCta ghost href="/priser">
                Se priser
              </MCta>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.fg, marginBottom: 10 }}>Inkludert i abonnement</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {PLAYERHQ_FORDELER.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
                  <Icon name="check" size={13} style={{ color: T.lime, flex: "none", marginTop: 3 }} />
                  {f}
                </li>
              ))}
            </ul>
            <div style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, marginTop: 16 }}>
              <strong>299 kr/mnd</strong> · gratis under beta
            </div>
          </div>
        </Kort>
      </Seksjon>

      {/* Trener-steg */}
      <Seksjon mobile={mobile}>
        <Caps>Coaching</Caps>
        <div style={{ marginTop: 14 }}>
          <SeksT mobile={mobile} em="tallene.">
            Slik bruker treneren
          </SeksT>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap, marginTop: 24 }}>
          {TRENER_STEG.map((s) => (
            <Kort key={s.n}>
              <Caps size={9}>{s.n}</Caps>
              <Icon name={s.icon} size={22} style={{ color: T.lime, marginTop: 10 }} />
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, marginTop: 10 }}>{s.tittel}</div>
              <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "8px 0 0" }}>{s.tekst}</p>
            </Kort>
          ))}
        </div>

        <Kort tint style={{ marginTop: T.gap, flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "center", display: "flex", gap: 18 }}>
          <div style={{ flex: 1 }}>
            <strong style={{ fontFamily: T.ui, fontSize: 14.5, fontWeight: 700, color: T.fg }}>Vil du jobbe med en av våre coacher?</strong>
            <div style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, marginTop: 6 }}>
              Vi har plass til nye spillere på AK Golf Academy i 2026: junior, amatør og proffspillere.
            </div>
          </div>
          <MCta icon="arrow-right" href="/coaching">
            Se coaching-tilbud
          </MCta>
        </Kort>
      </Seksjon>

      {/* Bunn-CTA */}
      <Seksjon mobile={mobile} style={{ textAlign: "center" }}>
        <Eyebrow>Kom i gang</Eyebrow>
        <SeksT mobile={mobile} em="bedre?">
          Klar for å bli
        </SeksT>
        <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, margin: "14px auto 0", maxWidth: 440, lineHeight: 1.6 }}>
          Det tar fem minutter å sette opp PlayerHQ. Etter første scorekort har du din egen SG-profil.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 24 }}>
          <MCta icon="arrow-right" href="/portal">
            Start PlayerHQ gratis
          </MCta>
          <MCta ghost href="/turneringer">
            Se norske i aksjon
          </MCta>
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, marginTop: 18 }}>
          Ingen kredittkort nødvendig · avslutt når du vil
        </div>
      </Seksjon>
    </StatsRamme>
  );
}
