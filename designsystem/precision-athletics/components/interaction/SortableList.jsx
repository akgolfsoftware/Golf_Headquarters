import React from "react";
import { Icon } from "../core/Icon.jsx";
/** Sortering med tre likeverdige veier: dra håndtaket (mus), tastatur (Mellomrom, piler, Mellomrom) og «Flytt»-knapp (mobil → MoveSheet). */
export function SortableList({ items, renderItem, onReorder, onMove, label = "Liste", locked = [], disabled, dragType = "application/x-ak-sort" }) {
  const [drag, setDrag] = React.useState(null), [over, setOver] = React.useState(null), [lift, setLift] = React.useState(null), [say, setSay] = React.useState("");
  const idx = (id) => items.findIndex((x) => x.id === id);
  const move = (from, to) => { if (from < 0 || from === to || to < 0 || to >= items.length) return; const ids = items.map((x) => x.id); const [m] = ids.splice(from, 1); ids.splice(to, 0, m); onReorder && onReorder(ids, { from, to }); };
  const key = (e, it) => { if (disabled || locked.includes(it.id)) return; const i = idx(it.id);
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (lift === it.id) { setLift(null); setSay(label + ": sluppet på plass " + (i + 1) + " av " + items.length); } else { setLift(it.id); setSay("Løftet. Bruk piltastene, Mellomrom for å slippe, Escape for å avbryte."); } }
    else if (lift === it.id && (e.key === "ArrowUp" || e.key === "ArrowDown")) { e.preventDefault(); const to = i + (e.key === "ArrowUp" ? -1 : 1); if (to >= 0 && to < items.length && !locked.includes(items[to].id)) { move(i, to); setSay("Plass " + (to + 1) + " av " + items.length); } }
    else if (e.key === "Escape" && lift) { setLift(null); setSay("Avbrutt"); } };
  return <div role="list" aria-label={label} style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
    {items.map((it, i) => { const isLocked = locked.includes(it.id), dragging = drag === it.id, lifted = lift === it.id;
      const handle = disabled || isLocked ? { disabled: true, "aria-disabled": true, style: { visibility: isLocked ? "visible" : "hidden" } } : {
        draggable: true, onDragStart: (e) => { e.dataTransfer.setData(dragType, it.id); e.dataTransfer.effectAllowed = "move"; setDrag(it.id); }, onDragEnd: () => { setDrag(null); setOver(null); },
        onKeyDown: (e) => key(e, it), "aria-pressed": lifted, "aria-roledescription": "sorterbar", "aria-label": "Flytt " + (it.label || "element") + ", plass " + (i + 1) + " av " + items.length };
      return <div role="listitem" key={it.id}
        onDragOver={(e) => { if (drag && !isLocked) { e.preventDefault(); setOver(i); } }}
        onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData(dragType); if (id) move(idx(id), i); setDrag(null); setOver(null); setSay("Flyttet til plass " + (i + 1)); }}
        style={{ position: "relative", opacity: dragging ? 0.45 : 1, outline: lifted ? "2px solid var(--border-ink)" : "none", outlineOffset: 2, borderRadius: "var(--radius-inner)" }}>
        {over === i && drag && drag !== it.id && <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: idx(drag) < i ? "auto" : -2, bottom: idx(drag) < i ? -2 : "auto", height: 2, background: "var(--primary)" }} />}
        {renderItem(it, { index: i, dragging, lifted, locked: isLocked,
          handle: <button type="button" {...handle} title={isLocked ? "Låst av coach" : "Dra, eller trykk Mellomrom og bruk piltastene"} style={{ all: "unset", cursor: isLocked ? "not-allowed" : "grab", width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 8, color: "var(--text-muted)", flexShrink: 0, ...(handle.style || {}) }}><Icon name={isLocked ? "lock" : "grip-vertical"} size={18} /></button>,
          moveButton: onMove && !isLocked && !disabled ? <button type="button" onClick={() => onMove(it)} aria-label={"Flytt " + (it.label || "")} style={{ all: "unset", cursor: "pointer", minHeight: 44, padding: "0 10px", display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 8, font: "500 13px/1 var(--font-sans)", color: "var(--text-primary)" }}><Icon name="move" size={16} />Flytt</button> : null })}
      </div>; })}
    <span aria-live="assertive" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{say}</span>
  </div>;
}
