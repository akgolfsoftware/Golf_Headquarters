"use client";

/**
 * WBP_Canvas (Periode-view) — port av workbench-plan/plan-a-canvas.jsx.
 * Pyramide-baner: 5 horisontale lanes × 6 uker. Sessions plassert
 * etter day (0-6) og span (1-7 dager).
 */

import { Fragment } from "react";
import { WBPIc } from "./icon";
import { usePlanContext } from "./plan-context";
import {
  WBP_SESSIONS,
  WBP_WEEKS,
  type Axis,
  type WBP_Session,
} from "./types";

const WBP_AXES: Array<{ key: Axis; name: string; weight: number; h: number }> = [
  { key: "fys", name: "FYS", weight: 15, h: 76 },
  { key: "tek", name: "TEK", weight: 18, h: 92 },
  { key: "slag", name: "SLAG", weight: 27, h: 132 },
  { key: "spill", name: "SPILL", weight: 30, h: 146 },
  { key: "turn", name: "TURN", weight: 10, h: 64 },
];

function sessionsFor(axis: Axis, weekId: number): WBP_Session[] {
  return WBP_SESSIONS.filter((s) => s.axis === axis && s.week === weekId);
}

function SessionCard({
  s,
  onClick,
}: {
  s: WBP_Session & { dragging?: boolean; selected?: boolean };
  onClick: (s: WBP_Session) => void;
}) {
  const left = (s.day / 7) * 100;
  const width = (s.span / 7) * 100;
  const cls = [
    "session",
    `s-${s.axis}`,
    s.done && "done",
    s.dragging && "dragging",
    s.selected && "selected",
    s.now && "now",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cls}
      style={{
        left: `calc(${left}% + 3px)`,
        width: `calc(${width}% - 6px)`,
      }}
      title={s.title}
      onClick={(e) => {
        e.stopPropagation();
        onClick(s);
      }}
    >
      <div className="title">{s.title}</div>
      <div className="meta">
        {s.now && (
          <>
            <span style={{ color: "var(--danger)", fontWeight: 700 }}>● NÅ</span>{" "}
            {s.meta}
          </>
        )}
        {s.done && !s.now && (
          <>
            <span style={{ color: "var(--success)" }}>✓</span> {s.meta}
          </>
        )}
        {!s.now && !s.done && s.meta}
      </div>
    </div>
  );
}

