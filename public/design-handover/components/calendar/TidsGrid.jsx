import React from "react";
import { DataPreview } from "../core/DataPreview.jsx";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — TidsGrid
 * Dag-/ukevisning med tidsakse. Notion-ro: hairline timelinjer, ingen
 * celle-rammer; hover/fokus i tom slot avslører «+ Ny». Nå-linjen er lime.
 * Blokker er children; akse-farge som venstrekant, booking-tilstander for
 * availability. DRAG & DROP: blokker med id flyttes med peker (snap :30,
 * på tvers av kolonner) og tastatur (Alt+piltaster). Escape avbryter.
 */

const GridCtx = React.createContext({ fraTime: 7, tilTime: 21, timeHoyde: 56 });
const KolCtx = React.createContext(null);

const CSS = `
.ak-tg{display:flex;width:100%;min-width:0;}
.ak-tg__akse{flex:none;width:46px;position:relative;}
.ak-tg__aksetime{
  position:absolute;right:8px;transform:translateY(-50%);
  font-family:var(--font-mono);font-size:9px;font-weight:600;
  color:var(--text-faint);font-variant-numeric:tabular-nums;
}
.ak-tg__kols{flex:1;display:grid;grid-auto-columns:1fr;grid-auto-flow:column;min-width:0;}
.ak-tg__kol{position:relative;border-left:1px solid var(--border);min-width:0;}
.ak-tg__kolhd{
  position:sticky;top:0;z-index:3;
  display:flex;align-items:center;justify-content:center;gap:6px;
  height:34px;background:var(--bg);border-bottom:1px solid var(--border);
  font-family:var(--font-mono);font-size:10px;font-weight:600;
  letter-spacing:.05em;text-transform:uppercase;color:var(--text-muted);
  font-variant-numeric:tabular-nums;
}
.ak-tg__kolhd--idag{color:var(--text);}
.ak-tg__kolhd--idag .ak-tg__idagdot{
  width:6px;height:6px;border-radius:9999px;background:var(--signal);
}
.ak-tg__flate{position:relative;}
.ak-tg__timelinje{position:absolute;left:0;right:0;height:1px;background:var(--border);}
.ak-tg__slot{
  position:absolute;left:0;right:0;background:none;border:none;padding:0;margin:0;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  color:transparent;border-radius:6px;
}
.ak-tg__slot:hover,.ak-tg__slot:focus-visible{color:var(--text-muted);background:var(--surface-hover);}
.ak-tg__slot:focus-visible{outline:none;box-shadow:inset 0 0 0 1px var(--border-strong);}
.ak-tg__slot span{
  display:inline-flex;align-items:center;gap:4px;
  font-family:var(--font-ui);font-size:11px;font-weight:500;
}
.ak-tg__naa{position:absolute;left:0;right:0;z-index:2;pointer-events:none;}
.ak-tg__naa::before{
  content:"";position:absolute;left:-3px;top:-2.5px;width:6px;height:6px;
  border-radius:9999px;background:var(--signal);
}
.ak-tg__naalinje{height:1.5px;background:var(--signal);opacity:.9;}
.ak-tgb{
  position:absolute;z-index:1;overflow:hidden;text-align:left;
  background:var(--surface);border:1px solid var(--border);
  border-left:3px solid var(--border-strong);border-radius:8px;
  padding:5px 8px 5px 9px;cursor:pointer;min-width:0;
  display:flex;flex-direction:column;gap:2px;
  transition:border-color var(--dur-fast) var(--ease-standard),background var(--dur-fast) var(--ease-standard);
}
.ak-tgb:hover{background:var(--surface-hover);}
.ak-tgb:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-tgb--apen{border-style:dashed;border-left-style:dashed;background:transparent;}
.ak-tgb--holdt{background:var(--warning-bg);border-color:var(--warning-border);border-left-color:var(--warning-solid);}
.ak-tgb--booket{background:var(--surface-2);border-left-color:var(--text-2);}
.ak-tgb--flyttbar{cursor:grab;touch-action:none;}
.ak-tgb--drar{
  cursor:grabbing;z-index:6;opacity:.92;transition:none;
  box-shadow:0 10px 28px rgba(0,0,0,0.35);
}
.ak-tg--drar,.ak-tg--drar *{user-select:none;}
.ak-tg__dragtid{
  position:absolute;z-index:7;pointer-events:none;transform:translate(-50%,-130%);
  background:var(--surface-2);border:1px solid var(--border-strong);border-radius:6px;
  padding:3px 8px;font-family:var(--font-mono);font-size:10px;font-weight:700;
  color:var(--text);font-variant-numeric:tabular-nums;white-space:nowrap;
}
.ak-tgb__resize{
  position:absolute;left:0;right:0;bottom:0;height:8px;cursor:ns-resize;touch-action:none;z-index:2;
}
.ak-tgb__resize::after{
  content:"";position:absolute;left:50%;bottom:2px;transform:translateX(-50%);
  width:22px;height:2px;border-radius:2px;background:var(--border-strong);
  opacity:0;transition:opacity var(--dur-fast) var(--ease-standard);
}
.ak-tgb:hover .ak-tgb__resize::after,.ak-tgb__resize:active::after{opacity:.7;}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-tg-css")) {
  const s = document.createElement("style");
  s.id = "ak-tg-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const AXIS_VAR = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
const fmtTime = (t) => `${String(Math.floor(t)).padStart(2, "0")}:${t % 1 ? "30" : "00"}`;

export function TidsGrid({
  fraTime = 7,
  tilTime = 21,
  timeHoyde = 56,
  naa,
  onFlytt,
  children,
  className = "",
  style,
}) {
  const timer = [];
  for (let t = fraTime; t <= tilTime; t++) timer.push(t);
  const hoyde = (tilTime - fraTime) * timeHoyde;
  const kolRef = React.useRef(new Map()); // id -> element
  const [drag, setDrag] = React.useState(null); // {tipX, tipY, tid}
  const registrer = React.useCallback((id, el) => {
    if (el) kolRef.current.set(id, el);
    else kolRef.current.delete(id);
  }, []);
  /** Finn kolonne-id fra clientX (midtpunkt-avstand). */
  const kolonneVed = React.useCallback((x) => {
    let best = null, bestDist = Infinity;
    kolRef.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right) { best = id; bestDist = 0; }
      else {
        const d = Math.min(Math.abs(x - r.left), Math.abs(x - r.right));
        if (bestDist > 0 && d < bestDist) { bestDist = d; best = id; }
      }
    });
    return best;
  }, []);
  const ctx = { fraTime, tilTime, timeHoyde, naa, onFlytt, registrer, kolonneVed, setDrag };
  return (
    <GridCtx.Provider value={ctx}>
      <div className={`ak-tg${drag ? " ak-tg--drar" : ""} ${className}`} style={{ position: "relative", ...style }}>
        <div className="ak-tg__akse" aria-hidden="true">
          <div style={{ height: 34 }}></div>
          <div style={{ position: "relative", height: hoyde }}>
            {timer.map((t) => (
              <span key={t} className="ak-tg__aksetime" style={{ top: (t - fraTime) * timeHoyde }}>
                {fmtTime(t)}
              </span>
            ))}
          </div>
        </div>
        <div className="ak-tg__kols">{children}</div>
        {drag && (
          <div className="ak-tg__dragtid" style={{ left: drag.tipX, top: drag.tipY }}>{drag.tid}</div>
        )}
      </div>
    </GridCtx.Provider>
  );
}

function Kolonne({ id, header, idag = false, onNyOkt, children }) {
  const { fraTime, tilTime, timeHoyde, naa, registrer } = React.useContext(GridCtx);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (id != null) { registrer(id, ref.current); return () => registrer(id, null); }
  }, [id]);
  const timer = [];
  for (let t = fraTime; t < tilTime; t++) timer.push(t);
  const hoyde = (tilTime - fraTime) * timeHoyde;
  const visNaa = naa != null && naa >= fraTime && naa <= tilTime;
  return (
    <div className="ak-tg__kol" ref={ref}>
      <div className={`ak-tg__kolhd${idag ? " ak-tg__kolhd--idag" : ""}`}>
        {idag && <span className="ak-tg__idagdot" aria-hidden="true"></span>}
        {header}
      </div>
      <div className="ak-tg__flate" style={{ height: hoyde }}>
        {timer.map((t) => (
          <div key={t} className="ak-tg__timelinje" style={{ top: (t - fraTime) * timeHoyde }} aria-hidden="true"></div>
        ))}
        {onNyOkt &&
          timer.map((t) => (
            <button
              key={`s${t}`}
              type="button"
              className="ak-tg__slot"
              style={{ top: (t - fraTime) * timeHoyde + 1, height: timeHoyde - 2 }}
              onClick={() => onNyOkt(t)}
              aria-label={`Ny økt ${fmtTime(t)}`}
            >
              <span><Icon name="plus" size={12} />Ny</span>
            </button>
          ))}
        <KolCtx.Provider value={id != null ? id : null}>{children}</KolCtx.Provider>
        {visNaa && (
          <div className="ak-tg__naa" style={{ top: (naa - fraTime) * timeHoyde }}>
            <div className="ak-tg__naalinje"></div>
          </div>
        )}
      </div>
    </div>
  );
}

function Blokk({ id, fra, til, akse, tilstand, arena, trinn, cs, onClick, children, spor = 0, antallSpor = 1 }) {
  const grid = React.useContext(GridCtx);
  const [peekXY, setPeekXY] = React.useState(null);
  const kolonneId = React.useContext(KolCtx);
  const { fraTime, tilTime, timeHoyde, onFlytt, kolonneVed, setDrag } = grid;
  const flyttbar = !!(onFlytt && id != null);
  const [drar, setDrar] = React.useState(false);
  const [delta, setDelta] = React.useState({ x: 0, y: 0 });
  const start = React.useRef(null);
  const varighet = til - fra;
  const maksFra = tilTime - varighet;

  const klampSnap = (t) => Math.min(Math.max(Math.round(t * 2) / 2, fraTime), maksFra);

  /* Endre varighet: dra nederste kant. Snap :30, min 0,5t, klamp til tilTime.
     Fyrer onFlytt med ny `til` (fra uendret) → konsumenten re-validerer arena/volum live. */
  const [resz, setResz] = React.useState(0);
  const rstart = React.useRef(null);
  const klampSnapTil = (t) => Math.min(Math.max(Math.round(t * 2) / 2, fra + 0.5), tilTime);
  const onResizeDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    rstart.current = { y: e.clientY, dy: 0 };
  };
  const onResizeMove = (e) => {
    if (!rstart.current) return;
    e.stopPropagation();
    const dy = e.clientY - rstart.current.y; rstart.current.dy = dy;
    setResz(dy);
    const nyTil = klampSnapTil(til + dy / timeHoyde);
    const gridEl = e.currentTarget.closest(".ak-tg");
    const gr = gridEl.getBoundingClientRect();
    setDrag({ tipX: e.clientX - gr.left, tipY: e.clientY - gr.top, tid: `${fmtTime(fra)}–${fmtTime(nyTil)} · ${String(nyTil - fra).replace(".", ",")} t` });
  };
  const resizeEnd = (commit) => {
    if (!rstart.current) return;
    const dy = rstart.current.dy; rstart.current = null; setResz(0); setDrag(null);
    if (!commit) return;
    const nyTil = klampSnapTil(til + dy / timeHoyde);
    if (nyTil !== til && onFlytt) onFlytt({ id, kolonneId, fra, til: nyTil });
  };
  React.useEffect(() => {
    if (resz === 0) return;
    const onKey = (ev) => { if (ev.key === "Escape") resizeEnd(false); };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  });

  const onPointerDown = (e) => {
    if (!flyttbar || e.button !== 0) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, flyttet: false };
  };
  const onPointerMove = (e) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (!start.current.flyttet && Math.hypot(dx, dy) < 5) return;
    start.current.flyttet = true;
    if (!drar) setDrar(true);
    setDelta({ x: dx, y: dy });
    const nyFra = klampSnap(fra + dy / timeHoyde);
    const gridEl = e.currentTarget.closest(".ak-tg");
    const gr = gridEl.getBoundingClientRect();
    setDrag({ tipX: e.clientX - gr.left, tipY: e.clientY - gr.top, tid: `${fmtTime(nyFra)}–${fmtTime(nyFra + varighet)}` });
  };
  const avslutt = (commit, e) => {
    if (!start.current) return;
    const var_ = start.current; start.current = null;
    setDrar(false); setDelta({ x: 0, y: 0 }); setDrag(null);
    if (!var_.flyttet) return; // klikk — la onClick håndtere
    if (!commit || !e) return;
    const nyFra = klampSnap(fra + (e.clientY - var_.y) / timeHoyde);
    const nyKol = kolonneVed(e.clientX);
    if (nyFra !== fra || (nyKol != null && nyKol !== kolonneId)) {
      onFlytt({ id, kolonneId: nyKol != null ? nyKol : kolonneId, fra: nyFra, til: nyFra + varighet });
    }
  };
  React.useEffect(() => {
    if (!drar) return;
    const onKey = (ev) => { if (ev.key === "Escape") avslutt(false); };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  });

  const onKeyDown = (e) => {
    if (!flyttbar || !e.altKey) return;
    let handled = true;
    if (e.key === "ArrowUp") {
      const nyFra = Math.max(fra - 0.5, fraTime);
      if (nyFra !== fra) onFlytt({ id, kolonneId, fra: nyFra, til: nyFra + varighet });
    } else if (e.key === "ArrowDown") {
      const nyFra = Math.min(fra + 0.5, maksFra);
      if (nyFra !== fra) onFlytt({ id, kolonneId, fra: nyFra, til: nyFra + varighet });
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      onFlytt({ id, kolonneId, fra, til, retning: e.key === "ArrowLeft" ? -1 : 1 });
    } else handled = false;
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  };

  const top = (fra - fraTime) * timeHoyde;
  const h = Math.max(varighet * timeHoyde - 3 + resz, 20);
  const w = 100 / antallSpor;
  const ax = akse ? AXIS_VAR[akse] : null;
  const cls = tilstand ? ` ak-tgb--${tilstand}` : "";
  const akRows = [
    akse ? { color: `var(--axis-${ax})`, label: akse, value: cs || "—" } : null,
    arena != null ? { label: "Arena", value: arena } : null,
    trinn != null ? { label: "Trinn", value: trinn } : null,
  ].filter(Boolean);
  return (
    <React.Fragment>
    <button
      type="button"
      className={`ak-tgb${cls}${flyttbar ? " ak-tgb--flyttbar" : ""}${drar || resz !== 0 ? " ak-tgb--drar" : ""}`}
      onClick={(e) => { if (start.current == null && !drar) onClick && onClick(e); }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => avslutt(true, e)}
      onPointerCancel={() => avslutt(false)}
      onKeyDown={onKeyDown}
      onMouseEnter={(e) => setPeekXY({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setPeekXY(null)}
      style={{
        top,
        height: h,
        left: `calc(${spor * w}% + 3px)`,
        width: `calc(${w}% - 6px)`,
        ...(drar ? { transform: `translate(${delta.x}px, ${delta.y}px)` } : {}),
        ...(ax ? { background: `var(--axis-${ax}-soft)`, borderLeftColor: `var(--axis-${ax})` } : {}),
      }}
      aria-label={`${fmtTime(fra)}–${fmtTime(til)}${flyttbar ? " — flyttbar: Alt + piltaster" : ""}`}
    >
      {children}
      {flyttbar && (
        <span
          className="ak-tgb__resize"
          onPointerDown={onResizeDown}
          onPointerMove={onResizeMove}
          onPointerUp={() => resizeEnd(true)}
          onPointerCancel={() => resizeEnd(false)}
          onClick={(e) => e.stopPropagation()}
          aria-hidden="true"
        />
      )}
    </button>
    {peekXY && !drar && resz === 0 && (
      <div style={{ position: "fixed", left: peekXY.x, top: peekXY.y - 6, zIndex: 60, pointerEvents: "none" }}>
        <DataPreview visible x={0} y={0} placement="top" label={`${fmtTime(fra)}–${fmtTime(til)}`} rows={akRows.length ? akRows : undefined} value={akRows.length ? undefined : (akse || "Økt")} />
      </div>
    )}
    </React.Fragment>
  );
}

TidsGrid.Kolonne = Kolonne;
TidsGrid.Blokk = Blokk;
