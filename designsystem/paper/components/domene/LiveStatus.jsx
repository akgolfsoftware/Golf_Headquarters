import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-lstat{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--fg);white-space:nowrap;line-height:1;flex:none}
.akhq-lstat-prikk{width:7px;height:7px;border-radius:50%;background:var(--up-raw);flex:none;animation:akhq-lstat-puls 2s var(--ease) infinite alternate}
@keyframes akhq-lstat-puls{from{opacity:.45}to{opacity:1}}
.akhq-lstat-tid{color:var(--muted);font-weight:400;font-variant-numeric:tabular-nums}
}
@layer akhq-container{
}
@layer akhq-modifier{
.akhq-lstat--pause .akhq-lstat-prikk{background:var(--mid);animation:none}
.akhq-lstat--slutt .akhq-lstat-prikk{background:var(--border);animation:none}
.akhq-lstat--invers{color:var(--bg)}
.akhq-lstat--invers .akhq-lstat-tid{color:color-mix(in srgb, var(--bg) 70%, transparent)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-lstat")) { const s = document.createElement("style"); s.id = "akhq-css-lstat"; s.textContent = css; document.head.appendChild(s); }
/* Live-indikatoren: DIREKTE-merket med rolig pulserende oliven prikk +
   klokke. Pulsen er samme rolige opacity-rytme som Skeleton — aldri
   oransje (OneThingNows kombinasjon) og aldri rød. Tilstander: live
   (puls), pause (--mid, stille), slutt (--border, stille).
   prefers-reduced-motion i tokens stopper pulsen globalt. `inverse` er
   varianten for blekkfylte flater (LiveBar) — den bor HER, i komponentens
   egen fil, per eierskapsregelen. */
export function LiveStatus({ mode = "live", timeLabel, inverse = false, dataOdId = "livestatus", ...rest }) {
  const tekst = mode === "pause" ? "Pause" : mode === "slutt" ? "Avsluttet" : "Direkte";
  return (
    <span className={"akhq-lstat" + (mode === "pause" ? " akhq-lstat--pause" : "") + (mode === "slutt" ? " akhq-lstat--slutt" : "") + (inverse ? " akhq-lstat--invers" : "")}
      role="status" data-od-id={"kpi-" + dataOdId} {...rest}>
      <span className="akhq-lstat-prikk" aria-hidden="true" />
      {tekst}
      {timeLabel && <span className="akhq-lstat-tid">{timeLabel}</span>}
    </span>
  );
}
