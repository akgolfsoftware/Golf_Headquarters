"use client";

/**
 * Rapporter-inngang på venn-profilen.
 */

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { Knapp, StatusPille } from "@/components/precision/pa";

import { opprettRapport } from "@/lib/moderering/actions";

export function RapporterVennKnapp({ vennUserId }: { vennUserId: string }) {
  const [apen, setApen] = useState(false);
  const [begrunnelse, setBegrunnelse] = useState("");
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);

  function send() {
    setFeil(null);
    startTransition(async () => {
      const res = await opprettRapport("SPILLERPROFIL", vennUserId, begrunnelse);
      if (!res.ok) {
        setFeil(res.error ?? "Kunne ikke sende rapport. Prøv igjen.");
        return;
      }
      setSendt(true);
      setApen(false);
      setBegrunnelse("");
    });
  }

  if (sendt) {
    return (
      <StatusPille tone="ok">Rapport sendt — takk. En coach ser på den.</StatusPille>
    );
  }

  if (!apen) {
    return (
      <Knapp type="button" variant="ghost" icon={Flag} onClick={() => setApen(true)}>
        Rapporter
      </Knapp>
    );
  }

  return (
    <form
      className="ph-skjema"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <strong>Rapporter denne profilen</strong>
      <p>
        Fortell kort hva som er galt. En coach vurderer rapporten. Vi deler ikke hvem som har rapportert.
      </p>
      <label>
        Hva vil du melde fra om?
        <textarea
          value={begrunnelse}
          onChange={(e) => setBegrunnelse(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Hva vil du melde fra om?"
        />
      </label>
      {feil ? <p role="alert">{feil}</p> : null}
      <Knapp
        type="submit"
        variant="primary"
        icon={Flag}
        fullWidth
        loading={pending}
        loadingText="Sender…"
        disabled={pending || begrunnelse.trim().length === 0}
      >
        Send rapport
      </Knapp>
      <Knapp
        type="button"
        variant="ghost"
        disabled={pending}
        onClick={() => {
          setApen(false);
          setBegrunnelse("");
          setFeil(null);
        }}
      >
        Avbryt
      </Knapp>
    </form>
  );
}
