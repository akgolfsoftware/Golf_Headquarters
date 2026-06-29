/**
 * /admin/tester — pixel-perfekt port av
 * docs/design-handoff/test-modul/coach-tester-stall.html
 */

import "../planlegge-v2/styles.css";
import { PlanleggeSprite } from "../planlegge-v2/icons";

type Pyr = "fys" | "tek" | "slag" | "spill" | "turn";

type MissRow = {
  initials: string;
  name: string;
  meta: string;
  pyr: Pyr;
  test: string;
  days: number;
  kind: "overdue" | "warn";
};

const MISSING: MissRow[] = [
  { initials: "JK", name: "Julia Karlsen", meta: "A1 · HCP 2.1 · Tester sist tatt 18. mar", pyr: "fys", test: "VO₂max", days: 71, kind: "overdue" },
  { initials: "OB", name: "Oliver Brekke", meta: "A2 · HCP 5.4 · Tester sist tatt 14. mar", pyr: "tek", test: "Clubhead Speed driver", days: 75, kind: "overdue" },
  { initials: "SH", name: "Sara Hauge", meta: "B1 · HCP 8.0 · Tester sist tatt 02. apr", pyr: "slag", test: "Putt 1–3 m", days: 63, kind: "overdue" },
  { initials: "EG", name: "Emil Grøtnes", meta: "A1 · HCP 3.6 · Tester sist tatt 10. apr", pyr: "turn", test: "MTQ stress-skåre", days: 43, kind: "warn" },
  { initials: "IL", name: "Ingrid Larssen", meta: "A2 · HCP 4.9 · Tester sist tatt 22. apr", pyr: "spill", test: "Course management", days: 31, kind: "warn" },
];

type Cell = { kind: "empty" | "ok" | "soon" | "overdue"; v?: string; age?: string };

type PlayerRow = { initials: string; name: string; tag: string; cells: Cell[]; tot: string; totWarn?: boolean };

const HEADERS: { kind: Pyr; label: string }[] = [
  { kind: "fys", label: "VO₂max" },
  { kind: "fys", label: "Deadlift" },
  { kind: "tek", label: "CHS" },
  { kind: "tek", label: "Smash F" },
  { kind: "slag", label: "Driver Bsc" },
  { kind: "slag", label: "Putt 1-3m" },
  { kind: "spill", label: "D-Plane" },
  { kind: "turn", label: "MTQ" },
];

const PLAYERS: PlayerRow[] = [
  {
    initials: "ØR",
    name: "Øyvind Rohjan",
    tag: "A1 · HCP 4.8",
    cells: [
      { kind: "empty" },
      { kind: "ok", v: "142", age: "18d" },
      { kind: "ok", v: "112", age: "9d" },
      { kind: "ok", v: "1,38", age: "9d" },
      { kind: "ok", v: "67,4", age: "i dag" },
      { kind: "soon", v: "73%", age: "pågående" },
      { kind: "ok", v: "82%", age: "17d" },
      { kind: "empty" },
    ],
    tot: "6/8",
  },
  {
    initials: "JK",
    name: "Julia Karlsen",
    tag: "A1 · HCP 2.1",
    cells: [
      { kind: "overdue", v: "52", age: "71d ↑" },
      { kind: "ok", v: "98", age: "12d" },
      { kind: "ok", v: "104", age: "5d" },
      { kind: "ok", v: "1,41", age: "5d" },
      { kind: "ok", v: "71,2", age: "6d" },
      { kind: "ok", v: "86%", age: "11d" },
      { kind: "ok", v: "76%", age: "22d" },
      { kind: "ok", v: "7,2", age: "14d" },
    ],
    tot: "8/8 — 1 overdue",
    totWarn: true,
  },
  {
    initials: "EG",
    name: "Emil Grøtnes",
    tag: "A1 · HCP 3.6",
    cells: [
      { kind: "ok", v: "56", age: "11d" },
      { kind: "ok", v: "131", age: "9d" },
      { kind: "ok", v: "108", age: "3d" },
      { kind: "ok", v: "1,37", age: "3d" },
      { kind: "ok", v: "64,8", age: "8d" },
      { kind: "ok", v: "81%", age: "7d" },
      { kind: "ok", v: "78%", age: "19d" },
      { kind: "soon", v: "6,3", age: "43d" },
    ],
    tot: "8/8",
  },
  {
    initials: "OB",
    name: "Oliver Brekke",
    tag: "A2 · HCP 5.4",
    cells: [
      { kind: "ok", v: "54", age: "14d" },
      { kind: "ok", v: "128", age: "14d" },
      { kind: "overdue", v: "106", age: "75d ↑" },
      { kind: "ok", v: "1,36", age: "14d" },
      { kind: "ok", v: "62,1", age: "14d" },
      { kind: "ok", v: "78%", age: "21d" },
      { kind: "empty" },
      { kind: "ok", v: "6,8", age: "16d" },
    ],
    tot: "7/8 — 1 overdue",
    totWarn: true,
  },
  {
    initials: "SH",
    name: "Sara Hauge",
    tag: "B1 · HCP 8.0",
    cells: [
      { kind: "ok", v: "50", age: "18d" },
      { kind: "ok", v: "94", age: "11d" },
      { kind: "ok", v: "98", age: "6d" },
      { kind: "ok", v: "1,32", age: "6d" },
      { kind: "ok", v: "58,6", age: "13d" },
      { kind: "overdue", v: "68%", age: "63d ↑" },
      { kind: "empty" },
      { kind: "ok", v: "5,9", age: "28d" },
    ],
    tot: "6/8 — 1 overdue",
    totWarn: true,
  },
  {
    initials: "IL",
    name: "Ingrid Larssen",
    tag: "A2 · HCP 4.9",
    cells: [
      { kind: "ok", v: "55", age: "5d" },
      { kind: "ok", v: "112", age: "17d" },
      { kind: "ok", v: "102", age: "5d" },
      { kind: "ok", v: "1,35", age: "5d" },
      { kind: "ok", v: "66,2", age: "10d" },
      { kind: "ok", v: "79%", age: "16d" },
      { kind: "soon", v: "73%", age: "31d" },
      { kind: "ok", v: "7,1", age: "19d" },
    ],
    tot: "8/8",
  },
];

