"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronDown, Mail, Phone, Send, User } from "lucide-react";
import {
  sendKontaktMelding,
  type KontaktFormState,
} from "./actions";

const INITIAL: KontaktFormState = { status: "idle" };

/* Felt-anatomi som auth (login-form): mono-label + h-12 rounded-xl border-input */
const LABEL_KLASSE =
  "mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground";
const FELT_RAMME =
  "flex h-12 items-center gap-2 rounded-xl border border-input bg-card px-4 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30";
const FELT_INPUT =
  "h-full w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60 sm:text-sm";

function SubmitKnapp() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_28px_rgba(209,248,67,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "Sender ..." : "Send melding"}
      <Send className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}

export function KontaktForm() {
  const [state, formAction] = useActionState(sendKontaktMelding, INITIAL);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="navn" className={LABEL_KLASSE}>
          Navn
        </label>
        <div className={FELT_RAMME}>
          <User
            className="h-4 w-4 shrink-0 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
          <input
            id="navn"
            name="navn"
            type="text"
            required
            autoComplete="name"
            className={FELT_INPUT}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="epost" className={LABEL_KLASSE}>
            E-post
          </label>
          <div className={FELT_RAMME}>
            <Mail
              className="h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
            <input
              id="epost"
              name="epost"
              type="email"
              required
              autoComplete="email"
              className={FELT_INPUT}
            />
          </div>
        </div>
        <div>
          <label htmlFor="telefon" className={LABEL_KLASSE}>
            Telefon{" "}
            <span className="font-normal text-muted-foreground/70">
              (valgfritt)
            </span>
          </label>
          <div className={FELT_RAMME}>
            <Phone
              className="h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
            <input
              id="telefon"
              name="telefon"
              type="tel"
              autoComplete="tel"
              className={FELT_INPUT}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="tema" className={LABEL_KLASSE}>
          Tema
        </label>
        <div className="relative">
          <select
            id="tema"
            name="tema"
            required
            defaultValue=""
            className="h-12 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-base text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 sm:text-sm"
          >
            <option value="" disabled>
              Velg tema
            </option>
            <option value="Coaching">Coaching</option>
            <option value="Booking">Booking</option>
            <option value="Annet">Annet</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>
      </div>

      <div>
        <label htmlFor="melding" className={LABEL_KLASSE}>
          Melding
        </label>
        <textarea
          id="melding"
          name="melding"
          required
          rows={5}
          className="w-full rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30 sm:text-sm"
        />
      </div>

      {state.status === "ok" && (
        <div className="rounded-xl border border-success/40 bg-success/10 px-4 py-4 text-sm text-foreground">
          {state.melding}
        </div>
      )}
      {state.status === "feil" && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm text-foreground">
          {state.melding}
        </div>
      )}

      <SubmitKnapp />
    </form>
  );
}
