/**
 * /portal/tren/tester/[testId] — pixel-perfekt port av
 * docs/design-handoff/test-modul/tester-detalj.html (Driver Basic eksempel)
 *
 * Demo-data; kan kobles til live Prisma-data per test senere.
 */

import "../planlegge-v2/styles.css";
import Link from "next/link";
import { PlanleggeSprite } from "../planlegge-v2/icons";

type Step = { num: number; title: string; desc: string; chips: string[] };

const STEPS: Step[] = [
  {
    num: 1,
    title: "Driver-oppvarming",
    desc: "Slå 5 driver-slag på 70–80% intensitet. Kom i takt med rytmen og varm opp ryggen.",
    chips: ["5 slag", "Mål: Klart oppvarmet"],
  },
  {
    num: 2,
    title: "5 driver-slag på rad",
    desc:
      "Sikt mot midten av fairway. Slå 5 driver-slag på rad uten korreksjon. Registrer carry-, total- og sideavvik per slag.",
    chips: ["5 slag", "Mål: PEI < 0,06"],
  },
  {
    num: 3,
    title: "PEI-beregning",
    desc:
      "Verktøyet beregner Performance Efficiency Index basert på lengde-konsistens og sideavvik. Du ser resultatet umiddelbart.",
    chips: ["Auto-beregnet"],
  },
];

type HRow = { dt: string; ctx: string; v: string; delta: string; deltaKind: "up" | "dn" | "flat"; pr?: boolean };

const HISTORY: HRow[] = [
  { dt: "12. mai 2026", ctx: "Ettermiddag · TrackMan studio", v: "67,4", delta: "+3,2", deltaKind: "up" },
  { dt: "28. apr 2026", ctx: "Morgen-økt · PR ⭐", v: "71,8", delta: "+4,7", deltaKind: "up", pr: true },
  { dt: "14. apr 2026", ctx: "Range Miklagard", v: "67,1", delta: "+1,4", deltaKind: "up" },
  { dt: "28. mar 2026", ctx: "TrackMan studio", v: "65,7", delta: "-2,0", deltaKind: "dn" },
  { dt: "12. mar 2026", ctx: "Range Miklagard", v: "67,7", delta: "+3,8", deltaKind: "up" },
  { dt: "22. feb 2026", ctx: "Vinter-camp Spania", v: "63,9", delta: "+6,1", deltaKind: "up" },
  { dt: "11. jan 2026", ctx: "Innendørs · ProPlay", v: "57,8", delta: "—", deltaKind: "flat" },
];

