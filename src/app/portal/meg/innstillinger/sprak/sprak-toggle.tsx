"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { oppdaterPreferences } from "../../actions";

type Sprak = "nb" | "en";

export function SpraakToggle({ initial }: { initial: Sprak }) {
  const router = useRouter();
  const [valgt, setValgt] = useState<Sprak>(initial);
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);

  function bytt(nytt: Sprak) {
    if (nytt === "en") return; // disabled — kommer senere
    setValgt(nytt);
    startTransition(async () => {
      await oppdaterPreferences({ spraak: nytt });
      setLagret(true);
      router.refresh();
      setTimeout(() => setLagret(false), 1500);
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => bytt("nb")}
        disabled={pending}
        className={`flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition-colors disabled:opacity-60 ${
          valgt === "nb"
            ? "border-primary bg-primary/5"
            : "border-input bg-card hover:border-border"
        }`}
      >
        <div>
          <div className="font-semibold">Norsk bokmål</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Standard for AK Golf
          </div>
        </div>
        {valgt === "nb" && <Check size={16} strokeWidth={2} className="text-primary" />}
      </button>

      <button
        type="button"
        disabled
        title="Engelsk-støtte kommer senere"
        className="flex w-full items-center justify-between rounded-md border border-input bg-card px-4 py-3 text-left opacity-60"
      >
        <div>
          <div className="font-semibold">English</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Kommer Q3 2026
          </div>
        </div>
        <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Snart
        </span>
      </button>

      {lagret && (
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
          Lagret
        </span>
      )}
    </div>
  );
}
