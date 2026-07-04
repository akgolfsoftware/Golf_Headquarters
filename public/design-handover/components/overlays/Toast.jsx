import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — Toast / ToastProvider
 * Notification toasts. Wrap your app in <ToastProvider>, then call toast({ title, tone }).
 * Tones: success · warning · error · info · neutral.
 * Also exposes useToast() hook. Default duration 4 000ms; pass 0 for persistent.
 */

const CSS = `
.ak-toast-region{
  position:fixed;bottom:24px;right:24px;z-index:400;
  display:flex;flex-direction:column-reverse;gap:10px;
  pointer-events:none;max-width:400px;width:calc(100vw - 48px);
}
.ak-toast{
  display:flex;align-items:flex-start;gap:12px;
  background:var(--surface-2);border:1px solid var(--border-strong);
  border-radius:var(--radius-card);box-shadow:var(--shadow-popover);
  padding:14px 16px;pointer-events:all;
  animation:ak-toast-in var(--dur-base) var(--ease-out);
}
.ak-toast__ic{
  display:flex;align-items:center;justify-content:center;
  width:20px;height:20px;flex-shrink:0;margin-top:1px;
}
.ak-toast__ic--success{color:var(--success);}
.ak-toast__ic--warning{color:var(--warning);}
.ak-toast__ic--error{color:var(--error);}
.ak-toast__ic--info{color:var(--info);}
.ak-toast__ic--neutral{color:var(--text-muted);}
.ak-toast__body{flex:1;min-width:0;}
.ak-toast__title{font-size:var(--text-14);font-weight:500;color:var(--text);}
.ak-toast__sub{font-size:var(--text-13);color:var(--text-muted);margin-top:2px;line-height:1.4;}
.ak-toast__close{
  display:flex;align-items:center;justify-content:center;
  width:24px;height:24px;border-radius:6px;
  background:transparent;border:none;cursor:pointer;
  color:var(--text-muted);flex-shrink:0;margin:-2px -4px 0 0;
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-toast__close:hover{background:var(--surface-hover);color:var(--text);}
.ak-toast__close:focus-visible{outline:none;box-shadow:var(--glow-signal);}
@keyframes ak-toast-in{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-toast-css")) {
  const s = document.createElement("style");
  s.id = "ak-toast-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const TONE_ICON = {
  success: "circle-check",
  warning: "triangle-alert",
  error: "circle-x",
  info: "info",
  neutral: "bell",
};

let _setToasts = null;
let _toastId = 0;

export function useToast() {
  return (opts) => _toast(opts);
}

export function toast(opts) {
  _toast(typeof opts === "string" ? { title: opts } : opts);
}

function _toast(opts) {
  if (!_setToasts) return;
  const id = ++_toastId;
  const duration = opts.duration ?? 4000;
  _setToasts((prev) => [...prev, { id, ...opts }]);
  if (duration > 0) setTimeout(() => _setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
}

/** Named alias so the bundler finds `Toast` from this file. */
export const Toast = ToastProvider;
/** Statisk fyr-funksjon på provideren — når toast()/useToast ikke er i scope (f.eks. galleriet). */
ToastProvider.vis = toast;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  _setToasts = setToasts;
  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  return (
    <React.Fragment>
      {children}
      <div className="ak-toast-region" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} className="ak-toast" role="status">
            <span className={`ak-toast__ic ak-toast__ic--${t.tone || "neutral"}`}>
              <Icon name={TONE_ICON[t.tone || "neutral"]} size={18} />
            </span>
            <span className="ak-toast__body">
              <div className="ak-toast__title">{t.title}</div>
              {t.description && <div className="ak-toast__sub">{t.description}</div>}
            </span>
            <button type="button" className="ak-toast__close" onClick={() => dismiss(t.id)} aria-label="Lukk">
              <Icon name="x" size={15} />
            </button>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}
