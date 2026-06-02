// ============================================================
// DashboardView — ported 1:1 from v10 workbench-views.jsx
// (DashboardView). 4 KPI cards + pyramide-pie (conic-gradient)
// + 8-week trends (SVG sparklines) + balance bars (plan vs mål).
// Rent presentasjonelt — ingen interaksjon (per manifest §4 a-dash).
//
// Icon sizes mirror v10: in v10 the lucide UMD rendered an <i> that
// `.dash-card .delta i { width:11px }` sized down to 11px. Our React
// <Icon> renders <svg> directly (the `i` selector no longer matches),
// so the delta icons pass w/h=11 explicitly to match the v10 pixels.
// The trend warn icon passed w/h=14 explicitly in v10 — kept as-is.
// ============================================================
import { Icon } from "./icon";
import { DASH_PIE_SEG, DASH_PIE_TOTAL, DASH_TRENDS, DASH_BALANCE } from "./data";

// Sparkline helper — returns the SVG path `d` for an 8-point line.
// Ported 1:1 from v10 (w=100, h=32, 2px top/bottom inset).
function spark(vals: number[], w = 100, h = 32): string {
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  return vals
    .map((v, i) => {
      const x = (i / (vals.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function DashboardView() {
  // Conic-gradient pie for pyramide-fordeling. Build cumulative angle
  // stops without mutating a closure variable (React-compiler-safe).
  const stops = DASH_PIE_SEG.map((s, i) => {
    const start = DASH_PIE_SEG.slice(0, i).reduce(
      (a, p) => a + (p.hrs / DASH_PIE_TOTAL) * 360,
      0,
    );
    const end = start + (s.hrs / DASH_PIE_TOTAL) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  }).join(", ");
  const pieBg = `conic-gradient(${stops})`;

  return (
    <section className="dash">
      {/* Top KPI strip */}
      <div className="dash-card kpi-card">
        <div className="eb">
          <span>TIMER PLANLAGT</span>
          <span>UKE 22</span>
        </div>
        <div className="val">12,5 t</div>
        <div className="delta up">
          <Icon n="trending-up" w={11} h={11} /> +2 t vs forrige
        </div>
      </div>
      <div className="dash-card kpi-card">
        <div className="eb">
          <span>ØKTER · UKE</span>
          <span>AKTUELT</span>
        </div>
        <div className="val">4 / 5</div>
        <div className="delta down">
          <Icon n="trending-down" w={11} h={11} /> −1 vs plan
        </div>
      </div>
      <div className="dash-card kpi-card">
        <div className="eb">
          <span>COMPLIANCE</span>
          <span>30 D</span>
        </div>
        <div className="val">88 %</div>
        <div className="delta">
          <Icon n="minus" w={11} h={11} /> Stabil
        </div>
      </div>
      <div className="dash-card kpi-card">
        <div className="eb">
          <span>SG · TOTAL</span>
          <span>SISTE 8 R</span>
        </div>
        <div className="val" style={{ color: "var(--destructive)" }}>
          −1,1
        </div>
        <div className="delta up">
          <Icon n="trending-up" w={11} h={11} /> +0,08 SG
        </div>
      </div>

      {/* Pyramide-pie */}
      <div className="dash-card pie-card">
        <div className="eb">
          <span>PYRAMIDE-FORDELING · UKE 22</span>
          <span>12,5 t total</span>
        </div>
        <div className="wrap">
          <div
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "9999px",
              background: pieBg,
              position: "relative",
              margin: "20px auto",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "32px",
                borderRadius: "9999px",
                background: "var(--card)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: "22px",
                  fontFeatureSettings: '"tnum","zero"',
                  letterSpacing: "-0.01em",
                }}
              >
                12,5 t
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--muted-foreground)",
                  marginTop: "2px",
                }}
              >
                PLANLAGT
              </div>
            </div>
          </div>
          <div className="legend">
            {DASH_PIE_SEG.map((s) => (
              <div className="lg-row" key={s.key}>
                <span className="sw" style={{ background: s.color }} />
                <span className="nm">{s.lbl}</span>
                <span className="hrs">{s.hrs.toString().replace(".", ",")} t</span>
                <span className="pct">{Math.round((s.hrs / DASH_PIE_TOTAL) * 100)} %</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trends */}
      <div className="dash-card trend-card">
        <div className="eb">
          <span>TRENDER · SISTE 8 UKER</span>
          <span>TIMER / UKE</span>
        </div>
        <div style={{ marginTop: "12px" }}>
          {DASH_TRENDS.map((t) => {
            const max = Math.max(...t.vals);
            const min = Math.min(...t.vals);
            const range = max - min || 1;
            const lastIdx = t.vals.length - 1;
            const lastVal = t.vals[lastIdx];
            const cx = (lastIdx / lastIdx) * 100;
            const cy = 32 - ((lastVal - min) / range) * 28 - 2;
            return (
              <div className="trend-row" key={t.lbl}>
                <span className="l">{t.lbl}</span>
                <svg className="spark" viewBox="0 0 100 32" preserveAspectRatio="none">
                  <path
                    d={spark(t.vals)}
                    fill="none"
                    stroke={t.col}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx={cx} cy={cy} r="2" fill={t.col} />
                </svg>
                <span className={"delta " + t.cls}>{t.d}</span>
                <span className={"ic" + (t.warn ? " warn" : "")}>
                  {t.warn ? <Icon n="alert-triangle" w={14} h={14} /> : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Balance — actual vs target */}
      <div className="dash-card bal-card">
        <div className="eb">
          <span>BALANSE · PLAN VS PERIODE-MÅL</span>
          <span>U. 19–24</span>
        </div>
        <div className="bal-bars">
          {DASH_BALANCE.map((b) => (
            <div className="bal-row" key={b.lbl}>
              <span className="l">{b.lbl}</span>
              <div className="target">
                <div className="f" style={{ width: b.target + "%" }} />
              </div>
              <div className="actual">
                <div className={"f " + b.key} style={{ width: b.actual + "%" }} />
              </div>
              <span className={"diff " + b.cls}>{b.diff}</span>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            gap: "16px",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.10em",
            color: "var(--muted-foreground)",
          }}
        >
          <span>
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "4px",
                background: "var(--cream-300)",
                verticalAlign: "middle",
                marginRight: "4px",
                borderRadius: "2px",
              }}
            />
            MÅL
          </span>
          <span>
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "4px",
                background: "var(--foreground)",
                verticalAlign: "middle",
                marginRight: "4px",
                borderRadius: "2px",
              }}
            />
            FAKTISK
          </span>
        </div>
      </div>
    </section>
  );
}
