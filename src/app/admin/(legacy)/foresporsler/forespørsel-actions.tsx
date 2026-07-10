"use client";

import { useTransition } from "react";
import { markerSomPlanlagt, avslaaForespørsel } from "./actions";
import { agBtnClass } from "@/components/admin/agencyos/ui";

export function ForespørselActions({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <span className="grid w-full grid-cols-2 gap-[6px] md:inline-flex md:w-auto md:shrink-0">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => markerSomPlanlagt(requestId))}
        className={`${agBtnClass("primary", "sm")} max-md:h-11 disabled:opacity-50`}
      >
        Godta
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => avslaaForespørsel(requestId))}
        className={`${agBtnClass("ghost", "sm")} max-md:h-11 disabled:opacity-50`}
      >
        Avvis
      </button>
    </span>
  );
}
