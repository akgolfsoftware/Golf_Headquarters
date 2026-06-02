// ============================================================
// DirBSlideOver — ported 1:1 from v10 workbench-dir-b.jsx
// (DirBSlideOver). Right slide-over inspector shown only in B ·
// TIDSLINJE: selected session head + 3 KPIs + compact drill list +
// periode-fordeling mini-bars + action row. The primary "Åpne
// drill-modus" CTA (⌘D) opens the drill-overlay (Bolk 4) via the
// `onOpenDrill` callback owned by ListShell.
// ============================================================
import { Icon } from "./icon";
import { DIRB_SLIDE } from "./data";

type DirBSlideOverProps = {
  /** Open the drill-modus overlay (slide-over primary CTA / ⌘D). */
  onOpenDrill?: () => void;
};

export function DirBSlideOver({ onOpenDrill }: DirBSlideOverProps) {
  return (
    <aside className="wbb-slide">
      <div className="wbb-slide-head">
        <div className="ax-block" />
        <div className="col">
          <div className="eb">
            <span>{DIRB_SLIDE.ebLeft}</span>
            <span>{DIRB_SLIDE.ebRight}</span>
          </div>
          <div className="ttl">{DIRB_SLIDE.ttl}</div>
          <div className="sub">{DIRB_SLIDE.sub}</div>
        </div>
        <button type="button" className="close">
          <Icon n="x" />
        </button>
      </div>

      <div className="wbb-slide-sec">
        <div className="wbb-slide-kpis">
          {DIRB_SLIDE.kpis.map((k) => (
            <div className="kpi" key={k.l}>
              <div className="v" style={k.warn ? { color: "var(--warning)" } : undefined}>
                {k.v}
              </div>
              <div className="l">{k.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="wbb-slide-sec">
        <div className="sec-lbl">
          <span>{DIRB_SLIDE.drillsLbl.left}</span>
          <span>{DIRB_SLIDE.drillsLbl.right}</span>
        </div>
        <div className="wbb-drills">
          {DIRB_SLIDE.drills.map((d) => (
            <div className="wbb-drill" key={d.num}>
              <span className="num">{d.num}</span>
              <span className="nm">
                {d.nm}
                <span className="sub">{d.sub}</span>
              </span>
              <span className="reps">{d.reps}</span>
              <span className="tm">{d.tm}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wbb-slide-sec">
        <div className="sec-lbl">
          <span>{DIRB_SLIDE.periodLbl.left}</span>
          <span>{DIRB_SLIDE.periodLbl.right}</span>
        </div>
        <div className="mp">
          {DIRB_SLIDE.period.map((p) => (
            <div className="mp-row" key={p.l}>
              <span className="l">{p.l}</span>
              <div className="b">
                <div className={"f " + p.ax} style={{ width: p.width }} />
              </div>
              <span className="v">{p.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wbb-slide-actions">
        <button type="button" className="btn pri" onClick={onOpenDrill}>
          <Icon n="maximize-2" />
          Åpne drill-modus
          <span className="kbd-hint">⌘D</span>
        </button>
        <button type="button" className="btn sec">
          <Icon n="play" />
          Start Live
        </button>
        <button type="button" className="btn sec">
          <Icon n="edit-3" />
          Rediger
        </button>
        <button type="button" className="btn sec">
          <Icon n="more-horizontal" />
        </button>
      </div>
    </aside>
  );
}
