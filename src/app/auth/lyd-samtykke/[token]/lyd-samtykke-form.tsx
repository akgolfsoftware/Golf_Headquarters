"use client";

/**
 * AU-05 Samtykke til opptak, i nytt design (utkast-flater/innlogging.html, «lyd»).
 * bekreftLydSamtykkeViaToken og ordlyden fra basen er uendret.
 */
import { useState, useTransition } from "react";
import { Check, Mic } from "lucide-react";
import { FlateRamme } from "@/components/flater/FlateRamme";
import { bekreftLydSamtykkeViaToken } from "./actions";
import "@/styles/flater-ny-konto.css";

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
      <FlateRamme skall="konto">
        <span className="stor-ikon"><Check className="ikon" aria-hidden="true" /></span>
        <div className="topp">
          <h1 className="tittel">Samtykke gitt</h1>
          <p className="ingress">Samtykke til opptak for {spillerNavn} er registrert. Det gjelder fra neste time.</p>
        </div>
      </FlateRamme>
    );
  }

  return (
    <FlateRamme skall="konto">
      <span className="stor-ikon"><Mic className="ikon" aria-hidden="true" /></span>
      <div className="topp">
        <h1 className="tittel">Samtykke til opptak</h1>
        <p className="ingress">Coachen vil ta opp lyden i coachingtimene med {spillerNavn}.</p>
      </div>
      <div className="kort">
        <ul style={{ display: "grid", gap: 8, margin: 0, paddingLeft: 18, fontSize: 14.5 }}>
          <li>{spillerNavn} ser «Opptak pågår» mens det tas opp.</li>
          <li>Opptaket blir et sammendrag. Coach leser det før {spillerNavn} får det.</li>
          <li>Navn tas ut før teksten behandles av AI.</li>
          <li>Du kan trekke samtykket tilbake. Da stopper opptak fra neste time.</li>
        </ul>
      </div>
      <details>
        <summary className="lenke">Les hele samtykketeksten</summary>
        <p className="forklar" style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{ordlyd}</p>
      </details>
      {feil && <p className="feilmelding" role="alert">{feil}</p>}
      <div className="knapper">
        <button type="button" className="knapp pri" onClick={bekreft} disabled={pending}>{pending ? "Lagrer …" : "Gi samtykke"}</button>
        <a href="/" className="knapp sek">Ikke nå</a>
      </div>
    </FlateRamme>
  );
}
