"use client";

// Knapper for faktura-detalj: "Last ned PDF" (lenke til pdf-ruten) og
// "Send på e-post" (server action med inline-tilbakemelding).
// Actionen (sendFakturaPaaEpost) og pdf-ruten er uendret.

import { useState, useTransition } from "react";
import { Knapp, StatusPille } from "@/components/precision/pa";
import { sendFakturaPaaEpost } from "./actions";

export function LastNedPdfKnapp({ paymentId }: { paymentId: string }) {
  return (
    <a
      href={`/portal/meg/abonnement/faktura/${paymentId}/pdf`}
      download
      className="pa-btn pa-btn--secondary pa-btn--full"
    >
      Last ned PDF
    </a>
  );
}

export function SendEpostKnapp({ paymentId }: { paymentId: string }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<
    { type: "ok" | "feil"; melding: string } | null
  >(null);

  function send() {
    setStatus(null);
    startTransition(async () => {
      const res = await sendFakturaPaaEpost(paymentId);
      if (res.ok) {
        setStatus({ type: "ok", melding: `Sendt til ${res.epost}` });
      } else {
        setStatus({ type: "feil", melding: res.feil });
      }
    });
  }

  return (
    <>
      <Knapp
        type="button"
        variant="secondary"
        fullWidth
        disabled={pending}
        loading={pending}
        loadingText="Sender …"
        onClick={send}
      >
        Send på e-post
      </Knapp>
      {status && (
        <StatusPille tone={status.type === "ok" ? "ok" : "warn"}>{status.melding}</StatusPille>
      )}
    </>
  );
}
