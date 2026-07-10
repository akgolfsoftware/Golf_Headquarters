"use client";

/**
 * AK Golf HQ v2 — STATS/VERKTØY (hub + 5 kalkulatorer), retning C, mørk.
 * Ekte copy + beregningslogikk speilet 1:1 fra (mlegacy)/stats/verktoy/**.
 * Beregningsfunksjonene (hcpFromAvgScore, tourEquivalentScore,
 * estimerSgFordelingFraSnitt) er videreført uendret fra @/lib/stats/sg-estimator.
 * WHS-metoden (score differential, 8 av 20 beste) er egen ren funksjon,
 * videreført 1:1 fra klienten i mlegacy.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps, Knapp } from "@/components/v2";
import { Glider, RadarProfil } from "@/components/v2";
import { hcpFromAvgScore, tourEquivalentScore, estimerSgFordelingFraSnitt } from "@/lib/stats/sg-estimator";
import { StatsRamme, useMobile } from "./stats-ramme";
import { Eyebrow, HeroT, SeksT, Lede, Seksjon } from "./marked-ramme";

/* ── Delt: tilbake-lenke ──────────────────────────────── */
function TilbakeVerktoy() {
  return (
    <Link
      href="/stats/verktoy"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: T.mono,
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: T.mut,
        textDecoration: "none",
        marginBottom: 18,
      }}
    >
      <Icon name="arrow-left" size={12} />
      Verktøy
    </Link>
  );
}

/* ── Delt: stort mono-tall i resultatkort (lime på mørk) ── */
function ResultatKort({ eyebrow, verdi, sub, children }: { eyebrow: string; verdi: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <Kort tint pad="44px 40px" style={{ textAlign: "center" }}>
      <Caps color={T.lime}>{eyebrow}</Caps>
      <div style={{ fontFamily: T.mono, fontSize: "clamp(72px,12vw,140px)", fontWeight: 500, lineHeight: 1, marginTop: 14, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
        {verdi}
      </div>
      {sub && <div style={{ fontFamily: T.ui, fontSize: 15, color: T.fg2, marginTop: 16 }}>{sub}</div>}
      {children}
    </Kort>
  );
}

/* =====================================================================
 * HUB — /stats/verktoy
 * =================================================================== */
const TOOLS = [
  { id: "score-til-hcp", navn: "Score til HCP", desc: "Hvilken HCP har du basert på snittscoren din? Broadie-basert estimat.", icon: "gauge" },
  { id: "tour-ekvivalent", navn: "Tour-ekvivalent", desc: "Hva tilsvarer scoren din på en PGA Tour-bane med slope 145?", icon: "target" },
  { id: "whs-kalkulator", navn: "WHS-kalkulator", desc: "Full WHS handicap fra dine 8 beste runder av siste 20. Ekte NHF-metode.", icon: "line-chart" },
  { id: "sg-estimator", navn: "SG-estimator", desc: "Estimert SG-fordeling fra snittscoren din, basert på Broadie-tabell.", icon: "sparkles" },
  { id: "avstand", navn: "Avstand", desc: "Yards ↔ meter konverter, kontekstualisert for ditt nivå.", icon: "crosshair" },
] as const;

export function VerktoyHubV2() {
  const mobile = useMobile();
  return (
    <StatsRamme mobile={mobile} aktiv="verktoy">
      <Seksjon mobile={mobile}>
        <Eyebrow>AK Golf Stats · Verktøy</Eyebrow>
        <HeroT mobile={mobile} em="lurer på.">
          Beregn det du
        </HeroT>
        <Lede style={{ marginTop: 22, maxWidth: 580 }}>
          Score til HCP, Tour-ekvivalent, WHS, SG-estimator. Alt gratis, alt nøyaktig.
        </Lede>
      </Seksjon>

      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap }}>
          {TOOLS.map((t) => (
            <Link key={t.id} href={`/stats/verktoy/${t.id}`} style={{ textDecoration: "none" }}>
              <Kort hover style={{ minHeight: 200, display: "flex", flexDirection: "column", gap: 16 }}>
                <span style={{ width: 48, height: 48, borderRadius: 14, background: T.panel2, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={t.icon} size={22} style={{ color: T.lime }} />
                </span>
                <div>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg, letterSpacing: "-0.015em" }}>{t.navn}</div>
                  <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, marginTop: 8, lineHeight: 1.55 }}>{t.desc}</p>
                </div>
                <div style={{ marginTop: "auto", fontFamily: T.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.lime, fontWeight: 700 }}>
                  Prøv →
                </div>
              </Kort>
            </Link>
          ))}
        </div>
      </Seksjon>

      <Seksjon mobile={mobile}>
        <Kort tint pad={mobile ? "26px 22px" : "40px 44px"} style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.2fr 1fr", gap: 32 }}>
          <div>
            <Caps color={T.lime} style={{ marginBottom: 14 }}>Vil du mer?</Caps>
            <SeksT mobile={mobile} em="automatisk.">Spor SG-en din</SeksT>
            <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.65, margin: "14px 0 0", maxWidth: 440 }}>
              Med PlayerHQ PRO logges SG automatisk fra Trackman. Ingen kalkulator nødvendig. Treneren din ser det samme som deg.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
              <Link href="/portal/meg/abonnement"><Knapp icon="arrow-right">Kom i gang</Knapp></Link>
              <Link href="/stats/sg-sammenlign"><Knapp ghost>Prøv SG-sammenligning</Knapp></Link>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.fg, marginBottom: 10 }}>Verktøy-pakken i PlayerHQ PRO</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {["Automatisk SG-tracking", "Ukentlig SG-rapport", "WHS beregnes automatisk", "AI-kalibrering av baner"].map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
                  <Icon name="check" size={13} style={{ color: T.lime, flex: "none", marginTop: 3 }} />
                  {f}
                </li>
              ))}
            </ul>
            <div style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, marginTop: 16 }}>
              <strong>299 kr / mnd</strong> · avbryt når som helst
            </div>
          </div>
        </Kort>
      </Seksjon>
    </StatsRamme>
  );
}

