"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Send } from "lucide-react";
import {
  sendKontaktMelding,
  type KontaktFormState,
} from "./actions";

const INITIAL: KontaktFormState = { status: "idle" };

function SubmitKnapp() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
    >
      <Send className="h-4 w-4" aria-hidden="true" />
      {pending ? "Sender ..." : "Send melding"}
    </button>
  );
}

export function KontaktForm() {
  const [state, formAction] = useActionState(sendKontaktMelding, INITIAL);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label
          htmlFor="navn"
          className="block text-sm font-medium text-foreground"
        >
          Navn
        </label>
        <input
          id="navn"
          name="navn"
          type="text"
          required
          autoComplete="name"
          className="mt-2 w-full rounded-md border border-input bg-background px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="epost"
            className="block text-sm font-medium text-foreground"
          >
            E-post
          </label>
          <input
            id="epost"
            name="epost"
            type="email"
            required
            autoComplete="email"
            className="mt-2 w-full rounded-md border border-input bg-background px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label
            htmlFor="telefon"
            className="block text-sm font-medium text-foreground"
          >
            Telefon{" "}
            <span className="text-muted-foreground">(valgfritt)</span>
          </label>
          <input
            id="telefon"
            name="telefon"
            type="tel"
            autoComplete="tel"
            className="mt-2 w-full rounded-md border border-input bg-background px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="tema"
          className="block text-sm font-medium text-foreground"
        >
          Tema
        </label>
        <select
          id="tema"
          name="tema"
          required
          defaultValue=""
          className="mt-2 w-full rounded-md border border-input bg-background px-4 py-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="" disabled>
            Velg tema
          </option>
          <option value="Coaching">Coaching</option>
          <option value="Booking">Booking</option>
          <option value="Annet">Annet</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="melding"
          className="block text-sm font-medium text-foreground"
        >
          Melding
        </label>
        <textarea
          id="melding"
          name="melding"
          required
          rows={5}
          className="mt-2 w-full rounded-md border border-input bg-background px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {state.status === "ok" && (
        <div className="rounded-md border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
          {state.melding}
        </div>
      )}
      {state.status === "feil" && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground">
          {state.melding}
        </div>
      )}

      <SubmitKnapp />
    </form>
  );
}