export function CoachTesterStallScreen() {
  return (
    <div className="planlegge-scope">
      <PlanleggeSprite />

      <main className="main">
        <header className="topbar">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)", letterSpacing: "0.04em" }}>
            AgencyOS &nbsp;/&nbsp; Innsikt &nbsp;/&nbsp;{" "}
            <span style={{ color: "var(--ink)", fontWeight: 700 }}>Tester · stall</span>
          </div>
          <div className="player">
            <div className="avatar">AK</div>
            <div>
              <div className="nm">Anders Kjellberg</div>
              <div className="sub">Head Coach · 38 spillere</div>
            </div>
          </div>
        </header>

        <div className="page" style={{ maxWidth: "1480px" }}>
          <section className="hero coach-hero">
            <div>
              <div className="eyebrow">AgencyOS · Innsikt · Tester · Hele stallen</div>
              <h1>
                Tester <em>på tvers</em> av stallen
              </h1>
              <div className="sub">
                <strong style={{ color: "var(--ink)", fontWeight: 700 }}>38</strong> spillere
                <span className="dot" />
                <strong style={{ color: "var(--ink)", fontWeight: 700 }}>36</strong> tester i batteriet
                <span className="dot" />
                <strong style={{ color: "var(--ink)", fontWeight: 700 }}>412</strong> målinger siste 30 dager
                <span className="dot" />
                <strong style={{ color: "var(--danger)", fontWeight: 700 }}>7</strong> spillere overdue
              </div>
            </div>
            <div className="actions">
              <button className="btn btn-outline btn-sm">Filtre</button>
              <button className="btn btn-outline btn-sm">
                <svg fill="none" stroke="currentColor"><use href="#i-download" /></svg>
                Benchmark-rapport
              </button>
              <button className="btn btn-primary">
                <svg fill="none" stroke="currentColor"><use href="#i-plus" /></svg>
                Tildel test
              </button>
            </div>
          </section>

          {/* KPI */}
          <section className="kpi-row">
            <div className="kpi featured">
              <div className="lbl">Test-dekning</div>
              <div className="val">
                68<span className="sm">%</span>
              </div>
              <div className="sub">+4% siste 30 dager</div>
            </div>
            <div className="kpi">
              <div className="lbl">Overdue (&gt; 60 dager)</div>
              <div className="val" style={{ color: "var(--danger)" }}>7</div>
              <div className="sub" style={{ color: "var(--danger)" }}>spillere mangler 1+ test</div>
            </div>
            <div className="kpi">
              <div className="lbl">Snart-due (30-60 d)</div>
              <div className="val" style={{ color: "var(--warn)" }}>12</div>
              <div className="sub" style={{ color: "var(--warn)" }}>planlegg neste 2 uker</div>
            </div>
            <div className="kpi">
              <div className="lbl">Sterkeste batteri-snitt</div>
              <div className="val" style={{ fontSize: "22px" }}>TEK · 71%</div>
              <div className="sub" style={{ color: "var(--success)" }}>
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5"><use href="#i-trend-up" /></svg>
                {" "}+3% vs april
              </div>
            </div>
          </section>

          {/* OVERDUE LIST */}
          <section className="card" style={{ padding: "20px 24px" }}>
            <div className="card-h">
              <div>
                <div className="eyebrow" style={{ color: "var(--danger)" }}>
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: "-2px" }}>
                    <use href="#i-alert" />
                  </svg>{" "}
                  SPILLERE SOM MANGLER TEST
                </div>
                <h2 style={{ marginTop: "4px" }}>Overdue og snart-due</h2>
              </div>
              <div className="right">
                <button className="btn btn-outline btn-xs">Send påminnelse alle</button>
              </div>
            </div>

            <div>
              {MISSING.map((m, i) => (
                <div key={i} className="miss-row">
                  <div className="left">
                    <div className="av">{m.initials}</div>
                    <div>
                      <div className="nm">{m.name}</div>
                      <div className="meta">{m.meta}</div>
                    </div>
                  </div>
                  <div className="test-lbl">
                    <span className={`pyr pyr-${m.pyr}`}>{m.pyr.toUpperCase()}</span> &nbsp; {m.test}
                  </div>
                  <div className={`since ${m.kind}`}>
                    {m.days} dager
                    <span className="sub">{m.kind === "overdue" ? "OVERDUE" : "SNART DUE"}</span>
                  </div>
                  <button className={`btn ${m.kind === "overdue" ? "btn-primary" : "btn-outline"} btn-sm`}>Tildel</button>
                </div>
              ))}
            </div>

            <div className="legend">
              <span className="sw">
                <span className="box" style={{ background: "rgba(163,45,45,0.10)", border: "1px solid rgba(163,45,45,0.30)" }} />
                Overdue · &gt; 60 dager
              </span>
              <span className="sw">
                <span className="box" style={{ background: "rgba(184,133,42,0.15)", border: "1px solid rgba(184,133,42,0.30)" }} />
                Snart due · 30–60 dager
              </span>
              <span className="sw">
                <span className="box" style={{ background: "rgba(44,125,82,0.10)", border: "1px solid rgba(44,125,82,0.30)" }} />
                OK · &lt; 30 dager
              </span>
            </div>
          </section>

          {/* COVERAGE MATRIX */}
          <section className="card matrix-card">
            <div className="card-h">
              <div>
                <div className="eyebrow">TEST-DEKNING · A1-KOHORT (n=12)</div>
                <h2 style={{ marginTop: "4px" }}>Hvem har tatt hvilken test?</h2>
              </div>
              <div className="right">Klikk en celle for detalj · grønt = OK · oker = snart due · rødt = overdue</div>
            </div>

            <div style={{ overflowX: "auto" }}>
            <div className="matrix" style={{ minWidth: 880 }}>
              <div className="cell h player">Spiller</div>
              {HEADERS.map((h, i) => (
                <div key={i} className="cell h">
                  <span className={`pyr pyr-${h.kind}`}>{h.label}</span>
                </div>
              ))}
              <div className="cell h tot">DEKNING</div>

              {PLAYERS.map((p, i) => (
                <div key={`p${i}`} style={{ display: "contents" }}>
                  <div className="cell player">
                    <div className="av">{p.initials}</div>
                    <div>
                      <div className="nm">{p.name}</div>
                      <div className="tag">{p.tag}</div>
                    </div>
                  </div>
                  {p.cells.map((c, j) => (
                    <div key={j} className={`cell score ${c.kind}`}>
                      {c.kind === "empty" ? (
                        "—"
                      ) : (
                        <>
                          <span className="v">{c.v}</span>
                          <span className="age">{c.age}</span>
                        </>
                      )}
                    </div>
                  ))}
                  <div className={`cell tot${p.totWarn ? " warn" : ""}`}>{p.tot}</div>
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
