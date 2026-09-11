"use client";

import { useId, useState } from "react";
import {
  SG_HOVEDFELT, SG_DETALJFELT, SG_DETALJGRUPPER, byttSgFortegn, lesManuellSgKladd,
  type ManuellSgKladd, type ManuellSgFeil, type ManuellSgFelt,
} from "@/lib/portal-runder/manuell-sg";
import styles from "./manuell-sg.module.css";

/** Utvidelse av eksisterende rundeskjema; felles Train-lock-verdier og feltmønstre. */
export function ManuellSgFelt({ value, onChange, feil = {}, disabled = false }: {
  value: ManuellSgKladd;
  onChange: (value: ManuellSgKladd) => void;
  feil?: ManuellSgFeil;
  disabled?: boolean;
}) {
  const id = useId();
  const [avansert, setAvansert] = useState(() => SG_DETALJFELT.some((f) => value[f.key] !== ""));
  const harDetaljer = SG_DETALJFELT.some((f) => value[f.key].trim() !== "");
  const resultat = lesManuellSgKladd(value);
  const total = resultat.ok ? resultat.beregnetTotal : null;
  const visDetaljer = avansert || SG_DETALJFELT.some((f) => feil[f.key]);

  function felt({ key, label }: { key: ManuellSgFelt; label: string }) {
    const inputId = `${id}-${key}`;
    return (
      <div className={styles.field} key={key}>
        <label htmlFor={inputId}>{label}</label>
        <div className={styles.inputRow}>
          <input id={inputId} name={key} type="text" inputMode="decimal" autoComplete="off"
            value={value[key]} disabled={disabled} aria-invalid={!!feil[key]}
            aria-describedby={feil[key] ? `${inputId}-feil` : `${id}-hjelp`}
            placeholder={key === "sgTotal" && total != null ? total.toFixed(2).replace(".", ",") : "—"}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })} />
          <button type="button" disabled={disabled} className={styles.sign}
            aria-label={`Bytt fortegn for ${label}`} title="Bytt mellom pluss og minus"
            onClick={() => onChange({ ...value, [key]: byttSgFortegn(value[key]) })}>
            <span aria-hidden="true">±</span>
          </button>
        </div>
        {feil[key] && <p id={`${inputId}-feil`} className={styles.fieldError}>{feil[key]}</p>}
      </div>
    );
  }

  return (
    <section className={styles.root} aria-labelledby={`${id}-tittel`}>
      <div className={styles.heading}>
        <h2 id={`${id}-tittel`}>Manuell Strokes Gained</h2>
        <span>Valgfritt</span>
      </div>
      <p id={`${id}-hjelp`} className={styles.help}>
        SG er slag vunnet (+) eller tapt (−) mot en referanse. Bruk tall for denne runden,
        med samme referanse i alle feltene. Komma og punktum fungerer. La ukjente tall stå tomme.
      </p>
      <div className={styles.modes} role="group" aria-label="Detaljnivå for SG">
        <button type="button" disabled={disabled} aria-pressed={!visDetaljer} onClick={() => setAvansert(false)}>Enkel</button>
        <button type="button" disabled={disabled} aria-pressed={!!visDetaljer} onClick={() => setAvansert(true)}>Avansert · alle kategorier</button>
      </div>
      <div className={styles.grid}>{SG_HOVEDFELT.map(felt)}</div>
      <p className={styles.help} aria-live="polite">
        {total != null && value.sgTotal.trim() === ""
          ? `Totalen beregnes fra de fire hovedkategoriene: ${total > 0 ? "+" : ""}${total.toFixed(2).replace(".", ",")} SG.`
          : "Oppgi totalen hvis du kjenner den. Ellers beregnes den når alle fire hovedkategorier er fylt ut."}
      </p>
      {!visDetaljer && harDetaljer && <p className={styles.help}>Avanserte tall beholdes og lagres også i enkel visning.</p>}
      {visDetaljer && (
        <div className={styles.details}>
          <p className={styles.help}>
            Detaljene er tilleggsopplysninger og summeres ikke automatisk til hovedkategoriene.
            Alle tee-slag inkluderer også utslag på par 3. Bruk avstandsintervallene som er oppgitt her.
          </p>
          {SG_DETALJGRUPPER.map((g) => (
            <fieldset className={styles.group} key={g.label}>
              <legend>{g.label}</legend>
              <div className={styles.grid}>{g.fields.map(felt)}</div>
            </fieldset>
          ))}
        </div>
      )}
    </section>
  );
}
