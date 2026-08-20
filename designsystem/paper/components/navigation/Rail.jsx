import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-rail{--w:232px;width:var(--w);flex:none;background:var(--soft);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:var(--s5) var(--s3) 14px;gap:1px;position:sticky;top:0;height:100dvh;z-index:var(--z-rail);font-family:var(--ui);--logo-mark:var(--fg);--logo-dot:var(--accent)}
.akhq-rail-brand{display:flex;align-items:center;gap:10px;padding:0 10px;margin-bottom:var(--s5);min-width:0}
.akhq-rail-brand svg{width:24px;height:24px;flex:none}
.akhq-rail-brand b{font-size:14px;font-weight:600;letter-spacing:-.01em;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.akhq-rail-sec{font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--text-tertiary);padding:var(--s4) 10px 6px}
.akhq-rail-item{--h:38px;--floor:0px;min-height:max(var(--h),var(--floor));width:100%;display:flex;align-items:center;gap:10px;padding:0 10px;border-radius:var(--r-sm);color:var(--muted);background:transparent;border:0;text-decoration:none;cursor:pointer;text-align:left;font-family:inherit;font-size:13.5px;font-weight:500;transition:color var(--dur) var(--ease),background var(--dur) var(--ease)}
.akhq-rail-item svg{width:17px;height:17px;flex:none;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.akhq-rail-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.akhq-rail-item:hover{color:var(--fg);background:var(--soft-hover)}
.akhq-rail-item:active{background:var(--border)}
.akhq-rail-item[aria-current=page]{color:var(--fg);background:var(--surface);font-weight:600;box-shadow:0 1px 0 rgba(20,20,19,.04)}
.akhq-rail-item:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-rail-spacer{flex:1;min-height:var(--s4)}
.akhq-rail-me{display:flex;align-items:center;gap:10px;padding:10px;border-top:1px solid var(--border);min-width:0}
.akhq-rail-avatar{width:28px;height:28px;border-radius:50%;background:var(--fg);color:var(--bg);display:grid;place-items:center;font-family:var(--mono);font-size:10px;font-weight:600;flex:none}
.akhq-rail-me-t{display:flex;flex-direction:column;gap:1px;min-width:0}
.akhq-rail-me-t b{font-size:12.5px;font-weight:600;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.akhq-rail-me-t span{font-family:var(--mono);font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
}
@layer akhq-container{
/* Skallkomponent: vindusbredde er RIKTIG her — sidemenyens bredde er en
   skallbeslutning, ikke en containertilpasning (beslutning 36). */
@media(max-width:1080px){
.akhq-rail{--w:64px;padding:var(--s4) var(--s2) 14px;align-items:center}
.akhq-rail-brand{justify-content:center;padding:0}
.akhq-rail-item{justify-content:center;padding:0;width:48px}
.akhq-rail-brand b,.akhq-rail-label,.akhq-rail-sec,.akhq-rail-me-t{display:none}
.akhq-rail-me{justify-content:center;padding:12px 0 0}
}
@media(pointer:coarse){.akhq-rail-item{--floor:48px}}
/* Stand-in: coarse pointer kan ikke simuleres. Samme lag og vekt som
   spørringen over, slik at en modifikator som nuller gulvet vinner her
   nøyaktig som på en berøringsenhet. */
[data-coarse-test] .akhq-rail-item{--floor:48px}
}
`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-rail")) { const s = document.createElement("style"); s.id = "akhq-css-rail"; s.textContent = css; document.head.appendChild(s); }
const Logo = () => (
  <svg viewBox="0 0 538 470" role="img" aria-label="AK Golf" fill="none">
    <g transform="translate(0,470) scale(0.1,-0.1)">
      <path fill="var(--logo-mark, #141413)" d="M3190 4486 c-23 -13 -109 -48 -585 -241 -99 -40 -198 -81 -220 -91 l-40 -18 45 -7 c127 -19 217 -102 271 -249 l24 -65 3 -1772 2 -1773 280 0 280 0 2 721 3 720 71 -83 c40 -46 132 -155 205 -243 73 -88 185 -221 249 -295 64 -74 152 -178 195 -230 44 -52 137 -162 209 -245 71 -82 167 -194 213 -247 l84 -98 355 0 c194 0 354 2 354 4 0 2 -73 89 -162 194 -90 104 -219 256 -288 337 -319 376 -552 649 -790 925 -59 69 -130 153 -158 187 -28 34 -56 64 -62 68 -5 3 -10 10 -10 14 0 7 90 83 221 186 42 33 163 130 270 215 107 86 223 178 259 206 378 292 550 427 550 430 0 2 -126 4 -279 4 l-280 0 -25 -82 c-25 -83 -102 -228 -159 -303 -108 -139 -178 -205 -502 -470 -87 -71 -189 -156 -225 -187 -100 -85 -293 -238 -297 -234 -2 1 -3 618 -3 1369 0 1297 -1 1367 -17 1367 -10 -1 -29 -7 -43 -14z M1200 3110 c-155 -15 -305 -58 -435 -123 -225 -112 -384 -275 -446 -457 -28 -82 -30 -194 -6 -267 25 -71 88 -139 162 -174 49 -24 73 -29 135 -29 62 0 85 5 135 29 75 36 116 79 150 155 35 80 41 138 21 214 -30 116 -119 209 -223 233 -29 7 -53 14 -53 16 0 3 13 23 29 47 60 86 146 146 260 180 68 20 222 21 313 2 254 -54 462 -285 542 -601 34 -138 47 -250 44 -380 l-3 -110 -95 -21 c-291 -66 -546 -127 -630 -149 -450 -122 -720 -290 -829 -517 -44 -91 -71 -205 -71 -296 0 -100 29 -241 65 -312 70 -140 152 -223 279 -285 98 -48 172 -66 302 -72 316 -16 613 107 885 365 l99 94 0 -191 0 -191 275 0 275 0 1 338 c0 185 0 618 -1 962 -1 576 -3 632 -21 720 -28 138 -55 216 -108 314 -111 207 -274 352 -496 437 -155 61 -371 87 -555 69z m630 -1846 l0 -486 -60 -56 c-91 -84 -157 -131 -235 -167 -265 -123 -559 -66 -692 134 -62 92 -78 148 -78 271 0 76 5 119 19 158 24 71 106 191 163 242 95 83 231 162 410 236 81 34 432 150 461 153 9 1 12 -102 12 -485z" />
      <circle cx="4840" cy="3620" r="310" fill="var(--logo-dot, #B85C3D)" />
    </g>
  </svg>
);
export function Rail({ items = [], current, onNavigate, initials = "AK", title = "AgencyOS", name = "Anders Kristiansen", role = "AK Golf Group", dataOdId = "rail", ...rest }) {
  let seen = null;
  return (
    <nav className="akhq-rail" aria-label="AgencyOS meny" data-od-id={dataOdId} {...rest}>
      <div className="akhq-rail-brand"><Logo /><b>{title}</b></div>
      {items.map((it) => {
        const head = it.section && it.section !== seen ? it.section : null;
        if (it.section) seen = it.section;
        return (
          <React.Fragment key={it.id}>
            {head ? <div className="akhq-rail-sec">{head}</div> : null}
            <button type="button" className="akhq-rail-item" aria-current={it.id === current ? "page" : undefined} aria-label={it.label} data-od-id={"nav-" + it.id} onClick={() => onNavigate && onNavigate(it.id)}>
              {it.icon}<span className="akhq-rail-label">{it.label}</span>
            </button>
          </React.Fragment>
        );
      })}
      <div className="akhq-rail-spacer" aria-hidden="true"></div>
      <div className="akhq-rail-me">
        <div className="akhq-rail-avatar" aria-hidden="true">{initials}</div>
        <div className="akhq-rail-me-t"><b>{name}</b><span>{role}</span></div>
      </div>
    </nav>
  );
}
