"use client";

import { Knapp } from "@/components/v2";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, Trash2, ShieldQuestion } from "lucide-react";
import {
  exportUserData,
  deleteUserAccount,
} from "@/app/portal/meg/innstillinger/actions";
import { opprettGdprForesporsel } from "@/lib/moderering/actions";
import { logout } from "@/lib/auth/logout";

type Props = {
  kind: "export" | "delete" | "gdpr-request";
};

export function PersonvernActions({ kind }: Props) {
  if (kind === "export") return <ExportAction />;
  if (kind === "gdpr-request") return <GdprForesporselAction />;
  return <DeleteAction />;
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

function DeleteAction() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onDelete() {
    startTransition(async () => {
      setError(null);
      const result = await deleteUserAccount(confirmText);
      if (!result.ok) {
        setError(result.error ?? "Sletting feilet.");
        return;
      }
      // Logg ut og redirect
      await logout();
      router.push("/auth/login?deleted=1");
    });
  }

  if (!showConfirm) {
    return (
      <div className="mt-4">
        <Knapp ghost onClick={() => setShowConfirm(true)}>
          <Trash2 className="h-4 w-4" />
          Slett kontoen min
        </Knapp>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-destructive bg-card p-4">
      <p className="text-sm font-semibold text-destructive">
        Er du helt sikker?
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Dette deaktiverer kontoen umiddelbart og sletter alle dine data
        permanent etter 30 dager. Skriv <strong>SLETT</strong> for å bekrefte.
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
      {error ? (
        <p className="font-mono mt-2 text-[11px] tracking-[0.06em] text-destructive">
          {error}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onDelete}
          disabled={isPending || confirmText !== "SLETT"}
          className="font-display inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-destructive px-6 text-sm font-bold text-destructive-foreground transition disabled:opacity-50"
        >
          {isPending ? "Sletter…" : "Bekreft sletting"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowConfirm(false);
            setConfirmText("");
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

/**
 * GDPR-slettforespørsel (D5): oppretter en GDPR_SLETTING-sak i moderering-køen
 * i stedet for å slette umiddelbart. Til forskjell fra «Slett kontoen din»
 * (30-dagers automatikk) behandles denne av en coach/administrator, og data
 * anonymiseres i stedet for å fjernes fysisk — treningshistorikk beholdes
 * avidentifisert. Passer når du vil ha kontoen slettet, men saken skal ses av
 * en person.
 */
function GdprForesporselAction() {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [begrunnelse, setBegrunnelse] = useState("");
  const [status, setStatus] = useState<Status | null>(null);

  function onSend() {
    startTransition(async () => {
      setStatus(null);
      const result = await opprettGdprForesporsel(begrunnelse.trim() || undefined);
      if (!result.ok) {
        setStatus({ ok: false, msg: result.error ?? "Kunne ikke sende forespørselen." });
        return;
      }
      setShowForm(false);
      setBegrunnelse("");
      setStatus({
        ok: true,
        msg: result.alleredeSendt
          ? "Du har allerede en åpen forespørsel."
          : "Forespørsel sendt",
      });
    });
  }

  if (!showForm) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Knapp ghost onClick={() => setShowForm(true)}>
          <ShieldQuestion className="h-4 w-4" />
          Be om sletting av kontoen min
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
    <div className="mt-4 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">
        Be om at kontoen din slettes
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Forespørselen behandles av en coach eller administrator. Ved godkjenning
        anonymiseres opplysningene dine — navn, e-post, telefon og bilde fjernes,
        mens avidentifisert treningshistorikk beholdes. Du kan legge ved en
        begrunnelse (valgfritt).
      </p>
      <textarea
        value={begrunnelse}
        onChange={(e) => setBegrunnelse(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Begrunnelse (valgfritt)"
        className="mt-2 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Knapp onClick={onSend} disabled={isPending}>
          <ShieldQuestion className="h-4 w-4" />
          {isPending ? "Sender…" : "Send forespørsel"}
        </Knapp>
        <Knapp
          ghost
          disabled={isPending}
          onClick={() => {
            setShowForm(false);
            setBegrunnelse("");
            setStatus(null);
          }}
        >
          Avbryt
        </Knapp>
      </div>
    </div>
  );
}
