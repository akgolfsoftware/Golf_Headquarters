"use client";

/**
 * WBP_CanvasPeriode — pyramide-baner-canvas for Periode-zoom.
 * 5 horisontale lanes (FYS/TEK/SLAG/SPILL/TURN) × 6 uker.
 * Klikk på en økt → åpner session-detail drawer.
 */

import { WBPIc } from "./icon";
import { usePlanContext } from "./plan-context";
import { WBP_SESSIONS, WBP_WEEKS, type Axis, type WBP_Session } from "./types";

const AXES: Axis[] = ["turn", "spill", "slag", "tek", "fys"]; // topp til bunn

export function WBP_CanvasPeriode() {
  const { setActiveSession } = usePlanContext();

  return (
    <div className="canvas">
      {/* Uke-header */}
      <div className="canvas-weeks">
        <div className="canvas-axis-label-spacer" />
        {WBP_WEEKS.map((w) => (
          <div key={w.id} className={`canvas-week canvas-week-${w.state}`}>
            <div className="cw-num">Uke {w.id}</div>
            <div className="cw-dates">{w.dates}</div>
            <div className="cw-load">
              <span className="cw-load-actual">{w.loadH.toFixed(1)}h</span>
              <span className="cw-load-sep">/</span>
              <span className="cw-load-ideal">{w.idealH}h</span>
            </div>
            {w.tournament && (
              <div className="cw-tournament" title={w.tournament}>
                <WBPIc id="ic-trophy" size={10} />
                <span className="truncate">{w.tournament.split(" ")[0]}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pyramide-lanes */}
      <div className="canvas-lanes">
        {AXES.map((axis) => (
          <div key={axis} className={`lane lane-${axis}`}>
            <div className="lane-label">
              <span className={`lane-dot lane-dot-${axis}`} />
              <span className="lane-label-text">{axis.toUpperCase()}</span>
            </div>
            <div className="lane-weeks">
              {WBP_WEEKS.map((w) => {
                const cellSessions = WBP_SESSIONS.filter(
                  (s) => s.week === w.id && s.axis === axis,
                );
                return (
                  <div key={w.id} className={`lane-week lane-week-${w.state}`}>
                    {cellSessions.map((s) => (
                      <SessionCard
                        key={s.id}
                        session={s}
                        onClick={() => setActiveSession(s)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionCard({
  session,
  onClick,
}: {
  session: WBP_Session;
  onClick: () => void;
}) {
  const cls = [
    "session-card",
    `session-card-${session.axis}`,
    session.done && "session-card-done",
    session.now && "session-card-now",
    session.peak && "session-card-peak",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={cls} onClick={onClick}>
      <div className="sc-title">
        {session.now && <span className="sc-now-dot" />}
        {session.done && <WBPIc id="ic-check" size={10} />}
        {session.title}
      </div>
      <div className="sc-meta">{session.meta}</div>
    </button>
  );
}
