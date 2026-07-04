import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — OppgaveKort
 * Arbeidsoppgave fra en fysisk time: drill + dose + frist + status.
 * Lukker lekse-loopen coach → spiller → innlevering → godkjenning.
 * Status = semantisk chip (ikon + tekst, aldri farge alene). Forfalt
 * varsler og foreslår — sperrer aldri (kanon: varsle og veilede).
 */

const CSS = `
.ak-oppg{
  display:flex;gap:12px;align-items:flex-start;
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-card);padding:13px 15px;
}
.ak-oppg--forfalt{border-color:var(--warning-border);background:var(--warning-bg);}
.ak-oppg__akse{width:4px;align-self:stretch;border-radius:3px;flex:none;background:var(--border-strong);}
.ak-oppg__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:7px;}
.ak-oppg__top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.ak-oppg__tittel{font-family:var(--font-ui);font-size:var(--text-14);font-weight:600;color:var(--text);}
.ak-oppg__beskr{font-family:var(--font-ui);font-size:var(--text-13);color:var(--text-2);line-height:var(--leading-body);}
.ak-oppg__meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.ak-oppg__chip{
  display:inline-flex;align-items:center;gap:5px;
  font-family:var(--font-mono);font-size:10px;font-weight:600;color:var(--text-muted);
  font-variant-numeric:tabular-nums;
}
.ak-oppg__chip svg{color:var(--text-faint);}
.ak-oppg__status{
  display:inline-flex;align-items:center;gap:5px;
  height:22px;padding:0 9px;border-radius:9999px;
  font-family:var(--font-mono);font-size:10px;font-weight:700;
  letter-spacing:.03em;border:1px solid transparent;white-space:nowrap;
}
.ak-oppg__status--venter{color:var(--text-muted);border-color:var(--border-strong);}
.ak-oppg__status--innlevert{color:var(--info);border-color:var(--info-border);background:var(--info-bg);}
.ak-oppg__status--godkjent{color:var(--success);border-color:var(--success-border);background:var(--success-bg);}
.ak-oppg__status--forfalt{color:var(--warning);border-color:var(--warning-border);background:var(--warning-bg);}
.ak-oppg__video{
  display:inline-flex;align-items:center;gap:4px;
  font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.05em;
  color:var(--text-2);border:1px solid var(--border-strong);border-radius:5px;padding:2px 6px;
}
.ak-oppg__handl{display:flex;flex-direction:column;gap:6px;align-items:flex-end;flex:none;}
.ak-oppg__prim{
  height:30px;padding:0 13px;border-radius:9px;border:none;cursor:pointer;
  background:var(--signal);color:var(--on-signal);
  font-family:var(--font-ui);font-size:12px;font-weight:700;white-space:nowrap;
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-oppg__prim:hover{background:var(--signal-press);}
.ak-oppg__prim:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-oppg__sek{
  height:30px;padding:0 11px;border-radius:9px;cursor:pointer;
  background:transparent;border:1px solid var(--border-strong);color:var(--text-2);
  font-family:var(--font-ui);font-size:12px;font-weight:500;white-space:nowrap;
  transition:background var(--dur-fast) var(--ease-standard),color var(--dur-fast) var(--ease-standard);
}
.ak-oppg__sek:hover{background:var(--surface-hover);color:var(--text);}
.ak-oppg__sek:focus-visible{outline:none;box-shadow:var(--glow-signal);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-oppg-css")) {
  const s = document.createElement("style");
  s.id = "ak-oppg-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const AXIS_VAR = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
const STATUS = {
  venter:    { ikon: "clock", tekst: "Venter" },
  innlevert: { ikon: "upload", tekst: "Innlevert" },
  godkjent:  { ikon: "check", tekst: "Godkjent" },
  forfalt:   { ikon: "alert-triangle", tekst: "Forfalt" },
};

export function OppgaveKort({
  tittel,
  beskrivelse,
  drill,
  dose,
  frist,
  status = "venter",
  videoKrav = false,
  akse,
  trinn,
  onPrimaer,
  primaerTekst = "Marker gjort",
  onSekundaer,
  sekundaerTekst,
  className = "",
  style,
}) {
  const st = STATUS[status] || STATUS.venter;
  const ax = akse ? AXIS_VAR[akse] : null;
  return (
    <div className={`ak-oppg${status === "forfalt" ? " ak-oppg--forfalt" : ""} ${className}`} style={style}>
      <span className="ak-oppg__akse" style={ax ? { background: `var(--axis-${ax})` } : undefined}></span>
      <div className="ak-oppg__body">
        <div className="ak-oppg__top">
          <span className="ak-oppg__tittel">{tittel}</span>
          <span className={`ak-oppg__status ak-oppg__status--${status}`}>
            <Icon name={st.ikon} size={11} />{st.tekst}
          </span>
          {videoKrav && <span className="ak-oppg__video"><Icon name="play" size={9} />Video</span>}
        </div>
        {beskrivelse && <div className="ak-oppg__beskr">{beskrivelse}</div>}
        <div className="ak-oppg__meta">
          {drill && <span className="ak-oppg__chip"><Icon name="target" size={11} />{drill}</span>}
          {dose && <span className="ak-oppg__chip"><Icon name="repeat" size={11} />{dose}</span>}
          {trinn && <span className="ak-oppg__chip"><Icon name="git-branch" size={11} />{trinn}</span>}
          {frist && <span className="ak-oppg__chip" style={status === "forfalt" ? { color: "var(--warning)" } : undefined}><Icon name="calendar" size={11} />Frist {frist}</span>}
        </div>
      </div>
      {(onPrimaer || onSekundaer) && (
        <div className="ak-oppg__handl">
          {onPrimaer && <button type="button" className="ak-oppg__prim" onClick={onPrimaer}>{primaerTekst}</button>}
          {onSekundaer && sekundaerTekst && <button type="button" className="ak-oppg__sek" onClick={onSekundaer}>{sekundaerTekst}</button>}
        </div>
      )}
    </div>
  );
}
