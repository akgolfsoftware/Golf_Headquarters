"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setSgHubMode } from "@/app/portal/mal/sg-hub/mode-action";

type Props = {
  current: "simple" | "advanced";
};

export function SgHubModeToggle({ current }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function bytt(mode: "simple" | "advanced") {
    if (mode === current) return;
    startTransition(async () => {
      await setSgHubMode(mode);
      router.refresh();
    });
  }

  return (
    <div
      className="inline-flex items-center rounded-full border border-border bg-card p-0.5"
      aria-label="Visningsmodus"
    >
      {(["simple", "advanced"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          disabled={pending}
          onClick={() => bytt(mode)}
          className={`rounded-full px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors ${
            current === mode
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {mode === "simple" ? "Enkel" : "Avansert"}
        </button>
      ))}
    </div>
  );
}
