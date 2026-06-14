/**
 * /portal/planlegge?tab=treningsplan — pixel-perfekt port av
 * docs/design-handoff/planlegge/planlegge-treningsplan.html
 */

import "./styles.css";
import { PlanleggeSprite } from "./icons";
import { PlanleggeHeroTabs } from "./hero-tabs";

type DrillBlock = {
  kind: "fys" | "tek" | "slag" | "spill" | "turn";
  title: string;
  meta: string;
  location: string;
};

// Helper for rendering a drill-block inside a week-grid cell
function Block({ kind, title, meta, location }: DrillBlock) {
  return (
    <div className={`drill-block ${kind}`}>
      <div className="dt">{meta}</div>
      {title}
      <span className="small">{location}</span>
    </div>
  );
}

// Each row: [timeLabel, mon, tue, wed, thu, fri, sat, sun]
// fri (index 4) is "today-col" highlighted
type Row = [string, DrillBlock | null, DrillBlock | null, DrillBlock | null, DrillBlock | null, DrillBlock | null, DrillBlock | null, DrillBlock | null];

const WEEK: Row[] = [
  [
    "06:00",
    { kind: "fys", title: "Trapbar + plyo", meta: "FYS · 60 min", location: "Mulligan Gym" },
    null,
    { kind: "fys", title: "CMJ + spenst", meta: "FYS · 45 min", location: "Mulligan Gym" },
    null,
    { kind: "fys", title: "Tung styrke", meta: "FYS · 60 min", location: "Mulligan Gym" },
    null,
    null,
  ],
  [
    "10:00",
    null,
    { kind: "tek", title: "P3-P4 sekvens", meta: "TEK · 90 min", location: "GFGK Range · m/ coach" },
    { kind: "slag", title: "Driver volum", meta: "SLAG · 60 min", location: "GFGK Range · TrackMan" },
    { kind: "tek", title: "Iron sequencing", meta: "TEK · 75 min", location: "GFGK Range" },
    null,
    { kind: "slag", title: "Bane-runde 9 hull", meta: "SLAG · 120 min", location: "GFGK Bane" },
    null,
  ],
  [
    "14:00",
    { kind: "slag", title: "Putt 1-3m", meta: "SLAG · 45 min", location: "Mulligan Indoor" },
    null,
    null,
    { kind: "spill", title: "Pre-shot rutine", meta: "SPILL · 60 min", location: "m/ mentaltrener" },
    { kind: "slag", title: "Chip landingsone", meta: "SLAG · 60 min", location: "GFGK SP" },
    null,
    { kind: "turn", title: "MTQ-quiz", meta: "TURN · 30 min", location: "Hjemme" },
  ],
  [
    "17:00",
    null,
    { kind: "slag", title: "Wedges 50-100m", meta: "SLAG · 60 min", location: "GFGK Range" },
    null,
    null,
    { kind: "slag", title: "Putt langdist.", meta: "SLAG · 45 min", location: "GFGK SP" },
    null,
    null,
  ],
];

type DrillCard = {
  kind: "fys" | "tek" | "slag" | "spill" | "turn";
  pyrLabel: string;
  coverBg: string;
  coverLabel: string;
  fav: boolean;
  name: string;
  time: string;
  hasTm?: boolean;
  dots: number;
  location: string;
};