export function WBP_CanvasPeriode() {
  const { setActiveSession } = usePlanContext();
  const weekCount = WBP_WEEKS.length;

  const todayWeekIdx = WBP_WEEKS.findIndex((w) => w.state === "now");
  const todayDay = 1; // Tirs
  const todayPct = ((todayWeekIdx + todayDay / 7) / weekCount) * 100;

  const sorIdx = WBP_WEEKS.findIndex((w) => w.id === 22);
  const sorPct = ((sorIdx + 3 / 7) / weekCount) * 100;
  const osloIdx = WBP_WEEKS.findIndex((w) => w.id === 24);
  const osloPct = ((osloIdx + 5 / 7) / weekCount) * 100;

  return (
    <main className="canvas">
      {/* CANVAS HEAD */}
      <div className="canvas-head">
        <div className="top-row">
          <h2 className="ttl">
            Periode 3 · <em>Bygging mot turnering</em>
            <span className="num">6 uker · 29 økter</span>
          </h2>
          <div className="meta-strip">
            <span>
              Fase: <strong>Peaking-form</strong>
            </span>
            <span className="sep" />
            <span>
              Ankret mot: <strong>Sørlandsåpent · 21d</strong>
            </span>
            <span className="sep" />
            <span>
              Balanse:{" "}
              <strong style={{ color: "var(--warning)" }}>−3 pp på SPILL</strong>
            </span>
            <span className="sep" />
            <span>3 endringer venter coach-godkjenning</span>
          </div>
        </div>

        <div className="phase-bar" title="Periode 3 ideal-pyramide">
          {WBP_AXES.map((a) => (
            <div
              key={a.key}
              className={`seg ${a.key}`}
              style={{ flex: a.weight }}
            />
          ))}
        </div>
      </div>

      {/* WEEK RIBBON */}
      <div
        className="week-ribbon"
        style={{ ["--week-count" as string]: weekCount }}
      >
        <div className="corner" />
        {WBP_WEEKS.map((w) => (
          <div
            key={w.id}
            className={
              "wcol " +
              (w.state === "now" ? "now" : w.state === "peak" ? "peak" : "")
            }
          >
            <div className="w-id">Uke {w.id}</div>
            <div className="w-dates">{w.dates}</div>
            <div
              className="w-load"
              title={`Volum ${w.loadH}t · ideal ${w.idealH}t`}
            >
              <div
                className="f"
                style={{
                  width: `${Math.min((w.loadH / 12) * 100, 100)}%`,
                  background:
                    w.state === "peak"
                      ? "var(--turn)"
                      : "var(--brand-primary)",
                }}
              />
              <div
                className="ideal"
                style={{ left: `${(w.idealH / 12) * 100}%` }}
              />
            </div>
            <div className="w-mini">
              <span>
                <strong>{w.loadH}</strong>t
              </span>
              <span>
                <strong>{w.sessions}</strong> økter
              </span>
              {w.tests > 0 && (
                <span>
                  <strong>{w.tests}</strong> test
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* LANES */}
      <div className="lanes-scroll">
        <div
          className="lanes"
          style={{
            ["--week-count" as string]: weekCount,
            position: "relative",
          }}
        >
          {WBP_AXES.map((ax) => (
            <Fragment key={ax.key}>
              <div className="lane-label" style={{ height: ax.h }}>
                <div
                  className="axis-bar"
                  style={{
                    background: `var(--${ax.key})`,
                    height: "60%",
                  }}
                />
                <div>
                  <div className="ax-name">{ax.name}</div>
                  <div className="ax-pct">{ax.weight}%</div>
                </div>
              </div>
              {WBP_WEEKS.map((w) => {
                const isNow = w.state === "now";
                const isPeak = w.state === "peak";
                const ses = sessionsFor(ax.key, w.id);
                return (
                  <div
                    key={w.id}
                    className={
                      "lane-cell" +
                      (isNow ? " now" : "") +
                      (isPeak ? " peak" : "")
                    }
                    style={{ height: ax.h }}
                  >
                    <div className="day-ticks">
                      {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                        <div key={d} className="t" />
                      ))}
                    </div>
                    {ses.map((s) => (
                      <SessionCard
                        key={s.id}
                        s={{
                          ...s,
                          selected: s.id === "s21c",
                        }}
                        onClick={setActiveSession}
                      />
                    ))}
                    {ses.length === 0 && (
                      <div className="ai-hint">
                        <WBPIc id="ic-sparkles" size={11} />
                        Caddie · foreslå
                      </div>
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}

          {/* Today-line + tournament pillars overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 90,
              right: 0,
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <div className="today-line" style={{ left: `${todayPct}%` }} />
            <div
              className="tournament-pillar A"
              style={{ left: `${sorPct}%`, top: -1 }}
            >
              <span className="flag">SØR.ÅPENT · 28.5</span>
            </div>
            <div
              className="tournament-pillar B"
              style={{ left: `${osloPct}%`, top: -1 }}
            >
              <span className="flag">OSLOÅPENT · 15.6</span>
            </div>
          </div>
        </div>
      </div>

      {/* PERIODISATION (volum + intensitet) */}
      <div
        className="periodisation"
        style={{ ["--week-count" as string]: weekCount }}
      >
        <div className="pd-label">
          <strong>Volum + intensitet</strong>
          ⌥ DRA HÅNDTAK
        </div>
        {WBP_WEEKS.map((w) => (
          <div key={w.id} className={`pd-cell ${w.state}`}>
            <div className="volume-bar">
              <div
                className="fill"
                style={{
                  width: `${Math.min((w.loadH / 12) * 100, 100)}%`,
                  background:
                    w.state === "peak"
                      ? "var(--turn)"
                      : w.state === "rec"
                        ? "var(--info)"
                        : "var(--brand-primary)",
                }}
              />
              <div
                className="ideal"
                style={{ left: `${(w.idealH / 12) * 100}%` }}
              />
              <div
                className="handle"
                style={{ left: `${Math.min((w.loadH / 12) * 100, 100)}%` }}
              />
              <div className="num">
                {w.loadH}
                <span className="u">/{w.idealH}t</span>
              </div>
            </div>
            <span className={`intensity-pill ${w.intensity}`}>
              {w.intensity === "peak"
                ? "PEAK"
                : w.intensity === "rec"
                  ? "RESTITUSJON"
                  : w.intensity === "high"
                    ? "HØY"
                    : w.intensity === "mid"
                      ? "MIDDELS"
                      : w.intensity}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
