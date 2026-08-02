import React from "react";
import { useOverlayLayer } from "./overlay-focus.jsx";
import { Button } from "../actions/Button.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-cdlg-scrim{position:fixed;inset:0;z-index:var(--z-toast);display:grid;place-items:center;padding:var(--s4);background:var(--scrim)}
.akhq-cdlg{--pad:22px;--w:400px;container-type:inline-size;width:min(var(--w),100%);max-height:calc(100dvh - 2 * var(--s4));overflow:auto;padding:var(--pad);box-sizing:border-box;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow);font-family:var(--ui)}
.akhq-cdlg:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-cdlg-kick{margin:0 0 8px;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.akhq-cdlg-t{margin:0;font-family:var(--disp);font-size:18px;font-weight:600;line-height:1.25;color:var(--fg);text-wrap:pretty}
.akhq-cdlg-b{margin:10px 0 0;font-family:var(--body);font-size:13px;line-height:1.55;color:var(--muted);text-wrap:pretty}
.akhq-cdlg-conseq{margin:var(--s3) 0 0;padding:11px 13px;border-radius:var(--r-sm);background:var(--soft);font-family:var(--mono);font-size:11.5px;line-height:1.5;color:var(--fg)}
.akhq-cdlg-act{display:flex;flex-direction:var(--act-dir,row);justify-content:flex-end;gap:var(--s2);margin-top:var(--s4)}
}
@layer akhq-container{
@container (max-width:340px){.akhq-cdlg{--pad:18px}.akhq-cdlg-act{--act-dir:column-reverse}}
}
@layer akhq-modifier{
.akhq-cdlg--wide{--w:520px}
/* Kortmodus: i flyten, ingen scrim, ingen laglogikk. Kun for spesimenkort. */
.akhq-cdlg-scrim--preview{position:static;inset:auto;padding:0;background:transparent;display:block;z-index:auto}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-cdlg")) { const s = document.createElement("style"); s.id = "akhq-css-cdlg"; s.textContent = css; document.head.appendChild(s); }
let seq = 0;
export function ConfirmDialog({
  open = false, kicker, title, body, consequence,
  confirmLabel = "Slett", cancelLabel = "Avbryt",
  destructive = true, wide = false, busy = false, preview = false,
  onConfirm, onCancel, triggerRef, dataOdId = "panel-bekreft"
}) {
  const layerRef = React.useRef(null);
  const avbrytRef = React.useRef(null);
  const id = React.useMemo(() => "akhq-cdlg" + (++seq), []);
  if (typeof console !== "undefined" && open && !title) console.warn("ConfirmDialog: mangler title — en dialog uten tilgjengelig navn skal ikke forekomme.");
  const lukk = React.useCallback(() => { if (!busy && onCancel) onCancel(); }, [busy, onCancel]);
  /* modal: inert + aria-hidden på søsknene og scroll-lås. initialFocus="layer"
     så fokus ikke lander på en destruktiv knapp; leseren får tittel og
     konsekvens først, og Tab velger.

     preview slår AV hele laglogikken: en modal komponent kan ikke rendres
     «alltid åpen» i et spesimenkort — åtte samtidige lag låser sidens
     rulling permanent og gjør kortet uleselig. Samme problem som
     defaultOpen løste for DropdownMenu, men strengere: her må modaliteten
     også av, ikke bare åpningen på. */
  useOverlayLayer({ open: open && !preview, onClose: lukk, layerRef, triggerRef, modal: true, initialFocus: "layer", closeOnOutside: !busy });
  if (!open) return null;
  return (
    <div className={"akhq-cdlg-scrim" + (preview ? " akhq-cdlg-scrim--preview" : "")} data-od-id={dataOdId + "-scrim"}>
      <div className={"akhq-cdlg" + (wide ? " akhq-cdlg--wide" : "")} ref={layerRef}
        role="dialog" aria-modal="true" aria-labelledby={id + "-t"} aria-describedby={body ? id + "-b" : undefined}
        data-od-id={dataOdId}>
        {kicker && <p className="akhq-cdlg-kick">{kicker}</p>}
        <h2 className="akhq-cdlg-t" id={id + "-t"}>{title}</h2>
        {body && <p className="akhq-cdlg-b" id={id + "-b"}>{body}</p>}
        {consequence && <p className="akhq-cdlg-conseq">{consequence}</p>}
        <div className="akhq-cdlg-act">
          <Button variant="ghost" size="sm" ref={avbrytRef} onClick={lukk} disabled={busy} dataOdId={"cta-" + dataOdId + "-avbryt"}>{cancelLabel}</Button>
          <Button variant={destructive ? "danger" : "primary"} size="sm" onClick={onConfirm} disabled={busy} dataOdId={"cta-" + dataOdId + "-bekreft"}>{busy ? "Jobber …" : confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