/* =====================================================================
 * AVSTAND — yards ↔ meter
 * =================================================================== */
const YARDS_PR_METER = 1.09361;
const METER_PR_YARDS = 0.9144;
const AVSTAND_REFERANSER = [
  { label: "Typisk driving (PGA Tour)", yards: 295, kontekst: "Tournivå, optimale betingelser" },
  { label: "Typisk driving (amatør HCP 10)", yards: 220, kontekst: "Norsk amatørsnitt" },
  { label: "Wedge full sving (9 jern)", yards: 150, kontekst: "Typisk innspill" },
  { label: "Pitching wedge (pro)", yards: 130, kontekst: "Full sving PGA Tour" },
  { label: "Sand wedge (amatør)", yards: 90, kontekst: "Typisk bunker" },
  { label: "Par 3 gjennomsnitt", yards: 185, kontekst: "PGA Tour par 3 snitt" },
];

export function AvstandV2() {
  const mobile = useMobile();
  const [verdi, setVerdi] = useState("100");
  const [retning, setRetning] = useState<"ym" | "my">("ym");

  const tall = parseFloat(verdi) || 0;
  const resultat = retning === "ym" ? tall * METER_PR_YARDS : tall * YARDS_PR_METER;

  const bytteRetning = () => {
    setRetning((r) => (r === "ym" ? "my" : "ym"));
    setVerdi(resultat.toFixed(1));
  };

  return (
    <StatsRamme mobile={mobile} aktiv="verktoy">
      <Seksjon mobile={mobile}>
        <TilbakeVerktoy />
        <Eyebrow>Verktøy · Avstand</Eyebrow>
        <HeroT mobile={mobile}>Yards ↔ meter.</HeroT>
        <Lede style={{ marginTop: 22, maxWidth: 520 }}>
          Konverter mellom yards og meter. Med referanse-kolonnen ser du hva de vanligste golf-avstandene betyr i praksis.
        </Lede>
      </Seksjon>

      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Kort pad={mobile ? "26px 22px" : "48px"} style={{ maxWidth: 620, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr auto 1fr", gap: 16, alignItems: "center" }}>
            <div>
              <Caps style={{ textAlign: "center", marginBottom: 8 }}>{retning === "ym" ? "Yards" : "Meter"}</Caps>
              <input
                type="number"
                value={verdi}
                onChange={(e) => setVerdi(e.target.value)}
                style={{ fontFamily: T.mono, fontSize: 40, fontWeight: 500, width: "100%", boxSizing: "border-box", padding: "10px 14px", border: `1px solid ${T.borderS}`, borderRadius: T.rRow, textAlign: "center", background: T.panel2, color: T.fg }}
              />
            </div>
            <button
              onClick={bytteRetning}
              style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${T.borderS}`, background: T.panel3, cursor: "pointer", display: "grid", placeItems: "center", color: T.lime, marginTop: mobile ? 0 : 26, justifySelf: "center" }}
            >
              <Icon name="arrow-left-right" size={18} />
            </button>
            <div>
              <Caps style={{ textAlign: "center", marginBottom: 8 }}>{retning === "ym" ? "Meter" : "Yards"}</Caps>
              <div style={{ fontFamily: T.mono, fontSize: 40, fontWeight: 500, padding: "10px 14px", border: `2px solid ${T.lime}`, borderRadius: T.rRow, textAlign: "center", background: "rgba(209,248,67,0.06)", color: T.lime, fontVariantNumeric: "tabular-nums" }}>
                {resultat.toFixed(1)}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 22, fontFamily: T.mono, fontSize: 11, textAlign: "center", color: T.mut }}>
            1 yard = 0,9144 m · 1 meter = {YARDS_PR_METER.toFixed(4)} yards
          </div>
        </Kort>
      </Seksjon>

      <Seksjon mobile={mobile}>
        <Caps>Referanser</Caps>
        <div style={{ marginTop: 14 }}>
          <SeksT mobile={mobile}>Vanlige golf-avstander.</SeksT>
        </div>
        <Kort pad={mobile ? "0" : "0"} style={{ marginTop: 24, overflow: "hidden" }}>
          {AVSTAND_REFERANSER.map((r, i) => (
            <div
              key={r.label}
              onClick={() => { setRetning("ym"); setVerdi(String(r.yards)); }}
              style={{
                display: "grid",
                gridTemplateColumns: mobile ? "1fr auto" : "1.4fr 0.6fr 0.6fr 1fr",
                gap: 8,
                padding: "14px 20px",
                borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                cursor: "pointer",
                alignItems: "center",
              }}
            >
              <span style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 600, color: T.fg }}>{r.label}</span>
              <span style={{ fontFamily: T.mono, fontSize: 13, color: T.lime, textAlign: mobile ? "right" : "left" }}>{r.yards} y</span>
              {!mobile && <span style={{ fontFamily: T.mono, fontSize: 13, color: T.fg2 }}>{(r.yards * METER_PR_YARDS).toFixed(0)} m</span>}
              {!mobile && <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>{r.kontekst}</span>}
            </div>
          ))}
        </Kort>
      </Seksjon>
    </StatsRamme>
  );
}

/* =====================================================================
 * SCORE TIL HCP
 * =================================================================== */
function hcpNiva(hcp: number): string {
  if (hcp <= 0) return "Scratch / Plus-handicap";
  if (hcp <= 5) return "Elitespiller";
  if (hcp <= 10) return "Single-figure";
  if (hcp <= 18) return "Mellomklasse";
  if (hcp <= 28) return "Rekreasjons";
  return "Nybegynner";
}
function percentilNorge(hcp: number): number {
  if (hcp <= 0) return 99;
  if (hcp <= 5) return 93;
  if (hcp <= 10) return 78;
  if (hcp <= 18) return 52;
  if (hcp <= 28) return 22;
  return 8;
}

export function ScoreTilHcpV2() {
  const mobile = useMobile();
  const [snitt, setSnitt] = useState(78);
  const [beregnet, setBeregnet] = useState(false);

  const hcp = hcpFromAvgScore(snitt);
  const { tourScore } = tourEquivalentScore(snitt);
  const niva = hcpNiva(hcp);
  const pct = percentilNorge(hcp);

  return (
    <StatsRamme mobile={mobile} aktiv="verktoy">
      <Seksjon mobile={mobile}>
        <TilbakeVerktoy />
        <Eyebrow>Verktøy · Score til HCP</Eyebrow>
        <HeroT mobile={mobile}>Hvilken HCP har du?</HeroT>
        <Lede style={{ marginTop: 22 }}>Skriv inn snittscoren din, så estimerer vi HCP basert på Broadie-data.</Lede>
      </Seksjon>

      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Kort pad={mobile ? "26px 22px" : "48px"} style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
          <Caps>Din snittscore (brutto)</Caps>
          <div style={{ fontFamily: T.mono, fontSize: "clamp(64px,14vw,120px)", fontWeight: 500, lineHeight: 1, marginTop: 12, color: T.fg }}>
            {snitt}
          </div>
          <div style={{ maxWidth: 400, margin: "28px auto 0", textAlign: "left" }}>
            <Glider label="" min={60} max={140} step={0.5} value={snitt} onChange={setSnitt} enhet="" />
          </div>
          <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 10, color: T.mut }}>Tour-snitt: 70,5</div>
          <div style={{ marginTop: 28 }}>
            <Knapp icon="arrow-right" onClick={() => setBeregnet(true)}>Beregn HCP</Knapp>
          </div>
        </Kort>
      </Seksjon>

      {beregnet && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <ResultatKort eyebrow="Din estimerte HCP" verdi={hcp.toFixed(1)} sub={<>HCP-nivå: <strong style={{ color: T.lime }}>{niva}</strong></>}>
              <div style={{ borderTop: `1px solid ${T.border}`, margin: "28px 0 0", paddingTop: 22, fontFamily: T.ui, fontSize: 14, lineHeight: 1.7, color: T.fg2, textAlign: "left", maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
                <p style={{ margin: 0 }}>Dette tilsvarer:</p>
                <ul style={{ listStyle: "none", padding: 0, marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  <li>· Bedre enn {pct} % av norske amatører</li>
                  <li>· Tour-ekvivalent: <strong style={{ color: T.lime }}>{tourScore.toFixed(1)}</strong> på en PGA-bane (slope 145)</li>
                  <li>· Basert på Broadie (2014) «Every Shot Counts» HCP-tabell</li>
                </ul>
              </div>
              <div style={{ marginTop: 24 }}>
                <Link href="/stats/verktoy/tour-ekvivalent"><Knapp ghost icon="arrow-right">Se Tour-ekvivalent</Knapp></Link>
              </div>
            </ResultatKort>
          </div>
        </Seksjon>
      )}
    </StatsRamme>
  );
}

/* =====================================================================
 * TOUR-EKVIVALENT
 * =================================================================== */
export function TourEkvivalentV2() {
  const mobile = useMobile();
  const [score, setScore] = useState(78);
  const [slope, setSlope] = useState(125);
  const [cr, setCr] = useState(71);
  const [beregnet, setBeregnet] = useState(false);

  const { tourScore, hcp, tourHcp } = tourEquivalentScore(score, { norskSlope: slope, norskCr: cr });

  return (
    <StatsRamme mobile={mobile} aktiv="verktoy">
      <Seksjon mobile={mobile}>
        <TilbakeVerktoy />
        <Eyebrow>Verktøy · Tour-ekvivalent</Eyebrow>
        <HeroT mobile={mobile}>Hva tilsvarer scoren din på Tour?</HeroT>
        <Lede style={{ marginTop: 22, maxWidth: 560 }}>
          Oppgi score, slope og course rating for banen du spilte på. Vi beregner hva det tilsvarer på en PGA Tour-bane (CR 74,5, Slope 145).
        </Lede>
      </Seksjon>

      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Kort pad={mobile ? "26px 22px" : "48px"} style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ marginBottom: 36, textAlign: "center" }}>
            <Caps>Din brutto-score</Caps>
            <div style={{ fontFamily: T.mono, fontSize: "clamp(48px,10vw,80px)", fontWeight: 500, lineHeight: 1, margin: "12px 0 20px", color: T.fg }}>
              {score}
            </div>
            <Glider label="" min={60} max={130} step={1} value={score} onChange={setScore} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 28 }}>
            <Glider label={`Slope (${slope})`} min={55} max={155} step={1} value={slope} onChange={setSlope} />
            <Glider label={`Course Rating (${cr})`} min={55} max={80} step={0.1} value={cr} onChange={setCr} fmt={(v) => v.toFixed(1)} />
          </div>
          <div style={{ marginTop: 36, textAlign: "center" }}>
            <Knapp icon="arrow-right" onClick={() => setBeregnet(true)}>Beregn Tour-ekvivalent</Knapp>
          </div>
        </Kort>
      </Seksjon>

      {beregnet && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <ResultatKort
              eyebrow="Din Tour-ekvivalent"
              verdi={tourScore.toFixed(1)}
              sub={<>Din score <span style={{ fontFamily: T.mono }}>{score}</span> på en bane med Slope <span style={{ fontFamily: T.mono }}>{slope}</span> / CR <span style={{ fontFamily: T.mono }}>{cr.toFixed(1)}</span> tilsvarer <strong style={{ color: T.lime }}>{tourScore.toFixed(1)}</strong> på en PGA Tour-bane.</>}
            >
              <div style={{ borderTop: `1px solid ${T.border}`, margin: "28px 0 0", paddingTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
                <div>
                  <Caps color={T.lime}>Estimert HCP</Caps>
                  <div style={{ fontFamily: T.mono, fontSize: 32, color: T.lime, marginTop: 8, fontWeight: 500 }}>{hcp.toFixed(1)}</div>
                </div>
                <div>
                  <Caps color={T.lime}>Tour-HCP</Caps>
                  <div style={{ fontFamily: T.mono, fontSize: 32, color: T.lime, marginTop: 8, fontWeight: 500 }}>{tourHcp.toFixed(1)}</div>
                </div>
              </div>
            </ResultatKort>
          </div>
        </Seksjon>
      )}
    </StatsRamme>
  );
}

/* =====================================================================
 * SG-ESTIMATOR
 * =================================================================== */
const KATEGORI_LABEL: Record<string, string> = { ott: "Off the Tee", app: "Approach", arg: "Around Green", putt: "Putting" };

export function SgEstimatorV2() {
  const mobile = useMobile();
  const [snitt, setSnitt] = useState(78);
  const [beregnet, setBeregnet] = useState(false);

  const sg = estimerSgFordelingFraSnitt(snitt);
  const hcp = hcpFromAvgScore(snitt);

  const kategorier = [
    { key: "ott", verdi: sg.sgOtt },
    { key: "app", verdi: sg.sgApp },
    { key: "arg", verdi: sg.sgArg },
    { key: "putt", verdi: sg.sgPutt },
  ];
  const storsteGap = kategorier.reduce((max, k) => (Math.abs(k.verdi ?? 0) > Math.abs(max.verdi ?? 0) ? k : max));

  // Radar: 0-10 skala, 5 = tour-snitt, avstand fra 5 proporsjonal med SG (±10 slag → ±5)
  const akser = kategorier.map((k) => ({ label: KATEGORI_LABEL[k.key], verdi: Math.max(0, Math.min(10, 5 + (k.verdi ?? 0) / 2)) }));
  const tourSnitt = [5, 5, 5, 5];

  return (
    <StatsRamme mobile={mobile} aktiv="verktoy">
      <Seksjon mobile={mobile}>
        <TilbakeVerktoy />
        <Eyebrow>Verktøy · SG-estimator</Eyebrow>
        <HeroT mobile={mobile}>Din estimerte SG-fordeling.</HeroT>
        <Lede style={{ marginTop: 22, maxWidth: 560 }}>
          Oppgi snittscoren din. Vi bruker Broadie-tabellen til å estimere SG fordelt på Off the Tee, Approach, Around Green og Putting.
        </Lede>
      </Seksjon>

      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Kort pad={mobile ? "26px 22px" : "48px"} style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
          <Caps>Din snittscore (brutto)</Caps>
          <div style={{ fontFamily: T.mono, fontSize: "clamp(64px,14vw,120px)", fontWeight: 500, lineHeight: 1, marginTop: 12, color: T.fg }}>
            {snitt}
          </div>
          <div style={{ maxWidth: 400, margin: "28px auto 0", textAlign: "left" }}>
            <Glider label="" min={60} max={140} step={0.5} value={snitt} onChange={setSnitt} />
          </div>
          <div style={{ marginTop: 28 }}>
            <Knapp icon="arrow-right" onClick={() => setBeregnet(true)}>Estimer SG-fordeling</Knapp>
          </div>
        </Kort>
      </Seksjon>

      {beregnet && (
        <>
          <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: T.gap }}>
              {kategorier.map((k) => {
                const erGap = k.key === storsteGap.key;
                return (
                  <Kort key={k.key} tint={erGap} style={{ position: "relative" }}>
                    <Caps color={erGap ? T.lime : T.mut}>
                      {KATEGORI_LABEL[k.key]}
                      {erGap && <span style={{ marginLeft: 8, background: T.lime, color: T.onLime, padding: "1px 6px", borderRadius: 3, fontSize: 9, fontWeight: 700 }}>GAP</span>}
                    </Caps>
                    <div style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 500, marginTop: 10, color: (k.verdi ?? 0) < -5 ? T.down : T.fg }}>
                      {k.verdi !== null ? (k.verdi >= 0 ? "+" : "") + k.verdi.toFixed(2) : "—"}
                    </div>
                    <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 4 }}>strokes/runde vs Tour</div>
                  </Kort>
                );
              })}
            </div>
          </Seksjon>

          <Seksjon mobile={mobile}>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 32, alignItems: "center" }}>
              <Kort pad="32px" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Caps style={{ alignSelf: "flex-start", marginBottom: 12 }}>SG-profil</Caps>
                <RadarProfil akser={akser} sammenlign={tourSnitt} max={10} size={mobile ? 260 : 300} />
              </Kort>
              <div>
                <Caps>Hva betyr dette?</Caps>
                <div style={{ marginTop: 12 }}>
                  <SeksT mobile={mobile}>
                    Estimert HCP: <span style={{ fontFamily: T.mono, color: T.lime }}>{hcp.toFixed(1)}</span>
                  </SeksT>
                </div>
                <p style={{ marginTop: 16, fontFamily: T.ui, fontSize: 14.5, lineHeight: 1.6, color: T.fg2 }}>
                  Med snittscore <strong style={{ color: T.fg }}>{snitt}</strong> er ditt største utviklingspotensial i <strong style={{ color: T.fg }}>{KATEGORI_LABEL[storsteGap.key]}</strong> ({storsteGap.verdi !== null ? (storsteGap.verdi >= 0 ? "+" : "") + storsteGap.verdi.toFixed(2) : "—"} strokes/runde vs Tour).
                </p>
                <p style={{ marginTop: 12, fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.mut }}>
                  Basert på Broadie (2014) «Every Shot Counts», HCP-stratifiserte gjennomsnitt. Disse er estimater, ikke nøyaktige per-spiller-tall.
                </p>
                <div style={{ marginTop: 22 }}>
                  <Link href="/stats/sg-sammenlign"><Knapp icon="arrow-right">Sammenlign mot Rory</Knapp></Link>
                </div>
              </div>
            </div>
          </Seksjon>
        </>
      )}
    </StatsRamme>
  );
}

/* =====================================================================
 * WHS-KALKULATOR
 * =================================================================== */
type Runde = { score: number; slope: number; cr: number };

function beregnScoreDifferential(score: number, slope: number, cr: number): number {
  return (score - cr) * (113 / slope);
}
function beregnWhsHcp(runder: Runde[]): number | null {
  if (runder.length < 3) return null;
  const diffs = runder.map((r) => beregnScoreDifferential(r.score, r.slope, r.cr));
  const sortert = [...diffs].sort((a, b) => a - b);
  const antallBruk = Math.min(8, Math.floor(sortert.length * 0.4 + 1));
  const beste = sortert.slice(0, antallBruk);
  const snitt = beste.reduce((s, v) => s + v, 0) / beste.length;
  return Math.round(snitt * 10) / 10;
}
const TOMME_RUNDER: Runde[] = [
  { score: 80, slope: 125, cr: 71 },
  { score: 78, slope: 120, cr: 70 },
  { score: 82, slope: 130, cr: 72 },
];

export function WhsKalkulatorV2() {
  const mobile = useMobile();
  const [runder, setRunder] = useState<Runde[]>(TOMME_RUNDER);
  const [beregnet, setBeregnet] = useState(false);

  const hcp = beregnWhsHcp(runder);

  const leggTil = () => runder.length < 20 && setRunder([...runder, { score: 80, slope: 125, cr: 71 }]);
  const fjern = (i: number) => { setRunder(runder.filter((_, idx) => idx !== i)); setBeregnet(false); };
  const oppdater = (i: number, felt: keyof Runde, verdi: number) => {
    const ny = [...runder];
    ny[i] = { ...ny[i], [felt]: verdi };
    setRunder(ny);
    setBeregnet(false);
  };

  const inputStil: React.CSSProperties = { fontFamily: T.mono, fontSize: 15, width: 64, boxSizing: "border-box", padding: "6px 8px", border: `1px solid ${T.borderS}`, borderRadius: 6, textAlign: "center", background: T.panel2, color: T.fg };

  return (
    <StatsRamme mobile={mobile} aktiv="verktoy">
      <Seksjon mobile={mobile}>
        <TilbakeVerktoy />
        <Eyebrow>Verktøy · WHS-kalkulator</Eyebrow>
        <HeroT mobile={mobile}>Beregn ditt WHS-handicap.</HeroT>
        <Lede style={{ marginTop: 22, maxWidth: 560 }}>
          Legg inn 3–20 runder med score, slope og course rating. Vi beregner handicap etter offisiell NHF/WHS-metode (8 beste score differentials).
        </Lede>
      </Seksjon>

      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Kort pad="0" style={{ overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 70px 70px 32px" : "1fr 100px 100px 40px", padding: "12px 20px", background: T.panel2, borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.mut }}>
              <span>Score</span><span>Slope</span><span>CR</span><span />
            </div>
            {runder.map((r, i) => {
              const diff = beregnScoreDifferential(r.score, r.slope, r.cr);
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 70px 70px 32px" : "1fr 100px 100px 40px", padding: "10px 20px", borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="number" value={r.score} onChange={(e) => oppdater(i, "score", Number(e.target.value))} style={inputStil} />
                    {!mobile && <span style={{ fontFamily: T.mono, fontSize: 11, color: diff < 0 ? T.lime : T.mut }}>diff: {diff.toFixed(1)}</span>}
                  </div>
                  <input type="number" value={r.slope} onChange={(e) => oppdater(i, "slope", Number(e.target.value))} style={inputStil} />
                  <input type="number" step="0.1" value={r.cr} onChange={(e) => oppdater(i, "cr", Number(e.target.value))} style={inputStil} />
                  <button onClick={() => fjern(i)} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.mut, padding: 4, display: "grid", placeItems: "center" }}>
                    <Icon name="trash-2" size={14} />
                  </button>
                </div>
              );
            })}
            {runder.length < 20 && (
              <button onClick={leggTil} style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", width: "100%", background: "transparent", border: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 12, color: T.lime, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                <Icon name="plus" size={14} />
                Legg til runde ({runder.length}/20)
              </button>
            )}
          </Kort>

          <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Knapp icon="arrow-right" disabled={runder.length < 3} onClick={() => setBeregnet(true)}>Beregn WHS-handicap</Knapp>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, letterSpacing: "0.06em" }}>Min. 3 runder kreves</span>
          </div>
        </div>
      </Seksjon>

      {beregnet && hcp !== null && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <ResultatKort
              eyebrow="Ditt WHS-handicap"
              verdi={hcp.toFixed(1)}
              sub={`Basert på ${runder.length} runder. Bruker ${Math.min(8, runder.length)} beste score differentials etter WHS-metoden.`}
            />
          </div>
        </Seksjon>
      )}
    </StatsRamme>
  );
}
