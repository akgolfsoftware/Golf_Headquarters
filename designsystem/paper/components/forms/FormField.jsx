import React from "react";
import { FieldMessage } from "./FieldMessage.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-ff{--gap:var(--s1);display:flex;flex-direction:column;gap:var(--gap);font-family:var(--ui);min-width:0}
.akhq-ff-lab{font-size:10px;text-transform:uppercase;letter-spacing:.08em;font-weight:500;color:var(--muted)}
.akhq-ff-krav{color:var(--dn);margin-inline-start:2px}
.akhq-ff-ctl{display:grid;min-width:0}
}
@layer akhq-modifier{
.akhq-ff--sm{--gap:2px}
/* Visuelt skjult, fortsatt annonsert. Ikke display:none — det fjerner den fra
   tilgjengelighetstreet, og da er feltet uten navn. */
.akhq-ff-lab--skjult{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-ff")) { const s = document.createElement("style"); s.id = "akhq-css-ff"; s.textContent = css; document.head.appendChild(s); }

let uid = 0;

/**
 * Feltanatomien: etikett, kontroll, og hjelpetekst ELLER feilmelding.
 * Eier koblingen — htmlFor, aria-describedby, aria-invalid, aria-required —
 * så hver enkelt kontroll slipper å gjenta den, og slipper å glemme den.
 */
export function FormField({
  label,
  labelHidden = false,
  hint,
  error,
  required = false,
  density = "md",
  htmlFor,
  dataOdId = "felt",
  children,
  ...rest
}) {
  const auto = React.useMemo(() => `akhq-ff-${++uid}`, []);
  const id = htmlFor || auto;
  const hjelpId = error ? `${id}-err` : hint ? `${id}-hint` : undefined;

  // Kontrollen får id og aria-kobling uten at kalleren må gjenta dem.
  const kontroll = React.isValidElement(children)
    ? React.cloneElement(children, {
        id: children.props.id || id,
        "aria-describedby": children.props["aria-describedby"] || hjelpId,
        "aria-invalid": error ? true : children.props["aria-invalid"],
        "aria-required": required || children.props["aria-required"],
      })
    : children;

  return (
    <div
      className={"akhq-ff" + (density === "sm" ? " akhq-ff--sm" : "")}
      data-od-id={dataOdId}
      {...rest}
    >
      {label && (
        <label className={"akhq-ff-lab" + (labelHidden ? " akhq-ff-lab--skjult" : "")} htmlFor={id}>
          {label}
          {required && <span className="akhq-ff-krav" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="akhq-ff-ctl">{kontroll}</div>
      {error ? (
        <FieldMessage tone="feil" id={`${id}-err`} dataOdId={`${dataOdId}-feil`}>{error}</FieldMessage>
      ) : hint ? (
        <FieldMessage id={`${id}-hint`} dataOdId={`${dataOdId}-hint`}>{hint}</FieldMessage>
      ) : null}
    </div>
  );
}
