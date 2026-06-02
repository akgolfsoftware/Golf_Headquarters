// ============================================================
// DirBDashboardBody — ported 1:1 from v10 workbench-dir-b.jsx
// (DirBDashboardBody). B-styled dashboard, list-first: 4 KPI cards,
// 2-col grid (pyramide donut + 8-week sparkline trends), then the
// balance bars (plan vs periode-mål). No pyramide-strip, no
// slide-over — purely presentational.
// ============================================================
import { Icon } from "./icon";
import { DASH_BALANCE, DASH_PIE_SEG, DASH_PIE_TOTAL, DASH_TRENDS, DIRB_DASH_KPIS } from "./data";

// conic-gradient stops from the pyramide hour segments
function pieBackground(): string {
  let acc = 0;
  const stops = DASH_PIE_SEG.map((s) => {
    const start = acc;
    acc += (s.hrs / DASH_PIE_TOTAL) * 360;
    return `${s.color} ${start}deg ${acc}deg`;
  }).join(", ");
  return `conic-gradient(${stops})`;
}

// sparkline path (same maths as v10)
function sparkPath(vals: number[], w = 100, h = 24): string {
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

function sparkEnd(vals: number[]): { x: number; y: number } {
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  const i = vals.length - 1;
  const x = (i / (vals.length - 1)) * 100;
  const y = 24 - ((vals[i] - min) / range) * 20 - 2;
  return { x, y };
}

export function DirBDashboardBody() {
  const pieBg = pieBackground();

  return (
    <section className="wbb-dash">
      <div className="wbb-dash-kpis">
        {DIRB_DASH_KPIS.map((k) => (
          <div className="kpi" key={k.eb}>
            <div className="eb">{k.eb}</div>
            <div className="v" style={k.vCls === "destructive" ? { color: "var(--destructive)" } : undefined}>
              {k.v}
            </div>
            <div className={"d " + k.dCls}>
              <Icon n={k.dIcon} w={10} h={10} />
              {k.d}
            </div>
          </div>
        ))}
      </div>

      <div className="wbb-dash-grid">
        <div className="wbb-dash-card">
          <div className="sec-lbl">
            <span>PYRAMIDE · UKE 22</span>
            <span>12,5 T TOTAL</span>
          </div>
          <div className="pie-wrap">
            <div className="pie" style={{ background: pieBg }}>
              <div className="hole">
                <div className="v">12,5 t</div>
                <div className="l">PLANLAGT</div>
              </div>
            </div>
            <div className="lgnd">
              {DASH_PIE_SEG.map((s) => (
                <div className="row" key={s.key}>
                  <span className="sw" style={{ background: s.color }} />
                  <span className="nm">{s.lbl}</span>
                  <span className="hrs">{s.hrs.toString().replace(".", ",")} t</span>
                  <span className="pct">{Math.round((s.hrs / DASH_PIE_TOTAL) * 100)} %</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="wbb-dash-card">
          <div className="sec-lbl">
            <span>TRENDER · 8 UKER</span>
            <span>TIMER / UKE</span>
          </div>
          <div className="trends">
            {DASH_TRENDS.map((t) => {
              const end = sparkEnd(t.vals);
              return (
                <div className="t-row" key={t.lbl}>
                  <span className="l">{t.lbl}</span>
                  <svg className="spark" viewBox="0 0 100 24" preserveAspectRatio="none">
                    <path
                      d={sparkPath(t.vals)}
                      fill="none"
                      stroke={t.col}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx={end.x} cy={end.y} r="1.8" fill={t.col} />
                  </svg>
                  <span className={"d " + t.cls}>{t.d}</span>
                  <span className="ic">{t.warn ? <Icon n="alert-triangle" w={12} h={12} /> : null}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="wbb-dash-card wbb-dash-bal">
        <div className="sec-lbl">
          <span>BALANSE · PLAN VS PERIODE-MÅL</span>
          <span>U. 19–24</span>
        </div>
        <div className="bars">
          {DASH_BALANCE.map((b) => (
            <div className="row" key={b.lbl}>
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
        <div className="bal-leg">
          <span>
            <span className="sw bg-cream" />
            MÅL
          </span>
          <span>
            <span className="sw bg-fg" />
            FAKTISK
          </span>
        </div>
      </div>
    </section>
  );
}
