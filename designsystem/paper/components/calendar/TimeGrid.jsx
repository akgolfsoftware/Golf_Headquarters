import React from "react";
import { ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-tg", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-tg-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
/* 1px = 1 minutt. --min0/--min1 er døgnvinduet i minutter; alt annet avledes. */
.akhq-tg{--min0:240;--min1:1380;--gut:52px;--colmin:112px;--lane:calc(var(--min1) - var(--min0));--hour:var(--tg-hour-line,color-mix(in srgb,var(--border) 100%,transparent));--sub:var(--tg-sub-line,color-mix(in srgb,var(--border) 45%,transparent));display:grid;box-sizing:border-box;min-width:0;max-width:100%;font-family:var(--ui);color:var(--fg);background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.akhq-tg-scroll{overflow:auto;overscroll-behavior:contain;max-height:var(--tg-h,460px);min-width:0}
.akhq-tg-head{position:sticky;top:0;z-index:4;display:grid;grid-template-columns:var(--gut) repeat(var(--days),minmax(var(--colmin),1fr));background:var(--surface);border-bottom:1px solid var(--border)}
.akhq-tg-head>.akhq-tg-gut{position:sticky;left:0;z-index:5;background:var(--surface);border-right:1px solid var(--border)}
.akhq-tg-day{display:grid;gap:2px;justify-items:center;padding:var(--s2) var(--s2);font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--mid);border-left:1px solid var(--border)}
.akhq-tg-day b{display:grid;place-items:center;min-width:24px;height:24px;padding:0 6px;border-radius:999px;font-family:var(--mono);font-size:13px;font-weight:600;color:var(--fg)}
.akhq-tg-col--today .akhq-tg-day b,.akhq-tg-day--today b{background:var(--soft)}
.akhq-tg-body{position:relative;display:grid;grid-template-columns:var(--gut) repeat(var(--days),minmax(var(--colmin),1fr));height:calc(var(--lane) * 1px)}
.akhq-tg-gut{position:sticky;left:0;z-index:3;background:var(--surface);border-right:1px solid var(--border)}
.akhq-tg-body>.akhq-tg-gut{position:sticky}
.akhq-tg-hour{position:absolute;left:0;width:calc(var(--gut) - 8px);text-align:right;transform:translateY(-50%);font-family:var(--mono);font-size:10.5px;color:var(--mid)}
/* Første og siste etikett flukter med kanten — ellers spises halve glyfen av
   det sticky dagshodet. Gutterens offset er urørt: 1px = 1min holder. */
.akhq-tg-hour--first{transform:none}
.akhq-tg-hour--last{transform:translateY(-100%)}
/* Rasteret er gradient, ikke DOM: 7 kolonner × 57 linjer = 399 noder spart. */
.akhq-tg-col{position:relative;min-width:0;border-left:1px solid var(--border);background-image:repeating-linear-gradient(to bottom,var(--hour) 0 1px,transparent 1px 60px),repeating-linear-gradient(to bottom,var(--sub) 0 1px,transparent 1px 20px);background-position:0 0,0 0}
.akhq-tg-col--today{background-color:color-mix(in srgb,var(--soft) 45%,transparent)}
.akhq-tg-ev{--floor:0px;position:absolute;left:3px;right:3px;z-index:2;box-sizing:border-box;display:grid;align-content:start;gap:1px;overflow:hidden;padding:3px 6px;border:1px solid var(--fg);border-left:3px solid var(--fg);border-radius:var(--r-sm,6px);background:var(--surface);color:var(--fg);text-align:left;font:inherit;cursor:pointer}
.akhq-tg-ev:hover{background:var(--soft)}
.akhq-tg-ev:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
/* Treffsonen er usynlig og sentrert — boksen strekkes aldri, ellers ville
   en 20-min-økt løyet om varigheten sin (1px = 1min er kontrakten). */
.akhq-tg-ev::after{content:"";position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);height:max(100%,var(--floor))}
.akhq-tg-ev-time{font-family:var(--mono);font-size:10px;color:var(--mid);white-space:nowrap}
.akhq-tg-ev-title{font-size:12px;font-weight:500;line-height:1.25;text-wrap:pretty;overflow:hidden}
.akhq-tg-ev--free{border-style:dashed;border-color:var(--up);border-left:3px dashed var(--up);background:transparent}
.akhq-tg-ev--free .akhq-tg-ev-title{color:var(--up)}
.akhq-tg-ev--bg{z-index:0;pointer-events:none;border:0;border-radius:0;left:0;right:0;padding:3px 6px;background:color-mix(in srgb,var(--soft) 70%,transparent);cursor:default}
.akhq-tg-ev--bg .akhq-tg-ev-title{font-weight:400;color:var(--mid)}
.akhq-tg-now{position:absolute;left:var(--gut);right:0;z-index:1;height:0;border-top:1px solid var(--accent);pointer-events:none}
.akhq-tg-now::before{content:"";position:absolute;left:-3px;top:-3px;width:6px;height:6px;border-radius:999px;background:var(--accent)}
}
@layer akhq-container{
@container (max-width:560px){.akhq-tg{--gut:40px;--colmin:96px}}
@media(pointer:coarse){.akhq-tg-ev{--floor:44px}}
[data-coarse-test] .akhq-tg-ev{--floor:44px}
}
@layer akhq-modifier{
.akhq-tg--tall{--tg-h:720px}
.akhq-tg-ev--kort{grid-auto-flow:column;grid-template-columns:auto minmax(0,1fr);align-content:center;align-items:baseline;gap:6px;padding-top:0;padding-bottom:0}
.akhq-tg-ev--kort .akhq-tg-ev-title{white-space:nowrap;text-overflow:ellipsis}
.akhq-tg--compact .akhq-tg-ev-title{font-size:11px}
}`);

const toMin = (t) => { if (typeof t === "number") return t; const [h, m] = String(t).split(":"); return (+h) * 60 + (+m || 0); };
const hhmm = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");

/** Baner: overlappende hendelser deler bredden i stedet for å skjule hverandre. */
function lanes(list) {
  const sorted = [...list].sort((a, b) => a.s - b.s || a.e - b.e);
  const out = []; let group = []; let groupEnd = -1;
  const flush = () => { group.forEach((g) => out.push({ ...g, lanes: group.__n })); group = []; };
  const ends = [];
  sorted.forEach((ev) => {
    if (group.length && ev.s >= groupEnd) { group.__n = ends.length; flush(); ends.length = 0; groupEnd = -1; }
    let lane = ends.findIndex((end) => end <= ev.s);
    if (lane === -1) { lane = ends.length; ends.push(ev.e); } else ends[lane] = ev.e;
    groupEnd = Math.max(groupEnd, ev.e);
    group.push({ ...ev, lane });
  });
  if (group.length) { group.__n = ends.length; flush(); }
  return out;
}

/**
 * Ukens tidsgrid: 04:00–23:00, 1px = 1 minutt, 20-min raster. Ren anatomi —
 * drag, resize og tastaturflytting hører til konsumenten (Workbench), ikke hit.
 */
export function TimeGrid({
  days = [], events = [], startHour = 4, endHour = 23, now = null,
  maxHeight, onEventClick, state = "content", emptyText = "Ingen økter planlagt denne uken.",
  dataOdId = "panel-tidsgrid", className = "", ...rest
}) {
  const min0 = startHour * 60, min1 = endHour * 60;
  const hours = []; for (let h = startHour; h <= endHour; h++) hours.push(h);
  const byDay = days.map((_, i) => lanes(events
    .filter((e) => e.day === i && e.kind !== "bg")
    .map((e) => ({ ...e, s: toMin(e.start), e: toMin(e.end) }))));
  const bg = events.filter((e) => e.kind === "bg").map((e) => ({ ...e, s: toMin(e.start), e: toMin(e.end) }));
  const nowMin = now == null ? null : toMin(now);
  const style = { "--days": days.length, "--min0": min0, "--min1": min1, ...(maxHeight ? { "--tg-h": typeof maxHeight === "number" ? maxHeight + "px" : maxHeight } : null) };
  return (
    <div className="akhq-tg-wrap">
      <div className={"akhq-tg " + className} style={style} data-od-id={dataOdId} {...rest}>
        <Region state={state} empty={emptyText} height={200}>
          <div className="akhq-tg-scroll">
            <div className="akhq-tg-head">
              <div className="akhq-tg-gut"></div>
              {days.map((d, i) => (
                <div key={i} className={"akhq-tg-day" + (d.today ? " akhq-tg-day--today" : "")}>
                  <span>{d.label}</span><b>{d.date}</b>
                </div>
              ))}
            </div>
            <div className="akhq-tg-body">
              <div className="akhq-tg-gut">
                {hours.map((h) => (
                  <span key={h} className={"akhq-tg-hour" + (h === startHour ? " akhq-tg-hour--first" : h === endHour ? " akhq-tg-hour--last" : "")} style={{ top: (h * 60 - min0) + "px" }}>{hhmm(h * 60)}</span>
                ))}
              </div>
              {days.map((d, i) => (
                <div key={i} className={"akhq-tg-col" + (d.today ? " akhq-tg-col--today" : "")}>
                  {bg.filter((e) => e.day === i).map((e, k) => (
                    <div key={"b" + k} className="akhq-tg-ev akhq-tg-ev--bg" style={{ top: (e.s - min0) + "px", height: (e.e - e.s) + "px" }} aria-hidden="true">
                      <span className="akhq-tg-ev-title">{e.title}</span>
                    </div>
                  ))}
                  {byDay[i].map((e, k) => {
                    const w = 100 / e.lanes;
                    return (
                      <button key={e.id ?? k} type="button" onClick={onEventClick ? () => onEventClick(e) : undefined}
                        className={"akhq-tg-ev" + (e.kind === "free" ? " akhq-tg-ev--free" : "") + (e.e - e.s < 45 ? " akhq-tg-ev--kort" : "")}
                        data-od-id={"cta-okt-" + (e.id ?? i + "-" + k)}
                        style={{ top: (e.s - min0) + "px", height: (e.e - e.s) + "px", left: "calc(" + (w * e.lane) + "% + 3px)", right: "calc(" + (100 - w * (e.lane + 1)) + "% + 3px)" }}>
                        <span className="akhq-tg-ev-time">{hhmm(e.s)}–{hhmm(e.e)}</span>
                        <span className="akhq-tg-ev-title">{e.title}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
              {nowMin != null && nowMin >= min0 && nowMin <= min1 && (
                <div className="akhq-tg-now" style={{ top: (nowMin - min0) + "px" }} aria-hidden="true"></div>
              )}
            </div>
          </div>
        </Region>
      </div>
    </div>
  );
}
