"use client";

import { useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { markerSomPlanlagt, avslaaForespørsel } from "./actions";

export function ForespørselActions({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => markerSomPlanlagt(requestId))}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
      >
        <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        Planlagt
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => avslaaForespørsel(requestId))}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
      >
        <XCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
        Avslå
      </button>
    </div>
  );
}
