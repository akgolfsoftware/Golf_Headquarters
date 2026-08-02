import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-sc{--pyr:var(--mid);container-type:inline-size;position:relative;display:flex;flex-direction:column;gap:6px;width:100%;min-width:0;box-sizing:border-box;padding:8px 10px 8px 12px;border:1px solid var(--border);border-left:3px solid var(--pyr);border-radius:var(--r-sm);background:var(--surface);font-family:var(--ui);text-align:left;color:var(--fg);cursor:pointer;transition:border-color var(--dur) var(--ease),background var(--dur) var(--ease)}
.akhq-sc:hover,.akhq-sc[data-state=hover]{background:var(--soft)}
.akhq-sc:focus-visible,.akhq-sc[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-sc-top{display:flex;align-items:center;gap:6px;min-width:0}
.akhq-sc-tid{font-family:var(--mono);font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums;flex:none}
.akhq-sc-omr{font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--pyr-tx,var(--fg))}
.akhq-sc-merker{display:flex;align-items:center;gap:4px;margin-left:auto;flex:none;color:var(--muted)}
.akhq-sc-merke{display:inline-flex;align-items:center;gap:3px;font-family:var(--mono);font-size:10px;color:var(--muted)}
.akhq-sc-ttl{margin:0;font-size:13px;font-weight:500;line-height:1.3;overflow-wrap:anywhere}
.akhq-sc-formel{font-family:var(--mono);font-size:10.5px;letter-spacing:.02em;color:var(--muted);overflow-wrap:anywhere}
.akhq-sc-bunn{display:flex;align-items:center;gap:var(--s2);flex-wrap:wrap}
.akhq-sc-note{font-family:var(--mono);font-size:10.5px;color:var(--muted)}
.akhq-sc-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
}
@layer akhq-container{
/* Under 150 px kolonnebredde (ukelerretets sju kolonner på et smalt vindu)
   faller formelen bort før tittelen. Formelen er presisering; tittelen er
   hva økta ER. Rekkefølgen på hva som ryker er en beslutning, ikke en
   bieffekt av kildeordenen. */
@container (max-width: 150px){.akhq-sc-formel{display:none}.akhq-sc{padding:6px 8px 6px 9px}}
@container (max-width: 110px){.akhq-sc-omr{display:none}}
}
@layer akhq-modifier{
.akhq-sc--fys{--pyr:var(--info)}
.akhq-sc--tek{--pyr:var(--fg)}
.akhq-sc--slag{--pyr:var(--mid)}
.akhq-sc--spill{--pyr:var(--muted)}
.akhq-sc--turn{--pyr:var(--up)}
.akhq-sc--laast{border-style:solid;background:var(--soft)}
.akhq-sc--utkast{border-style:dashed;background:transparent}
.akhq-sc--valgt{border-color:var(--fg);box-shadow:inset 0 0 0 1px var(--fg)}
.akhq-sc--kompakt .akhq-sc-formel,.akhq-sc--kompakt .akhq-sc-bunn{display:none}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-sc")) { const s = document.createElement("style"); s.id = "akhq-css-sc"; s.textContent = css; document.head.appendChild(s); }
const OMR = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
/* Øktkortet på ukelerretet, i kalenderen og i profilens Plan-fane.
   Anatomien er fast: tid · pyramideområde · merker · tittel · AK-formel ·
   bunnlinje. Kortet er ETT klikkbart element (åpner editoren) — hengelås,
   rrule og deltakertelling er informasjon, ikke knapper. Da holder ett
   treffmål for hele kortet, og gulvet er kortets egen høyde.

   Drag, resize og tastaturflytting hører til Workbench, ikke hit — samme
   skille som TimeGrid: anatomi i biblioteket, oppførsel i konsumenten. */
export function SessionCard({
  time, area = "TEK", title, formula, duration, participants, locked = false,
  recurring = false, draft = false, selected = false, compact = false,
  note, onClick, dataOdId = "okt", ...rest
}) {
  const mod = OMR[area] || "tek";
  return (
    <button type="button"
      className={"akhq-sc akhq-sc--" + mod + (locked ? " akhq-sc--laast" : "") + (draft ? " akhq-sc--utkast" : "") + (selected ? " akhq-sc--valgt" : "") + (compact ? " akhq-sc--kompakt" : "")}
      aria-pressed={selected ? "true" : undefined}
      onClick={onClick} data-od-id={"cta-" + dataOdId} {...rest}>
      <span className="akhq-sc-top">
        {time && <span className="akhq-sc-tid">{time}</span>}
        <span className="akhq-sc-omr">{area}</span>
        <span className="akhq-sc-merker">
          {locked && <span className="akhq-sc-merke" aria-hidden="true">◪</span>}
          {recurring && <span className="akhq-sc-merke" aria-hidden="true">↻</span>}
          {participants > 1 && <span className="akhq-sc-merke" aria-hidden="true">{participants}·</span>}
        </span>
      </span>
      <span className="akhq-sc-ttl">{title}</span>
      {formula && <span className="akhq-sc-formel">{formula}</span>}
      {(duration || note) && (
        <span className="akhq-sc-bunn">
          {duration && <span className="akhq-sc-note">{duration}</span>}
          {note && <span className="akhq-sc-note">{note}</span>}
        </span>
      )}
      <span className="akhq-sc-sr">
        {locked ? "Låst anker. " : ""}{recurring ? "Gjentakende. " : ""}{participants > 1 ? participants + " deltakere. " : ""}{draft ? "Utkast. " : ""}
      </span>
    </button>
  );
}
