import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-tip{position:relative;display:inline-flex;font-family:var(--ui)}
.akhq-tip-trig{display:contents}
.akhq-tip-lay{position:absolute;z-index:var(--z-toast);bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);max-width:240px;width:max-content;padding:6px 8px;box-sizing:border-box;background:var(--fg);color:var(--bg);border-radius:var(--r-sm);font-family:var(--mono);font-size:11px;line-height:1.35;letter-spacing:.01em;text-align:left;pointer-events:none;box-shadow:var(--shadow)}
.akhq-tip-kbd{margin-left:6px;opacity:.62}
}
@layer akhq-container{
/* Grov peker har ingen hover. Da er hjelpeteksten ikke tilgjengelig som
   tooltip i det hele tatt, og skal ligge i innholdet i stedet — vi skjuler
   den heller enn å late som den finnes. Se .prompt.md. */
@media(pointer:coarse){.akhq-tip-lay{display:none}}
}
@layer akhq-modifier{
.akhq-tip-lay--under{bottom:auto;top:calc(100% + 6px)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-tip")) { const s = document.createElement("style"); s.id = "akhq-css-tip"; s.textContent = css; document.head.appendChild(s); }
let seq = 0;
/* Tooltip er ren tekst uten fokus og uten handlinger. Den er IKKE et lag i
   fokuskontraktens forstand (ingenting å fokusere), men arver to av dens
   krav fordi WCAG 1.4.13 krever dem: Escape lukker, og teksten forsvinner
   ikke av seg selv. Innhold som må kunne trykkes hører i Popover. */
export function Tooltip({ text, kbd, side = "top", delay = 350, open: styrt, dataOdId = "tip", children }) {
  const [intern, setIntern] = React.useState(false);
  const open = styrt === undefined ? intern : styrt;
  const id = React.useMemo(() => "akhq-tip" + (++seq), []);
  const timer = React.useRef(null);
  const vis = React.useCallback((v) => {
    if (styrt !== undefined) return;
    clearTimeout(timer.current);
    if (v) timer.current = setTimeout(() => setIntern(true), delay);
    else setIntern(false);
  }, [delay, styrt]);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  React.useEffect(() => {
    if (!open || styrt !== undefined) return;
    const onKey = (e) => { if (e.key === "Escape") setIntern(false); };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, styrt]);
  const barn = React.cloneElement(children, {
    "aria-describedby": open ? id : undefined,
    onMouseEnter: (e) => { if (children.props.onMouseEnter) children.props.onMouseEnter(e); vis(true); },
    onMouseLeave: (e) => { if (children.props.onMouseLeave) children.props.onMouseLeave(e); vis(false); },
    onFocus: (e) => { if (children.props.onFocus) children.props.onFocus(e); vis(true); },
    onBlur: (e) => { if (children.props.onBlur) children.props.onBlur(e); vis(false); }
  });
  return (
    <span className="akhq-tip" data-od-id={dataOdId}>
      <span className="akhq-tip-trig">{barn}</span>
      {open && (
        <span role="tooltip" id={id} className={"akhq-tip-lay" + (side === "bottom" ? " akhq-tip-lay--under" : "")}>
          {text}{kbd && <span className="akhq-tip-kbd">{kbd}</span>}
        </span>
      )}
    </span>
  );
}
