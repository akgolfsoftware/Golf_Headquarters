"use client";

import { useState, useTransition } from "react";
import { bekreftLydSamtykkeViaToken } from "./actions";

type Props = {
  token: string;
  spillerNavn: string;
  ordlyd: string;
};

export function LydSamtykkeForm({ token, spillerNavn, ordlyd }: Props) {
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [ferdig, setFerdig] = useState(false);

  function bekreft() {
    setFeil(null);
    start(async () => {
      const res = await bekreftLydSamtykkeViaToken({ token });
      if (!res.ok) {
        setFeil(res.error);
        return;
      }
      setFerdig(true);
    });
  }

  if (ferdig) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-xl font-semibold text-foreground">Takk</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Samtykke til lydopptak for <strong className="text-foreground">{spillerNavn}</strong>{" "}
          er registrert. Treneren kan starte opptak ved neste økt.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-xl font-semibold text-foreground">
        Samtykke til lydopptak
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        For <strong className="text-foreground">{spillerNavn}</strong> — AK Golf Academy
      </p>

      <div className="mt-6 max-h-72 overflow-y-auto rounded-md border border-border bg-card p-4">
        <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-foreground">
          {ordlyd}
        </pre>
      </div>

      <button
        type="button"
        onClick={bekreft}
        disabled={pending}
        className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-[15px] font-semibold text-primary-foreground disabled:opacity-50"
      >
        {pending ? "Lagrer …" : "Jeg samtykker"}
      </button>

      {feil && (
        <p className="mt-3 text-[13px] text-destructive" role="alert">
          {feil}
        </p>
      )}

      <p className="mt-4 text-[12px] text-muted-foreground">
        Du kan trekke samtykket senere via treneren. Da stoppes nye opptak med
        en gang.
      </p>
    </div>
  );
}
