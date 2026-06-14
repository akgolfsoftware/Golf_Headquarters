/**
 * /admin/spillere/[id]/tester — coach-view av en spillers tester.
 *
 * Visuelt portet fra Claude Design-handoff, men ALL data er ekte (Prisma via
 * loadSpillerTesterData). Radaret viser DEKNING per disiplin (tester målt /
 * tilgjengelig) — ikke en fabrikkert 0–100 ferdighetsskala eller «A1-snitt».
 * Nivå vises kun der testen har ekte benchmarks (FYS uten → ingen nivå).
 */

import Link from "next/link";
import "../planlegge-v2/styles.css";
import { PlanleggeSprite } from "../planlegge-v2/icons";
import type { SpillerTesterData } from "@/lib/admin/spiller-tester-data";

const RADIUS = 160;
const CX = 200;
const CY = 200;
// Akse-vinkler (grader): FYS topp, så med klokka. Matcher det statiske rutenettet.
const VINKEL: Record<string, number> = { FYS: -90, TEK: -18, SLAG: 54, SPILL: 126, TURN: 198 };

function punkt(area: string, pct: number): [number, number] {
  const a = (VINKEL[area] ?? -90) * (Math.PI / 180);
  const r = (RADIUS * Math.max(0, Math.min(100, pct))) / 100;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

const NAVN_POS: Record<string, { x: number; y: number; anchor: "start" | "middle" | "end" }> = {
  FYS: { x: 200, y: 30, anchor: "middle" },
  TEK: { x: 370, y: 148, anchor: "middle" },
  SLAG: { x: 306, y: 350, anchor: "middle" },
  SPILL: { x: 94, y: 350, anchor: "middle" },
  TURN: { x: 30, y: 148, anchor: "middle" },
};

function fmtHcp(hcp: number | null): string {
  return hcp != null ? hcp.toFixed(1).replace(".", ",") : "—";
}

export function CoachSpillerTesterTabScreen({
  data,
  playerId,
}: {
  data: SpillerTesterData;
  playerId: string;
}) {
  const { player, omrader, sterkeste, svakeste } = data;
  const batteriPct = data.testsTotal > 0 ? Math.round((data.testsDone / data.testsTotal) * 100) : 0;
  const dekningPolygon = omrader
    .map((o) => punkt(o.area, o.coveragePct))
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  return (
    <div className="planlegge-scope">
      <PlanleggeSprite />

      <main className="main">
        <header className="topbar">
          <Link
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
          </Link>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)", letterSpacing: "0.04em" }}>
            AgencyOS &nbsp;/&nbsp; Stall &nbsp;/&nbsp; <span style={{ color: "var(--ink)", fontWeight: 700 }}>{player.name}</span>
          </div>
        </header>

        <div className="page" style={{ maxWidth: "1480px" }}>
          {/* PLAYER HEADER */}
          <section className="p-header">
            <div className="avatar xl">{player.initials}</div>
            <div>
              <h1>{player.name}</h1>
              <div className="meta">
                <span className="pill pill-pro">{player.tier}</span>
                <span>HCP <strong>{fmtHcp(player.hcp)}</strong></span>
                {player.alder != null && (
                  <>
                    <span className="dot" />
                    <span>{player.alder} år</span>
                  </>
                )}
                {player.homeClub && (
                  <>
                    <span className="dot" />
                    <span><strong>{player.homeClub}</strong></span>
                  </>
                )}
                {player.sistAktiv && (
                  <>
                    <span className="dot" />
                    <span>Sist aktiv {player.sistAktiv}</span>
                  </>
                )}
              </div>
            </div>
            <div className="actions">
              <Link className="btn btn-outline btn-sm" href={`/admin/tester/tildel/${playerId}`}>
                <svg fill="none" stroke="currentColor"><use href="#i-plus" /></svg>
                Tildel test
              </Link>
            </div>
          </section>

          {/* TAB BAR */}
          <nav className="tabs">
            <button className="tab">Profil</button>
            <button className="tab">Plan</button>
            <button className="tab">Økter</button>
            <button className="tab">Runder</button>
            <button className="tab">Mål</button>
            <button className="tab active">Tester <span className="ct">{data.testsDone}/{data.testsTotal}</span></button>
            <button className="tab">Helse</button>
            <button className="tab">WAGR</button>
            <button className="tab">Foreldre</button>
            <button className="tab">Innstillinger</button>
          </nav>

          {/* KPI ROW */}
          <section className="kpi-row">
            <div className="kpi featured">
              <div className="lbl">Tester gjennomført</div>
              <div className="val">{data.testsDone}<span className="sm">/{data.testsTotal}</span></div>
              <div className="sub">{batteriPct}% av batteriet · {data.measurements} målinger</div>
            </div>
            <div className="kpi">
              <div className="lbl">Disipliner dekket</div>
              <div className="val">{data.omraderDekket}<span className="sm">/5</span></div>
              <div className="sub">pyramide-områder med målinger</div>
            </div>
            <div className="kpi">
              <div className="lbl">Sterkeste dekning</div>
              <div className="val" style={{ fontSize: "22px" }}>
                {sterkeste ? `${sterkeste.area} · ${sterkeste.label}` : "—"}
              </div>
              <div className="sub">
                {sterkeste ? `${sterkeste.coveragePct}% dekket${sterkeste.bestLevel ? ` · nivå ${sterkeste.bestLevel}` : ""}` : "Ingen målinger ennå"}
              </div>
            </div>
            <div className="kpi">
              <div className="lbl">Svakeste dekning</div>
              <div className="val" style={{ fontSize: "22px", color: "var(--warn)" }}>
                {svakeste ? `${svakeste.area} · ${svakeste.label}` : "—"}
              </div>
              <div className="sub" style={{ color: "var(--warn)" }}>
                {svakeste ? `${svakeste.measured} av ${svakeste.available} tester tatt` : ""}
              </div>
            </div>
          </section>

          {/* RADAR + NESTE-TEST GRID */}
          <section className="radar-grid">
            {/* RADAR — dekning per disiplin */}
            <div className="card radar-card">
              <div className="card-h" style={{ marginBottom: "6px" }}>
                <div>
                  <div className="eyebrow">RADAR · 5 DISIPLINER</div>
                  <h2 style={{ marginTop: "4px" }}>Dekning per disiplin</h2>
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

                {/* Dekning */}
                <polygon
                  points={dekningPolygon}
                  fill="rgba(209,248,67,0.45)"
                  stroke="#005840"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                {omrader.map((o) => {
                  const [x, y] = punkt(o.area, o.coveragePct);
                  return <circle key={o.area} cx={x} cy={y} r="5" fill="#D1F843" stroke="#005840" strokeWidth="2" />;
                })}

                <g fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" letterSpacing="0.10em" fill="#0A1F17">
                  {omrader.map((o) => {
                    const p = NAVN_POS[o.area];
                    return <text key={o.area} x={p.x} y={p.y} textAnchor={p.anchor}>{o.area}</text>;
                  })}
                </g>
                <g fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" fill="#005840">
                  {omrader.map((o) => {
                    // Plasser prosenten rett under akse-navnet (alltid utenfor radaret).
                    const p = NAVN_POS[o.area];
                    return (
                      <text key={o.area} x={p.x} y={p.y + 13} textAnchor={p.anchor}>
                        {o.coveragePct}%
                      </text>
                    );
                  })}
                </g>
              </svg>

              <div className="radar-legend">
                <span className="sw">
                  <span className="box" style={{ background: "hsl(var(--primary))" }} />
                  Dekning (tester målt / tilgjengelig)
                </span>
                <span className="sw" style={{ marginLeft: "auto", color: "var(--ink)" }}>
                  Skala 0–100 %
                </span>
              </div>
            </div>

            {/* NESTE TEST (ærlig) + COACH-ACTIONS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {svakeste && (
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
                    NESTE TEST · SVAKEST DEKKET
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
                    Dekk <em className="italic-accent">{svakeste.label}</em>
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--ink)", lineHeight: 1.5, marginTop: "8px" }}>
                    {svakeste.measured} av {svakeste.available} tester er tatt i {svakeste.label}. Tildel en test her for å gi et komplett bilde av spilleren.
                  </p>
                  <div style={{ display: "flex", gap: "6px", marginTop: "14px", flexWrap: "wrap" }}>
                    <Link className="btn btn-primary btn-sm" href={`/admin/tester/tildel/${playerId}`}>Tildel test</Link>
                  </div>
                </div>
              )}

              <div className="coach-actions">
                <Link href={`/admin/tester/tildel/${playerId}`} className="ca-card" style={{ textDecoration: "none" }}>
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
                </Link>
              </div>

              {/* Per-disiplin liste (ekte) */}
              <div className="card" style={{ padding: "8px 0" }}>
                {omrader.map((o) => (
                  <div
                    key={o.area}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "8px 18px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ color: "var(--ink)", fontWeight: 700 }}>{o.area} · {o.label}</span>
                    <span style={{ color: "var(--muted)" }}>
                      {o.measured}/{o.available} tester
                      {o.bestLevel ? ` · ${o.bestLevel}` : ""}
                      {o.lastDate ? ` · sist ${o.lastDate}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
