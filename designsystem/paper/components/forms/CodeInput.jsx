import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-code{display:flex;gap:var(--s2);min-width:0;container-type:inline-size}
.akhq-code-in{--h:52px;--floor:0px;width:44px;height:max(var(--h),var(--floor));min-width:0;flex:1 1 44px;max-width:56px;box-sizing:border-box;padding:0;text-align:center;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface);color:var(--fg);font-family:var(--mono);font-size:20px;font-variant-numeric:tabular-nums;caret-color:var(--fg)}
.akhq-code-in:hover:not(:disabled){border-color:var(--muted)}
.akhq-code-in:focus-visible{outline:2px solid var(--focus);outline-offset:1px}
.akhq-code-in:disabled{opacity:.4;background:var(--soft);cursor:not-allowed}
.akhq-code[data-invalid=true] .akhq-code-in{border-color:var(--dn)}
.akhq-code-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-code-in{--floor:44px}}
[data-coarse-test] .akhq-code-in{--floor:44px}
/* Under 340 px container blir seks 44 px-ruter bredere enn skjermen.
   Rutene krymper i bredden, aldri i høyden — gulvet er høyden. */
@container (max-width: 340px){.akhq-code-in{font-size:17px}}
}
@layer akhq-modifier{
.akhq-code--fire .akhq-code-in{max-width:64px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-code")) { const s = document.createElement("style"); s.id = "akhq-css-code"; s.textContent = css; document.head.appendChild(s); }
let seq = 0;
/* Engangskode i separate ruter. Blokkerer Auth-familien (12 ruter, én mal).

   Én ting gjør denne komponenten verdt å bygge fremfor et vanlig felt:
   liming. Koden kommer fra en SMS eller en autentikator, og brukeren limer
   hele strengen i den første ruta. Fordeler den seg ikke selv, må folk
   klippe koden i seks biter for hånd — og da var de seks rutene en ulempe. */
export function CodeInput({ length = 6, value = "", onChange, onComplete, disabled, invalid, label = "Engangskode", dataOdId = "felt-kode" }) {
  const refs = React.useRef([]);
  const id = React.useMemo(() => "akhq-code" + (++seq), []);
  const tegn = React.useMemo(() => { const a = value.split("").slice(0, length); while (a.length < length) a.push(""); return a; }, [value, length]);
  const sett = (neste) => {
    const s = neste.join("").slice(0, length);
    if (onChange) onChange(s);
    if (s.length === length && onComplete) onComplete(s);
  };
  const skriv = (i, raw) => {
    const rens = raw.replace(/\D/g, "");
    if (!rens) { const n = [...tegn]; n[i] = ""; sett(n); return; }
    const n = [...tegn];
    /* Liming: fyll fremover fra ruta som ble limt i. */
    for (let k = 0; k < rens.length && i + k < length; k++) n[i + k] = rens[k];
    sett(n);
    const mål = Math.min(i + rens.length, length - 1);
    const el = refs.current[mål];
    if (el) { el.focus(); el.select(); }
  };
  const tast = (i, e) => {
    if (e.key === "Backspace" && !tegn[i] && i > 0) { e.preventDefault(); const n = [...tegn]; n[i - 1] = ""; sett(n); const el = refs.current[i - 1]; if (el) { el.focus(); el.select(); } }
    else if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); refs.current[i - 1].focus(); }
    else if (e.key === "ArrowRight" && i < length - 1) { e.preventDefault(); refs.current[i + 1].focus(); }
  };
  return (
    <div className={"akhq-code" + (length <= 4 ? " akhq-code--fire" : "")} data-invalid={invalid ? "true" : undefined} data-od-id={dataOdId}
      role="group" aria-labelledby={id + "-l"}>
      <span className="akhq-code-sr" id={id + "-l"}>{label}, {length} siffer</span>
      {tegn.map((t, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }} className="akhq-code-in"
          type="text" inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={length}
          value={t} disabled={disabled} aria-invalid={invalid ? "true" : undefined}
          aria-label={"Siffer " + (i + 1) + " av " + length}
          onChange={(e) => skriv(i, e.target.value)} onKeyDown={(e) => tast(i, e)}
          onFocus={(e) => e.target.select()} data-od-id={dataOdId + "-" + (i + 1)} />
      ))}
    </div>
  );
}
