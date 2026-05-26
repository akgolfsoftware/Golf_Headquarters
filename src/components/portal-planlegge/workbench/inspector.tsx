"use client";

/**
 * WBP_Inspector — høyre panel.
 * Viser valgt-økt, periode-pyramide, test-snarveier, neste handlinger.
 */

import { WBPIc } from "./icon";
import { usePlanContext } from "./plan-context";

const TEST_SHORTCUTS = [
  { id: "cmj", label: "CMJ", axis: "fys" as const },
  { id: "sprint", label: "Sprint 30m", axis: "fys" as const },
  { id: "putt-konsistens", label: "Putt-konsistens", axis: "slag" as const },
  { id: "wedge-spinn", label: "Wedge-spinn", axis: "slag" as const },
  { id: "iron-treff", label: "Iron-treff", axis: "tek" as const },
  { id: "putt-3m", label: "Putt 3m", axis: "slag" as const },
];

export function WBP_Inspector() {
  const { setModal, showToast } = usePlanContext();

  return (
    <aside className="inspector">
      {/* Valgt økt */}
      <div className="insp-section">
        <div className="eyebrow-row">
          <span className="eyebrow">Valgt · Økt</span>
          <button type="button" className="x" aria-label="Lukk">
            <WBPIc id="ic-x" size={12} />
          </button>
        </div>
        <div className="insp-title">
          Wedge-spinn <em>40–80m</em>
        </div>
        <div className="insp-sub">SLAG · Tirs 23/5 · 14:00–15:30</div>
        <div className="insp-meta-grid">
          <div>
            <div className="ml">Varighet</div>
            <div className="mv">
              90<span className="u">min</span>
            </div>
          </div>
          <div>
            <div className="ml">Sted</div>
            <div className="mv" style={{ fontSize: 12 }}>
              GFGK · TM bay 3
            </div>
          </div>
          <div>
            <div className="ml">Drills</div>
            <div className="mv">
              5<span className="u">stk</span>
            </div>
          </div>
          <div>
            <div className="ml">Intensitet</div>
            <div className="mv" style={{ fontSize: 12 }}>
              <span className="pill pill-warn">middels</span>
            </div>
          </div>
        </div>
      </div>

      {/* Periode-pyramide */}
      <div className="insp-section">
        <div className="insp-section-ttl">
          Periode-pyramide
          <span className="right">Uke 19–24</span>
        </div>
        <div className="insp-pyramid">
          {[
            { key: "turn", label: "TURN", weight: 10, actual: 10 },
            { key: "spill", label: "SPILL", weight: 30, actual: 26 },
            { key: "slag", label: "SLAG", weight: 27, actual: 24 },
            { key: "tek", label: "TEK", weight: 18, actual: 22 },
            { key: "fys", label: "FYS", weight: 15, actual: 18 },
          ].map((a) => (
            <div key={a.key} className={`pyr-row pyr-row-${a.key}`}>
              <div className="pyr-row-label">{a.label}</div>
              <div className="pyr-row-bar">
                <div
                  className="pyr-row-ideal"
                  style={{ width: `${a.weight * 3}px` }}
                />
                <div
                  className="pyr-row-actual"
                  style={{ width: `${a.actual * 3}px` }}
                />
              </div>
              <div className="pyr-row-pct">
                {a.actual}% / {a.weight}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test-snarveier */}
      <div className="insp-section">
        <div className="insp-section-ttl">
          Snarveier · Tester
          <span className="right">Ett klikk · linket</span>
        </div>
        <div className="insp-test-chips">
          {TEST_SHORTCUTS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`test-chip test-chip-${t.axis}`}
              onClick={() => showToast(`Test «${t.label}» lagt til i uke 21`)}
            >
              <WBPIc id="ic-beaker" size={11} />
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="test-show-all"
          onClick={() => setModal("testpicker")}
        >
          Vis alle tester →
        </button>
      </div>

      {/* Neste handlinger */}
      <div className="insp-section">
        <div className="insp-section-ttl">Neste handlinger</div>
        <div className="insp-actions">
          <button
            type="button"
            className="a"
            onClick={() => setModal("freq")}
          >
            <span className="ic">
              <WBPIc id="ic-trending" size={12} />
            </span>
            <span className="lbl">
              Sett ukentlig frekvens
              <span className="desc">Hvor mange FYS/TEK/SLAG-økter</span>
            </span>
            <span className="kbd-chip">⌘F</span>
          </button>
          <button
            type="button"
            className="a"
            onClick={() => setModal("camp")}
          >
            <span className="ic">
              <WBPIc id="ic-users" size={12} />
            </span>
            <span className="lbl">
              Legg til treningssamling
              <span className="desc">WANG · Klubb · Team Norge · Privat</span>
            </span>
            <span className="kbd-chip">⌘S</span>
          </button>
          <button
            type="button"
            className="a"
            onClick={() => showToast("Caddie auto-balanserer uke 21...")}
          >
            <span className="ic">
              <WBPIc id="ic-sparkles" size={12} />
            </span>
            <span className="lbl">
              Auto-balansér uke 21
              <span className="desc">+ SLAG, − TEK · 1 klikk</span>
            </span>
            <span className="kbd-chip">⌘B</span>
          </button>
          <button
            type="button"
            className="a"
            onClick={() => showToast("Sendt til coach for godkjenning")}
          >
            <span className="ic">
              <WBPIc id="ic-check" size={12} />
            </span>
            <span className="lbl">
              Be coach godkjenne endringer
              <span className="desc">3 endringer venter</span>
            </span>
            <span className="kbd-chip">⏎</span>
          </button>
        </div>
      </div>

      {/* Ankret mot */}
      <div className="insp-section">
        <div className="insp-section-ttl">
          Ankret mot
          <span className="right">21 dager</span>
        </div>
        <div className="insp-trn">
          <div className="eb">Neste turnering</div>
          <div className="nm">Sørlandsåpent</div>
          <div className="meta">28.–30. mai · Kristiansand GK · A-finale</div>
          <div className="count">
            <span className="num">21</span>
            <span className="unit">dager igjen</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
