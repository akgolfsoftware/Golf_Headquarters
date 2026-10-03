"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { bekreftLydSamtykkeViaToken } from "./actions";
import "@/styles/precision-athletics.css";

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
      <div className="pa-root au-ramme" data-design="precision-athletics">
        <div className="au-boks">
          <Link href="/" className="au-logo">AK Golf HQ</Link>
          <header>
            <p className="au-kicker">Lydopptak</p>
            <h1>Takk</h1>
            <p>
              Samtykke til lydopptak for {spillerNavn} er registrert. Treneren kan starte opptak ved neste økt.
            </p>
          </header>
        </div>
      </div>
    );
  }

  return (
    <div className="pa-root au-ramme" data-design="precision-athletics">
      <div className="au-boks au-boks--bred">
        <Link href="/" className="au-logo">AK Golf HQ</Link>
        <header>
          <p className="au-kicker">Lydopptak</p>
          <h1>Samtykke til lydopptak</h1>
          <p>For {spillerNavn} — AK Golf Academy</p>
        </header>
        <pre className="au-ordlyd">{ordlyd}</pre>
        <button type="button" className="pa-btn pa-btn--primary pa-btn--full" onClick={bekreft} disabled={pending}>
          {pending ? "Lagrer …" : "Jeg samtykker"}
        </button>
        {feil ? <p className="au-melding" data-tone="feil" role="alert">{feil}</p> : null}
        <p>Du kan trekke samtykket senere via treneren. Da stoppes nye opptak med en gang.</p>
      </div>
    </div>
  );
}
