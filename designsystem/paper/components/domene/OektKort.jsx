import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-oekt-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-oekt{--floor:0px;--ovelser:flex;display:flex;flex-direction:column;gap:var(--s2);width:100%;min-width:0;box-sizing:border-box;min-height:max(56px,var(--floor));padding:12px;border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface);font-family:var(--ui);text-align:left;color:var(--fg);cursor:pointer;transition:background var(--dur) var(--ease)}
.akhq-oekt:hover,.akhq-oekt[data-state=hover]{background:var(--soft)}
.akhq-oekt:focus-visible,.akhq-oekt[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-oekt-topp{display:flex;align-items:center;gap:var(--s2);min-width:0}
.akhq-oekt-ttl{flex:1;min-width:0;font-size:13.5px;font-weight:600;overflow-wrap:anywhere}
.akhq-oekt-tid{flex:none;font-family:var(--mono);font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-oekt-fokus{margin:0;font-family:var(--body);font-size:12.5px;color:var(--muted);line-height:1.5;max-width:52ch}
.akhq-oekt-ovelser{display:var(--ovelser);flex-direction:column;gap:2px;margin:0;padding:0;list-style:none}
.akhq-oekt-o-rad{display:flex;gap:var(--s2);font-family:var(--mono);font-size:10.5px;color:var(--muted)}
.akhq-oekt-o-n{flex:none;color:var(--mid);font-variant-numeric:tabular-nums}
.akhq-oekt-bunn{display:flex;align-items:center;gap:var(--s2);flex-wrap:wrap}
.akhq-oekt-status{font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
}
@layer akhq-container{
@container (max-width:340px){.akhq-oekt{--ovelser:none}}
@media(pointer:coarse){.akhq-oekt{--floor:56px}}
[data-coarse-test] .akhq-oekt{--floor:56px}
}
@layer akhq-modifier{
.akhq-oekt--gjennomfort{background:var(--soft)}
.akhq-oekt-status--ok{color:var(--up)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-oekt")) { const s = document.createElement("style"); s.id = "akhq-css-oekt"; s.textContent = css; document.head.appendChild(s); }
/* Øktas INNHOLD som artefaktkort: tittel, tid, fokus (Lora), øvelsesliste
   og status. Grensen mot SessionCard: SessionCard er økta PLASSERT PÅ
   TID (ukelerret/kalender, pyramidekant); OektKort er økta som innhold i
   tråden, planen og historikken. Ett treffmål — åpner økt-editoren/
   gjennomføringen. Formelchips og merker sendes inn som footer-children
   (AKFormelChip, FleksMerke) — kortet tegner dem ikke selv. */
export function OektKort({
  title, timeLabel, focus, drills = [], status, statusLabel,
  footer, onClick, dataOdId = "oektkort", ...rest
}) {
  return (
    <div className="akhq-oekt-wrap">
      <button type="button" className={"akhq-oekt" + (status === "gjennomfort" ? " akhq-oekt--gjennomfort" : "")}
        onClick={onClick} data-od-id={"cta-" + dataOdId} {...rest}>
        <span className="akhq-oekt-topp">
          <span className="akhq-oekt-ttl">{title}</span>
          {timeLabel && <span className="akhq-oekt-tid">{timeLabel}</span>}
        </span>
        {focus && <p className="akhq-oekt-fokus">{focus}</p>}
        {drills.length > 0 && (
          <ul className="akhq-oekt-ovelser">
            {drills.map((d, i) => (
              <li className="akhq-oekt-o-rad" key={i}><span className="akhq-oekt-o-n">{i + 1}.</span>{d}</li>
            ))}
          </ul>
        )}
        {(statusLabel || footer) && (
          <span className="akhq-oekt-bunn">
            {statusLabel && <span className={"akhq-oekt-status" + (status === "gjennomfort" ? " akhq-oekt-status--ok" : "")}>{statusLabel}</span>}
            {footer}
          </span>
        )}
      </button>
    </div>
  );
}