const DRILLS: DrillCard[] = [
  {
    kind: "slag",
    pyrLabel: "SLAG",
    coverBg: "linear-gradient(135deg, rgba(0,88,64,0.12), rgba(209,248,67,0.18))",
    coverLabel: "Driver — gate",
    fav: true,
    name: "Driver gate-drill",
    time: "25 min",
    hasTm: true,
    dots: 4,
    location: "GFGK Range · Mulligan",
  },
  {
    kind: "fys",
    pyrLabel: "FYS",
    coverBg: "linear-gradient(135deg, rgba(0,88,64,0.18), rgba(0,88,64,0.05))",
    coverLabel: "Trapbar 3×5",
    fav: false,
    name: "Trapbar deadlift 3×5",
    time: "35 min",
    dots: 3,
    location: "Mulligan Gym",
  },
  {
    kind: "tek",
    pyrLabel: "TEK",
    coverBg: "linear-gradient(135deg, rgba(26,125,86,0.15), rgba(26,125,86,0.05))",
    coverLabel: "P3-P4 sekvens",
    fav: true,
    name: "P3 → P4 posisjons-drill",
    time: "45 min",
    hasTm: true,
    dots: 5,
    location: "GFGK Range · m/ coach",
  },
  {
    kind: "slag",
    pyrLabel: "SLAG",
    coverBg: "linear-gradient(135deg, rgba(209,248,67,0.25), rgba(209,248,67,0.05))",
    coverLabel: "Putt 1-3m · 30 putt",
    fav: false,
    name: "Putt 1-3m · ladder",
    time: "20 min",
    dots: 2,
    location: "GFGK SP · Mulligan Indoor",
  },
  {
    kind: "spill",
    pyrLabel: "SPILL",
    coverBg: "linear-gradient(135deg, rgba(184,133,42,0.20), rgba(184,133,42,0.05))",
    coverLabel: "Course mgmt",
    fav: false,
    name: "Course mgmt — 9 hull",
    time: "120 min",
    dots: 4,
    location: "GFGK Bane",
  },
  {
    kind: "turn",
    pyrLabel: "TURN",
    coverBg: "linear-gradient(135deg, rgba(94,92,87,0.18), rgba(94,92,87,0.05))",
    coverLabel: "Pre-shot 7 sek",
    fav: false,
    name: "Pre-shot rutine 7-sek",
    time: "30 min",
    dots: 3,
    location: "m/ mentaltrener",
  },
];

