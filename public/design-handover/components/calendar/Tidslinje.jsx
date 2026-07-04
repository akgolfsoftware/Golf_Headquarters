import React from "react";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — Tidslinje
 * Horisontale baner (Notion-Timeline): rad per spiller/gruppe/ressurs,
 * periodebarer + hendelsespunkter på felles tidsakse (enheter, f.eks. uker).
 * DnD: flytt-drag (snap til enhet, på tvers av baner), kant-drag for varighet,
 * Alt+piltaster (±1 enhet; Shift = varighet), Escape avbryter.
 * Nå-markør i lime — én per visning.
 */

const Ctx = React.createContext(null);
const BaneCtx = React.createContext(null);

const CSS = `
.ak-tl{display:flex;flex-direction:column;width:100%;min-width:0;}
.ak-tl--drar,.ak-tl--drar *{user-select:none;}
.ak-tl__hode{display:flex;border-bottom:1px solid var(--border);}
.ak-tl__hjorne{flex:none;width:148px;}
.ak-tl__akse{flex:1;position:relative;height:26px;}
.ak-tl__tick{
  position:absolute;top:0;bottom:0;display:flex;align-items:center;
  font-family:var(--font-mono);font-size:9px;font-weight:600;
  letter-spacing:.05em;text-transform:uppercase;color:var(--text-muted);
  border-left:1px solid var(--border);padding-left:6px;
  font-variant-numeric:tabular-nums;
}
.ak-tl__kropp{position:relative;}
.ak-tl__naa{position:absolute;top:0;bottom:0;width:1.5px;background:var(--signal);opacity:.9;z-index:2;pointer-events:none;}
.ak-tl__naa::before{
  content:"";position:absolute;top:-2px;left:-2.25px;width:6px;height:6px;
  border-radius:9999px;background:var(--signal);
}
.ak-tlbane{display:flex;border-bottom:1px solid var(--border);min-height:44px;}
.ak-tlbane__etikett{
  flex:none;width:148px;display:flex;align-items:center;gap:8px;
  padding:6px 10px 6px 2px;min-width:0;
  font-family:var(--font-ui);font-size:var(--text-13);font-weight:500;color:var(--text);
}
.ak-tlbane__flate{flex:1;position:relative;min-width:0;}
.ak-tlbar{
  position:absolute;top:7px;bottom:7px;z-index:1;min-width:14px;
  display:flex;align-items:center;gap:6px;overflow:hidden;
  background:var(--surface);border:1px solid var(--border);
  border-left:3px solid var(--border-strong);border-radius:7px;
  padding:0 8px;cursor:pointer;text-align:left;
  font-family:var(--font-ui);font-size:11.5px;font-weight:500;color:var(--text);
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-tlbar:hover{background:var(--surface-hover);}
.ak-tlbar:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-tlbar--flyttbar{cursor:grab;touch-action:none;}
.ak-tlbar--drar{cursor:grabbing;z-index:6;opacity:.92;transition:none;box-shadow:0 8px 22px rgba(0,0,0,0.35);}
.ak-tlbar--utkast{border-style:dashed;border-left-style:dashed;background:transparent;color:var(--text-2);}
.ak-tlbar__kant{
  position:absolute;top:0;bottom:0;width:8px;cursor:ew-resize;z-index:2;
  display:flex;align-items:center;justify-content:center;color:transparent;
  touch-action:none;
}
.ak-tlbar__kant--h{right:0;}
.ak-tlbar__kant--v{left:0;}
.ak-tlbar:hover .ak-tlbar__kant{color:var(--text-faint);}
.ak-tlbar__kant::after{content:"";width:2px;height:12px;border-radius:2px;background:currentColor;}
.ak-tlbar__txt{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
.ak-tlpkt{
  position:absolute;top:50%;transform:translate(-50%,-50%);z-index:1;
  width:11px;height:11px;border-radius:3px;rotate:45deg;
  border:none;cursor:pointer;padding:0;
  background:var(--axis-turn);
}
.ak-tlpkt--peak{background:var(--signal);border-radius:9999px;rotate:none;}
.ak-tlpkt:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-tl__dragtid{
  position:absolute;z-index:7;pointer-events:none;transform:translate(-50%,-130%);
  background:var(--surface-2);border:1px solid var(--border-strong);border-radius:6px;
  padding:3px 8px;font-family:var(--font-mono);font-size:10px;font-weight:700;
  color:var(--text);font-variant-numeric:tabular-nums;white-space:nowrap;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-tl-css")) {
  const s = document.createElement("style");
  s.id = "ak-tl-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const AXIS_VAR = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };

export function Tidslinje({
  total,
  zoom = "maned",
  ticks = [],
  naa,
  onFlytt,
  children,
  className = "",
  style,
}) {
  const baneRef = React.useRef(new Map());
  const [drag, setDrag] = React.useState(null); // {tipX, tipY, tekst}
  const registrer = React.useCallback((id, el) => {
    if (el) baneRef.current.set(id, el);
    else baneRef.current.delete(id);
  }, []);
  const baneVed = React.useCallback((y) => {
    let best = null;
    baneRef.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      if (y >= r.top && y <= r.bottom) best = id;
    });
    return best;
  }, []);
  const rotRef = React.useRef(null);
  const ctx = { total, onFlytt, registrer, baneVed, setDrag, rotRef };
  return (
    <Ctx.Provider value={ctx}>
      <div ref={rotRef} className={`ak-tl${drag ? " ak-tl--drar" : ""} ${className}`} style={{ position: "relative", ...style }}>
        <div className="ak-tl__hode">
          <div className="ak-tl__hjorne"></div>
          <div className="ak-tl__akse" aria-hidden="true">
            {ticks.map((t, i) => (
              <span key={i} className="ak-tl__tick" style={{ left: `${(t.ved / total) * 100}%` }}>{t.tekst}</span>
            ))}
          </div>
        </div>
        <div className="ak-tl__kropp">
          {children}
          {naa != null && (
            <div className="ak-tl__naa" style={{ left: `calc(148px + (100% - 148px) * ${naa / total})` }}></div>
          )}
        </div>
        {drag && <div className="ak-tl__dragtid" style={{ left: drag.tipX, top: drag.tipY }}>{drag.tekst}</div>}
      </div>
    </Ctx.Provider>
  );
}

function Bane({ id, etikett, children }) {
  const { registrer } = React.useContext(Ctx);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (id != null) { registrer(id, ref.current); return () => registrer(id, null); }
  }, [id]);
  return (
    <div className="ak-tlbane">
      <div className="ak-tlbane__etikett">{etikett}</div>
      <div className="ak-tlbane__flate" ref={ref}>
        <BaneCtx.Provider value={id != null ? id : null}>{children}</BaneCtx.Provider>
      </div>
    </div>
  );
}

function Bar({ id, fra, til, akse, utkast = false, onClick, children }) {
  const { total, onFlytt, baneVed, setDrag, rotRef } = React.useContext(Ctx);
  const baneId = React.useContext(BaneCtx);
  const flyttbar = !!(onFlytt && id != null);
  const [drar, setDrar] = React.useState(null); // 'flytt' | 'kant-h' | 'kant-v'
  const [ghost, setGhost] = React.useState(null); // {fra, til}
  const start = React.useRef(null);
  const varighet = til - fra;

  const flateBredde = () => {
    const el = start.current && start.current.flateEl;
    return el ? el.getBoundingClientRect().width : 1;
  };
  const enheterFor = (dx) => Math.round((dx / flateBredde()) * total);

  const begynn = (e, modus) => {
    if (!flyttbar || e.button !== 0) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, modus, flyttet: false, flateEl: e.currentTarget.closest(".ak-tlbane__flate") };
  };
  const beveg = (e) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (!s.flyttet && Math.abs(dx) < 4 && Math.abs(e.clientY - s.y) < 4) return;
    s.flyttet = true;
    if (!drar) setDrar(s.modus);
    const d = enheterFor(dx);
    let nyFra = fra, nyTil = til;
    if (s.modus === "flytt") { nyFra = Math.min(Math.max(fra + d, 0), total - varighet); nyTil = nyFra + varighet; }
    else if (s.modus === "kant-h") { nyTil = Math.min(Math.max(til + d, fra + 1), total); }
    else { nyFra = Math.max(Math.min(fra + d, til - 1), 0); }
    setGhost({ fra: nyFra, til: nyTil });
    const gr = rotRef.current.getBoundingClientRect();
    setDrag({ tipX: e.clientX - gr.left, tipY: e.clientY - gr.top, tekst: `${nyFra + 1}–${nyTil}` });
  };
  const slipp = (e) => {
    const s = start.current;
    if (!s) return;
    start.current = null;
    const g = ghost;
    setDrar(null); setGhost(null); setDrag(null);
    if (!s.flyttet) return;
    if (!g) return;
    const nyBane = s.modus === "flytt" ? baneVed(e.clientY) : null;
    if (g.fra !== fra || g.til !== til || (nyBane != null && nyBane !== baneId)) {
      onFlytt({ id, baneId: nyBane != null ? nyBane : baneId, fra: g.fra, til: g.til });
    }
  };
  React.useEffect(() => {
    if (!drar) return;
    const onKey = (ev) => {
      if (ev.key === "Escape") { start.current = null; setDrar(null); setGhost(null); setDrag(null); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [drar]);

  const onKeyDown = (e) => {
    if (!flyttbar || !e.altKey) return;
    let handled = true;
    const d = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
    if (d !== 0 && e.shiftKey) {
      const nyTil = Math.min(Math.max(til + d, fra + 1), total);
      if (nyTil !== til) onFlytt({ id, baneId, fra, til: nyTil });
    } else if (d !== 0) {
      const nyFra = Math.min(Math.max(fra + d, 0), total - varighet);
      if (nyFra !== fra) onFlytt({ id, baneId, fra: nyFra, til: nyFra + varighet });
    } else handled = false;
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  };

  const visFra = ghost ? ghost.fra : fra;
  const visTil = ghost ? ghost.til : til;
  const ax = akse ? AXIS_VAR[akse] : null;
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      className={`ak-tlbar${utkast ? " ak-tlbar--utkast" : ""}${flyttbar ? " ak-tlbar--flyttbar" : ""}${drar ? " ak-tlbar--drar" : ""}`}
      onClick={() => { if (!start.current && !drar) onClick && onClick(); }}
      onPointerDown={(e) => begynn(e, "flytt")}
      onPointerMove={beveg}
      onPointerUp={slipp}
      onPointerCancel={() => { start.current = null; setDrar(null); setGhost(null); setDrag(null); }}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        left: `${(visFra / total) * 100}%`,
        width: `${((visTil - visFra) / total) * 100}%`,
        ...(ax ? { background: `var(--axis-${ax}-soft)`, borderLeftColor: `var(--axis-${ax})` } : {}),
      }}
      aria-label={`Uke ${fra + 1}–${til}${flyttbar ? " — flyttbar: Alt + piltaster, Shift for varighet" : ""}`}
    >
      <span className="ak-tlbar__txt">{children}</span>
      {hover && !drar && (
        <DataPreview
          visible
          x="50%"
          y={0}
          placement="top"
          label={`Uke ${fra + 1}–${til}`}
          value={akse ? undefined : (typeof children === "string" ? children : `${til - fra} uker`)}
          rows={akse ? [{ color: `var(--axis-${ax})`, label: akse, value: `${til - fra} uker` }] : undefined}
        />
      )}
      {flyttbar && (
        <React.Fragment>
          <span className="ak-tlbar__kant ak-tlbar__kant--v" onPointerDown={(e) => begynn(e, "kant-v")} onPointerMove={beveg} onPointerUp={slipp} aria-hidden="true"></span>
          <span className="ak-tlbar__kant ak-tlbar__kant--h" onPointerDown={(e) => begynn(e, "kant-h")} onPointerMove={beveg} onPointerUp={slipp} aria-hidden="true"></span>
        </React.Fragment>
      )}
    </button>
  );
}

function Punkt({ ved, variant = "turnering", etikett, onClick }) {
  const { total } = React.useContext(Ctx);
  return (
    <button
      type="button"
      className={`ak-tlpkt${variant === "peak" ? " ak-tlpkt--peak" : ""}`}
      style={{ left: `${(ved / total) * 100}%` }}
      onClick={onClick}
      title={etikett}
      aria-label={etikett || `Hendelse uke ${ved + 1}`}
    ></button>
  );
}

Tidslinje.Bane = Bane;
Tidslinje.Bar = Bar;
Tidslinje.Punkt = Punkt;
