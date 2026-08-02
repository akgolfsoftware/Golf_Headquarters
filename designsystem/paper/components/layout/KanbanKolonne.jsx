import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-kan-wrap{container-type:inline-size;display:flex;flex-direction:column;min-width:0;min-height:0}
.akhq-kan{--pad:var(--s3);--gap:var(--s2);--maxh:none;display:flex;flex-direction:column;min-width:0;background:var(--soft);border:1px solid var(--border);border-radius:var(--r)}
.akhq-kan-topp{display:flex;align-items:center;gap:var(--s2);padding:var(--pad) var(--pad) var(--s2);min-width:0}
.akhq-kan-tit{font-family:var(--ui);font-size:12.5px;font-weight:600;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* Antallet er mono og står ved tittelen, ikke som badge i et hjørne: det er en
   del av overskriften, ikke en varsling. */
.akhq-kan-n{flex:none;font-family:var(--mono);font-size:11px;font-variant-numeric:tabular-nums;color:var(--muted)}
.akhq-kan-hale{margin-left:auto;flex:none;display:flex;align-items:center;gap:var(--s1)}
.akhq-kan-liste{display:flex;flex-direction:column;gap:var(--gap);padding:0 var(--pad) var(--pad);max-height:var(--maxh);overflow-y:auto;min-height:0}
.akhq-kan-tom{padding:var(--s5) var(--pad);text-align:center;color:var(--muted);font-family:var(--ui);font-size:12px;line-height:1.55;border:1px dashed var(--border);border-radius:var(--r-sm);margin:0 var(--pad) var(--pad)}
/* Over-taket er en ANBEFALING, aldri en sperre: kolonnen får en dempet ramme
   og en setning, ingen disabled og ingen rød. */
.akhq-kan--over{border-color:var(--dn)}
.akhq-kan-merk{padding:0 var(--pad) var(--s2);font-family:var(--ui);font-size:11.5px;color:var(--dn);line-height:1.5}
}
@layer akhq-container{
@container (max-width:320px){.akhq-kan{--pad:10px}}
}
@layer akhq-modifier{
.akhq-kan--flat{background:none}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-kan")) { const s = document.createElement("style"); s.id = "akhq-css-kan"; s.textContent = css; document.head.appendChild(s); }
/* KanbanKolonne: ETT trinn i en flyt, med kortene som står der nå. Komponenten
   er kolonnen alene — brettet er skjermens grid, og kortene er QueueCard,
   SessionCard eller Panel. Den eier verken drag-drop eller rekkefølge.

   Grensen mot DataTable: samme sett, to spørsmål. Tabellen svarer «hvordan
   ligger disse an mot hverandre» og leses nedover i en kolonne. Kanban svarer
   «hvor i flyten står hver enkelt» og leses bortover mellom kolonner. */
export function KanbanKolonne({
  title, count, limit, action, emptyText = "Ingen saker i dette trinnet nå.",
  maxHeight, flat = false, children, dataOdId = "panel-kanban", ...rest
}) {
  const n = count != null ? count : React.Children.count(children);
  const over = limit != null && n > limit;
  const tom = n === 0;
  return (
    <div className="akhq-kan-wrap">
      <section className={"akhq-kan" + (flat ? " akhq-kan--flat" : "") + (over ? " akhq-kan--over" : "")}
        aria-label={title + " · " + n + (limit != null ? " av " + limit : "")}
        style={maxHeight ? { "--maxh": typeof maxHeight === "number" ? maxHeight + "px" : maxHeight } : undefined}
        data-od-id={dataOdId} {...rest}>
        <div className="akhq-kan-topp">
          <span className="akhq-kan-tit">{title}</span>
          <span className="akhq-kan-n">{limit != null ? n + "/" + limit : n}</span>
          {action && <span className="akhq-kan-hale">{action}</span>}
        </div>
        {over && <p className="akhq-kan-merk">Over anbefalt tak på {limit}. Flytt en sak videre før du legger til flere.</p>}
        {tom
          ? <p className="akhq-kan-tom">{emptyText}</p>
          : <div className="akhq-kan-liste">{children}</div>}
      </section>
    </div>
  );
}
