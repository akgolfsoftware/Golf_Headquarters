import React from "react";
import { Icon } from "../core/Icon.jsx";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — MaanedKalender (v2)
 * To moduser (lukket enum):
 *  - "varme" (default): månedsgrid m/ lime-varme etter øktmengde (dashbord).
 *  - "piller": Notion-månedsceller — inntil 3 økt-piller per dag (akse-prikk +
 *    trunkert tittel), «+N» ved flere, hover-«+ Ny», DnD av piller mellom dager
 *    (onFlytt; Escape avbryter). For planlegging.
 * Norsk uke (man først). I dag = signal-kant.
 */

const DAYS_NO = ["M", "T", "O", "T", "F", "L", "S"];

const CSS = `
.ak-maaned{display:flex;flex-direction:column;gap:4px;width:100%;}
.ak-maaned__hd{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:2px;}
.ak-maaned__dow{
  text-align:center;font-family:var(--font-mono);font-size:10px;
  font-weight:600;letter-spacing:.06em;text-transform:uppercase;
  color:var(--text-muted);padding:4px 0;
}
.ak-maaned__grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;}
.ak-maaned__cell{
  aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  border-radius:var(--radius-input);position:relative;overflow:hidden;
  font-family:var(--font-mono);font-size:var(--text-13);font-weight:500;
  color:var(--text-2);cursor:pointer;
  border:1px solid transparent;
  background:transparent;
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-maaned__cell:hover:not(.ak-maaned__cell--active){background:var(--surface-hover);}
.ak-maaned__cell--today{border-color:var(--signal);color:var(--text);}
.ak-maaned__cell--active{background:var(--primary-fill);color:var(--primary-text);}
.ak-maaned__cell--empty{pointer-events:none;opacity:0;}
.ak-maaned__heat{
  position:absolute;inset:0;pointer-events:none;border-radius:var(--radius-input);
}
.ak-maaned__dot{
  position:absolute;bottom:3px;left:50%;transform:translateX(-50%);
  width:4px;height:4px;border-radius:9999px;background:var(--signal);
}

/* ── Piller-modus ── */
.ak-maaned--piller .ak-maaned__grid{gap:2px;}
.ak-mnd-p{
  min-height:86px;border-radius:8px;position:relative;
  display:flex;flex-direction:column;gap:2px;align-items:stretch;
  padding:4px 4px 3px;text-align:left;cursor:default;
  border:1px solid transparent;border-top:1px solid var(--border);
  background:transparent;overflow:hidden;
}
.ak-mnd-p--utenfor{opacity:.35;}
.ak-mnd-p--dropmål{background:var(--surface-hover);border-radius:8px;}
.ak-mnd-p__dato{
  font-family:var(--font-mono);font-size:11px;font-weight:600;
  color:var(--text-muted);font-variant-numeric:tabular-nums;
  width:22px;height:20px;display:inline-flex;align-items:center;justify-content:center;
  border-radius:6px;flex:none;
}
.ak-mnd-p--idag .ak-mnd-p__dato{background:var(--signal);color:var(--on-signal);font-weight:700;}
.ak-mnd-p__ny{
  position:absolute;top:3px;right:3px;width:20px;height:20px;border-radius:6px;
  display:flex;align-items:center;justify-content:center;
  background:none;border:none;cursor:pointer;color:transparent;padding:0;
}
.ak-mnd-p:hover .ak-mnd-p__ny,.ak-mnd-p__ny:focus-visible{color:var(--text-muted);background:var(--surface-hover);}
.ak-mnd-p__ny:focus-visible{outline:none;box-shadow:inset 0 0 0 1px var(--border-strong);}
.ak-pille{
  display:flex;align-items:center;gap:4px;min-width:0;width:100%;
  height:20px;padding:0 5px;border-radius:5px;border:none;cursor:pointer;
  background:var(--surface);text-align:left;
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-pille:hover{background:var(--surface-hover);}
.ak-pille:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-pille--drar{opacity:.4;}
.ak-pille--flyttbar{touch-action:none;}
.ak-pille__prikk{width:6px;height:6px;border-radius:2px;flex:none;}
.ak-pille__txt{
  font-family:var(--font-ui);font-size:10.5px;font-weight:500;color:var(--text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;
}
.ak-pille__tid{font-family:var(--font-mono);font-size:8.5px;color:var(--text-muted);flex:none;font-variant-numeric:tabular-nums;}
.ak-mnd-p__fler{
  font-family:var(--font-mono);font-size:9px;font-weight:600;color:var(--text-muted);
  background:none;border:none;cursor:pointer;text-align:left;padding:0 5px;
}
.ak-mnd-p__fler:hover{color:var(--text);}
.ak-mnd-p__fler:focus-visible{outline:2px solid var(--signal);outline-offset:1px;border-radius:3px;}
.ak-maaned__spokelse{
  position:fixed;z-index:60;pointer-events:none;transform:translate(-50%,-120%);
  display:flex;align-items:center;gap:4px;height:22px;padding:0 8px;
  border-radius:6px;background:var(--surface-2);border:1px solid var(--border-strong);
  box-shadow:0 10px 28px rgba(0,0,0,0.35);
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-maaned-css")) {
  const s = document.createElement("style");
  s.id = "ak-maaned-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const AXIS_VAR = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };

function beregnCeller(y, m) {
  const firstDay = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

/* ── Piller-celle ─────────────────────────────────────────── */
function PillerCelle({ date, info, maksPiller, onOktKlikk, onNyOkt, onVisAlle, flytt, onPeek }) {
  const okter = info.okter || [];
  const vis = okter.slice(0, maksPiller);
  const rest = okter.length - vis.length;
  return (
    <div
      className={`ak-mnd-p${info.today ? " ak-mnd-p--idag" : ""}${flytt.mål === date ? " ak-mnd-p--dropmål" : ""}`}
      data-dato={date}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <span className="ak-mnd-p__dato">{date}</span>
      </div>
      {onNyOkt && (
        <button type="button" className="ak-mnd-p__ny" onClick={() => onNyOkt(date)} aria-label={`Ny økt ${date}.`}>
          <Icon name="plus" size={12} />
        </button>
      )}
      {vis.map((o) => (
        <button
          key={o.id ?? o.tittel}
          type="button"
          className={`ak-pille${flytt.aktiv === (o.id ?? o.tittel) ? " ak-pille--drar" : ""}${flytt.kan && o.id != null ? " ak-pille--flyttbar" : ""}`}
          onClick={() => { if (!flytt.flyttet()) onOktKlikk && onOktKlikk(o, date); }}
          onPointerDown={(e) => flytt.start(e, o, date)}
          onPointerMove={flytt.beveg}
          onPointerUp={flytt.slipp}
          onPointerCancel={() => flytt.avbryt()}
          onMouseEnter={(e) => { if (!(flytt.aktiv) && onPeek) onPeek(o, date, e); }}
          onMouseLeave={() => onPeek && onPeek(null)}
          aria-label={`${o.tittel}${o.tid ? " " + o.tid : ""}`}
        >
          {o.akse && <span className="ak-pille__prikk" style={{ background: `var(--axis-${AXIS_VAR[o.akse]})` }}></span>}
          <span className="ak-pille__txt">{o.tittel}</span>
          {o.tid && <span className="ak-pille__tid">{o.tid}</span>}
        </button>
      ))}
      {rest > 0 && (
        <button type="button" className="ak-mnd-p__fler" onClick={() => onVisAlle && onVisAlle(date)}>
          +{rest} flere
        </button>
      )}
    </div>
  );
}

export function MaanedKalender({
  year,
  month,
  days = [],
  value,
  onChange,
  modus = "varme",
  maksPiller = 3,
  onOktKlikk,
  onNyOkt,
  onVisAlle,
  onFlytt,
  className = "",
  style,
}) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();
  const cells = beregnCeller(y, m);

  const dayMap = {};
  days.forEach((d) => { dayMap[d.date] = d; });

  /* ── DnD-tilstand (piller-modus) ── */
  const [drag, setDrag] = React.useState(null); // {id, okt, fraDato, x, y, flyttet, mål}
  const dragRef = React.useRef(null);
  const settDrag = (v) => { dragRef.current = v; setDrag(v); };

  const målVed = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const celle = el && el.closest("[data-dato]");
    return celle ? Number(celle.getAttribute("data-dato")) : null;
  };

  const flytt = {
    kan: !!onFlytt,
    aktiv: drag && drag.flyttet ? drag.id : null,
    mål: drag && drag.flyttet ? drag.mål : null,
    flyttet: () => !!(dragRef.current && dragRef.current.flyttet),
    start: (e, o, dato) => {
      if (!onFlytt || o.id == null || e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      settDrag({ id: o.id, okt: o, fraDato: dato, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, flyttet: false, mål: null });
    },
    beveg: (e) => {
      const d = dragRef.current;
      if (!d) return;
      const flyttet = d.flyttet || Math.hypot(e.clientX - d.startX, e.clientY - d.startY) >= 5;
      settDrag({ ...d, x: e.clientX, y: e.clientY, flyttet, mål: flyttet ? målVed(e.clientX, e.clientY) : null });
    },
    slipp: () => {
      const d = dragRef.current;
      if (!d) return;
      const varFlyttet = d.flyttet;
      const mål = d.mål;
      // behold flyttet-flagget ett tick så klikk-etter-drag ikke åpner peek
      settDrag(null);
      if (varFlyttet && mål != null && mål !== d.fraDato) onFlytt({ id: d.id, fraDato: d.fraDato, tilDato: mål });
      if (varFlyttet) { dragRef.current = { flyttet: true }; setTimeout(() => { dragRef.current = null; }, 0); }
    },
    avbryt: () => settDrag(null),
  };

  React.useEffect(() => {
    if (!drag || !drag.flyttet) return;
    const onKey = (e) => { if (e.key === "Escape") settDrag(null); };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [drag && drag.flyttet]);

  const maxSessions = Math.max(1, ...days.map((d) => d.sessions || 0));
  /* Cellene har overflow:hidden — hover-kortet rendres derfor fast (fixed) på rot-nivå. */
  const [peek, setPeek] = React.useState(null);
  const oktPeek = (o, date, e) => {
    if (o == null) { setPeek(null); return; }
    const rows = [
      o.akse ? { color: `var(--axis-${AXIS_VAR[o.akse]})`, label: o.akse, value: o.cs || o.csNivaa || "—" } : null,
      o.arena != null ? { label: "Arena", value: o.arena } : null,
      o.trinn != null ? { label: "Trinn", value: o.trinn } : null,
    ].filter(Boolean);
    setPeek({ x: e.clientX, y: e.clientY, label: o.tid ? `${o.tittel} · ${o.tid}` : o.tittel, rows: rows.length ? rows : null, value: rows.length ? null : o.tittel });
  };

  return (
    <div className={`ak-maaned${modus === "piller" ? " ak-maaned--piller" : ""} ${className}`} style={style}>
      <div className="ak-maaned__hd">
        {DAYS_NO.map((d, i) => (
          <span key={i} className="ak-maaned__dow">{d}</span>
        ))}
      </div>
      <div className="ak-maaned__grid">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className={modus === "piller" ? "ak-mnd-p ak-mnd-p--utenfor" : "ak-maaned__cell ak-maaned__cell--empty"} aria-hidden="true" />;
          const info = dayMap[date] || {};
          if (modus === "piller") {
            return (
              <PillerCelle key={i} date={date} info={info} maksPiller={maksPiller}
                onOktKlikk={onOktKlikk} onNyOkt={onNyOkt} onVisAlle={onVisAlle} flytt={flytt} onPeek={oktPeek} />
            );
          }
          const isToday = info.today;
          const isActive = date === value;
          const heat = info.sessions ? info.sessions / maxSessions : 0;
          return (
            <button
              key={i}
              type="button"
              className={`ak-maaned__cell${isToday ? " ak-maaned__cell--today" : ""}${isActive ? " ak-maaned__cell--active" : ""}`}
              onClick={() => onChange && onChange(date)}
              onMouseEnter={(e) => { if (info.sessions > 0) setPeek({ x: e.clientX, y: e.clientY, label: `Dag ${date}`, value: `${info.sessions}`, unit: info.sessions === 1 ? "økt" : "økter" }); }}
              onMouseLeave={() => setPeek(null)}
              aria-current={isToday ? "date" : undefined}
            >
              {heat > 0 && !isActive && (
                <span
                  className="ak-maaned__heat"
                  style={{ background: "var(--signal)", opacity: 0.08 + heat * 0.22 }}
                />
              )}
              {date}
              {info.sessions > 0 && !isActive && <span className="ak-maaned__dot" />}
            </button>
          );
        })}
      </div>
      {drag && drag.flyttet && (
        <div className="ak-maaned__spokelse" style={{ left: drag.x, top: drag.y }}>
          {drag.okt.akse && <span className="ak-pille__prikk" style={{ background: `var(--axis-${AXIS_VAR[drag.okt.akse]})` }}></span>}
          <span className="ak-pille__txt" style={{ maxWidth: 140 }}>{drag.okt.tittel}</span>
        </div>
      )}
      {peek && !(drag && drag.flyttet) && (
        <div style={{ position: "fixed", left: peek.x, top: peek.y - 6, zIndex: 60, pointerEvents: "none" }}>
          <DataPreview visible x={0} y={0} placement="top" label={peek.label} value={peek.value} unit={peek.unit} rows={peek.rows} />
        </div>
      )}
    </div>
  );
}
