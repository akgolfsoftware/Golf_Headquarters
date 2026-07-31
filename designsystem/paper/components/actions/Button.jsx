import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
/* --h er høyden modifikatorer setter; --floor er tilgjengelighetsgulvet
   container-laget setter under pointer:coarse. max() gjør at gulvet holder
   uansett modifikator, mens større eksplisitte verdier fortsatt virker —
   unntaket fra «eksplisitt forfattervalg slår automatisk tilpasning». */
.akhq-btn{--h:36px;--floor:0px;display:inline-flex;align-items:center;justify-content:center;gap:7px;height:max(var(--h),var(--floor));min-height:max(var(--h),var(--floor));padding:0 var(--pad-x,14px);border-radius:var(--r-sm);border:1px solid var(--border);background:transparent;color:var(--fg);font-family:var(--ui);font-size:var(--fs,12.5px);font-weight:600;white-space:nowrap;cursor:pointer;transition:border-color var(--dur) var(--ease),background var(--dur) var(--ease),opacity var(--dur) var(--ease)}
.akhq-btn:focus-visible,.akhq-btn[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-btn:disabled,.akhq-btn[data-state=disabled]{opacity:.45;cursor:not-allowed;pointer-events:none}
}
@layer akhq-container{
/* Berøring er omgivelse, ikke forfattervalg — derfor container-laget.
   Gulvet settes som variabel, aldri som height direkte: en modifikator i et
   senere lag ville ellers vunnet og gitt 32px hitbox på mobil. */
@media(pointer:coarse){.akhq-btn{--floor:44px}.akhq-btn--sm{--floor:44px}}
/* Stand-in, samme lag og vekt som spørringen over — se Chip.jsx.
   --sm hevet fra 40 til 44 (29.07.2026): --sm var et bevisst unntak fra
   gulvet, men fem andre komponenter arvet unntaket uten selv å ha bestemt
   det (DropdownMenu, ConfirmDialog, Modal, Banner, OneThingNow, StickyActionBar).
   Visuell høyde vokser til 44px på coarse pointer, som --btn (md) allerede gjorde —
   samme mekanisme, ingen ny --after-teknikk innført her. */
[data-coarse-test] .akhq-btn{--floor:44px}
[data-coarse-test] .akhq-btn--sm{--floor:44px}
}
@layer akhq-modifier{
.akhq-btn--ghost:hover:not(:disabled),.akhq-btn--ghost[data-state=hover]{border-color:color-mix(in srgb,var(--fg) 22%,var(--border));background:color-mix(in srgb,var(--fg) 3%,transparent)}
.akhq-btn--ghost:active:not(:disabled),.akhq-btn--ghost[data-state=active]{transform:translateY(0.5px);background:color-mix(in srgb,var(--fg) 6%,transparent)}
.akhq-btn--primary{background:var(--cta);color:var(--on-cta);border-color:var(--cta)}
.akhq-btn--primary:hover:not(:disabled),.akhq-btn--primary[data-state=hover]{background:color-mix(in srgb,var(--cta) 88%,var(--bg));border-color:color-mix(in srgb,var(--cta) 88%,var(--bg))}
.akhq-btn--primary:active:not(:disabled),.akhq-btn--primary[data-state=active]{background:color-mix(in srgb,var(--cta) 76%,var(--bg));border-color:color-mix(in srgb,var(--cta) 76%,var(--bg));transform:translateY(0.5px)}
/* danger: --dn som tekst og ramme på papirflate, aldri fylt. Fylt rød flate
   finnes ikke i paletten — fyll er reservert primærhandling (blekk) og
   OneThingNow (oransje). Vekten kommer fra ordlyden, men fargen må være der:
   uten den er bekreft-knappen bit-identisk med «Avbryt». */
.akhq-btn--danger{background:transparent;color:var(--dn);border-color:color-mix(in srgb,var(--dn) 34%,transparent)}
.akhq-btn--danger:hover:not(:disabled),.akhq-btn--danger[data-state=hover]{background:color-mix(in srgb,var(--dn) 8%,transparent);border-color:color-mix(in srgb,var(--dn) 52%,transparent)}
.akhq-btn--danger:active:not(:disabled),.akhq-btn--danger[data-state=active]{background:color-mix(in srgb,var(--dn) 13%,transparent);transform:translateY(0.5px)}
.akhq-btn--sm{--h:32px;--pad-x:11px;--fs:12px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-btn")) { const s = document.createElement("style"); s.id = "akhq-css-btn"; s.textContent = css; document.head.appendChild(s); }
export const Button = React.forwardRef(function Button({ variant = "primary", size = "md", disabled = false, dataOdId = "cta-primary", children, ...rest }, ref) {
  return <button ref={ref} type="button" className={`akhq-btn akhq-btn--${variant}${size === "sm" ? " akhq-btn--sm" : ""}`} disabled={disabled} data-od-id={dataOdId} {...rest}>{children}</button>;
});
