import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — ValidationChip / ValidationGroup
 * The canonical Inspector chip pattern: a row of selectable value-pills
 * (CS-nivå, læringstrinn, P-posisjon …) wrapped in a group that carries one of the
 * CANON anbefalingstilstander — ren (Innenfor anbefaling, stille) · myk (Avviker fra
 * anbefaling, synlig chip + klarspråk) · hard (Sterkt avvik, tydeligere chip +
 * coach-varsel-event). ID-ene ren/myk/hard endres aldri; UI-språket er klarspråket.
 * Ingenting blokkeres og ingenting krever begrunnelse (kanon: anbefalinger, aldri
 * sperrer). State changes animate the edge color, never cut hard.
 */

const CSS = `
.ak-vchip{
  display:inline-flex;align-items:center;justify-content:center;
  height:28px;padding:0 12px;border-radius:var(--radius-pill);
  font-family:var(--font-mono);font-size:11px;font-weight:600;letter-spacing:.02em;
  border:1px solid var(--border);background:transparent;color:var(--text-2);
  cursor:pointer;user-select:none;
  transition:background var(--dur-fast) var(--ease-standard),
    border-color var(--dur-fast) var(--ease-standard),
    color var(--dur-fast) var(--ease-standard),
    transform var(--dur-fast) var(--ease-standard);
}
.ak-vchip:hover{border-color:var(--border-strong);}
.ak-vchip:active{transform:scale(.97);}
.ak-vchip[data-readonly]{cursor:default;}
.ak-vchip[data-readonly]:active{transform:none;}
.ak-vchip[data-on]{color:var(--on-signal);background:var(--chip-active-bg,var(--signal));border-color:transparent;}

.ak-vgroup{
  display:flex;flex-direction:column;gap:9px;
  padding:8px;border-radius:12px;
  border:1px solid transparent;
  background:transparent;
  transition:border-color var(--dur-slow) var(--ease-standard),
    background var(--dur-slow) var(--ease-standard);
}
.ak-vgroup__head{display:flex;align-items:center;gap:6px;}
.ak-vgroup__label{
  font-family:var(--font-mono);font-size:10px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);
  transition:color var(--dur-slow) var(--ease-standard);
}
.ak-vgroup__row{display:flex;gap:6px;flex-wrap:wrap;}
.ak-vgroup__msg{font-family:var(--font-ui);font-size:12px;line-height:1.5;}
.ak-vgroup__ro{
  font-family:var(--font-mono);font-size:9px;color:var(--text-muted);
  border:1px solid var(--border);border-radius:4px;padding:1px 6px;margin-left:auto;
}
.ak-vgroup__override-bar{display:flex;flex-direction:column;gap:6px;}
.ak-vgroup__textarea{
  width:100%;box-sizing:border-box;resize:none;outline:none;
  background:var(--bg);border:1px solid var(--error-solid);border-radius:8px;
  padding:8px 10px;color:var(--text);font-family:var(--font-ui);font-size:12px;
}
.ak-vgroup__btnrow{display:flex;gap:6px;}
.ak-vgroup__btn{
  height:27px;padding:0 11px;border-radius:6px;border:1px solid transparent;
  font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.04em;
  cursor:pointer;transition:background var(--dur-fast) var(--ease-standard),transform var(--dur-fast) var(--ease-standard);
}
.ak-vgroup__btn:active{transform:scale(.97);}
.ak-vgroup__btn--primary{background:var(--signal);color:var(--on-signal);}
.ak-vgroup__btn--primary:disabled{background:var(--surface-2);color:var(--text-faint);cursor:default;}
.ak-vgroup__btn--ghost{background:transparent;border-color:var(--border-strong);color:var(--text-muted);}
.ak-vgroup__override-cta{
  align-self:flex-start;display:inline-flex;align-items:center;gap:5px;
  height:26px;padding:0 11px;border-radius:7px;
  background:color-mix(in srgb, var(--error-solid) 12%, transparent);
  border:1px solid color-mix(in srgb, var(--error-solid) 55%, transparent);
  color:var(--error-solid);font-family:var(--font-mono);font-size:9px;font-weight:700;
  cursor:pointer;transition:background var(--dur-fast) var(--ease-standard);
}
.ak-vgroup__override-cta:hover{background:color-mix(in srgb, var(--error-solid) 18%, transparent);}
.ak-vgroup__penalty{
  display:inline-flex;align-items:center;gap:5px;align-self:flex-start;
  height:22px;padding:0 9px;border-radius:6px;
  background:color-mix(in srgb, var(--warning) 13%, transparent);
  border:1px solid color-mix(in srgb, var(--warning) 42%, transparent);
  color:var(--warning);font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.04em;
  animation:ak-vgroup-reveal var(--dur-slow) var(--ease-standard) both;
}
@keyframes ak-vgroup-reveal{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:none;}}
@media (prefers-reduced-motion: reduce){.ak-vgroup__penalty{animation:none;}}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-vchip-css")) {
  const s = document.createElement("style");
  s.id = "ak-vchip-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const STATE_ICON = { hard: "circle-x", myk: "triangle-alert" };
const STATE_COLOR_VAR = { ren: null, myk: "var(--warning)", hard: "var(--error-solid)" };

/** Single toggleable value pill (e.g. one CS-level, one L-phase). */
export function ValidationChip({
  label,
  active = false,
  color = "var(--signal)",
  readOnly = false,
  onClick,
  className = "",
  style,
}) {
  return (
    <button
      type="button"
      className={`ak-vchip ${className}`}
      data-on={active ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      disabled={readOnly}
      onClick={onClick}
      style={{ "--chip-active-bg": color, ...style }}
    >
      {label}
    </button>
  );
}

/**
 * Wraps a set of ValidationChips (or any children) with the CANON validation
 * ring + message + override flow. `state`: "ren" | "myk" | "hard".
 * `overridden`: string (the saved reason) once an override is committed.
 * `onOverride(reason)`: called when the coach commits an override reason.
 */
export function ValidationGroup({
  label,
  state = "ren",
  message,
  readerMessage,
  overridden,
  penalty = null,
  canOverride = false,
  rolle = "coach",
  onOverride,
  readOnly = false,
  children,
  className = "",
  style,
}) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const isHard = state === "hard" && !overridden;
  const isSoft = state === "myk" && !overridden;
  const edgeColor = overridden
    ? "var(--signal)"
    : isHard
    ? "var(--error-solid)"
    : isSoft
    ? STATE_COLOR_VAR.myk
    : "transparent";
  const labelColor = overridden
    ? "var(--text-muted)"
    : isHard
    ? "var(--down)"
    : isSoft
    ? STATE_COLOR_VAR.myk
    : "var(--text-muted)";
  const tint =
    edgeColor === "transparent"
      ? "transparent"
      : `color-mix(in srgb, ${edgeColor} ${overridden ? 5 : 7}%, transparent)`;

  return (
    <div
      className={`ak-vgroup ${className}`}
      style={{
        borderColor: edgeColor,
        borderStyle: overridden ? "dashed" : "solid",
        background: tint,
        ...style,
      }}
    >
      <div className="ak-vgroup__head">
        {label != null && (
          <span className="ak-vgroup__label" style={{ color: labelColor }}>
            {label}
          </span>
        )}
        {(state === "hard" || state === "myk") && (
          <Icon
            name={overridden ? "circle-check" : STATE_ICON[state]}
            size={12}
            style={{ color: overridden ? "var(--signal)" : labelColor }}
          />
        )}
        {readOnly && <span className="ak-vgroup__ro">lese</span>}
      </div>

      {children != null && <div className="ak-vgroup__row">{children}</div>}

      {(message || readerMessage) && (
        <div className="ak-vgroup__msg" style={{ color: overridden ? "var(--text-muted)" : labelColor }}>
          {readOnly || rolle === "spiller" ? readerMessage ?? message : message}
        </div>
      )}

      {overridden && (
        <React.Fragment>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>
            Bevisst avvik · «{overridden}»
          </div>
          {penalty != null && (
            <span className="ak-vgroup__penalty" title="Avviket vises i Plan-kvalitet som informasjon.">
              <Icon name="trending-down" size={11} />
              Plan-kvalitet −{penalty}
            </span>
          )}
        </React.Fragment>
      )}

      {!readOnly && canOverride && state === "hard" && !overridden && (
        open ? (
          <div className="ak-vgroup__override-bar">
            <textarea
              className="ak-vgroup__textarea"
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Begrunnelse (påkrevd — logges)…"
            />
            {rolle === "spiller" && (
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)" }}>
                Coachen din får beskjed om avviket.
              </span>
            )}
            <div className="ak-vgroup__btnrow">
              <button
                type="button"
                className="ak-vgroup__btn ak-vgroup__btn--primary"
                disabled={!text.trim()}
                onClick={() => {
                  if (!text.trim()) return;
                  onOverride && onOverride(text.trim());
                  setOpen(false);
                  setText("");
                }}
              >
                Lagre notat
              </button>
              <button type="button" className="ak-vgroup__btn ak-vgroup__btn--ghost" onClick={() => setOpen(false)}>
                Avbryt
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="ak-vgroup__override-cta" onClick={() => setOpen(true)}>
            <Icon name="lock" size={11} />
            Overstyr
          </button>
        )
      )}

      {readOnly && state === "hard" && !overridden && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)" }}>
          Coach varsles automatisk ved sterkt avvik.
        </span>
      )}
    </div>
  );
}
