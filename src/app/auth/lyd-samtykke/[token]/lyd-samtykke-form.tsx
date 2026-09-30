"use client";

/**
 * Lyd-samtykke via lenke i Precision Athletics. Ingen egen tegning: bruker
 * AU-05 (7d7c2994, ui_kits/konto/screens/AU-04-06.jsx). Logikken er uendret.
 */
import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Knapp, Meta } from "@/components/precision/pa";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { AuthFlate, AuthOverskrift } from "@/components/auth/precision/AuthFlate";
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
      <AuthFlate max={520}>
        <AuthOverskrift
          kicker="Samtykke"
          tittel="Takk, samtykket er registrert"
          tekst={<>Samtykke til lydopptak for <strong style={{ color: "var(--text-primary)" }}>{spillerNavn}</strong> er registrert. Treneren kan starte opptak ved neste økt.</>}
        />
      </AuthFlate>
    );
  }

  return (
    <AuthFlate max={520}>
      <AuthOverskrift kicker={`Samtykke for ${spillerNavn}`} tittel="Samtykke til lydopptak" tekst="AK Golf Academy ber om samtykke. Les ordlyden og bekreft. Du kan trekke samtykket senere." />
      <div className="pa-card" style={{ padding: 16, maxHeight: 288, overflowY: "auto", overflowX: "hidden" }} tabIndex={0} role="region" aria-label="Ordlyd i samtykket">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere", font: "var(--type-body-s)", color: "var(--text-body)" }}>{ordlyd}</pre>
      </div>
      <InlineVarsel tone="info">Denne lenken gir bare tilgang til dette samtykket. Den logger deg ikke inn og viser ingen andre data.</InlineVarsel>
      {feil && <InlineVarsel tone="signal">{feil}</InlineVarsel>}
      <Knapp fullWidth size="lg" icon={Check} loading={pending} loadingText="Lagrer …" onClick={bekreft}>Jeg samtykker</Knapp>
      <Meta>DU KAN TREKKE SAMTYKKET VIA TRENEREN · NYE OPPTAK STOPPES MED EN GANG</Meta>
    </AuthFlate>
  );
}
