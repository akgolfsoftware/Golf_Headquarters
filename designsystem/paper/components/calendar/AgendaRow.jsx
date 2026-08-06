import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-agr-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-agr{--pyr:var(--mid);--h:52px;--floor:0px;--tidw:76px;--slutt:block;position:relative;display:flex;align-items:center;gap:var(--s3);width:100%;min-width:0;box-sizing:border-box;min-height:max(var(--h),var(--floor));padding:6px 10px 6px 12px;border:0;border-left:3px solid var(--pyr);background:transparent;font-family:var(--ui);text-align:left;color:var(--fg);cursor:pointer;transition:background var(--dur) var(--ease)}
.akhq-agr:hover,.akhq-agr[data-state=hover]{background:var(--soft)}
.akhq-agr:focus-visible,.akhq-agr[data-state=focus]{outline:2px solid var(--focus);outline-offset:-2px}
.akhq-agr-tid{flex:none;width:var(--tidw);font-family:var(--mono);font-size:11px;font-variant-numeric:tabular-nums;color:var(--fg)}
.akhq-agr-slutt{display:var(--slutt);font-size:10px;color:var(--mid)}
.akhq-agr-c{min-width:0;flex:1}
.akhq-agr-ttl{margin:0;font-size:13.5px;font-weight:500;line-height:1.3;overflow-wrap:anywhere}
.akhq-agr-meta{margin:1px 0 0;font-family:var(--mono);font-size:10.5px;color:var(--muted)}
.akhq-agr-hale{flex:none;font-family:var(--mono);font-size:10.5px;color:var(--muted)}
.akhq-agr-naa{font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.09em;color:var(--fg)}
.akhq-agr-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
}
@layer akhq-container{
@container (max-width:360px){.akhq-agr{--tidw:44px;--slutt:none}}
@media(pointer:coarse){.akhq-agr{--floor:44px}}
[data-coarse-test] .akhq-agr{--floor:44px}
}
@layer akhq-modifier{
.akhq-agr--fys{--pyr:var(--info)}
.akhq-agr--tek{--pyr:var(--fg)}
.akhq-agr--slag{--pyr:var(--mid)}
.akhq-agr--spill{--pyr:var(--muted)}
.akhq-agr--turn{--pyr:var(--up)}
.akhq-agr--naa{background:var(--soft)}
.akhq-agr--ferdig .akhq-agr-ttl{color:var(--muted)}
.akhq-agr--avlyst .akhq-agr-ttl{color:var(--muted);text-decoration:line-through}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-agr")) { const s = document.createElement("style"); s.id = "akhq-css-agr"; s.textContent = css; document.head.appendChild(s); }
const OMR = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
/* Agendalistens rad: tidskolonne · innhold · hale. Tidsakse-forankret der
   ListRow er generell — tiden står i fast mono-kolonne så øyet kan skanne
   nedover klokka. Raden er ETT treffmål (åpner økta/hendelsen); status er
   informasjon, ikke knapper. Skillelinjene eier ListGroup/panelet — raden
   tegner ingen selv. */
export function AgendaRow({
  time, endTime, title, meta, area, status, trailing,
  onClick, dataOdId = "agenda", ...rest
}) {
  const mod = area ? " akhq-agr--" + (OMR[area] || "tek") : "";
  const st = status === "naa" ? " akhq-agr--naa" : status === "ferdig" ? " akhq-agr--ferdig" : status === "avlyst" ? " akhq-agr--avlyst" : "";
  return (
    <div className="akhq-agr-wrap">
      <button type="button" className={"akhq-agr" + mod + st}
        aria-current={status === "naa" ? "true" : undefined}
        onClick={onClick} data-od-id={"cta-" + dataOdId} {...rest}>
        <span className="akhq-agr-tid">
          {time}
          {endTime && <span className="akhq-agr-slutt">{endTime}</span>}
        </span>
        <span className="akhq-agr-c">
          <span className="akhq-agr-ttl">{title}</span>
          {meta && <span className="akhq-agr-meta">{meta}</span>}
        </span>
        {status === "naa"
          ? <span className="akhq-agr-naa">NÅ</span>
          : trailing && <span className="akhq-agr-hale">{status === "ferdig" ? "✓ " + trailing : trailing}</span>}
        <span className="akhq-agr-sr">
          {status === "naa" ? "Pågår nå. " : ""}{status === "ferdig" ? "Gjennomført. " : ""}{status === "avlyst" ? "Avlyst. " : ""}
        </span>
      </button>
    </div>
  );
}
