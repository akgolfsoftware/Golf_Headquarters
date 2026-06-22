"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, Trash2 } from "lucide-react";
import { beOmDataSletting } from "./actions";

type SisteForespoersel = {
  type: string; // EXPORT | DELETE
  status: string;
  createdAt: string; // ISO
} | null;

function formatDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DataActions({ sisteSletting }: { sisteSletting: SisteForespoersel }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sendt, setSendt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function sletteForespoersel() {
    setError(null);
    startTransition(async () => {
      try {
        await beOmDataSletting();
        setSendt(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke sende forespørsel.");
      }
    });
  }

  const slettingKvittert = sendt || sisteSletting != null;

  return (
    <div className="flex flex-col gap-2">
      <a
        href="/forelder/samtykke/eksport"
        className="flex w-full items-center gap-[10px] rounded-xl border border-border bg-card p-[13px] text-[14px] font-medium text-foreground"
      >
        <Download className="h-4 w-4 text-primary" strokeWidth={1.5} aria-hidden />
        Last ned alle data (GDPR-eksport)
      </a>

      <button
        className="flex w-full items-center gap-[10px] rounded-xl p-[13px] text-[14px] font-medium text-destructive disabled:opacity-50"
        style={{ background: "rgba(163,45,45,0.06)", border: "1px solid rgba(163,45,45,0.2)" }}
        type="button"
        onClick={sletteForespoersel}
        disabled={pending}
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        {pending ? "Sender forespørsel …" : "Be om sletting av data"}
      </button>

      {error && <p className="px-1 text-[12px] text-destructive">{error}</p>}

      {slettingKvittert && (
        <div
          className="flex items-start gap-[10px] rounded-xl p-3"
          style={{ background: "rgba(26,125,86,0.08)", border: "1px solid rgba(26,125,86,0.2)" }}
        >
          <Check className="mt-0.5 h-[16px] w-[16px] flex-shrink-0 text-success" strokeWidth={1.75} aria-hidden />
          <div className="text-[12.5px] leading-[1.5] text-foreground">
            <span className="font-semibold">Slette-forespørsel registrert.</span>{" "}
            {sisteSletting && !sendt
              ? `Sendt ${formatDato(sisteSletting.createdAt)}. `
              : ""}
            AK Golf behandler forespørselen og kontakter deg på e-post.
          </div>
        </div>
      )}
    </div>
  );
}