export function TreningsplanScreen({
  playerName,
  playerInitials,
  hcp,
  seasonYear,
}: {
  playerName: string;
  playerInitials: string;
  hcp: number | null;
  seasonYear: number;
}) {
  return (
    <div className="planlegge-scope">
      <PlanleggeSprite />

      <main className="main">
        <header className="topbar">
          <a className="back" href="/portal">
            <svg fill="none" stroke="currentColor"><use href="#i-arrow-left" /></svg>
            PlayerHQ
          </a>
          <div className="player">
            <div className="avatar">{playerInitials}</div>
            <div>
              <div className="nm">{playerName}</div>
              <div className="sub">
                A1 · HCP {hcp != null ? hcp.toFixed(1).replace(".", ",") : "—"} · Sesong {seasonYear}
              </div>
            </div>
          </div>
        </header>

        <div className="page" style={{ maxWidth: "1380px" }}>
          {/* Custom hero for treningsplan */}
          <section className="hero">
            <div>
              <div className="eyebrow">PlayerHQ · Planlegge · Treningsplan</div>
              <h1>
                Treningsplan <em>uke 21</em>
              </h1>
              <div className="sub">
                <strong style={{ color: "var(--ink)", fontWeight: 700 }}>Spesialisering</strong>
                <span className="dot" />
                <strong style={{ color: "var(--ink)", fontWeight: 700 }}>12</strong> økter planlagt denne uka
                <span className="dot" />
                CS-progresjon <strong style={{ color: "var(--success)", fontWeight: 700 }}>+2,1 mph</strong>
              </div>
            </div>
            <div className="actions">
              <button className="btn btn-outline btn-sm">
                <svg fill="none" stroke="currentColor"><use href="#i-cal" /></svg>
                Be coach om plan
              </button>
              <button className="btn btn-lime">
                <svg fill="none" stroke="currentColor"><use href="#i-sparkles" /></svg>
                AI-generer uke
              </button>
            </div>
          </section>

          <PlanleggeHeroTabsOnly activeTab="treningsplan" />

          {/* TECH-PLAN CARD */}
          <section className="tech-plan">
            <div className="tech-h">
              <span className="tag">
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><use href="#i-target" /></svg>
                Aktiv teknisk plan
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--muted)", letterSpacing: "0.06em", marginLeft: "auto" }}>
                Sist oppdatert 21. mai · av coach Anders
              </span>
              <h2>
                Vinter <em>{seasonYear}</em> · grunntrening &amp; spesialisering
              </h2>
            </div>

            <div className="tech-kpi">
              <div className="tk status-aktiv">
                <div className="l">Status</div>
                <div className="v">Aktiv</div>
                <div className="s">17. nov 2025 → 14. jun 2026</div>
              </div>
              <div className="tk">
                <div className="l">Periode</div>
                <div className="v" style={{ fontSize: "16px" }}>Uke 21 / 30</div>
                <div className="s">70% gjennomført · 9 uker igjen</div>
                <div className="ringseg">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className={`seg ${i < 7 ? "done" : i === 7 ? "cur" : ""}`} />
                  ))}
                </div>
              </div>
              <div className="tk">
                <div className="l">CS-progresjon</div>
                <div className="v delta-up">
                  +2,1<span className="u"> mph</span>
                </div>
                <div className="s">109,9 → 112,0 driver</div>
              </div>
              <div className="tk">
                <div className="l">TM hit-rate</div>
                <div className="v">68<span className="u">%</span></div>
                <div className="s">spread inn snittet 6,2m → 5,1m</div>
              </div>
            </div>

            <div className="tech-sub">
              <div className="sub-tabs">
                <button className="sub-tab active">Oversikt</button>
                <button className="sub-tab">Posisjoner</button>
                <button className="sub-tab">Drills</button>
                <button className="sub-tab">Hit-rate</button>
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginLeft: "auto" }}>Åpne hele planen →</button>
            </div>

            <div className="now-note">
              <svg fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-info" /></svg>
              <div>
                <strong>Coach Anders sin kommentar (denne uka):</strong> &quot;Hold fokus på P3-P4 i swingsekvensen. Vi øker bag-volum til 6×/uke før Sørlandsåpent. Putt-økter 3×/uke fortsatt.&quot;
              </div>
            </div>
          </section>

          {/* WEEK-GRID */}
          <section className="card week-card">
            <div className="week-h">
              <button className="nav-arrow" aria-label="Forrige uke">
                <svg width="14" height="14" fill="none" stroke="currentColor"><use href="#i-chevron-l" /></svg>
              </button>
              <h2>Uke 21</h2>
              <span className="wk-range">18. → 24. mai {seasonYear}</span>
              <button className="nav-arrow" aria-label="Neste uke">
                <svg width="14" height="14" fill="none" stroke="currentColor"><use href="#i-chevron-r" /></svg>
              </button>

              <div className="view-switch">
                <button>Dag</button>
                <button className="active">Uke</button>
                <button>Måned</button>
              </div>
            </div>

            <div className="week-grid">
              <div className="wg-cell head" />
              {["Man 18", "Tir 19", "Ons 20", "Tor 21", "Fre 22", "Lør 23", "Søn 24"].map((d, i) => {
                const [dn, dt] = d.split(" ");
                return (
                  <div key={d} className={`wg-cell head${i === 4 ? " today" : ""}`}>
                    <div className="dn">{dn}</div>
                    <div className="dt">{dt}</div>
                  </div>
                );
              })}

              {WEEK.map((row, ri) => (
                <div key={ri} style={{ display: "contents" }}>
                  <div className="wg-cell time">{row[0] as string}</div>
                  {(row.slice(1) as (DrillBlock | null)[]).map((cell, ci) => (
                    <div key={ci} className={`wg-cell${ci === 4 ? " today-col" : ""}`}>
                      {cell && <Block {...cell} />}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="gantt-legend" style={{ marginTop: "14px" }}>
              <span className="sw"><span className="box" style={{ background: "var(--pyr-fys)" }} />FYS</span>
              <span className="sw"><span className="box" style={{ background: "var(--pyr-tek)" }} />TEK</span>
              <span className="sw"><span className="box" style={{ background: "var(--lime)" }} />SLAG</span>
              <span className="sw"><span className="box" style={{ background: "var(--pyr-spill)" }} />SPILL</span>
              <span className="sw"><span className="box" style={{ background: "var(--pyr-turn)" }} />TURN</span>
              <span className="sw" style={{ marginLeft: "auto" }}>
                12 økter planlagt · 14 t 45 min · dra blokker for å flytte
              </span>
            </div>
          </section>

          {/* DRILL BIBLIOTEK */}
          <section className="card t-strip-card">
            <div className="card-h" style={{ marginBottom: "14px" }}>
              <div>
                <div className="eyebrow">DRILL-BIBLIOTEK · 48 DRILLS</div>
                <h2 style={{ marginTop: "4px" }}>Legg til denne uka</h2>
              </div>
              <div className="right">
                <div className="sub-tabs">
                  <button className="sub-tab">
                    Favoritter{" "}
                    <span style={{ marginLeft: "4px", fontWeight: 600, fontSize: "9px", background: "var(--lime)", color: "var(--forest)", padding: "0 5px", borderRadius: "999px" }}>
                      8
                    </span>
                  </button>
                  <button className="sub-tab active">Anbefalt</button>
                  <button className="sub-tab">Coach foreslår</button>
                </div>
              </div>
            </div>

            <div className="t-strip h-scroll">
              {DRILLS.map((d, i) => (
                <div key={i} className="drill-card">
                  <div className="cover" style={{ background: d.coverBg }}>
                    <span className={`pyr pyr-${d.kind}`} style={{ position: "absolute", top: "8px", left: "8px" }}>
                      {d.pyrLabel}
                    </span>
                    <button className={`fav${d.fav ? " on" : ""}`} aria-label="Favoritt">
                      <svg fill={d.fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth={d.fav ? undefined : "1.75"}>
                        <use href="#i-star" />
                      </svg>
                    </button>
                    <span>{d.coverLabel}</span>
                  </div>
                  <div className="nm">{d.name}</div>
                  <div className="meta">
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-clock" /></svg>
                    {" "}{d.time}
                    {d.hasTm && (
                      <>
                        <span className="sep">·</span>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-info" /></svg>
                      </>
                    )}
                    <span className="sep">·</span>
                    <span className="dots">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j} className={`d${j < d.dots ? " on" : ""}`} />
                      ))}
                    </span>
                  </div>
                  <div className="meta">{d.location}</div>
                  <button className="add">
                    <svg fill="none" stroke="currentColor" strokeWidth="2.5"><use href="#i-plus" /></svg>
                    Legg til uka
                  </button>
                </div>
              ))}
            </div>

            <div className="now-note">
              <svg fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-sparkles" /></svg>
              <div>
                Trenger flere drills? <strong>AI foreslår basert på SG-svakhet</strong> i siste 90 dager.
              </div>
              <a href="/portal/ai/foresla-drill" className="btn btn-lime btn-sm" style={{ marginLeft: "auto" }}>
                AI foreslå drill
                <svg fill="none" stroke="currentColor" strokeWidth="2"><use href="#i-arrow-right" /></svg>
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Renders only the plan-tabs nav (since this screen uses its own custom hero)
function PlanleggeHeroTabsOnly({ activeTab }: { activeTab: "arsplan" | "treningsplan" | "mal" | "turneringer" | "drills" }) {
  return <PlanleggeHeroTabs activeTab={activeTab} counts={{ treningsplan: 12, mal: 3, turneringer: 7, drills: 48 }} />;
}
