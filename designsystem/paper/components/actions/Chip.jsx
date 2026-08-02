import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-chip{--h:28px;--floor:0px;display:inline-flex;align-items:center;gap:var(--s2);height:max(var(--h),var(--floor));min-height:max(var(--h),var(--floor));padding:0 var(--pad-x,var(--s3));border-radius:var(--r-pill);font-family:var(--fam,var(--ui));font-size:var(--fs,12px);font-weight:var(--fw,500);background:var(--bgc,var(--surface));color:var(--fgc,var(--fg));border:1px solid var(--border);cursor:var(--cur,pointer);transition:background var(--dur) var(--ease),border-color var(--dur) var(--ease)}
.akhq-chip:focus-visible,.akhq-chip[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-chip:disabled,.akhq-chip[data-state=disabled]{opacity:.4;cursor:not-allowed}
.akhq-chip-x{border:none;background:none;color:var(--muted);cursor:pointer;font-size:13px;line-height:1;padding:0;font-family:inherit}
.akhq-chip-x:hover{color:var(--fg)}
}
@layer akhq-container{
/* Berøringsgulvet settes som variabel, aldri som height: en modifikator i et
   senere lag ville ellers vunnet. --static nuller gulvet bevisst — den er
   cursor:default, altså en etikett og ikke et treffmål. */
@media(pointer:coarse){.akhq-chip{--floor:44px}}
/* Stand-in for verifisering: coarse pointer kan ikke simuleres, og en inline
   --floor ville målt inline-presedens i stedet for lagforholdet. Denne regelen
   ligger i SAMME lag med samme vekt som spørringen over, så en modifikator som
   nuller gulvet vinner her nøyaktig som den ville gjort på en berøringsenhet. */
[data-coarse-test] .akhq-chip{--floor:44px}
}
@layer akhq-modifier{
.akhq-chip:hover:not(:disabled):not(.akhq-chip--static),.akhq-chip[data-state=hover]{background:var(--soft)}
.akhq-chip:active:not(:disabled):not(.akhq-chip--static),.akhq-chip[data-state=active]{border-color:var(--muted)}
.akhq-chip--selected{border-color:var(--fg);background:var(--soft)}
/* static er ikke interaktiv: ingen berøringsgulv, egen typografi. */
.akhq-chip--static{--h:22px;--floor:0px;--pad-x:7px;--fam:var(--mono);--fs:10px;--fw:600;--bgc:var(--soft);--fgc:var(--muted);--cur:default;letter-spacing:.04em;text-transform:uppercase}
}
`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-chip")) { const s = document.createElement("style"); s.id = "akhq-css-chip"; s.textContent = css; document.head.appendChild(s); }
export function Chip({ selected = false, static: isStatic = false, disabled = false, onRemove, dataOdId = "nav-chip", children, ...rest }) {
  const cls = "akhq-chip" + (selected ? " akhq-chip--selected" : "") + (isStatic ? " akhq-chip--static" : "");
  const inner = <>{children}{onRemove && <span className="akhq-chip-x" role="button" aria-label="Fjern" onClick={(e) => { e.stopPropagation(); onRemove(); }}>×</span>}</>;
  if (isStatic) return <span className={cls} data-od-id={dataOdId} {...rest}>{inner}</span>;
  return <button type="button" className={cls} aria-pressed={selected} disabled={disabled} data-od-id={dataOdId} {...rest}>{inner}</button>;
}
