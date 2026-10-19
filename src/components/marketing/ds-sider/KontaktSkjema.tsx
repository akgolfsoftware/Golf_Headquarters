"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

import "@/styles/precision-komponenter.css";
import { sendKontaktMelding, type KontaktFormState } from "@/app/(marketing)/kontakt/actions";

/**
 * Kontaktskjemaet på /kontakt. Samme server-handling (sendKontaktMelding) og
 * samme feltnavn (navn/epost/telefon/tema/melding) som før. Feltene bruker
 * Precisions .pa-field og .pa-control. Feil og kvittering står under
 * skjemaet, aldri bare i en toast.
 */

const TEMA = ["Coaching", "Booking", "Junior", "PlayerHQ", "Annet"];
const START: KontaktFormState = { status: "idle" };

function Felt({ etikett, children }: { etikett: string; children: ReactNode }) {
  return (
    <label className="pa-field">
      <span className="pa-field__label">{etikett}</span>
      {children}
    </label>
  );
}

function SendKnapp() {
  const { pending } = useFormStatus();
  return (
    <button className="pa-btn pa-btn--primary pa-btn--lg pa-btn--full" type="submit" disabled={pending}>
      {pending ? "Sender …" : "Send melding"}
    </button>
  );
}

export function KontaktSkjema() {
  const [state, formAction] = useActionState(sendKontaktMelding, START);
  return (
    <form action={formAction} className="flex flex-col gap-ak-4" style={{ minWidth: 0 }}>
      <Felt etikett="Navn">
        <span className="pa-control">
          <input name="navn" autoComplete="name" required />
        </span>
      </Felt>
      <div className="grid gap-ak-4 sm:grid-cols-2">
        <Felt etikett="E-post">
          <span className="pa-control">
            <input name="epost" type="email" inputMode="email" autoComplete="email" required />
          </span>
        </Felt>
        <Felt etikett="Telefon (valgfritt)">
          <span className="pa-control">
            <input name="telefon" type="tel" autoComplete="tel" />
          </span>
        </Felt>
      </div>
      <Felt etikett="Tema">
        <span className="pa-control">
          <select name="tema" defaultValue={TEMA[0]}>
            {TEMA.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </span>
      </Felt>
      <Felt etikett="Melding">
        <textarea
          name="melding"
          rows={5}
          required
          className="pa-control"
          style={{ height: "auto", padding: "10px 12px", font: "var(--type-body)", resize: "vertical" }}
        />
      </Felt>

      {state.status === "ok" ? (
        <p role="status" className="pa-alert pa-alert--ok">
          {state.melding}
        </p>
      ) : null}
      {state.status === "feil" ? (
        <p role="alert" className="pa-alert pa-alert--signal">
          {state.melding}
        </p>
      ) : null}

      <SendKnapp />
    </form>
  );
}
