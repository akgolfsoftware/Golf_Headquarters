import React from "react";
/* ─────────────────────────────────────────────────────────────
   Delt fokusoppførsel for ALLE overlay-komponenter.
   Implementerer fokuskontrakten i readme.md én gang, som kode:
   fokus inn ved åpning · fokusfelle · Escape lukker ØVERSTE lag ·
   fokus tilbake til utløseren (med fallback) · klikk utenfor ·
   ekte modalitet (inert + scroll-lås) når modal=true.

   Brukes av DropdownMenu, og skal brukes av ConfirmDialog, Modal,
   BottomSheet, CommandPalette, ContextMenu og FlyoutPanel.
   Skriv ALDRI en egen fokusfelle i en komponent — mangler hooken noe,
   utvides hooken.
   ───────────────────────────────────────────────────────────── */
const FOCUSABLE = 'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])';
export function focusablesIn(el) {
  if (!el) return [];
  return [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null || n === document.activeElement);
}
/* Felles stack for alle lag i dokumentet. Escape og klikk-utenfor gjelder
   BARE øverste lag — ellers lukker én Escape både ContextMenu og
   InspectorPanel den ligger over. Rettelsen er arkitektonisk hvis den
   kommer sent, derfor ligger stacken her fra første konsument. */
const stack = [];
export function isTopLayer(token) { return stack.length > 0 && stack[stack.length - 1] === token; }
/* Modalitet: inert + aria-hidden på alt utenfor laget, og scroll-lås.
   Fokusfelle stopper Tab, men skjermleserens virtuelle markør kan
   fortsatt bla bak — inert er det som gir ekte modalitet (WCAG).

   REFERANSETELT, ikke per lag. Da flere modale lag var montert samtidig,
   satte hvert lag inert på de andres forfedre og skrudde det av igjen i
   sin egen cleanup — nettoresultat: ingen inert, og fokus falt til <body>
   fordi laget selv lå inne i et inert tre. Nå eier ØVERSTE modale lag
   inert alene, og scroll-låsen slippes først når siste lås er borte. */
