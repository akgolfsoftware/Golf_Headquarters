import React from "react";
import { Avatar } from "../primitives/Avatar.jsx";
import { StatusBadge } from "../primitives/StatusBadge.jsx";
import { Toggle } from "../forms/Toggle.jsx";
import { Button } from "../actions/Button.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-lrow{--row-min:56px;--floor:0px;--pad-y:var(--s3);--pad-x:6px;--gap:var(--s3);--lead:0px;--cols:minmax(0,1fr) auto;display:grid;grid-template-columns:var(--cols);align-items:center;gap:var(--gap);width:100%;box-sizing:border-box;padding:var(--pad-y) var(--pad-x);min-height:max(var(--row-min),var(--floor));font-family:var(--ui);font-size:13.5px;color:var(--fg);background:transparent;border:0;text-align:left;text-decoration:none}
.akhq-lrow-main{min-width:0;display:flex;flex-direction:column;gap:2px}
.akhq-lrow-title{display:flex;align-items:center;gap:var(--s2);min-width:0}
.akhq-lrow-title>span:first-child{font-weight:500;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-lrow-meta{font-size:11.5px;line-height:1.45;color:var(--muted);text-wrap:pretty}
.akhq-lrow-trail{display:flex;align-items:center;gap:var(--s2);flex:none;justify-self:end}
.akhq-lrow-value{font-family:var(--mono);font-size:11.5px;font-variant-numeric:tabular-nums;color:var(--muted)}
.akhq-lrow-chev{width:16px;height:16px;stroke:var(--muted);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;flex:none}
.akhq-lrow-icon{display:grid;place-items:center;width:36px;height:36px;color:var(--muted)}
.akhq-lrow-status{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;flex:none;box-sizing:border-box}
.akhq-lrow-status.done{background:var(--up-raw)}
.akhq-lrow-status.done svg{stroke:var(--on-accent)}
.akhq-lrow-status.active{border:2px solid var(--fg)}
.akhq-lrow-status.todo{border:1px solid var(--border)}
.akhq-lrow-title--done>span:first-child{color:var(--muted);text-decoration:line-through;text-decoration-thickness:1px}
}
@layer akhq-container{
@container (max-width:420px){.akhq-lrow{--pad-x:0px;--gap:10px}}
@media(pointer:coarse){.akhq-lrow{--row-min:60px;--floor:44px}}
}
@layer akhq-modifier{
.akhq-lrow--lead{--cols:36px minmax(0,1fr) auto}
.akhq-lrow--tap{cursor:pointer;transition:background var(--dur) var(--ease)}
.akhq-lrow--tap:hover,.akhq-lrow--tap[data-state=hover]{background:var(--soft)}
.akhq-lrow--tap:active,.akhq-lrow--tap[data-state=active]{background:color-mix(in srgb,var(--soft) 70%,var(--border))}
.akhq-lrow--tap:focus-visible,.akhq-lrow--tap[data-state=focus]{outline:2px solid var(--focus);outline-offset:-2px;border-radius:var(--r-sm)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-lrow")) { const s = document.createElement("style"); s.id = "akhq-css-lrow"; s.textContent = css; document.head.appendChild(s); }
const Check = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;
const statusLabel = { done: "Fullført", active: "Pågår", todo: "Gjenstår" };
export function ListRow({
  title, meta, titleBadge, badge, leading = "none", avatar, status = "todo", icon,
  trailing = "none", value, toggleChecked = false, onToggle, actionLabel, onAction,
  href, onClick, as = "li", dataOdId = "row", ...rest
}) {
  const trailInteractive = trailing === "toggle" || trailing === "action";
  let rowInteractive = Boolean(href || onClick);
  if (rowInteractive && trailInteractive) {
    if (typeof console !== "undefined") console.warn("ListRow: raden er interaktiv OG halen er interaktiv (trailing=\"" + trailing + "\"). Radens href/onClick ignoreres — velg én radtype.");
    rowInteractive = false;
  }
  const lead = leading === "avatar" ? <Avatar {...(avatar || {})} decorative />
    : leading === "status" ? <span className={"akhq-lrow-status " + status} aria-label={statusLabel[status]}>{status === "done" && <Check />}</span>
    : leading === "icon" ? <span className="akhq-lrow-icon" aria-hidden="true">{icon}</span>
    : null;
  const trail = trailing === "chevron" ? <svg className="akhq-lrow-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
    : trailing === "value" ? <span className="akhq-lrow-value">{value}</span>
    : trailing === "badge" ? <StatusBadge kind={badge && badge.kind} tone={badge && badge.tone} dot={badge && badge.dot}>{badge && badge.text}</StatusBadge>
    : trailing === "toggle" ? <Toggle checked={toggleChecked} onChange={onToggle} ariaLabel={title} dataOdId={"cta-" + dataOdId + "-toggle"} />
    : trailing === "action" ? <Button variant="ghost" size="sm" onClick={onAction} dataOdId={"cta-" + dataOdId}>{actionLabel}</Button>
    : null;
  const cls = "akhq-lrow" + (lead ? " akhq-lrow--lead" : "") + (rowInteractive ? " akhq-lrow--tap" : "");
  const itemRef = React.useRef(null);
  /* Vakten slår opp med closest(), ikke parentElement: en runtime kan legge en
     mount-wrapper mellom gruppen og raden (DC-runtimen gjør det for hver
     `<x-import>` inne i en `<x-import>`), og parentElement ga da falsk alarm i
     hver eneste template [funn 31.07]. Containeren måles direkte i stedet for
     å påstås — den forrige teksten hevdet at container-spørringene ikke traff,
     og det var målbart feil. */
  React.useEffect(() => {
    const el = itemRef.current;
    if (!el) return;
    const gruppe = el.parentElement && el.parentElement.closest("[data-akhq-lgroup]");
    if (!gruppe) {
      console.warn("ListRow (" + (title || dataOdId) + ") ligger ikke i en ListGroup. Gruppen eier containeren og skillelinjene — uten den rendrer raden bredt i en smal spalte, og radene får ingen streker mellom seg.");
      return;
    }
    if (typeof getComputedStyle === "function" && getComputedStyle(gruppe).containerType === "normal") {
      console.warn("ListRow (" + (title || dataOdId) + "): ListGroup mangler container-type. Container-spørringene i .akhq-lrow treffer aldri.");
    }
    if (el.tagName === "LI" && gruppe.tagName !== "UL") {
      console.warn("ListRow (" + (title || dataOdId) + ") rendrer <li> i en ListGroup med as=\"div\". Sett as=\"div\" på raden også.");
    }
    if (el.tagName === "DIV" && gruppe.tagName === "UL") {
      console.warn("ListRow (" + (title || dataOdId) + ") rendrer <div role=\"listitem\"> i en <ul>. Sett as=\"div\" på ListGroup også, ellers er markupen ugyldig.");
    }
  }, [title, dataOdId]);
  const body = (
    <>
      {lead}
      <div className="akhq-lrow-main">
        <div className={"akhq-lrow-title" + (leading === "status" && status === "done" ? " akhq-lrow-title--done" : "")}>
          <span>{title}</span>
          {titleBadge && <StatusBadge kind={titleBadge.kind} tone={titleBadge.tone} dot={titleBadge.dot}>{titleBadge.text}</StatusBadge>}
        </div>
        {meta && <div className="akhq-lrow-meta">{meta}</div>}
      </div>
      {trail && <div className="akhq-lrow-trail">{trail}</div>}
    </>
  );
  const inner = rowInteractive
    ? (href
      ? <a className={cls} href={href} onClick={onClick} data-od-id={"cta-" + dataOdId} {...rest}>{body}</a>
      : <button type="button" className={cls} onClick={onClick} data-od-id={"cta-" + dataOdId} {...rest}>{body}</button>)
    : <div className={cls} data-od-id={dataOdId} {...rest}>{body}</div>;
  const Item = as === "div" ? "div" : "li";
  return <Item className="akhq-lrow-item" role={as === "div" ? "listitem" : undefined} ref={itemRef}>{inner}</Item>;
}
