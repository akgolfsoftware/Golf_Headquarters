import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — MeldingsTraad
 * Chat/samtale-tråd. Promotert fra caddie-app og innboks-app (ui_kits/agencyos).
 * Compound: MeldingsTraad.Melding (fra: meg/dem/ai) · .Skille (datoskille) · .Skriver (skriveindikator).
 * Innhold (tekst + rike kort) flyter som children. role="log" + aria-live="polite".
 */

const CSS = `
.ak-traad{display:flex;flex-direction:column;gap:18px;}
.ak-msg{display:flex;gap:12px;align-items:flex-start;}
.ak-msg--meg{flex-direction:row-reverse;}
.ak-msg__avatar{
  width:32px;height:32px;flex:none;border-radius:9999px;
  background:var(--surface-hover);border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--text);
}
.ak-msg--ai .ak-msg__avatar{
  background:color-mix(in srgb,var(--signal) 16%,var(--surface-hover));
  border-color:color-mix(in srgb,var(--signal) 40%,transparent);
  color:var(--signal);
}
.ak-msg__col{max-width:min(560px,82%);display:flex;flex-direction:column;gap:8px;align-items:flex-start;min-width:0;}
.ak-msg--meg .ak-msg__col{align-items:flex-end;}
.ak-msg__meta{
  display:flex;gap:8px;align-items:baseline;padding:0 2px;
  font-family:var(--font-mono);font-size:10px;color:var(--text-muted);
}
.ak-msg__navn{font-weight:600;color:var(--text-2);}
.ak-msg__bubble{
  padding:12px 15px;font-family:var(--font-ui);font-size:var(--text-14);
  line-height:var(--leading-body);color:var(--text);
  background:var(--surface-2);border:1px solid var(--border);
  border-radius:4px 14px 14px 14px;
  overflow-wrap:break-word;min-width:0;
}
.ak-msg--meg .ak-msg__bubble{
  background:var(--primary-fill);border:none;color:var(--primary-text);
  border-radius:14px 4px 14px 14px;
}
.ak-msg__extra{width:100%;display:flex;flex-direction:column;gap:8px;}
.ak-traad-skille{
  display:flex;align-items:center;gap:12px;padding:2px 0;
}
.ak-traad-skille::before,.ak-traad-skille::after{
  content:"";flex:1;height:1px;background:var(--border);
}
.ak-traad-skille__lbl{
  font-family:var(--font-mono);font-size:10px;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);
}
.ak-traad-skriver{display:flex;gap:12px;align-items:center;}
.ak-traad-skriver__dots{display:inline-flex;gap:4px;padding:12px 15px;
  background:var(--surface-2);border:1px solid var(--border);
  border-radius:4px 14px 14px 14px;
}
.ak-traad-skriver__dot{
  width:5px;height:5px;border-radius:50%;background:var(--text-muted);
  animation:ak-traad-dot 1.2s var(--ease-standard) infinite;
}
.ak-traad-skriver__dot:nth-child(2){animation-delay:.15s;}
.ak-traad-skriver__dot:nth-child(3){animation-delay:.3s;}
@keyframes ak-traad-dot{0%,60%,100%{opacity:.35;transform:none}30%{opacity:1;transform:translateY(-2px)}}
@media (prefers-reduced-motion: reduce){.ak-traad-skriver__dot{animation:none;opacity:.7;}}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-traad-css")) {
  const s = document.createElement("style");
  s.id = "ak-traad-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function MeldingsTraad({ label = "Samtale", children, className = "", style }) {
  return (
    <div className={`ak-traad ${className}`} style={style} role="log" aria-label={label} aria-live="polite">
      {children}
    </div>
  );
}

function Melding({ fra = "dem", navn, initialer, tid, children }) {
  const ai = fra === "ai";
  const meg = fra === "meg";
  const visNavn = !meg && (navn || (ai ? "AI-Caddie" : null));
  // Skiller ren tekst (i boble) fra rike kort (under boblen).
  const items = React.Children.toArray(children);
  const text = items.filter((c) => typeof c === "string" || typeof c === "number");
  const rich = items.filter((c) => typeof c !== "string" && typeof c !== "number");
  return (
    <div className={`ak-msg ak-msg--${fra}`}>
      <span className="ak-msg__avatar" aria-hidden="true">
        {ai ? <Icon name="sparkles" size={15} /> : (initialer || (navn ? navn.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "–"))}
      </span>
      <div className="ak-msg__col">
        {(visNavn || tid) && (
          <span className="ak-msg__meta">
            {visNavn && <span className="ak-msg__navn">{visNavn}</span>}
            {tid && <span>{tid}</span>}
          </span>
        )}
        {text.length > 0 && <div className="ak-msg__bubble">{text}</div>}
        {rich.length > 0 && <div className="ak-msg__extra">{rich}</div>}
      </div>
    </div>
  );
}

function Skille({ children }) {
  return (
    <div className="ak-traad-skille" role="separator">
      <span className="ak-traad-skille__lbl">{children}</span>
    </div>
  );
}

function Skriver({ navn = "Skriver" }) {
  return (
    <div className="ak-traad-skriver ak-msg" aria-label={`${navn} skriver…`}>
      <span className="ak-msg__avatar" aria-hidden="true">
        <Icon name="sparkles" size={15} style={{ color: "var(--signal)" }} />
      </span>
      <span className="ak-traad-skriver__dots" aria-hidden="true">
        <span className="ak-traad-skriver__dot"></span>
        <span className="ak-traad-skriver__dot"></span>
        <span className="ak-traad-skriver__dot"></span>
      </span>
    </div>
  );
}

MeldingsTraad.Melding = Melding;
MeldingsTraad.Skille = Skille;
MeldingsTraad.Skriver = Skriver;