let inertEier = null;
let inertUndo = null;
function settInert(layerEl) {
  if (inertUndo) { inertUndo(); inertUndo = null; inertEier = null; }
  if (!layerEl) return;
  const undo = [];
  let node = layerEl;
  while (node && node.parentElement) {
    const parent = node.parentElement;
    for (const sib of parent.children) {
      if (sib === node || sib.tagName === "SCRIPT" || sib.tagName === "STYLE" || sib.tagName === "LINK") continue;
      const hadInert = sib.hasAttribute("inert");
      const hadHidden = sib.getAttribute("aria-hidden");
      if (!hadInert) sib.setAttribute("inert", "");
      if (hadHidden === null) sib.setAttribute("aria-hidden", "true");
      undo.push(() => {
        if (!hadInert) sib.removeAttribute("inert");
        if (hadHidden === null) sib.removeAttribute("aria-hidden");
      });
    }
    if (parent === document.body) break;
    node = parent;
  }
  inertEier = layerEl;
  inertUndo = () => undo.forEach((f) => f());
}
function slippInert(layerEl) {
  if (inertEier !== layerEl) return;
  if (inertUndo) inertUndo();
  inertUndo = null;
  inertEier = null;
}
let låser = 0;
let forrigeOverflow = null;
function lockScroll() {
  if (låser === 0) { forrigeOverflow = document.body.style.overflow; document.body.style.overflow = "hidden"; }
  låser++;
  let sluppet = false;
  return () => {
    if (sluppet) return;
    sluppet = true;
    låser = Math.max(0, låser - 1);
    if (låser === 0) document.body.style.overflow = forrigeOverflow || "";
  };
}
export function useOverlayLayer({
  open, onClose, layerRef, triggerRef,
  closeOnOutside = true, initialFocus = "first",
  modal = false, lockScroll: wantLock = modal
}) {
  const token = React.useMemo(() => ({}), []);
  const restoreRef = React.useRef(null);
  const fallbackRef = React.useRef(null);
  /* Stack: legg laget øverst ved åpning, fjern ved lukking. */
  React.useEffect(() => {
    if (!open) return;
    stack.push(token);
    return () => { const i = stack.indexOf(token); if (i > -1) stack.splice(i, 1); };
  }, [open, token]);
  /* Husk utløseren VED ÅPNING — og en stabil forelder som fallback,
     for tilfellet der utløseren slettes av handlingen den startet
     (menyen som sletter raden den ble åpnet fra). */
  React.useEffect(() => {
    if (!open) return;
    const wrap = triggerRef && triggerRef.current;
    /* Utløseren er den fokuserbare noden i wrapperen — ikke wrapperen selv,
       og aldri document.activeElement som fallback (det kan være <body>). */
    const trig = wrap ? (wrap.matches && wrap.matches(FOCUSABLE) ? wrap : wrap.querySelector(FOCUSABLE)) : null;
    const aktiv = document.activeElement;
    restoreRef.current = trig || (aktiv && aktiv !== document.body ? aktiv : null);
    let p = (trig || aktiv || document.body).parentElement;
    while (p && p !== document.body && !p.matches('[data-od-id^="panel"],[data-od-id^="list"],section,main,form')) p = p.parentElement;
    fallbackRef.current = p && p !== document.body ? p : null;
  }, [open, triggerRef]);
  /* Modalitet + scroll-lås. Inert settes FØR fokus flyttes inn (egen effekt
     som kjører først), ellers kan laget rekke å stå i et inert tre når
     .focus() kalles — og fokus faller stille til <body>. */
  React.useEffect(() => {
    if (!open) return;
    const el = layerRef.current;
    if (modal && el) settInert(el);
    const slipp = wantLock ? lockScroll() : null;
    return () => { if (modal && el) slippInert(el); if (slipp) slipp(); };
  }, [open, modal, wantLock, layerRef]);
  /* Fokus inn — etter modalitetseffekten over. */
  React.useEffect(() => {
    if (!open) return;
    const el = layerRef.current;
    if (!el) return;
    const items = focusablesIn(el);
    const target = initialFocus === "layer" || !items.length ? el : items[0];
    if (target === el && !el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }, [open, layerRef, initialFocus]);
  /* Fokus tilbake, med dokumentert fallback. */
  const wasOpen = React.useRef(false);
  React.useEffect(() => {
    if (wasOpen.current && !open) {
      const t = restoreRef.current;
      if (t && document.contains(t)) t.focus({ preventScroll: true });
      else {
        const fb = fallbackRef.current;
        if (fb && document.contains(fb)) {
          if (!fb.hasAttribute("tabindex")) fb.setAttribute("tabindex", "-1");
          fb.focus({ preventScroll: true });
        }
      }
    }
    wasOpen.current = open;
  }, [open]);  /* Escape (bare øverste lag) + fokusfelle. */
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (!isTopLayer(token)) return;
        e.stopPropagation();
        onClose && onClose("escape");
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusablesIn(layerRef.current);
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === layerRef.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onClose, layerRef, token]);
  /* Klikk utenfor — også bare øverste lag. */
  React.useEffect(() => {
    if (!open || !closeOnOutside) return;
    const onDown = (e) => {
      if (!isTopLayer(token)) return;
      const l = layerRef.current, t = triggerRef && triggerRef.current;
      if (l && l.contains(e.target)) return;
      if (t && t.contains(e.target)) return;
      onClose && onClose("outside");
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open, closeOnOutside, onClose, layerRef, triggerRef, token]);
}
/* Piltastnavigasjon for menyer og lister (Tab er for dialoger). */
export function useRovingKeys({ open, layerRef, itemSelector = '[role="menuitem"]:not([aria-disabled="true"])' }) {
  React.useEffect(() => {
    if (!open) return;
    const el = layerRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
      const items = [...el.querySelectorAll(itemSelector)];
      if (!items.length) return;
      e.preventDefault();
      const i = items.indexOf(document.activeElement);
      const next = e.key === "Home" ? 0
        : e.key === "End" ? items.length - 1
        : e.key === "ArrowDown" ? (i + 1) % items.length
        : (i - 1 + items.length) % items.length;
      items[next].focus();
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [open, layerRef, itemSelector]);
}