export function TesterDetaljScreen({
  testId,
  playerName,
  playerInitials,
  hcp,
}: {
  testId: string;
  playerName: string;
  playerInitials: string;
  hcp: number | null;
}) {
  return (
    <div className="planlegge-scope">
      <PlanleggeSprite />

      <main className="main">
        <header className="topbar">
          <Link className="back" href="/portal/tren/tester">
            <svg fill="none" stroke="currentColor"><use href="#i-arrow-left" /></svg>
            Alle tester
          </Link>
          <div className="player">
            <div className="avatar">{playerInitials}</div>
            <div>
              <div className="nm">{playerName}</div>
              <div className="sub">A1 · HCP {hcp != null ? hcp.toFixed(1).replace(".", ",") : "—"}</div>
            </div>
          </div>
        </header>

        <div className="page">
          {/* HERO */}
          <section className="hero">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span className="pyr pyr-slag pyr-lg">SLAG</span>
                <span className="eyebrow">Slagteknikk · driver</span>
              </div>
              <h1>
                Driver <em>Basic</em>
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: "16px",
                  color: "var(--muted)",
                  marginTop: "10px",
                  lineHeight: 1.5,
                  maxWidth: "560px",
                }}
              >
                5 driver-slag. Måler carry-lengde, sideavvik og beregner Performance Efficiency Index (PEI).
              </p>
            </div>
            <div className="actions">
              <button className="btn btn-outline btn-sm">Vis protokoll PDF</button>
              <Link href={`/portal/test/${testId}/live`} className="btn btn-primary">
                <svg fill="none" stroke="currentColor"><use href="#i-play" /></svg>
                Start test
                <svg fill="none" stroke="currentColor"><use href="#i-arrow-right" /></svg>
              </Link>
            </div>
          </section>

          {/* 3 RINGS */}
          <section className="ring-row">
            {/* Siste måling */}
            <div className="ring-card lime">
              <svg className="ring-svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#fff" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="var(--forest)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="264"
                  strokeDashoffset="92"
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="48" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="18" fontWeight="700" fill="var(--ink)">
                  67,4
                </text>
                <text x="50" y="62" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" letterSpacing="0.12em" fill="var(--muted)">
                  PEI
                </text>
              </svg>
              <div>
                <div className="lbl">Siste måling</div>
                <div className="val">67,4</div>
                <div className="sub" style={{ color: "var(--success)", fontWeight: 700 }}>
                  +3,2 mot forrige · 12. mai
                </div>
              </div>
            </div>

            {/* PR */}
            <div className="ring-card forest">
              <svg className="ring-svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="var(--lime)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="264"
                  strokeDashoffset="40"
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="48" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="18" fontWeight="700" fill="var(--lime)">
                  71,8
                </text>
                <text x="50" y="62" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" letterSpacing="0.12em" fill="rgba(209,248,67,0.65)">
                  PR
                </text>
              </svg>
              <div>
                <div className="lbl">Personlig rekord</div>
                <div className="val">71,8</div>
                <div className="sub">8 forsøk totalt · 28. april</div>
              </div>
            </div>

            {/* Snitt */}
            <div className="ring-card">
              <svg className="ring-svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="264"
                  strokeDashoffset="158"
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="48" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="18" fontWeight="700" fill="var(--ink)">
                  64,1
                </text>
                <text x="50" y="62" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" letterSpacing="0.12em" fill="var(--muted)">
                  SNITT
                </text>
              </svg>
              <div>
                <div className="lbl">Ditt snitt</div>
                <div className="val">64,1</div>
                <div className="sub">87. percentil i A1-kohorten</div>
              </div>
            </div>
          </section>

          {/* PROTOKOLL */}
          <section className="card proto">
            <div className="card-h">
              <div>
                <div className="eyebrow">PROTOKOLL · NGF/WANG 20-TEST</div>
                <h2 style={{ marginTop: "4px" }}>Slik gjennomfører du testen</h2>
              </div>
              <div className="right" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-clock" /></svg>
                ~10 min
              </div>
            </div>

            <div className="proto-steps">
              {STEPS.map((s) => (
                <div key={s.num} className="pstep">
                  <div className="pn">{s.num}</div>
                  <div>
                    <div className="pttl">{s.title}</div>
                    <div className="pdesc">{s.desc}</div>
                    <div className="pmeta">
                      {s.chips.map((c) => (
                        <span key={c} className="chip">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginTop: "24px",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid var(--line)",
                paddingTop: "20px",
              }}
            >
              <div className="equip-row">
                <span className="lbl">Utstyr:</span>
                <span className="chip">Driver</span>
                <span className="chip">TrackMan</span>
                <span className="chip">5 baller</span>
              </div>
              <Link href={`/portal/test/${testId}/live`} className="btn btn-primary">
                <svg fill="none" stroke="currentColor"><use href="#i-play" /></svg>
                Start test nå
                <svg fill="none" stroke="currentColor"><use href="#i-arrow-right" /></svg>
              </Link>
            </div>

            <div className="bench" style={{ marginTop: "18px" }}>
              <svg fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-trophy" /></svg>
              <div className="txt">
                <strong>PGA Tour benchmark</strong> — Top 40 spillere på PGA Tour har snitt PEI <strong>&lt; 0,06</strong>. Stallen sitt snitt: <strong>0,082</strong>.
              </div>
            </div>
          </section>

          {/* HISTORIKK */}
          <section className="card">
            <div className="card-h">
              <div>
                <div className="eyebrow">MIN HISTORIKK · 8 FORSØK</div>
                <h2 style={{ marginTop: "4px" }}>Utvikling siste 6 måneder</h2>
              </div>
              <div className="right">Snitt-linje vises stiplet</div>
            </div>

            <svg className="hist-svg" viewBox="0 0 800 240" preserveAspectRatio="none">
              <defs>
                <linearGradient id="histfill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="40" y1="40" x2="780" y2="40" stroke="#EFEDE6" />
              <line x1="40" y1="100" x2="780" y2="100" stroke="#EFEDE6" />
              <line x1="40" y1="160" x2="780" y2="160" stroke="#EFEDE6" />
              <line x1="40" y1="220" x2="780" y2="220" stroke="#E5E3DD" />
              <text x="32" y="44" textAnchor="end" fontFamily="JetBrains Mono" fontSize="10" fill="#5E5C57">80</text>
              <text x="32" y="104" textAnchor="end" fontFamily="JetBrains Mono" fontSize="10" fill="#5E5C57">70</text>
              <text x="32" y="164" textAnchor="end" fontFamily="JetBrains Mono" fontSize="10" fill="#5E5C57">60</text>
              <text x="32" y="224" textAnchor="end" fontFamily="JetBrains Mono" fontSize="10" fill="#5E5C57">50</text>
              <line x1="40" y1="135" x2="780" y2="135" stroke="#5E5C57" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
              <text x="775" y="130" textAnchor="end" fontFamily="JetBrains Mono" fontSize="10" fill="#5E5C57">snitt 64,1</text>
              <path
                d="M 80 175 L 180 188 L 280 142 L 380 155 L 480 130 L 580 118 L 680 65 L 720 75 L 720 220 L 80 220 Z"
                fill="url(#histfill)"
              />
              <polyline
                points="80,175 180,188 280,142 380,155 480,130 580,118 680,65 720,75"
                fill="none"
                stroke="#005840"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {[
                { cx: 80, cy: 175 },
                { cx: 180, cy: 188 },
                { cx: 280, cy: 142 },
                { cx: 380, cy: 155 },
                { cx: 480, cy: 130 },
                { cx: 580, cy: 118 },
              ].map((p, i) => (
                <circle key={i} cx={p.cx} cy={p.cy} r="5" fill="#D1F843" stroke="#005840" strokeWidth="2" />
              ))}
              <circle cx="680" cy="65" r="8" fill="#D1F843" stroke="#005840" strokeWidth="2.5" />
              <text x="680" y="50" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" fill="#005840">
                PR 71,8
              </text>
              <circle cx="720" cy="75" r="8" fill="#D1F843" stroke="#003A2A" strokeWidth="3" />
              <text x="720" y="100" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" fill="#0A1F17">
                67,4
              </text>
              {["DES", "JAN", "FEB", "MAR", "APR", "APR", "APR"].map((label, i) => {
                const x = 80 + i * 100;
                return (
                  <text key={i} x={x} y="234" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="#5E5C57" letterSpacing="0.04em">
                    {label}
                  </text>
                );
              })}
              <text x="720" y="234" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="#0A1F17" fontWeight="700" letterSpacing="0.04em">
                12. MAI
              </text>
            </svg>

            <div className="h-table" style={{ marginTop: "18px" }}>
              <div className="h-row">
                <span>DATO</span>
                <span>KONTEKST</span>
                <span className="v">PEI</span>
                <span className="delta">Δ</span>
              </div>
              {HISTORY.map((h, i) => (
                <div key={i} className={`h-row${h.pr ? " pr" : ""}`}>
                  <span className="dt">{h.dt}</span>
                  <span className="ctx">{h.ctx}</span>
                  <span className="v">{h.v}</span>
                  <span className={`delta ${h.deltaKind}`} style={h.deltaKind === "flat" ? { color: "var(--muted)" } : undefined}>
                    {h.delta}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* KVARTIL-PLOT */}
          <section className="card box-card">
            <div className="card-h">
              <div>
                <div className="eyebrow">SAMMENLIGNING · A1-KOHORT (n=12)</div>
                <h2 style={{ marginTop: "4px" }}>Hvor du ligger an</h2>
              </div>
              <div className="right">Box-plot · Q1 – median – Q3</div>
            </div>

            <svg className="box-svg" viewBox="0 0 800 130" preserveAspectRatio="none">
              <line x1="40" y1="100" x2="780" y2="100" stroke="#E5E3DD" strokeWidth="1" />
              {[
                { x: 40, label: "50" },
                { x: 225, label: "60" },
                { x: 410, label: "70" },
                { x: 595, label: "80" },
                { x: 780, label: "90" },
              ].map((t) => (
                <text key={t.label} x={t.x} y="120" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#5E5C57">
                  {t.label}
                </text>
              ))}
              <line x1="120" y1="50" x2="120" y2="80" stroke="#005840" strokeWidth="1.5" />
              <line x1="120" y1="65" x2="280" y2="65" stroke="#005840" strokeWidth="1.5" />
              <line x1="660" y1="50" x2="660" y2="80" stroke="#005840" strokeWidth="1.5" />
              <line x1="540" y1="65" x2="660" y2="65" stroke="#005840" strokeWidth="1.5" />
              <rect x="280" y="45" width="260" height="40" fill="#D1F843" stroke="#005840" strokeWidth="1.5" rx="4" />
              <line x1="410" y1="45" x2="410" y2="85" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="500" cy="65" r="14" fill="#005840" stroke="#D1F843" strokeWidth="3" />
              <text x="500" y="68" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" fill="#D1F843">
                67,4
              </text>
              <text x="500" y="32" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" fill="#005840" letterSpacing="0.06em">
                DEG
              </text>
              <line x1="500" y1="40" x2="500" y2="48" stroke="#005840" strokeWidth="1.5" />
            </svg>

            <div className="percentile-row">
              <div className="ptile">
                <div className="pl">Min · 1. kvartil</div>
                <div className="pv">52,1</div>
                <div className="pn-sub">25% under</div>
              </div>
              <div className="ptile">
                <div className="pl">Median</div>
                <div className="pv">64,2</div>
                <div className="pn-sub">A1-snitt</div>
              </div>
              <div className="ptile you">
                <div className="pl">Deg</div>
                <div className="pv">67,4</div>
                <div className="pn-sub">87. percentil</div>
              </div>
              <div className="ptile">
                <div className="pl">3. kvartil · max</div>
                <div className="pv">74,9</div>
                <div className="pn-sub">25% over</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
