// ============================================================
// WBSidebar — ported 1:1 from v10 workbench-chrome.jsx
// 7 collapsible groups. Open/closed state is static (matches v10).
//
// W5b: `tournaments`/`goals`/`pyramid` are optional real Prisma data.
//   - Turneringer (gruppe 4) + Mål (gruppe 6): rene ekte mappinger.
//   - Stats·pyramide (gruppe 7): bar-bredder drives av ekte 30-d
//     fordeling (pct); SG-tallene har INGEN schema-kilde og forblir
//     v10-demo (SIDEBAR_PYRAMIDE) — bevisst (W5b-rapport).
// Sesong-tre (gruppe 1), Planer (2), Standardøkter (3),
// Treningsplaner (5) og ubalanse-alarmen forblir v10-demo.
// Mangler prop → alt v10-demo.
// ============================================================
import { Icon } from "./icon";
import {
  SIDEBAR_GOALS,
  SIDEBAR_PYRAMIDE,
  SIDEBAR_STANDARDOKTER,
  SIDEBAR_TURNERINGER,
  type Axis,
} from "./data";

type WBSidebarProps = {
  tournaments?: { tn: string; td: string; soon?: boolean }[];
  goals?: { gn: string; gm: string; ax: Axis }[];
  pyramid?: { lbl: string; ax: Axis; hours: number; pct: number }[];
};

