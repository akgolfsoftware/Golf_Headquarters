import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-cmb{position:relative;display:block;width:100%;min-width:0;font-family:var(--ui)}
.akhq-cmb-in{--h:36px;--floor:0px;height:max(var(--h),var(--floor));width:100%;box-sizing:border-box;padding:0 var(--s3);border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface);color:var(--fg);font-family:var(--ui);font-size:13px}
.akhq-cmb-in::placeholder{color:var(--muted)}
.akhq-cmb-in:hover:not(:disabled){border-color:var(--muted)}
.akhq-cmb-in:focus-visible{outline:2px solid var(--focus);outline-offset:1px}
.akhq-cmb-in:disabled{opacity:.4;cursor:not-allowed;background:var(--soft)}
.akhq-cmb-in[aria-invalid=true]{border-color:var(--dn)}
.akhq-cmb-lst{position:absolute;z-index:var(--z-toast);top:calc(100% + 4px);left:0;right:0;max-height:264px;overflow:auto;margin:0;padding:4px;box-sizing:border-box;list-style:none;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow)}
.akhq-cmb-opt{--hit:32px;--floor:0px;display:flex;align-items:center;gap:var(--s2);min-height:max(var(--hit),var(--floor));padding:0 10px;border-radius:var(--r-sm);font-size:13px;color:var(--fg);cursor:pointer}
.akhq-cmb-opt[aria-selected=true]{background:var(--soft)}
.akhq-cmb-opt-note{margin-left:auto;font-family:var(--mono);font-size:11px;color:var(--muted)}
.akhq-cmb-tom{padding:10px;font-size:12px;color:var(--muted)}
.akhq-cmb-tr{font-weight:600}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-cmb-in{--floor:44px}.akhq-cmb-opt{--floor:44px}}
[data-coarse-test] .akhq-cmb-in{--floor:44px}
[data-coarse-test] .akhq-cmb-opt{--floor:44px}
}
@layer akhq-modifier{
.akhq-cmb-lst--opp{top:auto;bottom:calc(100% + 4px)}
}`;
/* Klasseprefikset er akhq-cmb, ikke akhq-cb. Checkbox eier akhq-cb — og eide
   også style-tag-id-en akhq-css-cb. To komponenter som deler id gjør at den
   andres CSS aldri injiseres, og feilen er helt stille: målt 31.07 rendret
   comboboksfeltet 16 px høyt med checkboxens regler, uten gulv. Én id og étt
   prefiks per komponent, alltid. */
if (typeof document !== "undefined" && !document.getElementById("akhq-css-cmb")) { const s = document.createElement("style"); s.id = "akhq-css-cmb"; s.textContent = css; document.head.appendChild(s); }
let seq = 0;
/* Combobox: fritekst som filtrerer et sett. Brukes der settet er for stort
   for Select og valget kjennes ved navn — spillere, drills, fasiliteter.

   FOKUS: dette er det ene laget som IKKE flytter fokus inn i seg selv.
   ARIA-mønsteret krever at fokus blir i feltet mens aria-activedescendant
   peker på den aktive raden; en fokusfelle her ville brutt skrivingen. Derfor
   konsumeres ikke useOverlayLayer — og derfor finnes det heller ingen
   fokusfelle å skrive: laget har ingen tabbbare noder. Escape og klikk
   utenfor er implementert med samme oppførsel som hooken gir de andre. */
export function Combobox({ options = [], value = "", onChange, onSelect, placeholder, emptyText = "Ingen treff", disabled, dataOdId = "felt-combobox", ...rest }) {
  const [open, setOpen] = React.useState(false);
  const [aktiv, setAktiv] = React.useState(0);
  const rotRef = React.useRef(null);
  const listeRef = React.useRef(null);
  const id = React.useMemo(() => "akhq-cmb" + (++seq), []);
  const norm = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const treff = React.useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    if (!q) return norm;
    return norm.filter((o) => o.label.toLowerCase().includes(q) || (o.note || "").toLowerCase().includes(q));
  }, [value, options]);
  React.useEffect(() => { setAktiv(0); }, [value]);
  React.useEffect(() => {
    if (!open) return;
    const utenfor = (e) => { if (rotRef.current && !rotRef.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } };
    document.addEventListener("pointerdown", utenfor, true);
    document.addEventListener("keydown", esc, true);
    return () => { document.removeEventListener("pointerdown", utenfor, true); document.removeEventListener("keydown", esc, true); };
  }, [open]);
  const velg = (o) => { setOpen(false); if (onChange) onChange(o.label); if (onSelect) onSelect(o); };
  const tast = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      setAktiv((i) => { const n = treff.length; if (!n) return 0; return e.key === "ArrowDown" ? (i + 1) % n : (i - 1 + n) % n; });
    } else if (e.key === "Enter" && open && treff[aktiv]) { e.preventDefault(); velg(treff[aktiv]); }
    else if (e.key === "Home" && open) { e.preventDefault(); setAktiv(0); }
    else if (e.key === "End" && open) { e.preventDefault(); setAktiv(Math.max(0, treff.length - 1)); }
  };
  React.useEffect(() => {
    if (!open || !listeRef.current) return;
    const el = listeRef.current.children[aktiv];
    if (el && el.scrollIntoViewIfNeeded) el.scrollIntoViewIfNeeded(false);
    else if (el) { const l = listeRef.current; const t = el.offsetTop, b = t + el.offsetHeight; if (t < l.scrollTop) l.scrollTop = t; else if (b > l.scrollTop + l.clientHeight) l.scrollTop = b - l.clientHeight; }
  }, [aktiv, open]);
  const aktivId = open && treff[aktiv] ? id + "-o" + aktiv : undefined;
  return (
    <div className="akhq-cmb" ref={rotRef} data-od-id={dataOdId}>
      <input className="akhq-cmb-in" type="text" role="combobox" autoComplete="off"
        aria-expanded={open} aria-controls={id + "-l"} aria-autocomplete="list" aria-activedescendant={aktivId}
        value={value} placeholder={placeholder} disabled={disabled}
        onChange={(e) => { setOpen(true); if (onChange) onChange(e.target.value); }}
        onFocus={() => setOpen(true)} onKeyDown={tast} data-od-id={dataOdId + "-in"} {...rest} />
      {open && (
        <ul className="akhq-cmb-lst" id={id + "-l"} role="listbox" ref={listeRef}>
          {treff.length === 0 && <li className="akhq-cmb-tom">{emptyText}</li>}
          {treff.map((o, i) => (
            <li key={o.value} id={id + "-o" + i} role="option" aria-selected={i === aktiv}
              className="akhq-cmb-opt" onPointerDown={(e) => { e.preventDefault(); velg(o); }} onPointerEnter={() => setAktiv(i)}>
              <span>{o.label}</span>
              {o.note && <span className="akhq-cmb-opt-note">{o.note}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
