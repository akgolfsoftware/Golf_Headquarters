"use client";

// Knapper for faktura-detalj: "Last ned PDF" (lenke til pdf-ruten) og
// "Send på e-post" (server action med inline-tilbakemelding).

import { useState, useTransition } from "react";
import { Check, Download, Loader2, Mail } from "lucide-react";
import { sendFakturaPaaEpost } from "./actions";

const baseBtn =
  "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors";
const sekundaer = "border-border bg-card text-foreground hover:bg-muted";
const primaer =
  "border-primary bg-primary text-primary-foreground hover:opacity-90";

export function LastNedPdfKnapp({ paymentId }: { paymentId: string }) {
  return (
    <a
      href={`/portal/meg/abonnement/faktura/${paymentId}/pdf`}
      download
      className={`${baseBtn} ${primaer}`}
    >
      <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
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
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={send}
        disabled={pending}
        className={`${baseBtn} ${sekundaer} disabled:opacity-60`}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
        ) : status?.type === "ok" ? (
          <Check className="h-3.5 w-3.5" strokeWidth={2} />
        ) : (
          <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
        Send på e-post
      </button>
      {status && (
        <span
          className={`font-mono text-[10.5px] ${
            status.type === "ok" ? "text-success" : "text-destructive"
          }`}
        >
          {status.melding}
        </span>
      )}
    </span>
  );
}
