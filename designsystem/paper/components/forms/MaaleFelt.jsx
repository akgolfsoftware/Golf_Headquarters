import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-mf{display:flex;flex-direction:column;gap:4px;width:100%;min-width:0;font-family:var(--ui)}
.akhq-mf-lab{font-size:13px;color:var(--fg)}
.akhq-mf-rad{--floor:0px;display:flex;align-items:center;min-height:max(44px,var(--floor));border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface);padding:0 var(--s3)}
.akhq-mf-rad:focus-within{outline:2px solid var(--focus);outline-offset:2px}
.akhq-mf-in{flex:1;min-width:0;border:none;background:transparent;font-family:var(--mono);font-size:15px;color:var(--fg);font-variant-numeric:tabular-nums;padding:0}
.akhq-mf-in:focus{outline:none}
.akhq-mf-in::placeholder{color:var(--mid)}
.akhq-mf-enhet{font-family:var(--mono);font-size:12px;color:var(--muted);flex:none;margin-left:var(--s2)}
.akhq-mf-hjelp{font-size:11.5px;color:var(--muted);line-height:1.4}
.akhq-mf-feil{font-size:11.5px;color:var(--dn);line-height:1.4}
}
@layer akhq-modifier{
.akhq-mf--feil .akhq-mf-rad{border-color:var(--dn)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-mf")) { const s = document.createElement("style"); s.id = "akhq-css-mf"; s.textContent = css; document.head.appendChild(s); }
/* Tallfelt med enhetsetikett og forklaringslinje: rangelengde i meter,
   maks puttelengde i fot. Fri inntasting (i motsetning til TallStepper) —
   riktig når verdien er et ukjent, presist mål spilleren selv leser av et
   anlegg, ikke noe man teller seg fram til (onboarding-tillegget,
   manifest 20.08.2026). Putteavstander i fot, alt annet i meter (VOKABULAR §2). */
export function MaaleFelt({ label, verdi, onChange, enhet, hjelpetekst, feilmelding, placeholder, id, dataOdId = "malefelt" }) {
  const auto = React.useId ? React.useId() : dataOdId;
  const iid = id || `akhq-mf-${auto}`;
  return (
    <div className={"akhq-mf" + (feilmelding ? " akhq-mf--feil" : "")} data-od-id={dataOdId}>
      {label && <label className="akhq-mf-lab" htmlFor={iid}>{label}</label>}
      <div className="akhq-mf-rad">
        <input id={iid} className="akhq-mf-in" type="number" inputMode="decimal" value={verdi ?? ""} placeholder={placeholder}
          onChange={(e) => onChange && onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          aria-describedby={hjelpetekst ? iid + "-hjelp" : undefined}
          aria-invalid={feilmelding ? true : undefined} />
        {enhet && <span className="akhq-mf-enhet" aria-hidden="true">{enhet}</span>}
      </div>
      {feilmelding ? (
        <span className="akhq-mf-feil" role="alert">{feilmelding}</span>
      ) : hjelpetekst ? (
        <span className="akhq-mf-hjelp" id={iid + "-hjelp"}>{hjelpetekst}</span>
      ) : null}
    </div>
  );
}
