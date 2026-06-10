"use client";

import { useTransition } from "react";
import { markerSomPlanlagt, avslaaForespørsel } from "./actions";
import { agBtnClass } from "@/components/admin/agencyos/ui";

export function ForespørselActions({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <span className="inline-flex shrink-0 gap-[6px]">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => markerSomPlanlagt(requestId))}
        className={`${agBtnClass("primary", "sm")} disabled:opacity-50`}
      >
        Godta
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => avslaaForespørsel(requestId))}
        className={`${agBtnClass("ghost", "sm")} disabled:opacity-50`}
      >
        Avvis
      </button>
    </span>
  );
}
