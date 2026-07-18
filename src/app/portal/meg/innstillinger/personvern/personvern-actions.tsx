"use client";

import { Knapp } from "@/components/v2";
import { useState, useTransition } from "react";
import { Check, Download, Trash2 } from "lucide-react";
import { exportUserData } from "@/app/portal/meg/innstillinger/actions";
import { opprettGdprForesporsel } from "@/lib/moderering/actions";

type Props = {
  kind: "export" | "delete";
};

export function PersonvernActions({ kind }: Props) {
  if (kind === "export") return <ExportAction />;
  return <SlettKontoAction />;
}

type Status = { ok: boolean; msg: string };

function ExportAction() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status | null>(null);

  function onExport() {
    startTransition(async () => {
      setStatus(null);
      const result = await exportUserData();
      if (!result.ok || !result.data) {
        setStatus({ ok: false, msg: result.error ?? "Eksport feilet." });
        return;
      }
      // Trigger nedlasting av JSON-fil
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `akgolf-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus({ ok: true, msg: "Eksport lastet ned" });
    });
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <Knapp onClick={onExport} disabled={isPending}>
        <Download className="h-4 w-4" />
        {isPending ? "Genererer…" : "Last ned mine data"}
      </Knapp>
      {status ? (
        <span
          className={`inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.06em] ${
            status.ok ? "text-primary" : "text-destructive"
          }`}
        >
          {status.msg}
          {status.ok && <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Slett kontoen din (D5-konsolidering, 2026-07-18). Tidligere fantes to veier:
 * umiddelbar selvbetjent hard-delete (satte `deletedAt` → 30-dagers cron-kaskade)
 * OG coach-godkjent anonymisering via moderering-køen. De er nå slått sammen til
 * ÉN vei: forespørselen går alltid til køen (`opprettGdprForesporsel`), og ved
 * godkjenning ANONYMISERES opplysningene (navn/e-post/telefon/bilde/slug) mens
 * avidentifisert treningshistorikk beholdes. Ingen umiddelbar hard-delete lenger.
 * SLETT-bekreftelsen beholdes som friksjon; begrunnelse er valgfri.
 */
function SlettKontoAction() {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [begrunnelse, setBegrunnelse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);

  function onSend() {
    startTransition(async () => {
      setError(null);
      const result = await opprettGdprForesporsel(begrunnelse.trim() || undefined);
      if (!result.ok) {
        setError(result.error ?? "Kunne ikke sende forespørselen.");
        return;
      }
      setShowConfirm(false);
      setConfirmText("");
      setBegrunnelse("");
      setStatus({
        ok: true,
        msg: result.alleredeSendt
          ? "Du har allerede en åpen forespørsel."
          : "Forespørsel om sletting sendt",
      });
    });
  }

  if (!showConfirm) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Knapp ghost onClick={() => setShowConfirm(true)}>
          <Trash2 className="h-4 w-4" />
          Slett kontoen min
        </Knapp>
        {status ? (
          <span
            className={`inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.06em] ${
              status.ok ? "text-primary" : "text-destructive"
            }`}
          >
            {status.msg}
            {status.ok && <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-destructive bg-card p-4">
      <p className="text-sm font-semibold text-destructive">Er du helt sikker?</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Forespørselen behandles av en coach eller administrator. Ved godkjenning
        anonymiseres opplysningene dine — navn, e-post, telefon og bilde fjernes,
        mens avidentifisert treningshistorikk beholdes. Skriv <strong>SLETT</strong>{" "}
        for å bekrefte.
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="SLETT"
        autoComplete="off"
        autoCapitalize="characters"
        className="mt-2 w-full max-w-[200px] rounded-md border border-border bg-card px-4 py-2 text-sm tracking-[0.10em] uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
      />
      <textarea
        value={begrunnelse}
        onChange={(e) => setBegrunnelse(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Begrunnelse (valgfritt)"
        className="mt-2 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
      {error ? (
        <p className="font-mono mt-2 text-[11px] tracking-[0.06em] text-destructive">
          {error}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSend}
          disabled={isPending || confirmText !== "SLETT"}
          className="font-display inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-destructive px-6 text-sm font-bold text-destructive-foreground transition disabled:opacity-50"
        >
          {isPending ? "Sender…" : "Send slette-forespørsel"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowConfirm(false);
            setConfirmText("");
            setBegrunnelse("");
            setError(null);
          }}
          disabled={isPending}
          className="font-display inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground transition hover:bg-secondary"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
