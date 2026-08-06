import React from "react";
import { Region } from "../data/viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-mtr-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-mtr{--maks:52ch;display:flex;flex-direction:column;gap:var(--s3);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg);list-style:none;margin:0;padding:0}
.akhq-mtr-m{display:flex;flex-direction:column;gap:2px;min-width:0;align-items:flex-start}
.akhq-mtr-meta{display:flex;gap:var(--s2);font-family:var(--mono);font-size:9.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-mtr-boble{max-width:min(var(--maks),100%);box-sizing:border-box;padding:8px 12px;border-radius:var(--r);background:var(--surface);border:1px solid var(--border);font-size:13px;line-height:1.5;overflow-wrap:anywhere}
.akhq-mtr-dagskille{display:flex;align-items:center;gap:var(--s3);font-family:var(--mono);font-size:9.5px;color:var(--mid);text-transform:uppercase;letter-spacing:.08em}
.akhq-mtr-dagskille::before,.akhq-mtr-dagskille::after{content:"";flex:1;height:1px;background:var(--hairline)}
}
@layer akhq-container{
@container (max-width:420px){.akhq-mtr{--maks:100%}}
}
@layer akhq-modifier{
.akhq-mtr-m--meg{align-items:flex-end}
.akhq-mtr-m--meg .akhq-mtr-boble{background:var(--soft);border-color:transparent}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-mtr")) { const s = document.createElement("style"); s.id = "akhq-css-mtr"; s.textContent = css; document.head.appendChild(s); }
/* Meldingstråden mellom coach og spiller: motpartens meldinger venstre på
   surface, egne høyre på soft — rolige flater, aldri farge (en samtale er
   ikke datasemantikk). Dagskiller med hårlinjer. Ren visning: Composer
   (shell) eier skrivingen; tråden viser. Avsender + tid står over boblen i
   mono — aldri inni, så teksten kan siteres rent. */
export function MeldingsTraad({
  messages = [],
  state = "content",
  emptyText = "Ingen meldinger ennå. Skriv den første under.",
  dataOdId = "meldinger", ...rest
}) {
  return (
    <div className="akhq-mtr-wrap">
      <Region state={state} empty={emptyText}>
        <ol className="akhq-mtr" data-od-id={"panel-" + dataOdId} {...rest}>
          {messages.map((m, i) => m.divider
            ? <li className="akhq-mtr-dagskille" key={"d" + i} aria-hidden="true">{m.divider}</li>
            : (
              <li className={"akhq-mtr-m" + (m.self ? " akhq-mtr-m--meg" : "")} key={m.id || i}>
                <span className="akhq-mtr-meta">
                  <span>{m.self ? "Du" : m.author}</span>
                  {m.time && <span>{m.time}</span>}
                </span>
                <span className="akhq-mtr-boble">{m.text}</span>
              </li>
            ))}
        </ol>
      </Region>
    </div>
  );
}
