import React from "react";

/**
 * AK Golf HQ — delt dialog-a11y (WAI-ARIA dialog pattern)
 * Escape lukker · fokus-felle innenfor panelet · fokus-retur til utløser ved lukking.
 * Brukes av Modal, Drawer og Sheet. Ikke en komponent — ingen .d.ts.
 */

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useDialogA11y(open, onClose, panelRef) {
  React.useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement;
    const panel = panelRef.current;

    // Initialt fokus: første fokuserbare element, ellers panelet selv.
    if (panel) {
      const first = panel.querySelector(FOCUSABLE);
      (first || panel).focus({ preventScroll: true });
    }

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (onClose) onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        e.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      if (prevActive && typeof prevActive.focus === "function") {
        prevActive.focus({ preventScroll: true });
      }
    };
  }, [open]);
}