export function WBSidebar({ tournaments, goals, pyramid }: WBSidebarProps = {}) {
  const turneringer = tournaments ?? SIDEBAR_TURNERINGER;
  // Mål mappes til v10-formen; gpct/width har ingen kilde → 0-bredde når ekte.
  const maalRows = goals
    ? goals.map((g) => ({ gn: g.gn, gm: g.gm, ax: g.ax, gpct: "", width: "0%" }))
    : SIDEBAR_GOALS;
  const turneringerCount = turneringer.filter((t) => t.soon).length;
  // Pyramide: behold v10-demo-radene (rekkefølge + SG), men overstyr bar-bredde
  // med ekte 30-d pct når data finnes. Match per akse.
  const pyrRows = SIDEBAR_PYRAMIDE.map((row) => {
    const real = pyramid?.find((p) => p.ax === row.ax);
    return real ? { ...row, width: `${real.pct}%` } : row;
  });

  return (
    <aside className="sb">
      {/* 1. Sesong */}
      <div className="grp is-open">
        <button type="button" className="grp-head">
          <Icon n="calendar-range" />
          <span className="lbl">Sesong</span>
          <span className="ct">2026</span>
          <Icon n="chevron-right" w={12} h={12} />
        </button>
        <div className="grp-body">
          <div className="tr-row is-open">
            <Icon n="chevron-right" w={12} h={12} />
            <span className="tr-name">
              2026-sesongen <span className="nm-meta">42 u</span>
            </span>
            <span />
          </div>
          <div className="tr-children">
            <div className="tr-row is-open">
              <span />
              <span className="tr-name">
                <span className="tr-period-dot grunn" />
                Grunnperiode <span className="nm-meta">u. 1–14</span>
              </span>
              <span />
            </div>
            <div className="tr-children" style={{ marginLeft: "6px" }}>
              <div className="tr-row is-active">
                <span />
                <span className="tr-name">
                  <span className="tr-live" />
                  Uke 22 <span className="nm-meta">nå</span>
                </span>
                <span />
              </div>
              <div className="tr-row">
                <span />
                <span className="tr-name">
                  Uke 23
                  <span className="tr-tag eks">eksamen</span>
                </span>
                <span />
              </div>
            </div>
            <div className="tr-row">
              <Icon n="chevron-right" w={12} h={12} />
              <span className="tr-name">
                <span className="tr-period-dot spes" />
                Spesialiseringsperiode <span className="nm-meta">u. 15–28</span>
              </span>
              <span />
            </div>
            <div className="tr-row">
              <Icon n="chevron-right" w={12} h={12} />
              <span className="tr-name">
                <span className="tr-period-dot turn" />
                Turneringsperiode <span className="nm-meta">u. 29–42</span>
              </span>
              <span />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Planer */}
      <div className="grp is-open">
        <button type="button" className="grp-head">
          <Icon n="layers" />
          <span className="lbl">Planer</span>
          <span className="ct">A / B</span>
          <Icon n="chevron-right" w={12} h={12} />
        </button>
        <div className="grp-body">
          <div className="plan-row is-active">
            <span className="pd" />
            <span className="pn">Plan A · grunnperiode</span>
            <span className="meta">2 min</span>
          </div>
          <div className="plan-row">
            <span className="pd" />
            <span className="pn">Plan B · konservativ</span>
            <span className="meta">3 dg</span>
          </div>
        </div>
      </div>

      {/* 3. Standardøkter */}
      <div className="grp is-open">
        <button type="button" className="grp-head">
          <Icon n="layout-grid" />
          <span className="lbl">Standardøkter</span>
          <span className="ct">7</span>
          <Icon n="chevron-right" w={12} h={12} />
        </button>
        <div className="grp-body">
          {SIDEBAR_STANDARDOKTER.map((o) => (
            <div className="oekt" key={o.nm}>
              <Icon n="grip-vertical" w={12} h={12} />
              <span className={"ax " + o.ax} />
              <span className="nm">
                {o.nm}
                <span className="sub">{o.sub}</span>
              </span>
              <span className="dur">{o.dur}</span>
            </div>
          ))}
          <button type="button" className="create-btn">
            <Icon n="plus" w={12} h={12} />
            Opprett standardøkt
          </button>
        </div>
      </div>

      {/* 4. Turneringer */}
      <div className="grp is-open">
        <button type="button" className="grp-head">
          <Icon n="flag" />
          <span className="lbl">Turneringer</span>
          <span className="ct">{turneringerCount} nær</span>
          <Icon n="chevron-right" w={12} h={12} />
        </button>
        <div className="grp-body">
          {turneringer.map((t) => (
            <div className="turn-row" key={t.tn}>
              <span className="tn">{t.tn}</span>
              <span className={"td" + (t.soon ? " soon" : "")}>{t.td}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Treningsplaner */}
      <div className="grp">
        <button type="button" className="grp-head">
          <Icon n="clipboard-list" />
          <span className="lbl">Treningsplaner</span>
          <span className="ct">4 aktive</span>
          <Icon n="chevron-right" w={12} h={12} />
        </button>
      </div>

      {/* 6. Mål */}
      <div className="grp is-open">
        <button type="button" className="grp-head">
          <Icon n="target" />
          <span className="lbl">Mål</span>
          <span className="ct">{goals ? String(goals.length) : "6"}</span>
          <Icon n="chevron-right" w={12} h={12} />
        </button>
        <div className="grp-body">
          {maalRows.map((g) => (
            <div className="goal-row" key={g.gn}>
              <span className="gn">
                {g.gn}
                <span className="gm">{g.gm}</span>
              </span>
              <span className="gpct">{g.gpct}</span>
              <div className={"goal-bar " + g.ax}>
                <div className="fl" style={{ width: g.width }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Stats */}
      <div className="grp is-open">
        <button type="button" className="grp-head">
          <Icon n="bar-chart-3" />
          <span className="lbl">Stats · pyramide</span>
          <span className="ct">30 d</span>
          <Icon n="chevron-right" w={12} h={12} />
        </button>
        <div className="grp-body">
          {pyrRows.map((p) => (
            <div className="py-row" key={p.lbl}>
              <span className="lbl">{p.lbl}</span>
              <div className="py-bar">
                <div className="midline" />
                <div
                  className={"fill py-fill " + p.ax}
                  style={
                    p.side === "left"
                      ? { left: "50%", width: p.width }
                      : { right: "50%", width: p.width }
                  }
                />
              </div>
              <span className={"py-sg " + p.sgCls}>{p.sg}</span>
            </div>
          ))}
          <div className="py-alarm">
            <Icon n="alert-triangle" w={12} h={12} />
            <div className="tx">
              <b>Ubalanse.</b> Taper SG i innspill, men kun 2 t SLAG siste 30 d.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
