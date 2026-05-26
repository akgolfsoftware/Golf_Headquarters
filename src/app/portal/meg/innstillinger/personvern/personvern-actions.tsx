"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, Trash2 } from "lucide-react";
import { AthleticButton } from "@/components/athletic";
import {
  exportUserData,
  deleteUserAccount,
} from "@/app/portal/meg/innstillinger/actions";
import { logout } from "@/lib/auth/logout";

type Props = {
  kind: "export" | "delete";
};

export function PersonvernActions({ kind }: Props) {
  if (kind === "export") return <ExportAction />;
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
      <AthleticButton
        variant="lime"
        size="md"
        onClick={onExport}
        disabled={isPending}
      >
        <Download className="h-4 w-4" />
        {isPending ? "Genererer…" : "Last ned mine data"}
      </AthleticButton>
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
        <AthleticButton
          variant="ghost-light"
          size="md"
          onClick={() => setShowConfirm(true)}
          className="!border-destructive/40 !text-destructive hover:!bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          Slett kontoen min
        </AthleticButton>
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
