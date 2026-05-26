"use client";

/**
 * Session-detail drawer — åpner fra høyre når en økt er valgt.
 * Slag-data vises BARE for axis=SLAG (per design).
 */

import { WBPIc } from "./icon";
import { usePlanContext } from "./plan-context";

export function WBP_SessionDetail() {
  const { activeSession, setActiveSession } = usePlanContext();
  if (!activeSession) return null;

  const isSlag = activeSession.axis === "slag";
  const isFullSving =
    isSlag &&
    /wedge|driver|iron|spinn|full|range/i.test(activeSession.title);

  return (
    <>
      <div
        className="sd-backdrop"
        onClick={() => setActiveSession(null)}
        aria-hidden
      />
      <aside
        className={`sd-drawer sd-axis-${activeSession.axis}`}
        role="dialog"
        aria-label={activeSession.title}
      >
        <header className="sd-header">
          <div className="sd-axis-stripe" />
          <div className="sd-head-content">
            <div className="sd-eyebrow">
              {activeSession.axis.toUpperCase()} · Uke{" "}
              {activeSession.week} · Dag {activeSession.day + 1}
            </div>
            <h2 className="sd-title">{activeSession.title}</h2>
            <p className="sd-meta">{activeSession.meta}</p>
          </div>
          <button
            type="button"
            className="sd-close"
            onClick={() => setActiveSession(null)}
            aria-label="Lukk"
          >
            <WBPIc id="ic-x" size={14} />
          </button>
        </header>

        <div className="sd-body">
          {/* Status-pills */}
          <div className="sd-pills">
            {activeSession.done && (
              <span className="pill pill-ok">
                <WBPIc id="ic-check" size={10} />
                Fullført
              </span>
            )}
            {activeSession.now && (
              <span className="pill pill-now">
                <span className="ldot" />
                Pågår nå
              </span>
            )}
            {activeSession.peak && (
              <span className="pill pill-turn">
                <WBPIc id="ic-trophy" size={10} />
                Peak
              </span>
            )}
            <span className={`pill pill-${activeSession.axis}`}>
              <span className="ldot" />
              {activeSession.axis.toUpperCase()}
            </span>
          </div>

          {/* Slag-data — bare for full-sving SLAG */}
          {isFullSving && (
            <section className="sd-section">
              <h3 className="sd-section-title">Slag-data</h3>
              <div className="sd-data-grid">
                <SdStat label="Kølle-hastighet" value="98" unit="mph" />
                <SdStat label="Ball-hastighet" value="142" unit="mph" />
                <SdStat label="Spinn" value="6 200" unit="rpm" />
                <SdStat label="Launch-vinkel" value="14,8°" unit="" />
                <SdStat label="Smash factor" value="1,44" unit="" />
                <SdStat label="Carry" value="248" unit="m" />
              </div>
              <p className="sd-section-meta">
                Sist målt på TrackMan i bay 3 · 24. mai. Mål: spinn 5 800–6 500
                rpm.
              </p>
            </section>
          )}

          {/* Drills */}
          <section className="sd-section">
            <h3 className="sd-section-title">Drills i økten</h3>
            <ul className="sd-drills">
              <li>
                <span className="sd-drill-name">Hovedøvelse · 60 min</span>
                <span className="sd-drill-meta">Kjernen i økten</span>
              </li>
              <li>
                <span className="sd-drill-name">Oppvarming · 15 min</span>
                <span className="sd-drill-meta">Dynamisk + mobil</span>
              </li>
              <li>
                <span className="sd-drill-name">Avslutning · 10 min</span>
                <span className="sd-drill-meta">Cooldown + review</span>
              </li>
            </ul>
          </section>

          {/* Notater */}
          <section className="sd-section">
            <h3 className="sd-section-title">Notater</h3>
            <p className="sd-notes">
              Husk pre-shot rutine. Fokus: tempo og kontakt — ikke distanse.
            </p>
          </section>
        </div>

        <footer className="sd-footer">
          <button type="button" className="sd-btn sd-btn-ghost">
            Endre økt
          </button>
          <button type="button" className="sd-btn sd-btn-primary">
            Start live-økt
            <WBPIc id="ic-arrow-right" size={12} />
          </button>
        </footer>
      </aside>
    </>
  );
}

function SdStat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="sd-stat">
      <span className="sd-stat-label">{label}</span>
      <span className="sd-stat-value">
        {value}
        {unit && <span className="sd-stat-unit">{unit}</span>}
      </span>
    </div>
  );
}
