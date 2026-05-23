/**
 * /admin/spillere/[id]?tab=tester — pixel-perfekt port av
 * docs/design-handoff/test-modul/coach-spiller-tester-tab.html
 *
 * Player header + 10-tab nav + KPI + radar-chart vs A1-snitt + AI-forslag + coach-action-cards
 */

import "../planlegge-v2/styles.css";
import { PlanleggeSprite } from "../planlegge-v2/icons";

export function CoachSpillerTesterTabScreen({
  playerName = "Markus Røinaas Pedersen",
  playerInitials = "MP",
}: { playerName?: string; playerInitials?: string }) {
  return (
    <div className="planlegge-scope">
      <PlanleggeSprite />

      <main className="main">
        <header className="topbar">
          <a
            className="back"
            href="/admin/spillere"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-arrow-left" /></svg>
            Stall
          </a>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)", letterSpacing: "0.04em" }}>
            CoachHQ &nbsp;/&nbsp; Stall &nbsp;/&nbsp; <span style={{ color: "var(--ink)", fontWeight: 700 }}>{playerName}</span>
          </div>
          <div className="player">
            <div className="avatar">AK</div>
            <div>
              <div className="nm">Anders K.</div>
              <div className="sub">Head Coach</div>
            </div>
          </div>
        </header>

        <div className="page" style={{ maxWidth: "1480px" }}>
          {/* PLAYER HEADER */}
          <section className="p-header">
            <div className="avatar xl">{playerInitials}</div>
            <div>
              <h1>{playerName}</h1>
              <div className="meta">
                <span className="pill pill-pro">A1</span>
                <span>HCP <strong>4.8</strong></span>
                <span className="dot" />
                <span>Født 2007 · 18 år</span>
                <span className="dot" />
                <span><strong>WANG Toppidrett</strong> · VG2</span>
                <span className="dot" />
                <span>Coach <strong>Anders K.</strong></span>
                <span className="dot" />
                <span style={{ color: "var(--success)" }}>Aktiv · sist innlogget 2 t siden</span>
              </div>
            </div>
            <div className="actions">
              <button className="btn btn-outline btn-sm">
                <svg fill="none" stroke="currentColor"><use href="#i-msg" /></svg>
                Send melding
              </button>
              <button className="btn btn-outline btn-sm">
                <svg fill="none" stroke="currentColor"><use href="#i-dots" /></svg>
              </button>
            </div>
          </section>

          {/* TAB BAR */}
          <nav className="tabs">
            <button className="tab">Profil</button>
            <button className="tab">Plan <span className="ct">3</span></button>
            <button className="tab">Økter <span className="ct">42</span></button>
            <button className="tab">Runder <span className="ct">28</span></button>
            <button className="tab">Mål <span className="ct">5</span></button>
            <button className="tab active">Tester <span className="ct">12/36</span></button>
            <button className="tab">Helse</button>
            <button className="tab">WAGR</button>
            <button className="tab">Foreldre</button>
            <button className="tab">Innstillinger</button>
          </nav>

          {/* KPI ROW */}
          <section className="kpi-row">
            <div className="kpi featured">
              <div className="lbl">Tester gjennomført</div>
              <div className="val">12<span className="sm">/36</span></div>
              <div className="sub">33% av batteriet · 87 målinger</div>
            </div>
            <div className="kpi">
              <div className="lbl">Snitt vs A1-stall</div>
              <div className="val" style={{ color: "var(--success)" }}>+7,2</div>
              <div className="sub" style={{ color: "var(--success)" }}>prosentpoeng over snitt</div>
            </div>
            <div className="kpi">
              <div className="lbl">Sterkeste kategori</div>
              <div className="val" style={{ fontSize: "22px" }}>TEK · Teknisk</div>
              <div className="sub">
                <span className="dot" style={{ background: "var(--pyr-tek)" }} />+12% mot A1-snitt
              </div>
            </div>
            <div className="kpi">
              <div className="lbl">Svakeste kategori</div>
              <div className="val" style={{ fontSize: "22px", color: "var(--warn)" }}>TURN · Turn.mod.</div>
              <div className="sub" style={{ color: "var(--warn)" }}>
                <span className="dot" style={{ background: "var(--pyr-turn)" }} />0 av 4 tester tatt
              </div>
            </div>
          </section>

          {/* RADAR + AI-FORSLAG GRID */}
          <section className="radar-grid">
            {/* RADAR */}
            <div className="card radar-card">
              <div className="card-h" style={{ marginBottom: "6px" }}>
                <div>
                  <div className="eyebrow">RADAR · 5 DISIPLINER</div>
                  <h2 style={{ marginTop: "4px" }}>Markus vs A1-snitt</h2>
                </div>
                <div className="right" style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                  <span className="pill pill-pro" style={{ background: "var(--lime)", color: "var(--forest)" }}>MARKUS</span>
                  <span
                    className="pill"
                    style={{ background: "var(--cream)", border: "1px solid var(--border)", color: "var(--muted)" }}
                  >
                    A1-SNITT
                  </span>
                </div>
              </div>

              <svg className="radar-svg" viewBox="0 0 400 400">
                <g fill="none" stroke="#E5E3DD" strokeWidth="1">
                  <polygon points="200,40 352.4,150.7 294.2,328.5 105.8,328.5 47.6,150.7" />
                  <polygon points="200,72 322.0,160.6 275.4,302.8 124.6,302.8 78.0,160.6" />
                  <polygon points="200,104 291.7,170.4 256.6,277.1 143.4,277.1 108.3,170.4" />
                  <polygon points="200,136 261.3,180.3 237.8,251.4 162.2,251.4 138.7,180.3" />
                  <polygon points="200,168 231.0,190.1 219.0,225.7 181.0,225.7 169.0,190.1" />
                </g>
                <g stroke="#E5E3DD" strokeWidth="1">
                  <line x1="200" y1="200" x2="200" y2="40" />
                  <line x1="200" y1="200" x2="352.4" y2="150.7" />
                  <line x1="200" y1="200" x2="294.2" y2="328.5" />
                  <line x1="200" y1="200" x2="105.8" y2="328.5" />
                  <line x1="200" y1="200" x2="47.6" y2="150.7" />
                </g>

                {/* A1-snitt */}
                <polygon
                  points="200,104 270,170 256.6,277.1 152,265 116,165"
                  fill="rgba(94,92,87,0.18)"
                  stroke="#5E5C57"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Markus */}
                <polygon
                  points="200,72 322,160 256.6,277.1 124.6,302.8 100,158"
                  fill="rgba(209,248,67,0.45)"
                  stroke="#005840"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {[
                  { cx: 200, cy: 72 },
                  { cx: 322, cy: 160 },
                  { cx: 256.6, cy: 277.1 },
                  { cx: 124.6, cy: 302.8 },
                  { cx: 100, cy: 158 },
                ].map((p, i) => (
                  <circle key={i} cx={p.cx} cy={p.cy} r="5" fill="#D1F843" stroke="#005840" strokeWidth="2" />
                ))}

                <g fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" letterSpacing="0.10em" fill="#0A1F17">
                  <text x="200" y="30" textAnchor="middle">FYS</text>
                  <text x="370" y="148" textAnchor="middle">TEK</text>
                  <text x="306" y="350" textAnchor="middle">SLAG</text>
                  <text x="94" y="350" textAnchor="middle">SPILL</text>
                  <text x="30" y="148" textAnchor="middle">TURN</text>
                </g>
                <g fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" fill="#005840">
                  <text x="218" y="68" textAnchor="start">72</text>
                  <text x="336" y="155" textAnchor="start">85</text>
                  <text x="272" y="278" textAnchor="start">68</text>
                  <text x="112" y="318" textAnchor="end">75</text>
                  <text x="92" y="154" textAnchor="end">42</text>
                </g>
              </svg>

              <div className="radar-legend">
                <span className="sw">
                  <span className="box" style={{ background: "#005840" }} />
                  Markus (siste 30 d)
                </span>
                <span className="sw">
                  <span className="box" style={{ background: "#5E5C57" }} />
                  A1-snitt (n=12)
                </span>
                <span className="sw" style={{ marginLeft: "auto", color: "var(--ink)" }}>
                  Skala 0–100
                </span>
              </div>
            </div>

            {/* AI-FORSLAG + COACH-ACTIONS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div
                className="card"
                style={{
                  padding: "20px 22px",
                  background: "linear-gradient(160deg,#FCFEEC 0%,var(--card) 50%)",
                  borderColor: "rgba(191,233,51,0.45)",
                }}
              >
                <div className="eyebrow">
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: "-2px" }}>
                    <use href="#i-trend-up" />
                  </svg>{" "}
                  AI-FORSLAG · NESTE TEST
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "18px",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    marginTop: "10px",
                  }}
                >
                  Tildel <em className="italic-accent">MTQ stress-skåre</em>
                </h3>
                <p style={{ fontSize: "13px", color: "var(--ink)", lineHeight: 1.5, marginTop: "8px" }}>
                  Markus mangler hele TURN-disiplinen og er <strong>0,008 unna PR</strong> på Driver Basic — riktig tid å baseline mental tøffhet før neste turnering (Sørlandsåpent 8. juni).
                </p>
                <div style={{ display: "flex", gap: "6px", marginTop: "14px", flexWrap: "wrap" }}>
                  <button className="btn btn-primary btn-sm">Tildel MTQ</button>
                  <button className="btn btn-outline btn-sm">Andre forslag (3)</button>
                </div>
              </div>

              <div className="coach-actions">
                <div className="ca-card">
                  <div className="ic">
                    <svg fill="none" stroke="currentColor"><use href="#i-plus" /></svg>
                  </div>
                  <div>
                    <div className="ttl">Tildel test</div>
                    <div className="desc">Velg fra batteriet og planlegg dato.</div>
                  </div>
                  <div className="arr">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-arrow-right" /></svg>
                  </div>
                </div>
                <div className="ca-card alt">
                  <div className="ic">
                    <svg fill="none" stroke="currentColor"><use href="#i-cal-plus" /></svg>
                  </div>
                  <div>
                    <div className="ttl">Test-runde</div>
                    <div className="desc">Alle 5 disipliner · termin-uke.</div>
                  </div>
                  <div className="arr">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-arrow-right" /></svg>
                  </div>
                </div>
                <div className="ca-card">
                  <div className="ic">
                    <svg fill="none" stroke="currentColor"><use href="#i-download" /></svg>
                  </div>
                  <div>
                    <div className="ttl">Foreldrerapport</div>
                    <div className="desc">PDF · siste 90 dager + benchmarks.</div>
                  </div>
                  <div className="arr">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-arrow-right" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
