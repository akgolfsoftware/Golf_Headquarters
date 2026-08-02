import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-toast{--ic:var(--bg);position:fixed;bottom:24px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:9px;background:var(--fg);color:var(--bg);padding:12px 16px;border-radius:var(--r-sm);font-family:var(--ui);font-size:13px;font-weight:600;z-index:var(--z-toast);max-width:min(90vw,360px);text-align:left;box-shadow:var(--shadow)}
.akhq-toast .akhq-mono{font-family:var(--mono);font-variant-numeric:tabular-nums}
.akhq-toast-dot{width:6px;height:6px;border-radius:50%;background:var(--ic);flex:none}
}
@layer akhq-container{
@media(prefers-reduced-motion:no-preference){.akhq-toast{animation:akhq-toast-in var(--dur) var(--ease)}}
}
@layer akhq-modifier{
.akhq-toast--inline{position:static;transform:none;left:auto;bottom:auto;display:inline-flex}
.akhq-toast--ok{--ic:var(--up-raw)}
.akhq-toast--warn{--ic:var(--dn)}
.akhq-toast--info{--ic:var(--info)}
}
@keyframes akhq-toast-in{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-toast")) { const s = document.createElement("style"); s.id = "akhq-css-toast"; s.textContent = css; document.head.appendChild(s); }
export function Toast({ inline = false, tone = "neutral", duration = 4000, onDone, dataOdId = "panel-toast", children, ...rest }) {
  const [vist, setVist] = React.useState(true);
  React.useEffect(() => {
    if (inline || !duration) return;
    const t = setTimeout(() => { setVist(false); if (onDone) onDone(); }, duration);
    return () => clearTimeout(t);
  }, [inline, duration, onDone]);
  if (!vist) return null;
  return (
    <div className={"akhq-toast" + (inline ? " akhq-toast--inline" : "") + (tone !== "neutral" ? " akhq-toast--" + tone : "")}
      role="status" aria-live="polite" aria-atomic="true" data-od-id={dataOdId} {...rest}>
      {tone !== "neutral" && <span className="akhq-toast-dot" aria-hidden="true"></span>}
      <span>{children}</span>
    </div>
  );
}
