"use client";

// Knapper for faktura-detalj: "Last ned PDF" (lenke til pdf-ruten) og
// "Send på e-post" (server action med inline-tilbakemelding).
// v2-port 17. juli 2026 (Team D4a): kun presentasjon — actionen
// (sendFakturaPaaEpost) og pdf-ruten er uendret.

import { useState, useTransition } from "react";
import { T, CTAPill, Knapp, Icon } from "@/components/v2";
import { sendFakturaPaaEpost } from "./actions";

export function LastNedPdfKnapp({ paymentId }: { paymentId: string }) {
  return (
    <a
      href={`/portal/meg/abonnement/faktura/${paymentId}/pdf`}
      download
      style={{ textDecoration: "none" }}
    >
      <CTAPill icon="download">Last ned PDF</CTAPill>
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
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <Knapp
        ghost
        disabled={pending}
        onClick={send}
        icon={pending ? "loader" : status?.type === "ok" ? "check" : "mail"}
      >
        Send på e-post
      </Knapp>
      {status && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontFamily: T.mono,
            fontSize: 10.5,
            color: status.type === "ok" ? T.up : T.down,
          }}
        >
          {status.type === "feil" && <Icon name="alert-triangle" size={11} />}
          {status.melding}
        </span>
      )}
    </span>
  );
}
