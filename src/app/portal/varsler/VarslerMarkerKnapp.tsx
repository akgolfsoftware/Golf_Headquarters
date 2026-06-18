"use client";

/**
 * VarslerMarkerKnapp — klientknapp for «Marker alle lest».
 * Kaller markNotificationsRead (server action) via useTransition.
 */

import { useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { markNotificationsRead } from "./actions";

export function VarslerMarkerKnapp({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await markNotificationsRead();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-primary px-4 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-primary transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-50",
        "h-9",
        className,
      )}
    >
      <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      {pending ? "Markerer…" : "Marker alle lest"}
    </button>
  );
}
